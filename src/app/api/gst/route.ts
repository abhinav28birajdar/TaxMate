// ============================================
// GST MANAGEMENT API ENDPOINTS
// ============================================

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
      .from('gst_records')
      .select('*')
      .order('due_date', { ascending: true });

    if (caId) query = query.eq('ca_id', caId);
    if (clientId) query = query.eq('client_id', clientId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
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
      .from('gst_records')
      .insert([
        {
          client_id: body.clientId,
          ca_id: body.caId,
          month: body.month,
          year: body.year,
          gstr_type: body.gstrType,
          due_date: body.dueDate,
          status: 'not-started',
          documents: body.documents || [],
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('GST POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create GST record' },
      { status: 500 }
    );
  }
}

// PUT /api/gst/:id - Update GST record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const { data, error } = await supabase
      .from('gst_records')
      .update({
        status: body.status,
        filing_date: body.filingDate,
        total_invoice: body.totalInvoice,
        total_tax: body.totalTax,
        total_itc: body.totalITC,
        notes: body.notes,
        documents: body.documents,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('GST PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update GST record' },
      { status: 500 }
    );
  }
}
