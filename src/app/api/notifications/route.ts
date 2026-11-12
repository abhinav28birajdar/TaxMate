import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const VALID_NOTIFICATION_TYPES = new Set([
  'TASK_ASSIGNED',
  'TASK_DUE',
  'TASK_COMPLETED',
  'DOCUMENT_REQUESTED',
  'DOCUMENT_UPLOADED',
  'DOCUMENT_VERIFIED',
  'INVOICE_SENT',
  'PAYMENT_RECEIVED',
  'FILING_STATUS_CHANGED',
  'MESSAGE_RECEIVED',
  'SYSTEM',
  'compliance_due',
  'filing_overdue',
  'payment_due',
  'document_pending',
  'task_assigned',
  'appointment_reminder',
  'system_alert',
  'message_received',
  'proposal_received',
  'engagement_request',
]);

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const from = (page - 1) * limit;

    if (requestedUserId && requestedUserId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = requestedUserId && auth.isAdmin ? requestedUserId : auth.userId;
    const supabase = getServiceClient();

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, count, error } = await query.range(from, from + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, id, all = false } = body;
    const targetId = notificationId || id;
    const now = new Date().toISOString();

    const supabase = getServiceClient();
    let query = supabase
      .from('notifications')
      .update({
        read: true,
        is_read: true,
        read_at: now,
      })
      .eq('user_id', auth.userId);

    if (!all && targetId) {
      query = query.eq('id', targetId);
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Notification(s) marked as read' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetUserId, title, message, type = 'SYSTEM' } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const recipientId = targetUserId || auth.userId;

    if (recipientId !== auth.userId && !auth.isAdmin) {
      const canNotifyClient = auth.isCAOrStaff && (await canAccessClientRecord(auth, recipientId));
      if (!canNotifyClient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const safeType = VALID_NOTIFICATION_TYPES.has(String(type)) ? String(type) : 'SYSTEM';
    const supabase = getServiceClient();

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: recipientId,
        title,
        message,
        type: safeType,
        read: false,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, notification: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 500 }
    );
  }
}
