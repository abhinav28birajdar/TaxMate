import { createClient } from '@/utils/supabase/server';

const VALID_NOTIFICATION_TYPES = [
  'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_OVERDUE', 'INVOICE_SENT', 'INVOICE_PAID',
  'INVOICE_OVERDUE', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'DOCUMENT_SHARED',
  'APPOINTMENT_BOOKED', 'APPOINTMENT_REMINDER', 'MESSAGE_RECEIVED', 'FILING_DEADLINE',
  'CA_APPROVED', 'SYSTEM_ANNOUNCEMENT', 'OTHER'
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (str: string) => UUID_REGEX.test(str);

function getNotificationType(type: string): string {
  if (!type) return 'OTHER';
  const upper = type.toUpperCase();
  return VALID_NOTIFICATION_TYPES.includes(upper) ? upper : 'OTHER';
}

export const notificationService = {
  // Create notification
  async createNotification(data: {
    userId: string;
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
  }) {
    const supabase = await createClient();

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: data.userId,
        type: getNotificationType(data.type),
        title: data.title,
        message: data.message,
        related_entity_id: data.relatedId && isUuid(data.relatedId) ? data.relatedId : null,
        related_entity_type: data.relatedType || null,
        read: false,
        metadata: { actionUrl: data.actionUrl, originalRelatedId: data.relatedId },
      })
      .select()
      .single();

    if (error) throw error;
    return notification;
  },

  // Get notifications
  async getNotifications(userId: string, filters?: {
    read?: boolean;
    type?: string;
    skip?: number;
    take?: number;
  }) {
    const supabase = await createClient();

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (filters?.read !== undefined) {
      query = query.eq('read', filters.read);
    }
    if (filters?.type) {
      query = query.eq('type', getNotificationType(filters.type));
    }

    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    const { data: notifications, error, count } = await query;
    if (error) throw error;

    // Get unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (countError) throw countError;

    return { notifications: notifications || [], unreadCount: unreadCount || 0 };
  },

  // Mark as read
  async markAsRead(notificationId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark all as read
  async markAllAsRead(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) throw error;
    return data;
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    const supabase = await createClient();

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  },

  // Get unread count
  async getUnreadCount(userId: string) {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  },

  // Bulk create notifications
  async createBulkNotifications(userIds: string[], data: {
    type: string;
    title: string;
    message: string;
    relatedId?: string;
    relatedType?: string;
    actionUrl?: string;
  }) {
    return Promise.all(
      userIds.map((userId) =>
        this.createNotification({ ...data, userId })
      )
    );
  },

  // Get notification preferences
  async getPreferences(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update notification preferences
  async updatePreferences(userId: string, data: any) {
    const supabase = await createClient();

    const updatePayload = {
      user_id: userId,
      task_notifications: data.task_notifications ?? data.taskNotifications ?? true,
      invoice_notifications: data.invoice_notifications ?? data.invoiceNotifications ?? true,
      payment_notifications: data.payment_notifications ?? data.paymentNotifications ?? true,
      appointment_notifications: data.appointment_notifications ?? data.appointmentNotifications ?? true,
      email_digest: data.email_digest ?? data.emailDigest ?? true,
      digest_frequency: data.digest_frequency ?? data.digestFrequency ?? 'daily',
    };

    const { data: pref, error } = await supabase
      .from('notification_preferences')
      .upsert(updatePayload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return pref;
  },
};
