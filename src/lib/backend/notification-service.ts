import { getServiceClient } from './supabase';
import { internalError, notFound } from './errors';
import { paginate } from '@/lib/utils';

export async function getNotifications(userId: string, page: number = 1, limit: number = 20) {
  const client = getServiceClient();
  const { offset } = paginate(page, limit);

  const { data: notifications, error, count } = await client
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw internalError('Failed to fetch notifications');
  }

  return {
    items: notifications || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  metadata?: unknown
) {
  const client = getServiceClient();

  const { data: notification, error } = await client
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      metadata,
    })
    .select()
    .single();

  if (error) {
    throw internalError('Failed to create notification');
  }

  return notification;
}

export async function markAsRead(userId: string, notificationId?: string) {
  const client = getServiceClient();

  if (notificationId) {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      throw internalError('Failed to mark notification as read');
    }
  } else {
    const { error } = await client
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw internalError('Failed to mark notifications as read');
    }
  }
}

export async function getUnreadCount(userId: string): Promise<number> {
  const client = getServiceClient();

  const { count, error } = await client
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return count || 0;
}
