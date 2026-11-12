/**
 * POST /api/appointments - Create a new appointment (CA or Client)
 * GET /api/appointments - List user's appointments with participant metadata
 */

import { NextRequest } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createAppointmentRecord } from '@/lib/api/db-operations';
import { ApiError, HTTP_STATUS } from '@/lib/api/response';
import { canAccessClientRecord, getResolvedClientIdsForUser, getSessionUser } from '@/lib/api/server-auth';
import { getServiceClient } from '@/lib/backend/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      if (!checkRateLimit(user.sub, 50, 60000)) {
        throw new ApiError('Rate limit exceeded', {
          code: 'RATE_LIMIT',
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
        });
      }

      const body = await request.json();
      const validation = validateInput(body, RequestSchemas.createAppointment);

      if (!validation.success) {
        throw new ApiError('Validation failed', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: validation.errors,
        });
      }

      const startTime = new Date(validation.data.startTime);
      const endTime = new Date(validation.data.endTime);

      if (endTime <= startTime) {
        throw new ApiError('End time must be after start time', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
      }

      if (startTime < new Date(Date.now() - 5 * 60 * 1000)) {
        throw new ApiError('Cannot create appointment in the past', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const supabase = getServiceClient();
      const auth = await getSessionUser(req);

      let resolvedClientId = validation.data.clientId || '';
      let resolvedCaId = validation.data.caId || '';

      if (user.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(user.sub);
        if (resolvedClientId) {
          if (!clientIds.includes(resolvedClientId)) {
            throw new ApiError('Forbidden', {
              code: 'FORBIDDEN',
              statusCode: HTTP_STATUS.FORBIDDEN,
            });
          }
        } else {
          resolvedClientId = clientIds[0] || user.sub;
        }

        if (!resolvedCaId) {
          const [{ data: clientRow }, { data: relRow }] = await Promise.all([
            supabase
              .from('clients')
              .select('assigned_ca_id')
              .eq('portal_user_id', user.sub)
              .limit(1)
              .maybeSingle(),
            supabase
              .from('ca_client_relationships')
              .select('ca_id')
              .eq('client_id', user.sub)
              .in('status', ['accepted', 'active'])
              .limit(1)
              .maybeSingle(),
          ]);
          resolvedCaId = clientRow?.assigned_ca_id || relRow?.ca_id || '';
        }

        if (!resolvedCaId) {
          throw new ApiError('Please select a Chartered Accountant for this consultation', {
            code: 'VALIDATION_ERROR',
            statusCode: HTTP_STATUS.BAD_REQUEST,
          });
        }
      } else {
        resolvedCaId = user.sub;
        if (!resolvedClientId) {
          throw new ApiError('Client ID is required', {
            code: 'VALIDATION_ERROR',
            statusCode: HTTP_STATUS.BAD_REQUEST,
          });
        }
        if (auth) {
          const allowed = await canAccessClientRecord(auth, resolvedClientId);
          if (!allowed) {
            throw new ApiError('Forbidden', {
              code: 'FORBIDDEN',
              statusCode: HTTP_STATUS.FORBIDDEN,
            });
          }
        }
      }

      const result = await createAppointmentRecord(user.sub, {
        ...validation.data,
        clientId: resolvedClientId,
        caId: resolvedCaId,
        createdBy: user.sub,
      });

      const notifyRecipient = user.role === 'CLIENT' ? resolvedCaId : resolvedClientId;
      if (notifyRecipient && notifyRecipient !== user.sub) {
        await supabase.from('notifications').insert({
          user_id: notifyRecipient,
          title: 'Consultation Scheduled',
          message: `${validation.data.title} scheduled for ${startTime.toLocaleString('en-IN')}`,
          type: 'APPOINTMENT_SCHEDULED',
          read: false,
          is_read: false,
        });
      }

      return {
        id: result.id,
        caId: result.ca_id,
        clientId: result.client_id,
        title: result.title,
        status: result.status,
        startTime: result.start_time,
        endTime: result.end_time,
        type: result.type,
        notes: result.notes,
        metadata: result.metadata,
        createdAt: result.created_at,
      };
    },
    {
      method: 'POST',
      requireAuth: true,
    }
  );
}

export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const { searchParams } = new URL(req.url);
      const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
      const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

      const supabase = getServiceClient();

      let query = supabase
        .from('appointments')
        .select('*', { count: 'exact' });

      if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        const clientIds = await getResolvedClientIdsForUser(user.sub);
        query = query.or(
          `ca_id.eq.${user.sub},created_by.eq.${user.sub},client_id.in.(${clientIds.join(',')})`
        );
      }

      const { data, count, error } = await query
        .order('start_time', { ascending: true })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      const userIds = Array.from(
        new Set(
          (data || []).flatMap((item: any) => [item.ca_id, item.client_id]).filter(Boolean)
        )
      );

      const userMap = new Map<string, any>();
      const clientMap = new Map<string, any>();
      const caProfileMap = new Map<string, any>();

      if (userIds.length > 0) {
        const [{ data: users }, { data: clients }, { data: caProfiles }] = await Promise.all([
          supabase.from('users').select('id, name, avatar_url').in('id', userIds),
          supabase.from('clients').select('id, full_name, display_name, portal_user_id').in('id', userIds),
          supabase.from('ca_profiles').select('user_id, firm_name, consultation_fee').in('user_id', userIds),
        ]);

        for (const u of users || []) userMap.set(u.id, u);
        for (const c of clients || []) clientMap.set(c.id, c);
        for (const cp of caProfiles || []) caProfileMap.set(cp.user_id, cp);
      }

      const appointments = (data || []).map((item: any) => {
        const caUser = userMap.get(item.ca_id);
        const caProfile = caProfileMap.get(item.ca_id);
        const clientRecord = clientMap.get(item.client_id);
        const clientUser = userMap.get(item.client_id);

        return {
          id: item.id,
          caId: item.ca_id,
          caName: caUser?.name || caProfile?.firm_name || 'Chartered Accountant',
          caAvatar: caUser?.avatar_url || null,
          clientId: item.client_id,
          clientName:
            clientRecord?.display_name ||
            clientRecord?.full_name ||
            clientUser?.name ||
            'Client',
          title: item.title,
          description: item.description,
          category: item.metadata?.category || item.appointment_type || 'Tax Planning',
          fee:
            item.metadata?.fee ||
            (caProfile?.consultation_fee
              ? `₹${Number(caProfile.consultation_fee).toLocaleString('en-IN')}`
              : 'Retainer'),
          type: item.type,
          status: item.status,
          startTime: item.start_time,
          endTime: item.end_time,
          meetingLink: item.meeting_link,
          notes: item.notes,
          metadata: item.metadata || {},
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        };
      });

      return {
        appointments,
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
