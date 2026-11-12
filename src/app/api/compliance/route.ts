import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const PRIORITY_MAP: Record<string, string> = {
  low: 'LOW',
  medium: 'MEDIUM',
  high: 'HIGH',
  urgent: 'URGENT',
};

function formatComplianceItem(item: any) {
  return {
    ...item,
    type: item.compliance_type,
    priority: item.priority?.toLowerCase(),
    checklist: item.metadata?.checklist || item.document_checklist || [],
    documents: item.metadata?.documents || [],
    frequency: item.metadata?.frequency || 'once',
  };
}

// GET /api/compliance - Get compliance items scoped to the caller
export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const requestedCaId = searchParams.get('caId');
    const requestedClientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const overdueOnly = searchParams.get('overdueOnly') === 'true';

    let query = supabase
      .from('compliance_items')
      .select('*')
      .order('due_date', { ascending: true });

    if (requestedClientId) {
      const allowed = await canAccessClientRecord(auth, requestedClientId);
      if (!allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      query = query.eq('client_id', requestedClientId);
    } else if (requestedCaId) {
      if (requestedCaId !== auth.userId && !auth.isAdmin) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
      query = query.eq('ca_id', requestedCaId);
    } else if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(auth.userId);
        query = query.in('client_id', clientIds);
      } else {
        query = query.or(`ca_id.eq.${auth.userId},assigned_to.eq.${auth.userId}`);
      }
    }

    if (status) query = query.eq('status', status.toLowerCase());
    if (overdueOnly) {
      query = query
        .lt('due_date', new Date().toISOString().split('T')[0])
        .neq('status', 'completed');
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: (data || []).map(formatComplianceItem),
    });
  } catch (error) {
    console.error('Compliance GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance items' },
      { status: 500 }
    );
  }
}

// POST /api/compliance - Create compliance item
export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const targetClientId = body.clientId || body.client_id;
    const title = String(body.title || '').trim();
    const dueDate = body.dueDate || body.due_date;

    if (!title || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Title and due date are required' },
        { status: 400 }
      );
    }

    if (targetClientId) {
      const allowed = await canAccessClientRecord(auth, targetClientId);
      if (!allowed) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    } else if (!auth.isCAOrStaff) {
      return NextResponse.json(
        { success: false, error: 'Client ID or CA role is required' },
        { status: 403 }
      );
    }

    const dbPriority = PRIORITY_MAP[String(body.priority || '').toLowerCase()] || 'MEDIUM';
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('compliance_items')
      .insert([
        {
          ca_id: auth.isCAOrStaff ? (auth.isAdmin && body.caId ? body.caId : auth.userId) : (body.caId || null),
          client_id: targetClientId || auth.userId,
          title,
          description: body.description || '',
          compliance_type: body.type || 'GST',
          due_date: dueDate,
          status: 'not-started',
          priority: dbPriority as any,
          metadata: {
            frequency: body.frequency || 'once',
            checklist: body.checklist || [],
            documents: body.documents || [],
          },
        },
      ])
      .select()
      .single();

    if (error || !data) throw error || new Error('No data returned');

    return NextResponse.json({ success: true, data: formatComplianceItem(data) }, { status: 201 });
  } catch (error) {
    console.error('Compliance POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance item' },
      { status: 500 }
    );
  }
}

// PUT /api/compliance - Update compliance item
export async function PUT(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Compliance item ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing, error: fetchError } = await supabase
      .from('compliance_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: 'Compliance item not found' }, { status: 404 });
    }

    const isOwner =
      auth.isAdmin ||
      existing.ca_id === auth.userId ||
      existing.assigned_to === auth.userId ||
      (existing.client_id && (await canAccessClientRecord(auth, existing.client_id)));

    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.priority !== undefined) {
      updatePayload.priority = PRIORITY_MAP[String(body.priority).toLowerCase()] || 'MEDIUM';
    }
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.dueDate !== undefined) updatePayload.due_date = body.dueDate;

    const existingMeta = (existing.metadata && typeof existing.metadata === 'object') ? existing.metadata : {};
    if (body.documents !== undefined || body.checklist !== undefined || body.frequency !== undefined) {
      updatePayload.metadata = {
        ...existingMeta,
        ...(body.frequency !== undefined ? { frequency: body.frequency } : {}),
        ...(body.checklist !== undefined ? { checklist: body.checklist } : {}),
        ...(body.documents !== undefined ? { documents: body.documents } : {}),
      };
    }

    const { data, error } = await supabase
      .from('compliance_items')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to update');

    return NextResponse.json({ success: true, data: formatComplianceItem(data) });
  } catch (error) {
    console.error('Compliance PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update compliance item' },
      { status: 500 }
    );
  }
}

// DELETE /api/compliance
export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Compliance item ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing } = await supabase
      .from('compliance_items')
      .select('ca_id, client_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Compliance item not found' }, { status: 404 });
    }

    const canDelete =
      auth.isAdmin ||
      existing.ca_id === auth.userId ||
      (auth.isCAOrStaff && existing.client_id && (await canAccessClientRecord(auth, existing.client_id)));

    if (!canDelete) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('compliance_items').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Compliance DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete compliance item' },
      { status: 500 }
    );
  }
}
