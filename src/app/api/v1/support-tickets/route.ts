import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { supportTicketSchema } from '@/lib/backend/validation';
import { ensureRole } from '@/lib/backend/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const status = request.nextUrl.searchParams.get('status');

    let query = supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (auth.role === 'user') {
      query = query.eq('created_by', auth.userId);
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
        created_by: auth.userId,
        subject: parsed.subject,
        description: parsed.description,
        priority: parsed.priority,
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
    ensureRole(auth.role, ['admin', 'moderator']);

    const body = await request.json();
    const ticketId = body.ticketId as string;

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        status: body.status,
        admin_response: body.response || null,
        responded_by: auth.userId,
        responded_at: new Date().toISOString(),
      })
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
