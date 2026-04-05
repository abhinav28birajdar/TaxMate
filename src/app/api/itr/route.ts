// ============================================
// ITR MANAGEMENT API ENDPOINTS
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// GET /api/itr - Get all ITR records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caId = searchParams.get('caId');
    const clientId = searchParams.get('clientId');

    let query = supabase
      .from('itr_records')
      .select('*')
      .order('due_date', { ascending: true });

    if (caId) query = query.eq('ca_id', caId);
    if (clientId) query = query.eq('client_id', clientId);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('ITR GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch ITR records' },
      { status: 500 }
    );
  }
}

// POST /api/itr - Create ITR record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('itr_records')
      .insert([
        {
          client_id: body.clientId,
          ca_id: body.caId,
          financial_year: body.financialYear,
          itr_type: body.itrType,
          due_date: body.dueDate,
          status: 'not-started',
          documents: body.documents || [],
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('ITR POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ITR record' },
      { status: 500 }
    );
  }
}

// PUT /api/itr/:id - Update ITR record
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const { data, error } = await supabase
      .from('itr_records')
      .update({
        status: body.status,
        filing_date: body.filingDate,
        gross_income: body.grossIncome,
        taxable_income: body.taxableIncome,
        tax_amount: body.taxAmount,
        refund_amount: body.refundAmount,
        acknowledge_number: body.acknowledgeNumber,
        documents: body.documents,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('ITR PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ITR record' },
      { status: 500 }
    );
  }
}
