'use client';

/**
 * ChatContext
 * 
 * Provides centralized chat state management with Supabase real-time subscriptions.
 * Manages conversations, messages, and real-time updates.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/AuthContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export type MessageType = 'text' | 'file' | 'image' | 'voice' | 'system';

export interface Participant {
    id: string;
    name: string;
    avatar?: string;
    role?: 'client' | 'ca' | 'firm' | 'admin';
}

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    type: MessageType;
    content: string;
    fileUrl?: string;
    fileName?: string;
    isEdited?: boolean;
    editedAt?: string;
    createdAt: string;
    status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Chat {
    id: string;
    type: 'direct' | 'case' | 'group';
    participants: Participant[];
    lastMessage?: Message;
    unreadCount: number;
    onlineStatus?: 'online' | 'offline' | 'away';
    isTyping?: boolean;
    caseId?: string;
}

interface ChatContextType {
    chats: Chat[];
    activeChat: Chat | null;
    setActiveChat: (chat: Chat | null) => void;
    messages: Message[];
    sendMessage: (content: string, type?: MessageType, fileUrl?: string, fileName?: string) => Promise<void>;
    markAsRead: (chatId: string) => Promise<void>;
    createChat: (participantId: string, caseId?: string) => Promise<Chat | null>;
    isLoading: boolean;
    error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Helper to get supabase client safely
function getSupabaseClient() {
    try {
        return createClient();
    } catch {
        return null;
    }
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChat, setActiveChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    
    const supabase = getSupabaseClient();
    const conversationsChannelRef = useRef<RealtimeChannel | null>(null);
    const messagesChannelRef = useRef<RealtimeChannel | null>(null);

    // Fetch user profile helper
    const fetchParticipantProfile = useCallback(async (userId: string): Promise<Participant> => {
        if (!supabase) return { id: userId, name: 'Unknown User' };
        
        // Try CA profiles first
        const { data: caProfile } = await supabase
            .from('ca_profiles')
            .select('user_id, first_name, last_name, avatar_url')
            .eq('user_id', userId)
            .single();

        if (caProfile) {
            return {
                id: caProfile.user_id,
                name: `${caProfile.first_name} ${caProfile.last_name}`.trim(),
                avatar: caProfile.avatar_url,
                role: 'ca',
            };
        }

        // Try client profiles
        const { data: clientProfile } = await supabase
            .from('client_profiles')
            .select('user_id, first_name, last_name, avatar_url')
            .eq('user_id', userId)
            .single();

        if (clientProfile) {
            return {
                id: clientProfile.user_id,
                name: `${clientProfile.first_name} ${clientProfile.last_name}`.trim(),
                avatar: clientProfile.avatar_url,
                role: 'client',
            };
        }

        return { id: userId, name: 'Unknown User' };
    }, [supabase]);

    // Fetch all conversations
    const fetchChats = useCallback(async () => {
        if (!user || !supabase) return;

        try {
            setIsLoading(true);
            setError(null);

            const { data: conversations, error: fetchError } = await supabase
                .from('conversations')
                .select('*')
                .contains('participant_ids', [user.id])
                .eq('is_archived', false)
                .order('last_message_at', { ascending: false });

            if (fetchError) throw fetchError;

            // Process each conversation
            const processedChats = await Promise.all(
                (conversations || []).map(async (conv) => {
                    // Get other participants
                    const otherParticipantIds = (conv.participant_ids as string[]).filter(
                        (id: string) => id !== user.id
                    );
                    
                    const participants = await Promise.all(
                        otherParticipantIds.map(fetchParticipantProfile)
                    );

                    // Get last message
                    const { data: lastMessageData } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('conversation_id', conv.id)
                        .is('deleted_at', null)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();

                    // Get unread count
                    const { count: unreadCount } = await supabase
                        .from('messages')
                        .select('*', { count: 'exact', head: true })
                        .eq('conversation_id', conv.id)
                        .neq('sender_id', user.id)
                        .is('read_at', null);

                    const lastMessage: Message | undefined = lastMessageData ? {
                        id: lastMessageData.id,
                        chatId: lastMessageData.conversation_id,
                        senderId: lastMessageData.sender_id,
                        type: lastMessageData.message_type || 'text',
                        content: lastMessageData.content || '',
                        fileUrl: lastMessageData.file_url,
                        fileName: lastMessageData.file_name,
                        isEdited: lastMessageData.is_edited,
                        editedAt: lastMessageData.edited_at,
                        createdAt: lastMessageData.created_at,
                        status: 'sent',
                    } : undefined;

                    return {
                        id: conv.id,
                        type: conv.case_id ? 'case' : 'direct',
                        participants,
                        lastMessage,
                        unreadCount: unreadCount || 0,
                        caseId: conv.case_id,
                    } as Chat;
                })
            );

            setChats(processedChats);
        } catch (err) {
            console.error('Error fetching chats:', err);
            setError('Failed to load conversations');
        } finally {
            setIsLoading(false);
        }
    }, [user, supabase, fetchParticipantProfile]);

    // Fetch messages for active chat
    const fetchMessages = useCallback(async () => {
        if (!activeChat || !user || !supabase) return;

        try {
            setIsLoading(true);

            const { data, error: fetchError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', activeChat.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: true })
                .limit(100);

            if (fetchError) throw fetchError;

            const processedMessages: Message[] = (data || []).map(msg => ({
                id: msg.id,
                chatId: msg.conversation_id,
                senderId: msg.sender_id,
                type: msg.message_type || 'text',
                content: msg.content || '',
                fileUrl: msg.file_url,
                fileName: msg.file_name,
                isEdited: msg.is_edited,
                editedAt: msg.edited_at,
                createdAt: msg.created_at,
                status: msg.read_at ? 'read' : 'sent',
            }));

            setMessages(processedMessages);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages');
        } finally {
            setIsLoading(false);
        }
    }, [activeChat, user, supabase]);

    // Send a message
    const sendMessage = useCallback(async (
        content: string, 
        type: MessageType = 'text', 
        fileUrl?: string, 
        fileName?: string
    ) => {
        if (!activeChat || !user || !supabase) return;
        if (!content.trim() && !fileUrl) return;

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticMessage: Message = {
            id: tempId,
            chatId: activeChat.id,
            senderId: user.id,
            type,
            content: content.trim(),
            fileUrl,
            fileName,
            createdAt: new Date().toISOString(),
            status: 'sending',
        };

        setMessages(prev => [...prev, optimisticMessage]);

        try {
            const { data, error: sendError } = await supabase
                .from('messages')
                .insert({
                    conversation_id: activeChat.id,
                    sender_id: user.id,
                    content: content.trim() || null,
                    message_type: type,
                    file_url: fileUrl || null,
                    file_name: fileName || null,
                })
                .select()
                .single();

            if (sendError) throw sendError;

            // Replace optimistic message with real one
            setMessages(prev => prev.map(msg => 
                msg.id === tempId ? {
                    ...optimisticMessage,
                    id: data.id,
                    status: 'sent',
                } : msg
            ));

            // Update last message in chats list
            setChats(prev => prev.map(chat =>
                chat.id === activeChat.id ? {
                    ...chat,
                    lastMessage: {
                        ...optimisticMessage,
                        id: data.id,
                        status: 'sent',
                    },
                } : chat
            ));
        } catch (err) {
            console.error('Error sending message:', err);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setError('Failed to send message');
        }
    }, [activeChat, user, supabase]);

    // Mark messages as read
    const markAsRead = useCallback(async (chatId: string) => {
        if (!user || !supabase) return;

        try {
            await supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('conversation_id', chatId)
                .neq('sender_id', user.id)
                .is('read_at', null);

            setChats(prev => prev.map(chat =>
                chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
            ));
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, [user, supabase]);

    // Create a new chat
    const createChat = useCallback(async (participantId: string, caseId?: string): Promise<Chat | null> => {
        if (!user || !supabase) return null;

        try {
            // Check if conversation already exists
            const { data: existing } = await supabase
                .from('conversations')
                .select('*')
                .contains('participant_ids', [user.id, participantId])
                .single();

            if (existing) {
                const existingChat = chats.find(c => c.id === existing.id);
                if (existingChat) {
                    setActiveChat(existingChat);
                    return existingChat;
                }
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

            const participant = await fetchParticipantProfile(participantId);
            
            const newChat: Chat = {
                id: data.id,
                type: caseId ? 'case' : 'direct',
                participants: [participant],
                unreadCount: 0,
                caseId,
            };

            setChats(prev => [newChat, ...prev]);
            setActiveChat(newChat);
            return newChat;
        } catch (err) {
            console.error('Error creating chat:', err);
            setError('Failed to create conversation');
            return null;
        }
    }, [user, supabase, chats, fetchParticipantProfile]);

    // Initial fetch and realtime subscriptions
    useEffect(() => {
        if (!user || !supabase) return;

        fetchChats();

        // Subscribe to conversation updates
        conversationsChannelRef.current = supabase
            .channel('chat-conversations')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'conversations',
                },
                (payload) => {
                    const conv = payload.new as { participant_ids: string[] };
                    if (conv?.participant_ids?.includes(user.id)) {
                        fetchChats();
                    }
                }
            )
            .subscribe();

        return () => {
            if (conversationsChannelRef.current) {
                supabase.removeChannel(conversationsChannelRef.current);
            }
        };
    }, [user, supabase, fetchChats]);

    // Fetch messages when active chat changes
    useEffect(() => {
        if (!activeChat || !user || !supabase) {
            setMessages([]);
            return;
        }

        fetchMessages();
        markAsRead(activeChat.id);

        // Subscribe to new messages in this conversation
        messagesChannelRef.current = supabase
            .channel(`chat-messages:${activeChat.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${activeChat.id}`,
                },
                (payload) => {
                    const newMsg = payload.new as {
                        id: string;
                        conversation_id: string;
                        sender_id: string;
                        message_type: MessageType;
                        content: string;
                        file_url?: string;
                        file_name?: string;
                        created_at: string;
                    };

                    // Don't add if it's our own message (already added optimistically)
                    if (newMsg.sender_id === user.id) return;

                    const message: Message = {
                        id: newMsg.id,
                        chatId: newMsg.conversation_id,
                        senderId: newMsg.sender_id,
                        type: newMsg.message_type || 'text',
                        content: newMsg.content || '',
                        fileUrl: newMsg.file_url,
                        fileName: newMsg.file_name,
                        createdAt: newMsg.created_at,
                        status: 'sent',
                    };

                    setMessages(prev => [...prev, message]);
                    markAsRead(activeChat.id);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${activeChat.id}`,
                },
                (payload) => {
                    const updated = payload.new as {
                        id: string;
                        conversation_id: string;
                        sender_id: string;
                        message_type: MessageType;
                        content: string;
                        is_edited: boolean;
                        edited_at: string;
                        deleted_at?: string;
                        created_at: string;
                    };

                    if (updated.deleted_at) {
                        setMessages(prev => prev.filter(m => m.id !== updated.id));
                    } else {
                        setMessages(prev => prev.map(m => 
                            m.id === updated.id ? {
                                ...m,
                                content: updated.content,
                                isEdited: updated.is_edited,
                                editedAt: updated.edited_at,
                            } : m
                        ));
                    }
                }
            )
            .subscribe();

        return () => {
            if (messagesChannelRef.current) {
                supabase.removeChannel(messagesChannelRef.current);
            }
        };
    }, [activeChat, user, supabase, fetchMessages, markAsRead]);

    return (
        <ChatContext.Provider value={{
            chats,
            activeChat,
            setActiveChat,
            messages,
            sendMessage,
            markAsRead,
            createChat,
            isLoading,
            error,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChatContext() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
}
