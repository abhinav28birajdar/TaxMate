/**
 * Supabase Realtime Subscriptions
 * 
 * Centralized realtime subscription management for:
 * - Database table changes
 * - User presence
 * - Notifications
 * - Chat messages
 * - Activity logs
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { getPrimaryClient } from './dual-clients';

// Store active channels for cleanup
const activeChannels: Map<string, RealtimeChannel> = new Map();

// Payload type for realtime changes
interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, unknown>;
  old: Record<string, unknown>;
  schema: string;
  table: string;
  commit_timestamp: string;
}

/**
 * Subscribe to changes on a specific table
 */
export function subscribeToTable(
  tableName: string,
  callback: (payload: RealtimePayload) => void,
  options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    schema?: string;
  }
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `table-${tableName}-${Date.now()}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      {
        event: options?.event || '*',
        schema: options?.schema || 'public',
        table: tableName,
        filter: options?.filter,
      } as Record<string, unknown>,
      (payload: RealtimePayload) => {
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`✅ Subscribed to ${tableName} changes`);
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`❌ Error subscribing to ${tableName}`);
      }
    });

  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Subscribe to user presence changes
 */
export function subscribeToPresence(
  callback: (presences: Map<string, { status: string; lastSeen: string }>) => void,
  userIds?: string[]
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `presence-${Date.now()}`;
  
  let filter: string | undefined;
  if (userIds && userIds.length > 0) {
    filter = `user_id=in.(${userIds.join(',')})`;
  }

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter,
      } as Record<string, unknown>,
      (payload: { new: Record<string, unknown> }) => {
        const presence = payload.new as { user_id: string; status: string; last_seen_at: string };
        const presenceMap = new Map<string, { status: string; lastSeen: string }>();
        presenceMap.set(presence.user_id, {
          status: presence.status,
          lastSeen: presence.last_seen_at,
        });
        callback(presenceMap);
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Subscribe to notifications for a specific user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    action_url?: string;
    created_at: string;
  }) => void
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `notifications-${userId}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      } as Record<string, unknown>,
      (payload: { new: Record<string, unknown> }) => {
        const notification = payload.new as {
          id: string;
          type: string;
          title: string;
          message: string;
          action_url?: string;
          created_at: string;
        };
        callback(notification);
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: string;
    created_at: string;
  }) => void
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `messages-${conversationId}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      } as Record<string, unknown>,
      (payload: { new: Record<string, unknown> }) => {
        const message = payload.new as {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          created_at: string;
        };
        callback(message);
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Subscribe to typing indicators in a conversation
 */
export function subscribeToTyping(
  conversationId: string,
  callback: (typing: { user_id: string; is_typing: boolean }) => void
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `typing-${conversationId}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      } as Record<string, unknown>,
      (payload: { new: Record<string, unknown> }) => {
        const typing = payload.new as { user_id: string; is_typing: boolean };
        callback(typing);
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Subscribe to case updates
 */
export function subscribeToCaseUpdates(
  caseId: string,
  callback: (caseUpdate: {
    id: string;
    status: string;
    priority: string;
    updated_at: string;
  }) => void
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `case-${caseId}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes' as 'system',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'cases',
        filter: `id=eq.${caseId}`,
      } as Record<string, unknown>,
      (payload: { new: Record<string, unknown> }) => {
        const caseUpdate = payload.new as {
          id: string;
          status: string;
          priority: string;
          updated_at: string;
        };
        callback(caseUpdate);
      }
    )
    .subscribe();

  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Subscribe to dashboard metrics for real-time updates
 */
export function subscribeToDashboardMetrics(
  userId: string,
  role: 'ca' | 'client',
  callback: (metric: { type: string; value: number }) => void
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `dashboard-${userId}`;
  
  // Subscribe to multiple tables for dashboard updates
  const channel = supabase.channel(channelName);

  // Cases updates
  if (role === 'ca') {
    channel.on(
      'postgres_changes' as 'system',
      {
        event: '*',
        schema: 'public',
        table: 'cases',
      } as Record<string, unknown>,
      () => {
        callback({ type: 'cases_updated', value: 1 });
      }
    );
  }

  // Payments updates
  channel.on(
    'postgres_changes' as 'system',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'payments',
    } as Record<string, unknown>,
    (payload: { new: Record<string, unknown> }) => {
      const payment = payload.new as { amount: number; status: string };
      if (payment.status === 'completed') {
        callback({ type: 'payment_received', value: payment.amount });
      }
    }
  );

  // Client requests
  if (role === 'ca') {
    channel.on(
      'postgres_changes' as 'system',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ca_client_relationships',
      } as Record<string, unknown>,
      () => {
        callback({ type: 'new_client_request', value: 1 });
      }
    );
  }

  channel.subscribe();
  activeChannels.set(channelName, channel);
  return channel;
}

/**
 * Broadcast presence using Supabase Realtime Presence
 */
export function broadcastPresence(
  userId: string,
  status: 'online' | 'away' | 'busy' | 'offline'
): RealtimeChannel {
  const supabase = getPrimaryClient();
  const channelName = `presence-broadcast`;
  
  let channel = activeChannels.get(channelName);
  
  if (!channel) {
    channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });
    activeChannels.set(channelName, channel);
  }

  channel.track({
    user_id: userId,
    status,
    online_at: new Date().toISOString(),
  });

  return channel;
}

/**
 * Unsubscribe from a specific channel
 */
export function unsubscribe(channelName: string): void {
  const channel = activeChannels.get(channelName);
  if (channel) {
    const supabase = getPrimaryClient();
    supabase.removeChannel(channel);
    activeChannels.delete(channelName);
    console.log(`Unsubscribed from ${channelName}`);
  }
}

/**
 * Unsubscribe from all active channels
 */
export function unsubscribeAll(): void {
  const supabase = getPrimaryClient();
  activeChannels.forEach((channel, name) => {
    supabase.removeChannel(channel);
    console.log(`Unsubscribed from ${name}`);
  });
  activeChannels.clear();
}

/**
 * Get count of active subscriptions
 */
export function getActiveSubscriptionCount(): number {
  return activeChannels.size;
}

export default {
  subscribeToTable,
  subscribeToPresence,
  subscribeToNotifications,
  subscribeToMessages,
  subscribeToTyping,
  subscribeToCaseUpdates,
  subscribeToDashboardMetrics,
  broadcastPresence,
  unsubscribe,
  unsubscribeAll,
  getActiveSubscriptionCount,
};
