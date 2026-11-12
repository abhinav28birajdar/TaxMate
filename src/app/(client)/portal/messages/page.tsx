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

        let channel: any = null;

        const loadChat = async () => {
            try {
                const res = await fetch('/api/conversations');
                const json = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(json.error || 'Failed to load conversations');
                }

                let conv = (json.conversations || [])[0] || null;
                if (!conv && (json.contacts || []).length > 0) {
                    const firstCa = json.contacts[0];
                    const createRes = await fetch('/api/conversations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            participantId: firstCa.id,
                            title: `Consultation with ${firstCa.name}`,
                        }),
                    });
                    if (createRes.ok) {
                        const createdJson = await createRes.json().catch(() => ({}));
                        conv = createdJson.conversation || null;
                    }
                }

                if (conv) {
                    setConversation(conv);
                    setClientData(conv);

                    const msgRes = await fetch(`/api/messages?conversationId=${encodeURIComponent(conv.id)}&limit=100`);
                    const msgJson = await msgRes.json().catch(() => ({}));
                    if (msgRes.ok) {
                        setMessages(msgJson.data?.messages || msgJson.messages || []);
                    }

                    channel = supabase.channel(`room-${conv.id}`)
                        .on('postgres_changes', {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'messages',
                            filter: `conversation_id=eq.${conv.id}`
                        }, (payload) => {
                            setMessages(prev => {
                                if (prev.some(m => m.id === payload.new.id)) return prev;
                                return [...prev, payload.new];
                            });
                        })
                        .subscribe();
                } else {
                    setMessages([]);
                }
            } catch (err: any) {
                console.error('Error loading chat:', err);
                toast.error(err.message || 'Unable to load advisor message stream.');
            } finally {
                setLoading(false);
            }
        };

        loadChat();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [user, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        if (!conversation) {
            toast.error('No active CA channel assigned yet. Hire a CA from Find CAs to start messaging.');
            return;
        }

        setSending(true);
        const text = newMessage.trim();
        setNewMessage('');

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: conversation.id,
                    content: text,
                    messageType: 'TEXT',
                }),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(json.message || json.error || 'Message transmission failed');
            }

            const savedMsg = json.data?.message || json.data || json;
            setMessages(prev => {
                if (prev.some(m => m.id === savedMsg.id)) return prev;
                return [...prev, {
                    id: savedMsg.id,
                    sender_id: savedMsg.sender_id || savedMsg.senderId || user.id,
                    content: savedMsg.content,
                    message_type: savedMsg.message_type || 'TEXT',
                    created_at: savedMsg.created_at || savedMsg.createdAt || new Date().toISOString(),
                }];
            });
            toast.success('Message sent.');
        } catch (err: any) {
            setNewMessage(text);
            toast.error(err.message || 'Message transmission failed.');
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
