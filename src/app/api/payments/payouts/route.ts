import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceClient();
    const [{ data: payments }, { data: methods }, { data: settingsRow }] = await Promise.all([
      supabase
        .from('payments')
        .select('*')
        .eq('ca_id', auth.userId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', auth.userId)
        .order('is_default', { ascending: false }),
      supabase
        .from('settings')
        .select('metadata')
        .eq('user_id', auth.userId)
        .maybeSingle(),
    ]);

    const settledPayments = (payments || []).filter((p: any) =>
      ['SUCCESS', 'COMPLETED'].includes(String(p.status || '').toUpperCase())
    );
    const pendingPayments = (payments || []).filter((p: any) =>
      ['PENDING', 'PROCESSING'].includes(String(p.status || '').toUpperCase())
    );

    const grossCollected = settledPayments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
    const pendingSettlement = pendingPayments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);

    const meta = (settingsRow?.metadata && typeof settingsRow.metadata === 'object'
      ? settingsRow.metadata
      : {}) as Record<string, any>;
    const payouts: any[] = Array.isArray(meta.payout_requests) ? meta.payout_requests : [];
    const totalPayouts = payouts.reduce((acc: number, po: any) => acc + Number(po.amount || 0), 0);
    const availableBalance = Math.max(0, grossCollected - totalPayouts);

    // Resolve client names
    const clientIds = Array.from(
      new Set((payments || []).map((p: any) => p.client_id).filter(Boolean))
    );
    const clientMap = new Map<string, string>();
    if (clientIds.length > 0) {
      const [{ data: clientRows }, { data: userRows }] = await Promise.all([
        supabase.from('clients').select('id, full_name, display_name').in('id', clientIds),
        supabase.from('users').select('id, name').in('id', clientIds),
      ]);
      for (const c of clientRows || []) clientMap.set(c.id, c.display_name || c.full_name);
      for (const u of userRows || []) if (!clientMap.has(u.id)) clientMap.set(u.id, u.name);
    }

    const ledger = [
      ...payouts.map((po: any) => ({
        id: po.id,
        desc: `Bank Payout to ${po.bankLabel}`,
        amount: -Math.abs(Number(po.amount || 0)),
        date: po.createdAt,
        type: 'debit' as const,
        status: po.status || 'SUBMITTED',
      })),
      ...settledPayments.map((p: any) => ({
        id: p.id,
        desc: `Client Payment - ${clientMap.get(p.client_id) || 'Client'}`,
        amount: Number(p.amount || 0),
        date: p.paid_at || p.created_at,
        type: 'credit' as const,
        status: p.status,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      summary: {
        availableBalance,
        pendingSettlement,
        totalPayouts,
        grossCollected,
      },
      bankAccounts: methods || [],
      transactions: ledger,
    });
  } catch (error: any) {
    console.error('Wallet payouts GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load wallet ledger' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const amount = Number(body.amount);
    const bankMethodId = String(body.bankMethodId || '').trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Valid positive payout amount is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const [{ data: payments }, { data: methodRow }, { data: settingsRow }] = await Promise.all([
      supabase.from('payments').select('amount, status').eq('ca_id', auth.userId),
      bankMethodId
        ? supabase
            .from('payment_methods')
            .select('id, label, bank_name, account_last4')
            .eq('id', bankMethodId)
            .eq('user_id', auth.userId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from('settings').select('metadata').eq('user_id', auth.userId).maybeSingle(),
    ]);

    const grossCollected = (payments || [])
      .filter((p: any) => ['SUCCESS', 'COMPLETED'].includes(String(p.status || '').toUpperCase()))
      .reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);

    const existingMeta = (settingsRow?.metadata && typeof settingsRow.metadata === 'object'
      ? settingsRow.metadata
      : {}) as Record<string, any>;
    const existingPayouts: any[] = Array.isArray(existingMeta.payout_requests)
      ? existingMeta.payout_requests
      : [];
    const totalPayouts = existingPayouts.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
    const availableBalance = Math.max(0, grossCollected - totalPayouts);

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Requested payout (₹${amount.toLocaleString('en-IN')}) exceeds available balance (₹${availableBalance.toLocaleString('en-IN')}).` },
        { status: 400 }
      );
    }

    const bankLabel = methodRow
      ? `${methodRow.bank_name || methodRow.label}${methodRow.account_last4 ? ` (****${methodRow.account_last4})` : ''}`
      : body.bankLabel || 'Primary Settlement Bank';

    const newPayout = {
      id: `po_${crypto.randomUUID().slice(0, 8)}`,
      amount,
      bankMethodId: methodRow?.id || null,
      bankLabel,
      status: 'SUBMITTED',
      createdAt: new Date().toISOString(),
    };

    const nextMeta = {
      ...existingMeta,
      payout_requests: [newPayout, ...existingPayouts],
    };

    const { error: upsertErr } = await supabase
      .from('settings')
      .upsert(
        {
          user_id: auth.userId,
          metadata: nextMeta,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (upsertErr) throw upsertErr;

    await supabase.from('notifications').insert({
      user_id: auth.userId,
      title: 'Bank Payout Requested',
      message: `Payout of ₹${amount.toLocaleString('en-IN')} to ${bankLabel} has been queued.`,
      type: 'PAYOUT_REQUESTED',
      read: false,
      is_read: false,
    });

    return NextResponse.json({ success: true, payout: newPayout }, { status: 201 });
  } catch (error: any) {
    console.error('Wallet payout POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit payout request' },
      { status: 500 }
    );
  }
}
