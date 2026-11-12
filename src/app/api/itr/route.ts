import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const VALID_FILING_TYPES = new Set([
  'ITR_1',
  'ITR_2',
  'ITR_3',
  'ITR_4',
  'GSTR_1',
  'GSTR_3B',
  'GSTR_9',
  'TDS_24Q',
  'TDS_26Q',
  'ADVANCE_TAX',
  'OTHER',
]);

const STATUS_MAP: Record<string, string> = {
  'not-started': 'NOT_STARTED',
  'document-collection': 'DOCUMENT_COLLECTION',
  'in-progress': 'IN_PROGRESS',
  'under-review': 'UNDER_REVIEW',
  'submitted': 'SUBMITTED',
  'e-filed': 'SUBMITTED',
  'acknowledged': 'ACKNOWLEDGED',
  'completed': 'COMPLETED',
  'cancelled': 'CANCELLED',
};

function normalizeFilingType(input?: string): string {
  const normalized = String(input || 'ITR_2').toUpperCase().replace(/-/g, '_');
  return VALID_FILING_TYPES.has(normalized) ? normalized : 'OTHER';
}

function formatItrRecord(item: any) {
  return {
    id: item.id,
    clientId: item.client_id,
    caId: item.ca_id,
    financialYear: item.financial_year,
    assessmentYear: item.assessment_year || item.metadata?.assessment_year || `AY ${item.financial_year}`,
    itrType: item.metadata?.itr_form_label || item.filing_type,
    filingType: item.filing_type,
    dueDate: item.metadata?.dueDate || item.submission_date || null,
    status: item.status?.toLowerCase().replace(/_/g, '-'),
    rawStatus: item.status,
    filingDate: item.submission_date,
    grossIncome: item.metadata?.gross_income ?? 0,
    taxableIncome: item.metadata?.taxable_income ?? 0,
    taxAmount: Number(item.tax_payable ?? item.metadata?.tax_amount ?? 0),
    refundAmount: Number(item.refund_due ?? item.metadata?.refund_amount ?? 0),
    prepaidTaxes: item.metadata?.prepaid_taxes ?? 0,
    regime: item.metadata?.regime || 'new',
    pan: item.metadata?.pan || '',
    taxpayerName: item.metadata?.taxpayer_name || '',
    caName: item.metadata?.ca_name || '',
    computation: item.metadata?.computation || null,
    eVerified: Boolean(item.metadata?.e_verified || item.status === 'ACKNOWLEDGED' || item.status === 'COMPLETED' || item.status === 'SUBMITTED'),
    acknowledgeNumber: item.acknowledgment_number || item.metadata?.acknowledge_number || '',
    documents: item.metadata?.documents || item.documents_collected || [],
    updatedAt: item.updated_at,
  };
}

// GET /api/itr - Get ITR records scoped to caller
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

    let query = supabase
      .from('tax_filings')
      .select('*')
      .in('filing_type', ['ITR_1', 'ITR_2', 'ITR_3', 'ITR_4', 'OTHER'])
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

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: (data || []).map(formatItrRecord) });
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

    // Resolve non-null ca_id required by schema
    let resolvedCaId: string = auth.isCAOrStaff
      ? (auth.isAdmin && body.caId ? body.caId : auth.userId)
      : (body.caId || '');

    if (!resolvedCaId) {
      const { data: rel } = await supabase
        .from('ca_client_relationships')
        .select('ca_id')
        .eq('client_id', auth.userId)
        .in('status', ['accepted', 'active'])
        .limit(1)
        .maybeSingle();

      if (rel?.ca_id) {
        resolvedCaId = rel.ca_id;
      } else {
        const { data: clientRow } = await supabase
          .from('clients')
          .select('assigned_ca_id')
          .or(`id.eq.${targetClientId},portal_user_id.eq.${auth.userId}`)
          .limit(1)
          .maybeSingle();
        resolvedCaId = clientRow?.assigned_ca_id || auth.userId;
      }
    }

    const dbStatus = body.status
      ? STATUS_MAP[String(body.status).toLowerCase()] || 'IN_PROGRESS'
      : 'IN_PROGRESS';

    const filingTypeEnum = normalizeFilingType(body.itrType || body.filingType);

    const { data, error } = await supabase
      .from('tax_filings')
      .insert([
        {
          client_id: targetClientId,
          ca_id: resolvedCaId,
          filing_type: filingTypeEnum,
          financial_year: body.financialYear || '2025-26',
          assessment_year: body.assessmentYear || 'AY 2026-27',
          status: dbStatus,
          submission_date: body.filingDate || null,
          acknowledgment_number: body.acknowledgeNumber || null,
          tax_payable: Number(body.taxAmount ?? 0),
          refund_due: Number(body.refundAmount ?? 0),
          notes: body.notes || null,
          metadata: {
            dueDate: body.dueDate || null,
            documents: body.documents || [],
            itr_form_label: body.itrFormLabel || body.itrType || filingTypeEnum,
            assessment_year: body.assessmentYear || 'AY 2026-27',
            gross_income: Number(body.grossIncome ?? 0),
            taxable_income: Number(body.taxableIncome ?? 0),
            tax_amount: Number(body.taxAmount ?? 0),
            refund_amount: Number(body.refundAmount ?? 0),
            prepaid_taxes: Number(body.prepaidTaxes ?? 0),
            regime: body.regime || 'new',
            pan: body.pan || '',
            taxpayer_name: body.taxpayerName || '',
            ca_name: body.caName || '',
            computation: body.computation || null,
            e_verified: Boolean(body.eVerified),
            self_filed: !auth.isCAOrStaff && resolvedCaId === auth.userId,
          },
        },
      ])
      .select()
      .single();

    if (error || !data) throw error || new Error('No data returned');

    return NextResponse.json({ success: true, data: formatItrRecord(data) }, { status: 201 });
  } catch (error) {
    console.error('ITR POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ITR record' },
      { status: 500 }
    );
  }
}

// PUT /api/itr - Update ITR record
export async function PUT(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'ITR filing ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing, error: fetchError } = await supabase
      .from('tax_filings')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ success: false, error: 'ITR filing not found' }, { status: 404 });
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
        acknowledgment_number:
          body.acknowledgeNumber !== undefined ? body.acknowledgeNumber : existing.acknowledgment_number,
        tax_payable: body.taxAmount !== undefined ? Number(body.taxAmount) : existing.tax_payable,
        refund_due: body.refundAmount !== undefined ? Number(body.refundAmount) : existing.refund_due,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        metadata: {
          ...existingMeta,
          ...(body.grossIncome !== undefined ? { gross_income: Number(body.grossIncome) } : {}),
          ...(body.taxableIncome !== undefined ? { taxable_income: Number(body.taxableIncome) } : {}),
          ...(body.taxAmount !== undefined ? { tax_amount: Number(body.taxAmount) } : {}),
          ...(body.refundAmount !== undefined ? { refund_amount: Number(body.refundAmount) } : {}),
          ...(body.prepaidTaxes !== undefined ? { prepaid_taxes: Number(body.prepaidTaxes) } : {}),
          ...(body.regime !== undefined ? { regime: body.regime } : {}),
          ...(body.pan !== undefined ? { pan: body.pan } : {}),
          ...(body.taxpayerName !== undefined ? { taxpayer_name: body.taxpayerName } : {}),
          ...(body.caName !== undefined ? { ca_name: body.caName } : {}),
          ...(body.computation !== undefined ? { computation: body.computation } : {}),
          ...(body.eVerified !== undefined ? { e_verified: Boolean(body.eVerified) } : {}),
          ...(body.documents !== undefined ? { documents: body.documents } : {}),
          ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw error || new Error('Failed to update');

    return NextResponse.json({ success: true, data: formatItrRecord(data) });
  } catch (error) {
    console.error('ITR PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update ITR record' },
      { status: 500 }
    );
  }
}
