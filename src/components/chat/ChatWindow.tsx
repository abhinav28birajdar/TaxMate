'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Send,
    Paperclip,
    Mic,
    Video,
    Phone,
    MoreVertical,
    Smile,
    Search,
    Check,
    CheckCheck,
    MoreHorizontal,
    ChevronLeft,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useChat, Message } from '@/context/ChatContext';
import { format, isValid } from 'date-fns';

const MessageItem = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
    const messageDate = new Date(message.createdAt);
    const formattedTime = isValid(messageDate) ? format(messageDate, 'HH:mm') : '--:--';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group`}
        >
            <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && <Avatar className="w-8 h-8 border-none ring-1 ring-blue-500/20" />}

                <div className="space-y-1">
                    <div className={`relative px-4 py-3 rounded-[24px] shadow-sm ${isOwn
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'glass rounded-bl-none text-gray-900 dark:text-white'
                        }`}>
                        <p className="text-sm font-medium leading-relaxed">{message.content}</p>

                        {/* Reaction Placeholder */}
                        <div className={`absolute -bottom-2 ${isOwn ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-1 px-2 text-[10px] flex gap-1 border border-gray-100 dark:border-gray-800">
                                <span>👍</span>
                                <span>🔥</span>
                            </div>
                        </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                            {formattedTime}
                        </span>
                        {isOwn && (
                            <div className="flex-shrink-0">
                                {message.status === 'read' ? (
                                    <CheckCheck className="w-3 h-3 text-blue-500" />
                                ) : (
                                    <Check className="w-3 h-3 text-gray-400" />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
            </div>
        </motion.div>
    );
};

export default function ChatWindow() {
    const { activeChat, messages, sendMessage, isLoading } = useChat();
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    if (!activeChat) {
        return (
            <div className="h-full glass rounded-[32px] flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center animate-float">
                    <MessageSquare className="w-12 h-12 text-blue-600" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Select a Conversation</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xs">
                        Connect with your clients or CA in real-time. Sub-100ms latency messaging for professional workflows.
                    </p>
                </div>
                <Button className="rounded-2xl bg-blue-600 text-white font-bold h-12 px-8 shadow-xl shadow-blue-500/20">
                    Start New Case Thread
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col glass rounded-[32px] overflow-hidden border-none shadow-2xl relative">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between glass z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10"><ChevronLeft className="w-6 h-6" /></Button>
                    <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-blue-500/20 shadow-xl" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tighter uppercase leading-none mb-1">
                            {activeChat.type === 'direct' ? 'Anita Desai' : 'ITR Case Thread'}
                        </h3>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-700 border-none text-[8px] h-4 px-1 font-black">ONLINE</Badge>
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-none">Senior Client Partner</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-blue-600"><Phone className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 text-blue-600"><Video className="w-5 h-5" /></Button>
                    <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"><Search className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"><MoreVertical className="w-5 h-5" /></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-2 relative"
            >
                <div className="text-center mb-8 pt-4">
                    <Badge variant="outline" className="opacity-40 italic font-medium border-gray-200">Today, January 26</Badge>
                </div>

                {messages.map((msg) => (
                    <MessageItem key={msg.id} message={msg} isOwn={msg.senderId === 'ca1'} />
                ))}

                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="glass px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 glass border-t border-gray-100 dark:border-gray-800 z-10">
                <form onSubmit={handleSend} className="relative flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"><Paperclip className="w-6 h-6" /></Button>
                        <Button type="button" variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"><Mic className="w-6 h-6" /></Button>
                    </div>

                    <div className="flex-1 relative group">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your message here..."
                            className="h-14 px-6 rounded-2xl glass border-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-blue-500 transition-all font-semibold pr-12"
                        />
                        <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-gray-400 hover:text-blue-600"><Smile className="w-6 h-6" /></Button>
                    </div>

                    <Button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="h-14 w-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 transition-transform active:scale-90 flex-shrink-0"
                    >
                        <Send className="w-6 h-6" />
                    </Button>
                </form>

                {/* Quick Actions / Recommendations */}
                <div className="flex items-center gap-3 mt-4 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Quick Replies:</span>
                    {['Understood', 'Request Docs', 'Schedule Call'].map(reply => (
                        <Badge key={reply} onClick={() => setInputValue(reply)} className="cursor-pointer bg-white/10 hover:bg-blue-600 hover:text-white border-white/20 font-bold transition-all">
                            {reply}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
