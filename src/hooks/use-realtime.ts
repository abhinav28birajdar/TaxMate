/**
 * REAL-TIME SUBSCRIPTION SYSTEM
 * Handles all real-time updates using Supabase
 * 
 * Created: 2026-04-08
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Generic hook for subscribing to database changes
 */
export function useRealtimeSubscription<T>(
  table: string,
  filter?: string,
  onInsert?: (record: T) => void,
  onUpdate?: (record: T) => void,
  onDelete?: (record: T) => void,
  _dependencies?: unknown[]
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete });
  callbacksRef.current = { onInsert, onUpdate, onDelete };

  useEffect(() => {
    const supabase = createClient();
    const channelName = `realtime-${table}-${filter || 'all'}`;

    // Create channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          callbacksRef.current.onInsert?.(payload.new as T);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          callbacksRef.current.onUpdate?.(payload.new as T);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload) => {
          callbacksRef.current.onDelete?.(payload.old as T);
        }
      );

    // Subscribe
    channel.subscribe((status) => {
      setIsSubscribed(status === 'SUBSCRIBED');
    });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, filter]);

  return isSubscribed;
}

/**
 * Hook for real-time tasks
 */
export function useRealtimeTasks(
  userId: string,
  onTaskAdded?: (task: any) => void,
  onTaskUpdated?: (task: any) => void,
  onTaskDeleted?: (task: any) => void
) {
  return useRealtimeSubscription(
    'tasks',
    `ca_id=eq.${userId},client_id=eq.${userId}`,
    onTaskAdded,
    onTaskUpdated,
    onTaskDeleted,
    [userId]
  );
}

/**
 * Hook for real-time messages
 */
export function useRealtimeMessages(
  conversationId: string,
  onMessageAdded?: (msg: any) => void,
  onMessageUpdated?: (msg: any) => void,
  onMessageDeleted?: (msg: any) => void
) {
  return useRealtimeSubscription(
    'messages',
    `conversation_id=eq.${conversationId}`,
    onMessageAdded,
    onMessageUpdated,
    onMessageDeleted,
    [conversationId]
  );
}

/**
 * Hook for real-time notifications
 */
export function useRealtimeNotifications(
  userId: string,
  onNotification?: (notification: any) => void
) {
  return useRealtimeSubscription(
    'notifications',
    `user_id=eq.${userId}`,
    onNotification,
    undefined,
    undefined,
    [userId]
  );
}

/**
 * Hook for real-time appointments
 */
export function useRealtimeAppointments(
  userId: string,
  onAppointmentAdded?: (apt: any) => void,
  onAppointmentUpdated?: (apt: any) => void
) {
  return useRealtimeSubscription(
    'appointments',
    `ca_id=eq.${userId},client_id=eq.${userId}`,
    onAppointmentAdded,
    onAppointmentUpdated,
    undefined,
    [userId]
  );
}

/**
 * Hook for real-time invoices
 */
export function useRealtimeInvoices(
  userId: string,
  onInvoiceAdded?: (inv: any) => void,
  onInvoiceUpdated?: (inv: any) => void,
  onInvoiceDeleted?: (inv: any) => void
) {
  return useRealtimeSubscription(
    'invoices',
    `ca_id=eq.${userId},client_id=eq.${userId}`,
    onInvoiceAdded,
    onInvoiceUpdated,
    onInvoiceDeleted,
    [userId]
  );
}

/**
 * Hook for real-time presence (who's online)
 */
export function useRealtimePresence(
  userId: string,
  userRole: string
) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const presenceRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const presenceChannel = supabase.channel(`presence:${userRole}`, {
      config: {
        broadcast: { self: true },
        presence: { key: userId },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state)
          .flat()
          .filter((user: any) => user.user_id !== userId);
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers((prev) => [
          ...prev,
          ...newPresences.filter((p: any) => p.user_id !== userId),
        ]);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        setOnlineUsers((prev) =>
          prev.filter(
            (p: any) => !leftPresences.some((l: any) => l.user_id === p.user_id)
          )
        );
      });

    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({
          user_id: userId,
          presence: 'online',
          timestamp: new Date().toISOString(),
        });
      }
    });

    presenceRef.current = presenceChannel;

    return () => {
      if (presenceRef.current) {
        supabase.removeChannel(presenceRef.current);
      }
    };
  }, [userId, userRole]);

  return onlineUsers;
}

/**
 * Hook for typing indicators
 */
export function useTypingIndicator(
  conversationId: string,
  userId: string
) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setTyping = useCallback((isTyping: boolean) => {
    if (typingRef.current) {
      typingRef.current.send({
        type: 'broadcast',
        event: isTyping ? 'user_typing' : 'user_stop_typing',
        payload: { user_id: userId, conversation_id: conversationId },
      });
    }

    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
      }, 3000); // Auto-stop after 3 seconds
    }
  }, [conversationId, userId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`typing:${conversationId}`);

    channel
      .on('broadcast', { event: 'user_typing' }, ({ payload }) => {
        setTypingUsers((prev) => {
          const filtered = prev.filter((id) => id !== payload.user_id);
          return [...filtered, payload.user_id];
        });
      })
      .on('broadcast', { event: 'user_stop_typing' }, ({ payload }) => {
        setTypingUsers((prev) =>
          prev.filter((id) => id !== payload.user_id)
        );
      });

    channel.subscribe();
    typingRef.current = channel;

    return () => {
      if (typingRef.current) {
        supabase.removeChannel(typingRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId]);

  return { typingUsers, setTyping };
}

/**
 * Hook for collaborative features (cursor position, user focus)
 */
export function useCollaboration(
  documentId: string,
  userId: string
) {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const collabRef = useRef<RealtimeChannel | null>(null);

  const updateCursorPosition = useCallback(
    (line: number, column: number) => {
      if (collabRef.current) {
        collabRef.current.send({
          type: 'broadcast',
          event: 'cursor_move',
          payload: { user_id: userId, line, column },
        });
      }
    },
    [userId]
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`collab:${documentId}`);

    channel
      .on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
        setCollaborators((prev) => {
          const filtered = prev.filter((c) => c.user_id !== payload.user_id);
          return [...filtered, payload];
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setCollaborators((prev) =>
          prev.filter(
            (c) => !leftPresences.some((l: any) => l.user_id === c.user_id)
          )
        );
      });

    channel.subscribe();
    collabRef.current = channel;

    return () => {
      if (collabRef.current) {
        supabase.removeChannel(collabRef.current);
      }
    };
  }, [documentId]);

  return { collaborators, updateCursorPosition };
}

/**
 * Utility: Batch subscribe to multiple tables
 */
export function useMultipleRealtimeSubscriptions(
  subscriptions: Array<{
    table: string;
    filter?: string;
    onInsert?: (record: any) => void;
    onUpdate?: (record: any) => void;
    onDelete?: (record: any) => void;
  }>
) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) return;
    const supabase = createClient();
    const channels = subscriptions.map((sub) => {
      return supabase
        .channel(`multi-${sub.table}-${sub.filter || 'all'}-${Math.random()}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: sub.table, ...(sub.filter && { filter: sub.filter }) },
          (payload) => sub.onInsert?.(payload.new)
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: sub.table, ...(sub.filter && { filter: sub.filter }) },
          (payload) => sub.onUpdate?.(payload.new)
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: sub.table, ...(sub.filter && { filter: sub.filter }) },
          (payload) => sub.onDelete?.(payload.old)
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setIsSubscribed(true);
        });
    });

    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [JSON.stringify(subscriptions.map(s => `${s.table}:${s.filter}`))]);

  return isSubscribed;
}
