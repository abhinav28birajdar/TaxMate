/**
 * REAL-TIME SUBSCRIPTION SYSTEM
 * Handles all real-time updates using Supabase
 *
 * Created: 2026-04-08
 */

'use client';

import { useEffect, useState, useCallback, useRef, useId } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

function getSafeSupabaseClient() {
  try {
    return createClient();
  } catch {
    return null;
  }
}

function isInvalidFilter(filter?: string) {
  if (!filter) return false;
  return filter.endsWith('=') || filter.includes('=eq.undefined') || filter.includes('=eq.null');
}

/**
 * Generic hook for subscribing to database changes
 */
export function useRealtimeSubscription<T>(
  table: string,
  filter?: string,
  onInsert?: (record: T) => void,
  onUpdate?: (record: T) => void,
  onDelete?: (record: T) => void,
  _dependencies?: unknown[],
  enabled: boolean = true
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete });
  callbacksRef.current = { onInsert, onUpdate, onDelete };

  useEffect(() => {
    if (!enabled || !table || isInvalidFilter(filter)) {
      setIsSubscribed(false);
      return;
    }

    const supabase = getSafeSupabaseClient();
    if (!supabase) return;

    const channelName = `realtime-${table}-${filter || 'all'}-${instanceId}`;
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

    channel.subscribe((status) => {
      setIsSubscribed(status === 'SUBSCRIBED');
    });

    return () => {
      setIsSubscribed(false);
      void supabase.removeChannel(channel);
    };
  }, [table, filter, instanceId, enabled]);

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
  const matchesUser = (record: any) =>
    !userId || record?.ca_id === userId || record?.client_id === userId || record?.assigned_to === userId;

  return useRealtimeSubscription(
    'tasks',
    undefined,
    (task) => { if (matchesUser(task)) onTaskAdded?.(task); },
    (task) => { if (matchesUser(task)) onTaskUpdated?.(task); },
    (task) => { if (matchesUser(task)) onTaskDeleted?.(task); },
    [userId],
    Boolean(userId)
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
    conversationId ? `conversation_id=eq.${conversationId}` : undefined,
    onMessageAdded,
    onMessageUpdated,
    onMessageDeleted,
    [conversationId],
    Boolean(conversationId)
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
    userId ? `user_id=eq.${userId}` : undefined,
    onNotification,
    onNotification,
    undefined,
    [userId],
    Boolean(userId)
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
  const matchesUser = (record: any) =>
    !userId || record?.ca_id === userId || record?.client_id === userId || record?.created_by === userId;

  return useRealtimeSubscription(
    'appointments',
    undefined,
    (apt) => { if (matchesUser(apt)) onAppointmentAdded?.(apt); },
    (apt) => { if (matchesUser(apt)) onAppointmentUpdated?.(apt); },
    undefined,
    [userId],
    Boolean(userId)
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
  const matchesUser = (record: any) =>
    !userId || record?.ca_id === userId || record?.client_id === userId;

  return useRealtimeSubscription(
    'invoices',
    undefined,
    (inv) => { if (matchesUser(inv)) onInvoiceAdded?.(inv); },
    (inv) => { if (matchesUser(inv)) onInvoiceUpdated?.(inv); },
    (inv) => { if (matchesUser(inv)) onInvoiceDeleted?.(inv); },
    [userId],
    Boolean(userId)
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
    if (!userId || !userRole) return;
    const supabase = getSafeSupabaseClient();
    if (!supabase) return;

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
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setOnlineUsers((prev) => [
          ...prev,
          ...newPresences.filter((p: any) => p.user_id !== userId),
        ]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
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
        void supabase.removeChannel(presenceRef.current);
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
    if (!conversationId || !userId) return;
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
      }, 3000);
    }
  }, [conversationId, userId]);

  useEffect(() => {
    if (!conversationId) return;
    const supabase = getSafeSupabaseClient();
    if (!supabase) return;

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
        void supabase.removeChannel(typingRef.current);
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
      if (!documentId || !userId) return;
      if (collabRef.current) {
        collabRef.current.send({
          type: 'broadcast',
          event: 'cursor_move',
          payload: { user_id: userId, line, column },
        });
      }
    },
    [documentId, userId]
  );

  useEffect(() => {
    if (!documentId) return;
    const supabase = getSafeSupabaseClient();
    if (!supabase) return;

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
        void supabase.removeChannel(collabRef.current);
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
  }>,
  enabled: boolean = true
) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const subsRef = useRef(subscriptions);
  subsRef.current = subscriptions;

  const signature = subscriptions
    .map((s) => `${s.table}:${s.filter || ''}`)
    .join('|');

  useEffect(() => {
    const currentSubs = subsRef.current;
    if (!enabled || !currentSubs || currentSubs.length === 0) {
      setIsSubscribed(false);
      return;
    }

    const supabase = getSafeSupabaseClient();
    if (!supabase) return;

    const channels = currentSubs
      .filter((sub) => sub.table && !isInvalidFilter(sub.filter))
      .map((sub, index) => {
        return supabase
          .channel(`multi-${sub.table}-${sub.filter || 'all'}-${instanceId}-${index}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: sub.table,
              ...(sub.filter && { filter: sub.filter }),
            },
            (payload) => subsRef.current[index]?.onInsert?.(payload.new)
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: sub.table,
              ...(sub.filter && { filter: sub.filter }),
            },
            (payload) => subsRef.current[index]?.onUpdate?.(payload.new)
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: sub.table,
              ...(sub.filter && { filter: sub.filter }),
            },
            (payload) => subsRef.current[index]?.onDelete?.(payload.old)
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') setIsSubscribed(true);
          });
      });

    return () => {
      setIsSubscribed(false);
      channels.forEach((ch) => {
        void supabase.removeChannel(ch);
      });
    };
  }, [signature, instanceId, enabled]);

  return isSubscribed;
}
