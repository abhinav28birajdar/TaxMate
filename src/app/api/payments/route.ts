/**
 * POST /api/payments - Create a new payment/invoice
 * Protected route: Requires CA role
 */

import { NextRequest } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createInvoiceRecord } from '@/lib/api/db-operations';
import { ApiError, HTTP_STATUS } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      // Rate limiting
      if (!checkRateLimit(user.sub, 50, 60000)) {
        throw new ApiError('Rate limit exceeded', {
          code: 'RATE_LIMIT',
          statusCode: HTTP_STATUS.INTERNAL_ERROR,
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
        clientId: result.clientId,
        amount: result.amount,
        status: result.status,
        dueDate: result.dueDate,
        createdAt: result.createdAt,
      };
    },
    {
      method: 'POST',
      requireAuth: true,
      allowedRoles: ['CA', 'SUPER_ADMIN'],
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
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const status = searchParams.get('status');

      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();

      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .or(`createdBy.eq.${user.sub},clientId.eq.${user.sub}`);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, count, error } = await query
        .order('createdAt', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        invoices: data || [],
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
