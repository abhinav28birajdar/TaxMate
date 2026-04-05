'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/AuthContext';
import { Conversation, Message } from '@/types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  createConversation: (participantId: string, caseId?: string) => Promise<Conversation | null>;
  archiveConversation: (conversationId: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id])
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch participant details for each conversation
      const conversationsWithParticipants = await Promise.all(
        (data || []).map(async (conv) => {
          const otherParticipantIds = conv.participant_ids.filter((id: string) => id !== user.id);
          
          // Get participant profiles
          const participants = await Promise.all(
            otherParticipantIds.map(async (participantId: string) => {
              // Try CA profiles first
              const { data: caProfile } = await supabase
                .from('ca_profiles')
                .select('id, user_id, first_name, last_name, avatar_url')
                .eq('user_id', participantId)
                .single();

              if (caProfile) {
                return {
                  id: caProfile.user_id,
                  first_name: caProfile.first_name,
                  last_name: caProfile.last_name,
                  avatar_url: caProfile.avatar_url,
                };
              }

              // Try client profiles
              const { data: clientProfile } = await supabase
                .from('client_profiles')
                .select('id, user_id, first_name, last_name, avatar_url')
                .eq('user_id', participantId)
                .single();

              if (clientProfile) {
                return {
                  id: clientProfile.user_id,
                  first_name: clientProfile.first_name,
                  last_name: clientProfile.last_name,
                  avatar_url: clientProfile.avatar_url,
                };
              }

              return {
                id: participantId,
                first_name: 'Unknown',
                last_name: 'User',
                avatar_url: null,
              };
            })
          );

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id)
            .not('id', 'in', `(SELECT message_id FROM message_read_receipts WHERE user_id = '${user.id}')`);

          return {
            ...conv,
            participants,
            unread_count: count || 0,
          };
        })
      );

      setConversations(conversationsWithParticipants);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const createConversation = useCallback(async (participantId: string, caseId?: string): Promise<Conversation | null> => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [user.id, participantId])
        .single();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_ids: [user.id, participantId],
          case_id: caseId || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      await fetchConversations();
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError('Failed to create conversation');
      return null;
    }
  }, [user, supabase, fetchConversations]);

  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      const { error: archiveError } = await supabase
        .from('conversations')
        .update({ is_archived: true })
        .eq('id', conversationId);

      if (archiveError) throw archiveError;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError('Failed to archive conversation');
    }
  }, [supabase]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    // Set up realtime subscription
    channelRef.current = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const conv = payload.new as Conversation;
            if (conv.participant_ids.includes(user.id)) {
              fetchConversations();
            }
          }
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user, supabase, fetchConversations]);

  return {
    conversations,
    loading,
    error,
    createConversation,
    archiveConversation,
    refreshConversations: fetchConversations,
  };
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string, fileUrl?: string, fileName?: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useMessages(conversationId: string | null): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const PAGE_SIZE = 50;

  const fetchMessages = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (!conversationId || !user) return;

    try {
      if (!append) setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (fetchError) throw fetchError;

      const reversedData = (data || []).reverse();

      if (append) {
        setMessages(prev => [...reversedData, ...prev]);
      } else {
        setMessages(reversedData);
      }

      setHasMore((data?.length || 0) === PAGE_SIZE);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, supabase]);

  const sendMessage = useCallback(async (content: string, fileUrl?: string, fileName?: string) => {
    if (!conversationId || !user || (!content.trim() && !fileUrl)) return;

    try {
      const messageType = fileUrl ? (fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'file') : 'text';

      const { error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim() || null,
          message_type: messageType,
          file_url: fileUrl || null,
          file_name: fileName || null,
        });

      if (sendError) throw sendError;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  }, [conversationId, user, supabase]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) return;

    try {
      const { error: editError } = await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (editError) throw editError;
    } catch (err) {
      console.error('Error editing message:', err);
      setError('Failed to edit message');
    }
  }, [user, supabase]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (deleteError) throw deleteError;

      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message');
    }
  }, [user, supabase]);

  const markAsRead = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      // Get unread messages
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      if (unreadMessages && unreadMessages.length > 0) {
        const receipts = unreadMessages.map(msg => ({
          message_id: msg.id,
          user_id: user.id,
        }));

        await supabase
          .from('message_read_receipts')
          .upsert(receipts, { onConflict: 'message_id,user_id' });
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [conversationId, user, supabase]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMessages(nextPage, true);
  }, [hasMore, loading, page, fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId || !user) return;

    fetchMessages();

    // Set up realtime subscription
    channelRef.current = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if not from current user
          if (newMessage.sender_id !== user.id) {
            markAsRead();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          setMessages(prev =>
            prev.map(m => (m.id === updatedMessage.id ? updatedMessage : m))
          );
        }
      )
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, user, supabase, fetchMessages, markAsRead]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMore,
    hasMore,
  };
}

interface TypingUser {
  userId: string;
  firstName: string;
  lastName: string;
}

interface UseTypingReturn {
  typingUsers: TypingUser[];
  setTyping: (isTyping: boolean) => void;
}

export function useTyping(conversationId: string | null): UseTypingReturn {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();
  const supabase = createClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setTyping = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user) return;

    try {
      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        });

      // Auto-clear typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error setting typing status:', err);
    }
  }, [conversationId, user, supabase]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const indicator = payload.new as { user_id: string; is_typing: boolean };
          
          if (indicator.user_id === user.id) return;

          if (indicator.is_typing) {
            // Fetch user info
            const { data: caProfile } = await supabase
              .from('ca_profiles')
              .select('first_name, last_name')
              .eq('user_id', indicator.user_id)
              .single();

            const userInfo = caProfile || { first_name: 'User', last_name: '' };

            setTypingUsers(prev => {
              const exists = prev.some(u => u.userId === indicator.user_id);
              if (exists) return prev;
              return [...prev, {
                userId: indicator.user_id,
                firstName: userInfo.first_name,
                lastName: userInfo.last_name,
              }];
            });
          } else {
            setTypingUsers(prev => prev.filter(u => u.userId !== indicator.user_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [conversationId, user, supabase]);

  return { typingUsers, setTyping };
}
