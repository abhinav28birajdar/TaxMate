import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const STATUS_MAP: Record<string, string> = {
  'not-started': 'NOT_STARTED',
  'document-collection': 'DOCUMENT_COLLECTION',
  'in-progress': 'IN_PROGRESS',
  'under-review': 'UNDER_REVIEW',
  'completed': 'COMPLETED',
  'cancelled': 'CANCELLED',
};

function formatGstRecord(item: any) {
  return {
    id: item.id,
    clientId: item.client_id,
    caId: item.ca_id,
    dueDate: item.metadata?.dueDate || item.submission_date || null,
    gstrType: item.filing_type,
    status: item.status?.toLowerCase().replace('_', '-'),
    year: item.financial_year,
    month: item.metadata?.month || 1,
    filingDate: item.submission_date,
    totalInvoice: item.metadata?.total_invoice || 0,
    totalTax: item.metadata?.total_tax || 0,
    totalITC: item.metadata?.total_itc || 0,
    notes: item.metadata?.notes || '',
    documents: item.metadata?.documents || item.documents_collected || [],
  };
}

// GET /api/gst - Get GST records scoped to caller
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

    let query = supabase
      .from('tax_filings')
      .select('*')
      .in('filing_type', ['GSTR_1', 'GSTR_3B', 'GSTR_9'])
      .order('created_at', { ascending: false });

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
        query = query.eq('ca_id', auth.userId);
      }
    }

    if (status && status !== 'all') {
      const dbStatus = status.toUpperCase().replace('-', '_');
      query = query.eq('status', dbStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: (data || []).map(formatGstRecord) });
  } catch (error) {
    console.error('GST GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GST records' },
      { status: 500 }
    );
  }
}

// POST /api/gst - Create GST record
export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const targetClientId = body.clientId || body.client_id || auth.userId;
    const allowed = await canAccessClientRecord(auth, targetClientId);
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('tax_filings')
      .insert([
        {
          client_id: targetClientId,
          ca_id: auth.isCAOrStaff ? (auth.isAdmin && body.caId ? body.caId : auth.userId) : (body.caId || null),
          filing_type: body.gstrType || 'GSTR_1',
          financial_year: body.year?.toString() || new Date().getFullYear().toString(),
          status: 'NOT_STARTED',
          metadata: {
            month: body.month || 1,
            dueDate: body.dueDate || null,
            documents: body.documents || [],
          },
        },
      ])
      .select()
      .single();

    if (error || !data) throw error || new Error('No data returned');

    return NextResponse.json({ success: true, data: formatGstRecord(data) }, { status: 201 });
  } catch (error) {
    console.error('GST POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create GST record' },
      { status: 500 }
    );
  }
}

// PUT /api/gst - Update GST record
export async function PUT(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'GST filing ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing, error: fetchError } = await supabase
      .from('tax_filings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: 'GST filing not found' }, { status: 404 });
    }

    const isOwner =
      auth.isAdmin ||
      existing.ca_id === auth.userId ||
      (existing.client_id && (await canAccessClientRecord(auth, existing.client_id)));

    if (!isOwner) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const existingMeta = (existing.metadata && typeof existing.metadata === 'object') ? existing.metadata : {};
    const dbStatus = body.status
      ? STATUS_MAP[String(body.status).toLowerCase()] || String(body.status).toUpperCase().replace('-', '_')
      : existing.status;

    const { data, error } = await supabase
      .from('tax_filings')
      .update({
        status: dbStatus,
        submission_date: body.filingDate !== undefined ? body.filingDate : existing.submission_date,
        metadata: {
          ...existingMeta,
          ...(body.totalInvoice !== undefined ? { total_invoice: body.totalInvoice } : {}),
          ...(body.totalTax !== undefined ? { total_tax: body.totalTax } : {}),
          ...(body.totalITC !== undefined ? { total_itc: body.totalITC } : {}),
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
          ...(body.documents !== undefined ? { documents: body.documents } : {}),
          ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
          ...(body.month !== undefined ? { month: body.month } : {}),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to update');

    return NextResponse.json({ success: true, data: formatGstRecord(data) });
  } catch (error) {
    console.error('GST PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update GST record' },
      { status: 500 }
    );
  }
}
