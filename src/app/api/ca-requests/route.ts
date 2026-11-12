import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    let query = supabase
      .from('ca_engagement_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        query = query.eq('client_user_id', auth.userId);
      } else {
        query = query.or(`ca_id.eq.${auth.userId},client_user_id.eq.${auth.userId}`);
      }
    }

    const { data: requests, error } = await query;
    if (error) throw error;

    let relQuery = supabase
      .from('ca_client_relationships')
      .select('*')
      .order('created_at', { ascending: false });

    if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        relQuery = relQuery.eq('client_id', auth.userId);
      } else {
        relQuery = relQuery.or(`ca_id.eq.${auth.userId},client_id.eq.${auth.userId}`);
      }
    }

    const { data: relationships } = await relQuery;

    const userIds = Array.from(
      new Set([
        ...(requests || []).flatMap((r: any) => [r.client_user_id, r.ca_id]),
        ...(relationships || []).flatMap((rel: any) => [rel.client_id, rel.ca_id]),
      ].filter(Boolean))
    );

    const userMap: Record<string, any> = {};
    const caFirmMap: Record<string, any> = {};
    if (userIds.length > 0) {
      const [{ data: users }, { data: caProfs }] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, avatar_url, phone')
          .in('id', userIds),
        supabase
          .from('ca_profiles')
          .select('user_id, firm_name, designation')
          .in('user_id', userIds),
      ]);
      for (const u of users || []) {
        userMap[u.id] = u;
      }
      for (const p of caProfs || []) {
        caFirmMap[p.user_id] = p;
      }
    }

    const enriched = (requests || []).map((r: any) => ({
      ...r,
      client: userMap[r.client_user_id] || null,
      ca: userMap[r.ca_id]
        ? {
            ...userMap[r.ca_id],
            firm_name: caFirmMap[r.ca_id]?.firm_name || null,
          }
        : null,
    }));

    const enrichedRelationships = (relationships || []).map((rel: any) => ({
      ...rel,
      ca: userMap[rel.ca_id]
        ? {
            ...userMap[rel.ca_id],
            firm_name: caFirmMap[rel.ca_id]?.firm_name || null,
            designation: caFirmMap[rel.ca_id]?.designation || null,
          }
        : null,
      client: userMap[rel.client_id] || null,
    }));

    return NextResponse.json({
      success: true,
      requests: enriched,
      relationships: enrichedRelationships,
    });
  } catch (error: any) {
    console.error('CA requests GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch CA engagement requests' },
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

    const body = await request.json();
    const caId = body.caId || body.ca_id;
    const title = String(body.title || 'CA Engagement Request').trim();
    const requestType = ['hire', 'change_ca', 'consultation', 'audit'].includes(
      String(body.requestType || body.request_type || 'hire')
    )
      ? String(body.requestType || body.request_type || 'hire')
      : 'hire';

    if (!caId) {
      return NextResponse.json({ error: 'CA ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const [{ data: caUser }, { data: existingClientRow }] = await Promise.all([
      supabase.from('users').select('id, role').eq('id', caId).maybeSingle(),
      supabase
        .from('clients')
        .select('id')
        .eq('portal_user_id', auth.userId)
        .maybeSingle(),
    ]);

    if (!caUser) {
      return NextResponse.json({ error: 'Selected CA was not found' }, { status: 404 });
    }

    const { data: created, error } = await supabase
      .from('ca_engagement_requests')
      .insert({
        client_user_id: auth.userId,
        client_record_id: existingClientRow?.id || null,
        ca_id: caId,
        request_type: requestType,
        title,
        message: body.message || '',
        service_category: body.serviceCategory || body.service_category || 'general',
        proposed_budget:
          body.proposedBudget !== undefined && body.proposedBudget !== null
            ? Number(body.proposedBudget)
            : null,
        financial_year: body.financialYear || body.financial_year || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: caId,
      title: 'New Client Engagement Request',
      message: `${title} has been submitted for your review.`,
      type: 'engagement_request',
      read: false,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, request: created }, { status: 201 });
  } catch (error: any) {
    console.error('CA requests POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit CA request' },
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
    const { id, status, responseNotes } = body;
    const normalizedStatus = String(status || '').toLowerCase();

    if (!id || !['accepted', 'rejected', 'cancelled'].includes(normalizedStatus)) {
      return NextResponse.json(
        { error: 'Valid request ID and status (accepted, rejected, cancelled) are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const { data: existing, error: fetchError } = await supabase
      .from('ca_engagement_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Engagement request not found' }, { status: 404 });
    }

    if (normalizedStatus === 'cancelled') {
      if (!auth.isAdmin && existing.client_user_id !== auth.userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (!auth.isAdmin && existing.ca_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Only the requested CA can accept or reject this request' },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const { data: updated, error } = await supabase
      .from('ca_engagement_requests')
      .update({
        status: normalizedStatus,
        response_notes: responseNotes || null,
        responded_at: now,
        updated_at: now,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // On acceptance, activate ca_client_relationships and link/provision clients record
    if (normalizedStatus === 'accepted') {
      await supabase
        .from('ca_client_relationships')
        .upsert(
          {
            ca_id: existing.ca_id,
            client_id: existing.client_user_id,
            status: 'active',
            connected_at: now,
          },
          { onConflict: 'ca_id,client_id' }
        );

      const { data: clientUser } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', existing.client_user_id)
        .maybeSingle();

      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('portal_user_id', existing.client_user_id)
        .maybeSingle();

      if (existingClient) {
        await supabase
          .from('clients')
          .update({ assigned_ca_id: existing.ca_id, status: 'active', updated_at: now })
          .eq('id', existingClient.id);
      } else {
        await supabase.from('clients').insert({
          portal_user_id: existing.client_user_id,
          assigned_ca_id: existing.ca_id,
          full_name: clientUser?.name || 'Client',
          display_name: clientUser?.name || 'Client',
          email: clientUser?.email || '',
          phone: clientUser?.phone || null,
          status: 'active',
          portal_access: true,
        });
      }

      await supabase.from('notifications').insert({
        user_id: existing.client_user_id,
        title: 'CA Request Accepted',
        message: `Your request "${existing.title}" was accepted.`,
        type: 'engagement_request',
        read: false,
        is_read: false,
        created_at: now,
      });
    } else if (normalizedStatus === 'rejected') {
      await supabase.from('notifications').insert({
        user_id: existing.client_user_id,
        title: 'CA Request Declined',
        message: responseNotes || `Your request "${existing.title}" could not be accepted.`,
        type: 'engagement_request',
        read: false,
        is_read: false,
        created_at: now,
      });
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error: any) {
    console.error('CA requests PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update CA request' },
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

    const caId = request.nextUrl.searchParams.get('caId');
    const supabase = getServiceClient();
    const now = new Date().toISOString();

    let relQuery = supabase
      .from('ca_client_relationships')
      .update({ status: 'ended', updated_at: now })
      .eq('client_id', auth.userId);
    if (caId) {
      relQuery = relQuery.eq('ca_id', caId);
    }
    await relQuery;

    let clientQuery = supabase
      .from('clients')
      .update({ assigned_ca_id: null, updated_at: now })
      .eq('portal_user_id', auth.userId);
    if (caId) {
      clientQuery = clientQuery.eq('assigned_ca_id', caId);
    }
    await clientQuery;

    return NextResponse.json({ success: true, message: 'CA engagement terminated' });
  } catch (error: any) {
    console.error('CA disconnect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect CA' },
      { status: 500 }
    );
  }
}
