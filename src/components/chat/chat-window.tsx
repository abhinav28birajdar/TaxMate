'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface User {
    id: string;
    name?: string;
    avatarUrl?: string;
    email?: string;
}

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'TEXT' | 'IMAGE' | 'FILE' | 'AUDIO' | 'SYSTEM';
    createdAt: string;
    isOptimistic?: boolean;
}

export function ChatWindow({ conversationId, otherUser }: { conversationId: string; otherUser: User }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const { socket } = useSocket();
    const { data: session } = useSession();
    const myId = session?.user?.id;

    // Load messages
    const { data: initial } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: async () => {
            const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
            return res.json();
        },
    });

    useEffect(() => {
        if (initial?.data) setMessages(initial.data);
    }, [initial]);

    // Socket events
    useEffect(() => {
        if (!socket) return;
        socket.emit('chat:join', { conversationId });

        socket.on('message:new', (msg: Message) => {
            if (msg.conversationId === conversationId) {
                setMessages(prev => [...prev, msg]);
                socket.emit('chat:read', { conversationId, messageId: msg.id });
            }
        });
        socket.on('chat:typing', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
            if (userId === otherUser.id) setIsOtherTyping(isTyping);
        });
        socket.on('user:status', ({ userId, isOnline: online }: { userId: string; isOnline: boolean }) => {
            if (userId === otherUser.id) setIsOnline(online);
        });

        return () => {
            socket.off('message:new');
            socket.off('chat:typing');
            socket.off('user:status');
        };
    }, [socket, conversationId, otherUser.id]);

    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOtherTyping]);

    // Send message
    const sendMessage = useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type: 'TEXT' }),
            });
            return res.json();
        },
        onMutate: (content: string) => {
            const optimistic: Message = {
                id: `temp-${Date.now()}`,
                conversationId,
                senderId: myId || 'me',
                content,
                type: 'TEXT',
                createdAt: new Date().toISOString(),
                isOptimistic: true,
            };
            setMessages(prev => [...prev, optimistic]);
        },
        onSuccess: (data: Message) => {
            setMessages(prev => prev.map(m => (m.isOptimistic ? data : m)));
        },
    });

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage.mutate(input.trim());
        setInput('');
    };

    const handleTyping = useCallback(() => {
        socket?.emit('chat:typing', { conversationId, isTyping: true });
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket?.emit('chat:typing', { conversationId, isTyping: false });
        }, 1500);
    }, [socket, conversationId]);

    const groupMessages = () => {
        return messages.map((msg, i) => ({
            ...msg,
            showAvatar: i === 0 || messages[i - 1]?.senderId !== msg.senderId,
            isMe: msg.senderId === myId,
        }));
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b">
                <div className="relative">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={otherUser.avatarUrl} />
                        <AvatarFallback>{otherUser.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                    )}
                </div>
                <div>
                    <p className="font-semibold text-sm">{otherUser.name}</p>
                    <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {groupMessages().map((msg) => (
                    <div
                        key={msg.id}
                        className={cn('flex items-end gap-2', msg.isMe ? 'flex-row-reverse' : 'flex-row')}
                    >
                        {!msg.isMe && msg.showAvatar && (
                            <Avatar className="h-7 w-7 shrink-0">
                                <AvatarImage src={otherUser.avatarUrl} />
                                <AvatarFallback className="text-xs">{otherUser.name?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                        )}
                        {!msg.isMe && !msg.showAvatar && <div className="w-7" />}
                        <div className={cn(
                            'max-w-[70%] rounded-2xl px-3 py-2 text-sm',
                            msg.isMe
                                ? 'bg-blue-600 text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                            msg.isOptimistic && 'opacity-70'
                        )}>
                            <p>{msg.content}</p>
                            <p className={cn('text-xs mt-1', msg.isMe ? 'text-blue-200' : 'text-gray-400')}>
                                {format(new Date(msg.createdAt), 'h:mm a')}
                            </p>
                        </div>
                    </div>
                ))}
                {isOtherTyping && (
                    <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                            <AvatarImage src={otherUser.avatarUrl} />
                            <AvatarFallback className="text-xs">{otherUser.name?.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400">
                    <Paperclip size={18} />
                </Button>
                <Input
                    value={input}
                    onChange={e => { setInput(e.target.value); handleTyping(); }}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    placeholder="Type a message..."
                    className="flex-1 rounded-full bg-gray-100 border-0 focus-visible:ring-0"
                />
                <Button variant="ghost" size="icon" className="text-gray-400">
                    <Smile size={18} />
                </Button>
                <Button onClick={handleSend} size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700">
                    <Send size={16} className="text-white" />
                </Button>
            </div>
        </div>
    );
}
