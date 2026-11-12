import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const status = request.nextUrl.searchParams.get('status');
    const skip = Math.max(0, parseInt(request.nextUrl.searchParams.get('skip') || '0') || 0);
    const take = Math.min(100, Math.max(1, parseInt(request.nextUrl.searchParams.get('take') || '20') || 20));

    const serviceClient = getServiceClient();
    let query = serviceClient
      .from('invoices')
      .select(`
        *,
        payments (*)
      `, { count: 'exact' });

    if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(auth.userId);
        query = query.in('client_id', clientIds);
      } else {
        query = query.eq('ca_id', auth.userId);
      }
    }

    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: invoices, error, count } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) throw error;

    return NextResponse.json({ invoices: invoices || [], total: count || 0 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json(
        { error: 'Only CAs or admins can create invoices' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const clientId = body.clientId || body.client_id;
    if (!clientId) {
      return NextResponse.json({ error: 'clientId is required' }, { status: 400 });
    }

    const allowed = await canAccessClientRecord(auth, clientId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const baseAmount = Number(body.amount || 0);
    const taxAmount = Number(body.taxAmount || 0);
    const totalAmount = baseAmount + taxAmount;
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json({ error: 'Invoice amount must be positive' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    const { data: invoice, error } = await serviceClient
      .from('invoices')
      .insert({
        ca_id: auth.userId,
        client_id: clientId,
        client_name: body.clientName || body.client_name || null,
        client_email: body.clientEmail || body.client_email || null,
        amount: totalAmount,
        subtotal: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        description: body.description || '',
        due_date: body.dueDate ? new Date(body.dueDate).toISOString().split('T')[0] : null,
        status: 'DRAFT',
        invoice_number: body.invoiceNumber || `INV-${Date.now()}`,
        notes: body.notes || null,
        payment_terms: body.terms || 'net_15',
        metadata: { taxAmount, items: body.items || [] },
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, invoice },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}
