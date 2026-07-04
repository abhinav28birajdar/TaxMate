'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Search, 
    Send, 
    Paperclip, 
    Bot, 
    Users, 
    Folder, 
    CheckCheck,
    Smile,
    Pin,
    AlertCircle,
    Check,
    MessageSquare,
    Mail,
    Phone
} from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorMessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConv, setSelectedConv] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [convFilter, setConvFilter] = useState<'all' | 'client' | 'team'>('all');
    const [sending, setSending] = useState(false);
    const [loadingConvs, setLoadingConvs] = useState(true);
    
    // Client Info sidebar details
    const [clientMeta, setClientMeta] = useState<any>(null);
    const [sharedFiles, setSharedFiles] = useState<any[]>([]);

    const messageEndRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Fetch conversations
    useEffect(() => {
        if (!user) return;

        const loadConversations = async () => {
            try {
                // Get organization of current operator
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .maybeSingle();

                const orgId = profile?.organization_id;
                if (!orgId) {
                    setConversations(getMockConversations());
                    setLoadingConvs(false);
                    return;
                }

                // Query conversations
                const { data: convs, error } = await supabase
                    .from('conversations')
                    .select('*')
                    .eq('organization_id', orgId)
                    .order('last_message_at', { ascending: false });

                if (error) throw error;

                if (convs && convs.length > 0) {
                    setConversations(convs);
                } else {
                    setConversations(getMockConversations());
                }
            } catch (err: any) {
                console.error('Error fetching conversations:', err);
                setConversations(getMockConversations());
            } finally {
                setLoadingConvs(false);
            }
        };

        loadConversations();
    }, [user, supabase]);

    // 2. Fetch messages on conversation selection
    useEffect(() => {
        if (!selectedConv) return;

        const loadMessages = async () => {
            try {
                if (String(selectedConv.id).startsWith('mock-')) {
                    setMessages(getMockMessages(selectedConv.id));
                    setClientMeta(getMockClientMeta(selectedConv.id));
                    setSharedFiles(getMockSharedFiles(selectedConv.id));
                    return;
                }

                // Fetch messages from DB
                const { data: msgs, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', selectedConv.id)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(msgs || []);

                // Fetch related client metadata
                if (selectedConv.client_id) {
                    const { data: client } = await supabase
                        .from('clients')
                        .select('id, full_name, email, phone, pan, status')
                        .eq('id', selectedConv.client_id)
                        .maybeSingle();
                    
                    if (client) {
                        const { count } = await supabase
                            .from('tasks')
                            .select('*', { count: 'exact', head: true })
                            .eq('client_id', client.id)
                            .neq('status', 'completed');
                        
                        setClientMeta({
                            ...client,
                            openTasks: count || 0
                        });
                    }
                }

                // Subscribe to Realtime insertions
                const channel = supabase.channel(`room-operator-${selectedConv.id}`)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `conversation_id=eq.${selectedConv.id}`
                    }, (payload) => {
                        setMessages(prev => {
                            if (prev.some(m => m.id === payload.new.id)) return prev;
                            return [...prev, payload.new];
                        });
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };

            } catch (err: any) {
                console.error('Error loading chat messages:', err);
                setMessages(getMockMessages(selectedConv.id));
            }
        };

        loadMessages();
    }, [selectedConv, supabase]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        setSending(true);
        const text = newMessage;
        setNewMessage('');

        try {
            const timestamp = new Date().toISOString();
            const tempId = `temp-${Date.now()}`;
            const localMsg = {
                id: tempId,
                sender_id: user?.id || 'mock-ca-id',
                content: text,
                created_at: timestamp
            };

            setMessages(prev => [...prev, localMsg]);

            if (!String(selectedConv.id).startsWith('mock-')) {
                await supabase
                    .from('messages')
                    .insert({
                        conversation_id: selectedConv.id,
                        sender_id: user?.id,
                        content: text,
                        message_type: 'text'
                    });
            } else {
                // Simulated reply for sandbox
                setTimeout(() => {
                    const mockReply = {
                        id: `mock-reply-${Date.now()}`,
                        sender_id: 'mock-client-id',
                        content: `Got it! I am uploading the documents matching: "${text}" now.`,
                        created_at: new Date().toISOString()
                    };
                    setMessages(prev => [...prev, mockReply]);
                }, 1500);
            }

            toast.success('Message dispatched.');
        } catch (err) {
            toast.error('Could not transmit message.');
        } finally {
            setSending(false);
        }
    };

    const getMockConversations = () => [
        { id: 'mock-1', title: 'ABC Business Solutions', type: 'client', last_message_at: new Date().toISOString(), last_message_preview: 'I uploaded my sales reports.' },
        { id: 'mock-2', title: 'Aditya Birla Services', type: 'client', last_message_at: new Date(Date.now() - 3600000).toISOString(), last_message_preview: 'Payment invoice cleared.' },
        { id: 'mock-3', title: 'TaxMate Operators Chat', type: 'team', last_message_at: new Date(Date.now() - 7200000).toISOString(), last_message_preview: 'Priya: I will review Dr. Shah ITR.' }
    ];

    const getMockMessages = (id: string) => {
        if (id === 'mock-1') {
            return [
                { id: 'm-1', sender_id: 'mock-client-id', content: 'Hi, I just uploaded the business invoice statement sheets.', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
                { id: 'm-2', sender_id: 'mock-ca-id', content: 'Acknowledge. Let me confirm the GST filings columns.', created_at: new Date(Date.now() - 3600000).toISOString() }
            ];
        }
        return [
            { id: 'm-3', sender_id: 'mock-client-id', content: 'Hello! I require ITR-4 filings confirmation.', created_at: new Date(Date.now() - 3600000).toISOString() }
        ];
    };

    const getMockClientMeta = (id: string) => ({
        full_name: id === 'mock-1' ? 'ABC Business Solutions' : 'Aditya Birla Services',
        email: id === 'mock-1' ? 'info@abcsolutions.com' : 'billing@birla.com',
        phone: '+91 99887 76655',
        pan: 'ABCDE1234F',
        status: 'active',
        openTasks: 3
    });

    const getMockSharedFiles = (id: string) => [
        { id: 'f-1', name: 'GST_Sales_Sheet_Q1.xlsx', size: '2.4 MB' },
        { id: 'f-2', name: 'PAN_Card_Verify.pdf', size: '1.2 MB' }
    ];

    const filteredConvs = conversations.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (c.last_message_preview && c.last_message_preview.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesType = convFilter === 'all' || c.type === convFilter;

        return matchesSearch && matchesType;
    });

    return (
        <div className="h-[calc(100vh-8rem)] flex overflow-hidden bg-black border border-slate-800">
            {/* Panel 1: Conversation List (Left) */}
            <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/50">
                <div className="p-4 border-b border-slate-800 space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Practice Channels</span>
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-lime-500 transition-colors" />
                        <Input
                            placeholder="SEARCH CHANNELS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-black border-slate-800 focus:border-lime-600/50 pl-8 h-9 text-[10px] uppercase font-bold tracking-widest rounded-none"
                        />
                    </div>

                    <div className="flex gap-1 bg-black p-0.5 border border-slate-800/80">
                        {['all', 'client', 'team'].map(type => (
                            <button
                                key={type}
                                onClick={() => setConvFilter(type as any)}
                                className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest transition-all ${
                                    convFilter === type ? 'bg-lime-600 text-black' : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loadingConvs ? (
                        <div className="flex justify-center py-8">
                            <div className="w-5 h-5 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
                        </div>
                    ) : filteredConvs.length === 0 ? (
                        <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest py-8">No open channels</p>
                    ) : (
                        filteredConvs.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className={`p-4 border-b border-slate-800/40 cursor-pointer transition-all flex gap-3 ${
                                    selectedConv?.id === conv.id ? 'bg-lime-600/5 border-l-2 border-l-lime-600' : 'hover:bg-white/5'
                                }`}
                            >
                                <div className="w-8 h-8 bg-slate-900 border border-slate-800 flex items-center justify-center text-lime-500 font-black italic rounded-none flex-shrink-0">
                                    {conv.title[0]?.toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 space-y-0.5">
                                    <p className="text-xs font-black uppercase text-white truncate">{conv.title}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{conv.last_message_preview || 'No messages yet'}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Panel 2: Message Thread (Center) */}
            <div className="flex-1 flex flex-col bg-black/30">
                {selectedConv ? (
                    <>
                        <div className="h-14 border-b border-slate-800 px-4 flex items-center justify-between bg-slate-950/40">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-lime-600/15 border border-lime-600/20 flex items-center justify-center text-lime-500 font-black text-xs">
                                    {selectedConv.title[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs font-black uppercase tracking-wider text-white">{selectedConv.title}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
                            {messages.map((msg) => {
                                const isSelf = msg.sender_id === user?.id || msg.sender_id === 'mock-ca-id';
                                return (
                                    <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} w-full animate-in fade-in`}>
                                        <div className={`max-w-md p-3 border rounded-none ${
                                            isSelf ? 'bg-lime-950/40 border-lime-600/20 text-white' : 'bg-slate-900 border-slate-800 text-white'
                                        }`}>
                                            <p className="text-xs leading-relaxed font-sans">{msg.content}</p>
                                            <div className="flex justify-end items-center gap-1 mt-1 text-[8px] font-mono text-slate-500">
                                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                {isSelf && <CheckCheck className="w-3 h-3 text-lime-500" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messageEndRef} />
                        </div>

                        <div className="p-3 bg-slate-950 border-t border-slate-800">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="w-10 h-10 border border-slate-800 text-slate-500 hover:text-white rounded-none"
                                >
                                    <Paperclip className="w-4 h-4" />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="TRANSMIT CHAT OVER SSL..."
                                    className="flex-1 bg-black border-slate-800 focus:border-lime-600/50 text-xs text-white rounded-none placeholder:text-slate-600"
                                />
                                <Button
                                    type="submit"
                                    disabled={sending}
                                    className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] px-4 rounded-none h-10 flex items-center gap-1.5"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    TRANSMIT
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-2">
                        <MessageSquare className="w-8 h-8 text-slate-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Awaiting channel selection...</span>
                    </div>
                )}
            </div>

            {/* Panel 3: Client Info Sidebar (Right) */}
            {selectedConv && selectedConv.type === 'client' && clientMeta && (
                <div className="w-72 border-l border-slate-800 bg-slate-950/30 flex flex-col p-4 space-y-6 overflow-y-auto custom-scrollbar">
                    <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-500">Channel Metadata</span>
                        <h3 className="text-xs font-black uppercase tracking-wider text-white mt-1">Client Profile</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-slate-800 rounded-none">
                                <AvatarFallback className="bg-lime-600/10 text-lime-500 font-black italic rounded-none">
                                    {clientMeta.full_name[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-xs font-black uppercase text-white tracking-wider">{clientMeta.full_name}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">PAN: {clientMeta.pan || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <div className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-lime-500" />
                                <span>{clientMeta.email}</span>
                            </div>
                            {clientMeta.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-lime-500" />
                                    <span>{clientMeta.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Open Tasks</span>
                            <span className="text-lime-500">{clientMeta.openTasks || 0}</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Shared Documents</h4>
                        <div className="space-y-2">
                            {sharedFiles.map((file) => (
                                <div key={file.id} className="p-2 bg-black border border-slate-800 flex items-center justify-between text-[10px] font-sans">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <Folder className="w-3.5 h-3.5 text-lime-500 flex-shrink-0" />
                                        <span className="text-slate-300 truncate font-mono text-[9px]">{file.name}</span>
                                    </div>
                                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest flex-shrink-0">{file.size}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
