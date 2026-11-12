import { NextRequest } from 'next/server';
import { handleApiRequest } from '@/lib/api/auth-middleware';
import { ApiError, HTTP_STATUS } from '@/lib/api/response';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cases/[id] - Get case details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const caseId = params.id;
      const supabase = getServiceClient();

      const { data: caseRecord, error } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (error || !caseRecord) {
        throw new ApiError('Case not found', {
          code: 'NOT_FOUND',
          statusCode: HTTP_STATUS.NOT_FOUND,
        });
      }

      const auth = await getSessionUser(req);
      const clientAllowed =
        auth && caseRecord.client_id
          ? await canAccessClientRecord(auth, caseRecord.client_id)
          : false;

      const isAuthorized =
        user.role === 'SUPER_ADMIN' ||
        user.role === 'ADMIN' ||
        caseRecord.ca_id === user.sub ||
        caseRecord.client_id === user.sub ||
        caseRecord.assigned_to === user.sub ||
        clientAllowed;

      if (!isAuthorized) {
        throw new ApiError('Forbidden', {
          code: 'FORBIDDEN',
          statusCode: HTTP_STATUS.FORBIDDEN,
        });
      }

      return caseRecord;
    },
    {
      method: 'GET',
      requireAuth: true,
    }
  );
}

/**
 * PUT /api/cases/[id] - Update case
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const caseId = params.id;
      const body = await req.json();
      const supabase = getServiceClient();

      const { data: existingCase } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (!existingCase) {
        throw new ApiError('Case not found', {
          code: 'NOT_FOUND',
          statusCode: HTTP_STATUS.NOT_FOUND,
        });
      }

      const auth = await getSessionUser(req);
      const clientAllowed =
        auth && existingCase.client_id
          ? await canAccessClientRecord(auth, existingCase.client_id)
          : false;

      if (
        user.role !== 'SUPER_ADMIN' &&
        user.role !== 'ADMIN' &&
        existingCase.client_id !== user.sub &&
        existingCase.ca_id !== user.sub &&
        existingCase.assigned_to !== user.sub &&
        !clientAllowed
      ) {
        throw new ApiError('Forbidden', {
          code: 'FORBIDDEN',
          statusCode: HTTP_STATUS.FORBIDDEN,
        });
      }

      const updates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (body.title !== undefined) updates.title = body.title;
      if (body.description !== undefined) updates.description = body.description;
      if (body.caseType !== undefined) updates.case_type = body.caseType;
      if (body.status !== undefined) updates.status = String(body.status).toLowerCase();
      if (body.priority !== undefined) updates.priority = String(body.priority).toUpperCase();
      if (body.deadline !== undefined) {
        updates.deadline = body.deadline ? new Date(body.deadline).toISOString().split('T')[0] : null;
      }
      if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo;
      if (body.notes !== undefined) updates.notes = body.notes;
      if (body.metadata && typeof body.metadata === 'object') {
        updates.metadata = {
          ...(existingCase.metadata && typeof existingCase.metadata === 'object' ? existingCase.metadata : {}),
          ...body.metadata,
        };
      }

      const { data: updatedCase, error } = await supabase
        .from('cases')
        .update(updates)
        .eq('id', caseId)
        .select()
        .single();

      if (error) throw error;
      return updatedCase;
    },
    {
      requireAuth: true,
    }
  );
}

export const PATCH = PUT;

/**
 * DELETE /api/cases/[id] - Delete case
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const caseId = params.id;
      const supabase = getServiceClient();

      const { data: existingCase } = await supabase
        .from('cases')
        .select('ca_id, assigned_to')
        .eq('id', caseId)
        .single();

      if (!existingCase) {
        throw new ApiError('Case not found', {
          code: 'NOT_FOUND',
          statusCode: HTTP_STATUS.NOT_FOUND,
        });
      }

      if (
        user.role !== 'SUPER_ADMIN' &&
        user.role !== 'ADMIN' &&
        existingCase.ca_id !== user.sub &&
        existingCase.assigned_to !== user.sub
      ) {
        throw new ApiError('Forbidden', {
          code: 'FORBIDDEN',
          statusCode: HTTP_STATUS.FORBIDDEN,
        });
      }

      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', caseId);

      if (error) throw error;
      return { success: true, message: 'Case deleted successfully' };
    },
    {
      method: 'DELETE',
      requireAuth: true,
      allowedRoles: ['CA', 'STAFF', 'ADMIN', 'SUPER_ADMIN'],
    }
  );
}
