'use client';

/**
 * usePresence Hook
 * 
 * Tracks user presence (online/away/offline) in real-time.
 * Provides methods to check other users' status.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string | null;
  currentPage?: string;
}

interface UsePresenceReturn {
  onlineUsers: Map<string, UserPresence>;
  isUserOnline: (userId: string) => boolean;
  getUserStatus: (userId: string) => 'online' | 'away' | 'offline';
  getLastSeen: (userId: string) => string | null;
  setStatus: (status: 'online' | 'away' | 'offline') => Promise<void>;
}

export function usePresence(): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Get supabase client with error handling
  const getSupabase = useCallback(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const supabase = getSupabase();

  const updatePresence = useCallback(async (status: 'online' | 'away' | 'offline') => {
    if (!user || !supabase) return;

    try {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          status,
          last_seen_at: new Date().toISOString(),
        });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [user, supabase]);

  const setStatus = useCallback(async (status: 'online' | 'away' | 'offline') => {
    await updatePresence(status);
  }, [updatePresence]);

  const isUserOnline = useCallback((userId: string): boolean => {
    const presence = onlineUsers.get(userId);
    return presence?.status === 'online';
  }, [onlineUsers]);

  const getUserStatus = useCallback((userId: string): 'online' | 'away' | 'offline' => {
    const presence = onlineUsers.get(userId);
    return presence?.status || 'offline';
  }, [onlineUsers]);

  const getLastSeen = useCallback((userId: string): string | null => {
    const presence = onlineUsers.get(userId);
    return presence?.lastSeen || null;
  }, [onlineUsers]);

  useEffect(() => {
    if (!user || !supabase) return;

    // Set initial presence
    updatePresence('online');

    // Subscribe to presence changes
    channelRef.current = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const presence = payload.new as { 
            user_id: string; 
            status: 'online' | 'away' | 'offline'; 
            last_seen_at: string;
            current_page?: string;
          };
          
          setOnlineUsers(prev => {
            const newMap = new Map(prev);
            newMap.set(presence.user_id, {
              userId: presence.user_id,
              status: presence.status,
              lastSeen: presence.last_seen_at,
              currentPage: presence.current_page,
            });
            return newMap;
          });
        }
      )
      .subscribe();

    // Heartbeat to maintain online status
    heartbeatRef.current = setInterval(() => {
      updatePresence('online');
    }, 30000); // Every 30 seconds
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence('away');
      } else {
        updatePresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle before unload
    const handleBeforeUnload = () => {
      updatePresence('offline');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Load initial presence data
    const loadInitialPresence = async () => {
      if (!supabase) return;
      
      const { data } = await supabase
        .from('user_presence')
        .select('*')
        .gte('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Last 5 minutes

      if (data) {
        const presenceMap = new Map<string, UserPresence>();
        data.forEach((p: { user_id: string; status: 'online' | 'away' | 'offline'; last_seen_at: string; current_page?: string }) => {
          presenceMap.set(p.user_id, {
            userId: p.user_id,
            status: p.status,
            lastSeen: p.last_seen_at,
            currentPage: p.current_page,
          });
        });
        setOnlineUsers(presenceMap);
      }
    };

    loadInitialPresence();

    return () => {
      if (channelRef.current && supabase) {
        supabase.removeChannel(channelRef.current);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence('offline');
    };
  }, [user, supabase, updatePresence]);

  return {
    onlineUsers,
    isUserOnline,
    getUserStatus,
    getLastSeen,
    setStatus,
  };
}

// Helper to format last seen time
export function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Unknown';

  const date = new Date(lastSeen);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
