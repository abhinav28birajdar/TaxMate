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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = request.nextUrl.searchParams.get('status');
    const supabase = getServiceClient();

    let query = supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(auth.userId);
        const orParts = [`client_user_id.eq.${auth.userId}`];
        if (clientIds.length > 0) {
          orParts.push(`client_id.in.(${clientIds.join(',')})`);
        }
        query = query.or(orParts.join(','));
      } else {
        query = query.eq('ca_id', auth.userId);
      }
    }

    if (status && status !== 'all') {
      query = query.eq('status', status.toLowerCase());
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, proposals: data || [] });
  } catch (error: any) {
    console.error('Proposals GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load proposals' },
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
      return NextResponse.json(
        { error: 'Only CAs or admins can create proposals' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const title = String(body.title || '').trim();
    const clientName = String(body.clientName || body.client_name || '').trim();
    const retainerAmount = Number(body.retainerAmount ?? body.retainer_amount ?? 0);

    if (!title || !clientName) {
      return NextResponse.json(
        { error: 'Proposal title and client name are required' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(retainerAmount) || retainerAmount < 0) {
      return NextResponse.json(
        { error: 'Retainer amount must be a valid non-negative number' },
        { status: 400 }
      );
    }

    const clientId = body.clientId || body.client_id || null;
    if (clientId) {
      const allowed = await canAccessClientRecord(auth, clientId);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const supabase = getServiceClient();
    let clientUserId = body.clientUserId || body.client_user_id || null;

    if (clientId && !clientUserId) {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('portal_user_id, email')
        .eq('id', clientId)
        .maybeSingle();
      if (clientRow?.portal_user_id) {
        clientUserId = clientRow.portal_user_id;
      }
    }

    const status = ['draft', 'sent'].includes(String(body.status || '').toLowerCase())
      ? String(body.status).toLowerCase()
      : 'draft';

    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        ca_id: auth.userId,
        client_id: clientId,
        client_user_id: clientUserId,
        client_name: clientName,
        client_email: body.clientEmail || body.client_email || null,
        title,
        scope: body.scope || '',
        retainer_amount: retainerAmount,
        billing_frequency: body.billingFrequency || body.billing_frequency || 'annual',
        status,
        valid_until: body.validUntil || body.valid_until || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (status === 'sent' && clientUserId) {
      await supabase.from('notifications').insert({
        user_id: clientUserId,
        title: 'New Proposal Received',
        message: `You received a new proposal "${title}" (₹${retainerAmount}).`,
        type: 'proposal_received',
        read: false,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, proposal }, { status: 201 });
  } catch (error: any) {
    console.error('Proposals POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create proposal' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing, error: fetchError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const isCAOwner = existing.ca_id === auth.userId || auth.isAdmin;
    const isTargetClient =
      existing.client_user_id === auth.userId ||
      (existing.client_id && (await canAccessClientRecord(auth, existing.client_id)));

    if (!isCAOwner && !isTargetClient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const updatePayload: Record<string, any> = { updated_at: now };

    if (isCAOwner) {
      if (body.title !== undefined) updatePayload.title = body.title;
      if (body.scope !== undefined) updatePayload.scope = body.scope;
      if (body.retainerAmount !== undefined) updatePayload.retainer_amount = Number(body.retainerAmount);
      if (body.billingFrequency !== undefined) updatePayload.billing_frequency = body.billingFrequency;
      if (body.validUntil !== undefined) updatePayload.valid_until = body.validUntil;
      if (body.notes !== undefined) updatePayload.notes = body.notes;
      if (body.status !== undefined) updatePayload.status = String(body.status).toLowerCase();
    } else if (isTargetClient) {
      const requestedStatus = String(body.status || '').toLowerCase();
      if (!['accepted', 'declined'].includes(requestedStatus)) {
        return NextResponse.json(
          { error: 'Clients can only accept or decline proposals' },
          { status: 403 }
        );
      }
      updatePayload.status = requestedStatus;
      if (requestedStatus === 'accepted') {
        updatePayload.signed_at = now;
      }
      if (body.notes !== undefined) updatePayload.notes = body.notes;
    }

    const { data: updated, error } = await supabase
      .from('proposals')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (updatePayload.status === 'sent' && existing.client_user_id) {
      await supabase.from('notifications').insert({
        user_id: existing.client_user_id,
        title: 'Proposal Sent',
        message: `Your CA shared proposal "${existing.title}" for review.`,
        type: 'proposal_received',
        read: false,
        is_read: false,
        created_at: now,
      });
    } else if (['accepted', 'declined'].includes(updatePayload.status)) {
      await supabase.from('notifications').insert({
        user_id: existing.ca_id,
        title: `Proposal ${updatePayload.status === 'accepted' ? 'Accepted' : 'Declined'}`,
        message: `${existing.client_name} ${updatePayload.status} proposal "${existing.title}".`,
        type: 'proposal_received',
        read: false,
        is_read: false,
        created_at: now,
      });
    }

    return NextResponse.json({ success: true, proposal: updated });
  } catch (error: any) {
    console.error('Proposals PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update proposal' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Proposal ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing } = await supabase
      .from('proposals')
      .select('ca_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    if (!auth.isAdmin && existing.ca_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('proposals').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Proposals DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete proposal' },
      { status: 500 }
    );
  }
}

