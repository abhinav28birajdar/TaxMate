'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from './SupabaseAuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
}

interface UsePresenceReturn {
  onlineUsers: Map<string, UserPresence>;
  isUserOnline: (userId: string) => boolean;
  getUserStatus: (userId: string) => 'online' | 'away' | 'offline';
  getLastSeen: (userId: string) => Date | null;
  updateStatus: (status: 'online' | 'away') => Promise<void>;
}

export function useRealtimePresence(channelName: string = 'global'): UsePresenceReturn {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, UserPresence>>(new Map());
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = useCallback(async (status: 'online' | 'away') => {
    if (!user || !channelRef.current) return;

    try {
      await channelRef.current.track({
        userId: user.id,
        status,
        lastSeen: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [user]);

  const isUserOnline = useCallback((userId: string): boolean => {
    const presence = onlineUsers.get(userId);
    if (!presence) return false;
    
    // Consider user offline if last seen > 2 minutes ago
    const now = new Date();
    const lastSeen = presence.lastSeen;
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMinutes = diffMs / (1000 * 60);
    
    return presence.status === 'online' && diffMinutes < 2;
  }, [onlineUsers]);

  const getUserStatus = useCallback((userId: string): 'online' | 'away' | 'offline' => {
    if (isUserOnline(userId)) return 'online';
    
    const presence = onlineUsers.get(userId);
    if (!presence) return 'offline';
    
    return presence.status === 'away' ? 'away' : 'offline';
  }, [onlineUsers, isUserOnline]);

  const getLastSeen = useCallback((userId: string): Date | null => {
    const presence = onlineUsers.get(userId);
    return presence?.lastSeen || null;
  }, [onlineUsers]);

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    // Set up presence channel
    channelRef.current = supabase
      .channel(`presence:${channelName}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channelRef.current?.presenceState();
        if (!state) return;

        const usersMap = new Map<string, UserPresence>();
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            usersMap.set(presence.userId, {
              userId: presence.userId,
              status: presence.status,
              lastSeen: new Date(presence.lastSeen),
            });
          });
        });

        setOnlineUsers(usersMap);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          setOnlineUsers(prev => new Map(prev).set(presence.userId, {
            userId: presence.userId,
            status: presence.status,
            lastSeen: new Date(presence.lastSeen),
          }));
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          setOnlineUsers(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(presence.userId);
            if (existing) {
              newMap.set(presence.userId, {
                ...existing,
                status: 'offline',
                lastSeen: new Date(),
              });
            }
            return newMap;
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await updateStatus('online');
          
          // Send heartbeat every 30 seconds
          heartbeatRef.current = setInterval(() => {
            updateStatus('online');
          }, 30000);
        }
      });

    // Handle tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateStatus('away');
      } else {
        updateStatus('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, channelName, updateStatus]);

  return {
    onlineUsers,
    isUserOnline,
    getUserStatus,
    getLastSeen,
    updateStatus,
  };
}
