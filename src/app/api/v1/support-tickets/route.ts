import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { supportTicketSchema } from '@/lib/backend/validation';
import { ensureRole } from '@/lib/backend/rbac';
import { badRequest } from '@/lib/backend/errors';

const STAFF_OR_ADMIN = ['SUPER_ADMIN', 'ADMIN', 'STAFF'];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const status = request.nextUrl.searchParams.get('status');
    const isPrivileged = auth.roles.some((r) => STAFF_OR_ADMIN.includes(String(r).toUpperCase()));

    let query = supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!isPrivileged) {
      query = query.or(`user_id.eq.${auth.userId},created_by.eq.${auth.userId}`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return ok({ tickets: data || [] }, 'Support tickets fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const parsed = supportTicketSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        user_id: auth.userId,
        created_by: auth.userId,
        ticket_number: `TKT-${Date.now().toString(36).toUpperCase()}`,
        category: parsed.category || 'general',
        subject: parsed.subject,
        description: parsed.body,
        priority: parsed.priority || 'medium',
        status: 'open',
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return ok({ ticket: data }, 'Support ticket created', 201);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, STAFF_OR_ADMIN);

    const body = await request.json();
    const ticketId = typeof body.ticketId === 'string' ? body.ticketId.trim() : '';
    if (!ticketId) {
      throw badRequest('ticketId is required');
    }

    const updatePayload: Record<string, unknown> = {
      responded_by: auth.userId,
      responded_at: new Date().toISOString(),
    };
    if (body.status) {
      updatePayload.status = body.status;
      if (body.status === 'resolved' || body.status === 'closed') {
        updatePayload.resolved_at = new Date().toISOString();
      }
    }
    if (body.response !== undefined) {
      updatePayload.admin_response = body.response || null;
      updatePayload.resolution = body.response || null;
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updatePayload)
      .eq('id', ticketId)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return ok({ ticket: data }, 'Support ticket updated');
  } catch (error) {
    return fail(error);
  }
}
