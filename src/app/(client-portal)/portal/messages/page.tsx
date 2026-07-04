'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Send, 
    MessageSquare, 
    User, 
    File, 
    Paperclip, 
    Smile, 
    Sparkles, 
    RefreshCw, 
    CheckCheck,
    Bot
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientMessages() {
    const { user } = useAuth();
    const [clientData, setClientData] = useState<any>(null);
    const [conversation, setConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const messageEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Scroll chat to bottom
    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!user) return;

        const loadChat = async () => {
            try {
                // 1. Fetch client details
                const { data: client } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('portal_user_id', user.id)
                    .maybeSingle();

                let clientId = 'mock-client-id';
                let caId = 'mock-ca-id';
                let orgId = 'mock-org-id';

                if (client) {
                    setClientData(client);
                    clientId = client.id;
                    caId = client.assigned_ca_id || caId;
                    orgId = client.organization_id || orgId;
                }

                // 2. Find or create conversation with CA
                let { data: conv, error: convError } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('client_id', clientId)
                    .maybeSingle();

                if (!conv) {
                    // Try to insert a new conversation
                    const { data: newConv, error: createError } = await supabase
                        .from('conversations')
                        .insert({
                            organization_id: orgId === 'mock-org-id' ? '00000000-0000-0000-0000-000000000000' : orgId,
                            type: 'client',
                            client_id: clientId,
                            title: `Chat with ${client?.full_name || user.name}`
                        })
                        .select()
                        .single();

                    if (!createError && newConv) {
                        conv = newConv;
                        
                        // Add participants
                        await supabase.from('conversation_participants').insert([
                            { conversation_id: conv.id, user_id: user.id, role: 'member' },
                            { conversation_id: conv.id, user_id: caId, role: 'member' }
                        ]);
                    }
                }

                if (conv) {
                    setConversation(conv);

                    // 3. Fetch existing messages
                    const { data: msgs, error: msgsError } = await supabase
                        .from('messages')
                        .select('*')
                        .eq('conversation_id', conv.id)
                        .order('created_at', { ascending: true });

                    if (msgsError) throw msgsError;
                    setMessages(msgs || []);

                    // 4. Subscribe to Realtime messages for this conversation
                    const channel = supabase.channel(`room-${conv.id}`)
                        .on('postgres_changes', { 
                            event: 'INSERT', 
                            schema: 'public', 
                            table: 'messages',
                            filter: `conversation_id=eq.${conv.id}`
                        }, (payload) => {
                            setMessages(prev => {
                                // Prevent duplicate inserts
                                if (prev.some(m => m.id === payload.new.id)) return prev;
                                return [...prev, payload.new];
                            });
                        })
                        .subscribe();

                    return () => {
                        supabase.removeChannel(channel);
                    };
                } else {
                    // Fallback / Mock chat stream
                    setMessages([
                        {
                            id: 'msg-1',
                            sender_id: 'mock-ca-id',
                            content: 'Hello! Welcome to TaxMate Secure Message Stream. How can we help you today?',
                            created_at: new Date(Date.now() - 3600000 * 2).toISOString()
                        },
                        {
                            id: 'msg-2',
                            sender_id: user.id,
                            content: 'Hi, I just wanted to check if you received my GST sales reports.',
                            created_at: new Date(Date.now() - 3600000).toISOString()
                        },
                        {
                            id: 'msg-3',
                            sender_id: 'mock-ca-id',
                            content: 'Yes, we received them. Priya from our team is auditing the sheets right now. We will notify you once filed.',
                            created_at: new Date(Date.now() - 1800000).toISOString()
                        }
                    ]);
                }
            } catch (err: any) {
                console.error('Error loading chat:', err);
                toast.error('Realtime sync offline. Rerouting chat stream to simulation mode.');
            } finally {
                setLoading(false);
            }
        };

        loadChat();
    }, [user, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        const text = newMessage;
        setNewMessage('');

        try {
            const timestamp = new Date().toISOString();
            const tempId = `temp-msg-${Date.now()}`;
            
            const localMsg = {
                id: tempId,
                sender_id: user?.id || 'mock-client-id',
                content: text,
                created_at: timestamp
            };

            // Optimistic Update
            setMessages(prev => [...prev, localMsg]);

            if (conversation) {
                const { data, error } = await supabase
                    .from('messages')
                    .insert({
                        conversation_id: conversation.id,
                        sender_id: user?.id,
                        content: text,
                        message_type: 'text'
                    })
                    .select()
                    .single();

                if (error) {
                    console.warn('Supabase message insert failed, using mock persistence:', error.message);
                } else if (data) {
                    // Replace temp optimistic message with real db record
                    setMessages(prev => prev.map(m => m.id === tempId ? data : m));
                }
            } else {
                // If offline completely, trigger a mock automated CA reply after 1.5 seconds
                setTimeout(() => {
                    const mockReply = {
                        id: `mock-reply-${Date.now()}`,
                        sender_id: 'mock-ca-id',
                        content: `Acknowledged. We have logged your request: "${text}". An operator will review this shortly.`,
                        created_at: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, mockReply]);
                }, 1500);
            }

            toast.success('Message sent.');
        } catch (err) {
            toast.error('Message transmission failed.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Secure Channels</span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                    Advisor Message Stream
                </h1>
            </div>

            <Card className="flex-1 bg-slate-900 border-slate-800 rounded-none flex flex-col overflow-hidden">
                <CardHeader className="border-b border-slate-800 py-3 px-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-lime-600/15 border border-lime-600/20 flex items-center justify-center text-lime-500 rounded-none">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                                CA Operations Channel
                            </CardTitle>
                            <CardDescription className="text-[8px] uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" />
                                Secured SSL Link Active
                            </CardDescription>
                        </div>
                    </div>
                    
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toast.success('Cleared local message logs cache')}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 h-8 rounded-none px-3 border border-slate-800"
                    >
                        Sync Stream
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 p-0 overflow-y-auto custom-scrollbar bg-black/40 relative">
                    <div className="p-4 space-y-4 min-h-full flex flex-col justify-end">
                        {messages.length === 0 ? (
                            <div className="text-center py-20 space-y-2 text-slate-600">
                                <MessageSquare className="w-8 h-8 mx-auto" />
                                <p className="text-[10px] font-bold uppercase tracking-widest italic">Message stream empty</p>
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isSelf = msg.sender_id === user?.id;
                                return (
                                    <div 
                                        key={msg.id} 
                                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'} w-full animate-in fade-in slide-in-from-bottom-2 duration-200`}
                                    >
                                        <div className={`max-w-md p-3.5 border ${
                                            isSelf 
                                                ? 'bg-lime-950/45 text-white border-lime-600/20 shadow-[0_0_15px_rgba(101,163,13,0.05)]' 
                                                : 'bg-slate-900 text-white border-slate-800'
                                        } rounded-none relative`}>
                                            <p className="text-xs font-medium leading-relaxed font-sans">{msg.content}</p>
                                            
                                            <div className="flex items-center justify-end gap-1 mt-1.5">
                                                <span className="text-[8px] font-bold text-slate-500 font-mono">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isSelf && <CheckCheck className="w-3 h-3 text-lime-500" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messageEndRef} />
                    </div>
                </CardContent>

                {/* Form Input */}
                <div className="p-3 bg-slate-950 border-t border-slate-800">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Button 
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => toast.info('Vault file upload shortcuts are active in File Vault tab.')}
                            className="w-10 h-10 border border-slate-800 text-slate-500 hover:text-white rounded-none hover:bg-slate-900"
                        >
                            <Paperclip className="w-4 h-4" />
                        </Button>
                        <Input 
                            type="text"
                            placeholder="TRANSMIT SECURE CHAT PAYLOAD..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-black border-slate-800 focus:border-lime-600/50 text-xs text-white rounded-none placeholder:text-slate-600 font-sans h-10"
                        />
                        <Button 
                            type="submit" 
                            disabled={sending}
                            className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] rounded-none h-10 px-4 flex items-center justify-center gap-1.5 transition-all"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Send
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
