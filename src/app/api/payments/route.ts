/**
 * POST /api/payments - Create a new payment/invoice
 * Protected route: Requires CA role
 */

import { NextRequest } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createInvoiceRecord } from '@/lib/api/db-operations';
import { ApiError, HTTP_STATUS } from '@/lib/api/response';

import { getResolvedClientIdsForUser } from '@/lib/api/server-auth';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      // Rate limiting
      if (!checkRateLimit(user.sub, 50, 60000)) {
        throw new ApiError('Rate limit exceeded', {
          code: 'RATE_LIMIT',
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
        });
      }

      // Parse and validate
      const body = await request.json();
      const validation = validateInput(body, RequestSchemas.createInvoice);

      if (!validation.success) {
        throw new ApiError('Validation failed', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: validation.errors,
        });
      }

      // Validate due date
      const dueDate = new Date(validation.data.dueDate);
      if (dueDate < new Date()) {
        throw new ApiError('Due date must be in the future', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
      }

      // Create invoice
      const result = await createInvoiceRecord(user.sub, validation.data);

      return {
        id: result.id,
        clientId: result.client_id || result.clientId,
        amount: result.amount,
        status: result.status,
        dueDate: result.due_date || result.dueDate,
        createdAt: result.created_at || result.createdAt,
      };
    },
    {
      method: 'POST',
      requireAuth: true,
      allowedRoles: ['CA', 'STAFF', 'ADMIN', 'SUPER_ADMIN'],
    }
  );
}

/**
 * GET /api/payments - List invoices for user
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
      const status = searchParams.get('status');

      const { getServiceClient } = await import('@/lib/backend/supabase');
      const supabase = getServiceClient();

      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' });

      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        const clientIds = await getResolvedClientIdsForUser(user.sub);
        query = query.or(`ca_id.eq.${user.sub},created_by.eq.${user.sub},client_id.in.(${clientIds.join(',')})`);
      }

      if (status) {
        query = query.eq('status', status.toUpperCase());
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      let paymentsQuery = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        const clientIds = await getResolvedClientIdsForUser(user.sub);
        paymentsQuery = paymentsQuery.or(`ca_id.eq.${user.sub},client_id.in.(${clientIds.join(',')})`);
      }

      const { data: paymentRows } = await paymentsQuery;

      const invoices = (data || []).map((item) => ({
        id: item.id,
        caId: item.ca_id,
        clientId: item.client_id,
        invoiceNumber: item.invoice_number,
        description: item.description,
        amount: item.amount,
        totalAmount: item.total_amount ?? item.amount,
        taxAmount: item.tax_amount ?? item.metadata?.taxAmount ?? 0,
        status: item.status,
        dueDate: item.due_date,
        paidAt: item.paid_at,
        issuedAt: item.issued_at,
        metadata: item.metadata,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      const payments = (paymentRows || []).map((p: any) => ({
        id: p.id,
        invoiceId: p.invoice_id,
        caId: p.ca_id,
        clientId: p.client_id,
        amount: Number(p.amount || 0),
        currency: p.currency || 'INR',
        status: p.status,
        gateway: p.gateway,
        orderId: p.razorpay_order_id || p.gateway_order_id,
        paymentId: p.razorpay_payment_id || p.gateway_payment_id || p.gateway_transaction_id,
        paymentMethod: p.payment_method,
        notes: p.notes,
        metadata: p.metadata,
        paidAt: p.paid_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      return {
        invoices,
        payments,
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },
    {
      method: 'GET',
      requireAuth: true,
    }
  );
}
