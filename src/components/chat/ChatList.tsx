'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MoreHorizontal, Check, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChatContext, Chat } from '@/hooks/ChatContext';
import { formatDistanceToNow } from 'date-fns';

const ChatItem = ({ chat, active, onClick }: { chat: Chat; active: boolean; onClick: () => void }) => {
    return (
        <motion.div
            whileHover={{ x: 4 }}
            onClick={onClick}
            className={`p-4 rounded-[24px] cursor-pointer transition-all duration-300 flex items-center gap-4 relative group ${active
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                    : 'hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                }`}
        >
            <div className="relative flex-shrink-0">
                <Avatar className={`w-14 h-14 border-2 ${active ? 'border-white/40' : 'border-blue-500/20 shadow-xl'}`} />
                {chat.onlineStatus === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-950 rounded-full" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-black text-sm uppercase tracking-tight truncate ${active ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {chat.type === 'direct' ? 'Anita Desai' : 'ITR Case Thread'}
                    </h4>
                    <span className={`text-[10px] font-bold ${active ? 'text-white/60' : 'opacity-40'}`}>
                        {chat.lastMessage ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false }) : ''}
                    </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold truncate ${active ? 'text-white/80' : 'opacity-60'}`}>
                        {chat.isTyping ? (
                            <span className="text-blue-500 font-black animate-pulse">Typing...</span>
                        ) : chat.lastMessage?.content}
                    </p>

                    {chat.unreadCount > 0 && !active && (
                        <Badge className="bg-blue-600 text-white border-none text-[10px] h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold">
                            {chat.unreadCount}
                        </Badge>
                    )}

                    {active && (
                        <div className="flex-shrink-0">
                            {chat.lastMessage?.status === 'read' ? (
                                <CheckCheck className="w-4 h-4 text-white/60" />
                            ) : (
                                <Check className="w-4 h-4 text-white/60" />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {active && (
                <motion.div
                    layoutId="chat-active-indicator"
                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
                />
            )}
        </motion.div>
    );
};

export default function ChatList() {
    const { chats, activeChat, setActiveChat } = useChatContext();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChats = chats.filter(chat =>
        chat.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="h-full flex flex-col glass rounded-[32px] overflow-hidden border-none shadow-2xl">
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight uppercase">Messages</h2>
                    <Button size="icon" variant="ghost" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Plus className="w-6 h-6 text-blue-600" />
                    </Button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 rounded-2xl glass border-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Badge className="bg-blue-600 text-white border-none px-3 py-1 cursor-pointer">All Chats</Badge>
                    <Badge variant="outline" className="opacity-40 hover:opacity-100 cursor-pointer border-gray-200">Unread</Badge>
                    <Badge variant="outline" className="opacity-40 hover:opacity-100 cursor-pointer border-gray-200">Clients</Badge>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8"><Filter className="w-4 h-4" /></Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-6 space-y-2">
                <AnimatePresence mode="popLayout">
                    {filteredChats.map((chat) => (
                        <ChatItem
                            key={chat.id}
                            chat={chat}
                            active={activeChat?.id === chat.id}
                            onClick={() => setActiveChat(chat)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Last Backup</p>
                        <p className="text-sm font-bold opacity-80">Today, 04:00 AM</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-600"><MoreHorizontal className="w-5 h-5" /></Button>
                </div>
            </div>
        </div>
    );
}
