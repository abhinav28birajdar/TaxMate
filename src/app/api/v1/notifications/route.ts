import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { notificationCreateSchema } from '@/lib/backend/validation';
import { ensureRole } from '@/lib/backend/rbac';

const ALLOWED_NOTIFICATION_TYPES = new Set([
  'TASK_ASSIGNED',
  'TASK_COMPLETED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_VERIFIED',
  'INVOICE_SENT',
  'PAYMENT_RECEIVED',
  'DEADLINE_REMINDER',
  'MESSAGE_RECEIVED',
  'APPOINTMENT_SCHEDULED',
  'FILING_STATUS_CHANGED',
  'SECURITY',
  'SYSTEM',
  'BILLING',
  'FEATURE',
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'deadline_reminder',
  'document_uploaded',
  'document_verified',
  'document_rejected',
  'case_update',
  'payment_received',
  'payment_due',
  'appointment_reminder',
  'message_received',
  'ca_verified',
  'system',
]);

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') || '1') || 1);
    const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit') || '20') || 20));
    const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';

    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', auth.userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.or('is_read.eq.false,read.eq.false');
    }

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query.range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    const notifications = (data || []).map((n: any) => ({
      ...n,
      read: Boolean(n.read ?? n.is_read),
      is_read: Boolean(n.is_read ?? n.read),
    }));

    return ok(
      {
        notifications,
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
    ensureRole(auth.roles, ['SUPER_ADMIN', 'ADMIN', 'STAFF']);

    const body = await request.json();
    const parsed = notificationCreateSchema.parse(body);
    const targetUserId = typeof body.userId === 'string' && body.userId ? body.userId : auth.userId;
    const normalizedType = ALLOWED_NOTIFICATION_TYPES.has(parsed.type)
      ? parsed.type
      : ALLOWED_NOTIFICATION_TYPES.has(parsed.type.toUpperCase())
      ? parsed.type.toUpperCase()
      : 'system';

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: targetUserId,
        type: normalizedType,
        title: parsed.title,
        message: parsed.body || parsed.title,
        body: parsed.body || parsed.title,
        metadata: parsed.metadata || {},
        read: false,
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
    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === 'string') : [];
    const nowIso = new Date().toISOString();

    if (body.markAll) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({
          read: true,
          is_read: true,
          read_at: nowIso,
        })
        .eq('user_id', auth.userId)
        .or('read.eq.false,is_read.eq.false');

      if (error) {
        throw error;
      }
      return ok({}, 'All notifications marked as read');
    }

    if (ids.length === 0) {
      return ok({}, 'No notifications specified');
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({
        read: true,
        is_read: true,
        read_at: nowIso,
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

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const id = request.nextUrl.searchParams.get('id');
    const clearAll = request.nextUrl.searchParams.get('all') === 'true';

    if (clearAll) {
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ is_deleted: true })
        .eq('user_id', auth.userId);
      if (error) throw error;
      return ok({}, 'All notifications cleared');
    }

    if (!id) {
      return ok({}, 'Notification ID not provided');
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_deleted: true })
      .eq('user_id', auth.userId)
      .eq('id', id);

    if (error) throw error;
    return ok({}, 'Notification removed');
  } catch (error) {
    return fail(error);
  }
}
