/**
 * POST /api/cases - Create a new case
 * Protected route: Requires CA role
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createCaseRecord } from '@/lib/api/db-operations';
import { errorResponse, ApiError, HTTP_STATUS } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      // Rate limiting
      if (!checkRateLimit(user.sub, 50, 60000)) {
        throw new ApiError('Rate limit exceeded. Please try again later.', {
          code: 'RATE_LIMIT',
          statusCode: HTTP_STATUS.INTERNAL_ERROR,
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
      const result = await createCaseRecord(user.sub, validation.data);

      return {
        id: result.id,
        title: result.title,
        status: result.status,
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
