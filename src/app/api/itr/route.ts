import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '../../../lib/backend/supabase';

export const dynamic = 'force-dynamic';

// GET /api/itr - Get all ITR records
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const caId = searchParams.get('caId');
    const clientId = searchParams.get('clientId');

    let query = supabase
      .from('tax_filings')
      .select('*')
      .in('filing_type', ['ITR_1', 'ITR_2', 'ITR_3', 'ITR_4'])
      .order('created_at', { ascending: false });

    if (caId) query = query.eq('ca_id', caId);
    if (clientId) query = query.eq('client_id', clientId);

    const { data, error } = await query;

    if (error) throw error;

    // Map DB structure to response fields that caller expects
    const records = (data || []).map((item) => ({
      id: item.id,
      clientId: item.client_id,
      caId: item.ca_id,
      financialYear: item.financial_year,
      itrType: item.filing_type,
      dueDate: item.metadata?.dueDate || item.submission_date || null,
      status: item.status?.toLowerCase().replace('_', '-'),
      filingDate: item.submission_date,
      grossIncome: item.metadata?.gross_income || 0,
      taxableIncome: item.metadata?.taxable_income || 0,
      taxAmount: item.metadata?.tax_amount || 0,
      refundAmount: item.metadata?.refund_amount || 0,
      acknowledgeNumber: item.acknowledgment_number || item.metadata?.acknowledge_number || '',
      documents: item.metadata?.documents || item.documents_collected || [],
    }));

    return NextResponse.json({ success: true, data: records });
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
    const supabase = getServiceClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('tax_filings')
      .insert([
        {
          client_id: body.clientId,
          ca_id: body.caId,
          filing_type: body.itrType || 'ITR_1',
          financial_year: body.financialYear || new Date().getFullYear().toString(),
          status: 'NOT_STARTED',
          metadata: {
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
      financialYear: item.financial_year,
      itrType: item.filing_type,
      dueDate: item.metadata?.dueDate,
      status: item.status?.toLowerCase().replace('_', '-'),
      documents: item.metadata?.documents || [],
    };

    return NextResponse.json({ success: true, data: record });
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
    const supabase = getServiceClient();
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
        acknowledgment_number: body.acknowledgeNumber,
        metadata: {
          gross_income: body.grossIncome,
          taxable_income: body.taxableIncome,
          tax_amount: body.taxAmount,
          refund_amount: body.refundAmount,
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
      financialYear: item.financial_year,
      itrType: item.filing_type,
      dueDate: item.metadata?.dueDate,
      status: item.status?.toLowerCase().replace('_', '-'),
      filingDate: item.submission_date,
      grossIncome: item.metadata?.gross_income,
      taxableIncome: item.metadata?.taxable_income,
      taxAmount: item.metadata?.tax_amount,
      refundAmount: item.metadata?.refund_amount,
      acknowledgeNumber: item.acknowledgment_number,
      documents: item.metadata?.documents,
    };

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('ITR PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ITR record' },
      { status: 500 }
    );
  }
}
