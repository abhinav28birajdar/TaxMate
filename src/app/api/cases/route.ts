/**
 * POST /api/cases - Create a new case
 * Protected route: Requires CA role
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createCaseRecord } from '@/lib/api/db-operations';
import { errorResponse, ApiError, HTTP_STATUS } from '@/lib/api/response';

import { canAccessClientRecord, getResolvedClientIdsForUser, getSessionUser } from '@/lib/api/server-auth';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      // Rate limiting
      if (!checkRateLimit(user.sub, 50, 60000)) {
        throw new ApiError('Rate limit exceeded. Please try again later.', {
          code: 'RATE_LIMIT',
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
        });
      }

      // Parse and validate request body
      const body = await request.json();
      const validation = validateInput(body, RequestSchemas.createCase);

      if (!validation.success) {
        throw new ApiError('Validation failed', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: validation.errors,
        });
      }

      // Create case
      if (validation.data.clientId) {
        const auth = await getSessionUser(req);
        if (auth) {
          const allowed = await canAccessClientRecord(auth, validation.data.clientId);
          if (!allowed) {
            throw new ApiError('Forbidden', {
              code: 'FORBIDDEN',
              statusCode: HTTP_STATUS.FORBIDDEN,
            });
          }
        }
      }

      const result = await createCaseRecord(user.sub, validation.data);

      return {
        id: result.id,
        caseNumber: result.case_number,
        title: result.title,
        description: result.description,
        caseType: result.case_type,
        status: result.status,
        priority: result.priority,
        deadline: result.deadline,
        clientId: result.client_id,
        metadata: result.metadata,
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
 * GET /api/cases - List cases for user
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
      const status = searchParams.get('status');
      const priority = searchParams.get('priority');
      const search = searchParams.get('search');
      const clientId = searchParams.get('clientId');

      const { getServiceClient } = await import('@/lib/backend/supabase');
      const supabase = getServiceClient();

      let query = supabase
        .from('cases')
        .select('*', { count: 'exact' });

      // Role-based visibility
      if (user.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(user.sub);
        query = query.in('client_id', clientIds);
      } else if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        query = query.or(`ca_id.eq.${user.sub},assigned_to.eq.${user.sub}`);
      }

      if (clientId) {
        const auth = await getSessionUser(req);
        if (auth) {
          const allowed = await canAccessClientRecord(auth, clientId);
          if (!allowed) {
            throw new ApiError('Forbidden', {
              code: 'FORBIDDEN',
              statusCode: HTTP_STATUS.FORBIDDEN,
            });
          }
        }
        query = query.eq('client_id', clientId);
      }

      if (status && status !== 'all') {
        query = query.eq('status', status.toLowerCase());
      }

      if (priority && priority !== 'all') {
        query = query.eq('priority', priority.toUpperCase());
      }

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const rawCases = data || [];
      const clientIds = Array.from(new Set(rawCases.map((c: any) => c.client_id).filter(Boolean)));
      const clientNameMap = new Map<string, string>();
      if (clientIds.length > 0) {
        const [{ data: clients }, { data: users }] = await Promise.all([
          supabase.from('clients').select('id, full_name, display_name').in('id', clientIds),
          supabase.from('users').select('id, name').in('id', clientIds),
        ]);
        for (const c of clients || []) clientNameMap.set(c.id, c.display_name || c.full_name);
        for (const u of users || []) if (!clientNameMap.has(u.id)) clientNameMap.set(u.id, u.name);
      }

      const enrichedCases = rawCases.map((c: any) => ({
        ...c,
        clientName: c.client_id ? clientNameMap.get(c.client_id) || c.metadata?.clientName || 'Client Entity' : c.metadata?.clientName || 'Internal Case',
      }));

      return {
        cases: enrichedCases,
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

