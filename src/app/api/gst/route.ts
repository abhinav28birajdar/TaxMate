import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// GET /api/gst - Get all GST records for CA
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caId = searchParams.get('caId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');

    let query = supabase
      .from('tax_filings')
      .select('*')
      .in('filing_type', ['GSTR_1', 'GSTR_3B', 'GSTR_9'])
      .order('created_at', { ascending: false });

    if (caId) query = query.eq('ca_id', caId);
    if (clientId) query = query.eq('client_id', clientId);
    if (status) {
      const dbStatus = status.toUpperCase().replace('-', '_');
      query = query.eq('status', dbStatus);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map DB structure to response fields that caller expects
    const records = (data || []).map((item) => ({
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
    }));

    return NextResponse.json({ success: true, data: records });
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
    const body = await request.json();

    const { data, error } = await supabase
      .from('tax_filings')
      .insert([
        {
          client_id: body.clientId,
          ca_id: body.caId,
          filing_type: body.gstrType || 'GSTR_1',
          financial_year: body.year?.toString() || new Date().getFullYear().toString(),
          status: 'NOT_STARTED',
          metadata: {
            month: body.month || 1,
            dueDate: body.dueDate,
            documents: body.documents || [],
          },
        },
      ])
      .select();

    if (error || !data) throw error || new Error('No data returned');

    const item = data[0];
    const record = {
      id: item.id,
      clientId: item.client_id,
      caId: item.ca_id,
      dueDate: item.metadata?.dueDate,
      gstrType: item.filing_type,
      status: item.status?.toLowerCase().replace('_', '-'),
      year: item.financial_year,
      month: item.metadata?.month,
      documents: item.metadata?.documents || [],
    };

    return NextResponse.json({ success: true, data: record });
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
    const body = await request.json();
    const { id } = body;

    const statusMap: Record<string, string> = {
      'not-started': 'NOT_STARTED',
      'document-collection': 'DOCUMENT_COLLECTION',
      'in-progress': 'IN_PROGRESS',
      'under-review': 'UNDER_REVIEW',
      'completed': 'COMPLETED',
      'cancelled': 'CANCELLED',
    };
    const dbStatus = statusMap[body.status?.toLowerCase()] || body.status?.toUpperCase() || 'NOT_STARTED';

    const { data, error } = await supabase
      .from('tax_filings')
      .update({
        status: dbStatus,
        submission_date: body.filingDate,
        metadata: {
          total_invoice: body.totalInvoice,
          total_tax: body.totalTax,
          total_itc: body.totalITC,
          notes: body.notes,
          documents: body.documents,
        }
      })
      .eq('id', id)
      .select();

    if (error || !data) throw error || new Error('Failed to update');

    const item = data[0];
    const record = {
      id: item.id,
      clientId: item.client_id,
      caId: item.ca_id,
      dueDate: item.metadata?.dueDate,
      gstrType: item.filing_type,
      status: item.status?.toLowerCase().replace('_', '-'),
      year: item.financial_year,
      filingDate: item.submission_date,
      totalInvoice: item.metadata?.total_invoice,
      totalTax: item.metadata?.total_tax,
      totalITC: item.metadata?.total_itc,
      notes: item.metadata?.notes,
      documents: item.metadata?.documents,
    };

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('GST PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update GST record' },
      { status: 500 }
    );
  }
}
