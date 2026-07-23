/**
 * POST /api/appointments - Create a new appointment
 * Protected route: Requires CA role
 */

import { NextRequest } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createAppointmentRecord } from '@/lib/api/db-operations';
import { ApiError, HTTP_STATUS } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

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
      const validation = validateInput(body, RequestSchemas.createAppointment);

      if (!validation.success) {
        throw new ApiError('Validation failed', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: validation.errors,
        });
      }

      // Validate time range
      const startTime = new Date(validation.data.startTime);
      const endTime = new Date(validation.data.endTime);

      if (endTime <= startTime) {
        throw new ApiError('End time must be after start time', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (startTime < new Date()) {
        throw new ApiError('Cannot create appointment in the past', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
      }

      // Create appointment
      const result = await createAppointmentRecord(user.sub, validation.data);

      return {
        id: result.id,
        title: result.title,
        startTime: result.startTime,
        endTime: result.endTime,
        type: result.type,
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
 * GET /api/appointments - List user's appointments
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');

      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();

      const { data, count, error } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .or(`caId.eq.${user.sub},clientId.eq.${user.sub}`)
        .order('startTime', { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      return {
        appointments: data || [],
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
