import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { notificationCreateSchema } from '@/lib/backend/validation';
import { ensureRole } from '@/lib/backend/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const page = Number(request.nextUrl.searchParams.get('page') || '1');
    const pageSize = Number(request.nextUrl.searchParams.get('limit') || '20');
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query.range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    return ok(
      {
        notifications: data || [],
        total: count || 0,
        page,
        pageSize,
      },
      'Notifications fetched'
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.role, ['admin', 'moderator']);

    const body = await request.json();
    const parsed = notificationCreateSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: parsed.userId,
        type: parsed.type,
        title: parsed.title,
        message: parsed.message,
        metadata: parsed.metadata || {},
        is_read: false,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return ok({ notification: data }, 'Notification created', 201);
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids : [];

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', auth.userId)
      .in('id', ids);

    if (error) {
      throw error;
    }

    return ok({}, 'Notifications marked as read');
  } catch (error) {
    return fail(error);
  }
}
