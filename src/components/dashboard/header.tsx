'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export function DashboardHeader() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const fetchNotifs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_read', false)
                .limit(10);

            if (data) setNotifications(data);
        };

        fetchNotifs();

        const sub = supabase.channel('header-notifs')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <header className="h-16 border-b border-primary/10 bg-black/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 lg:hidden">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-primary">
                    <Menu className="w-5 h-5" />
                </Button>
                <span className="font-black uppercase tracking-tighter italic text-foreground">
                    Tax<span className="text-primary">Mate</span>
                </span>
            </div>

            <div className="hidden lg:flex flex-1 max-w-xl">
                <div className="relative w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        type="search"
                        placeholder="SEARCH COMMANDS..."
                        className="w-full bg-white/5 border-primary/10 focus:border-primary/50 pl-10 h-10 rounded-none text-[10px] font-bold uppercase tracking-widest placeholder:text-muted-foreground/30 transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative group/notif rounded-none hover:bg-primary/10 transition-colors">
                            <Bell className="w-4 h-4 text-muted-foreground group-hover/notif:text-primary group-hover/notif:animate-bounce transition-colors" />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-black border-primary/20 rounded-none shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.3em] font-black text-primary p-4 pb-2">Sync Alerts</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-primary/10 mx-2" />
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest italic">All systems clear</div>
                            ) : (
                                notifications.map((n) => (
                                    <DropdownMenuItem key={n.id} className="cursor-pointer p-4 border-b border-primary/5 last:border-0 hover:bg-primary/5 focus:bg-primary/5 group/item">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[11px] font-black uppercase tracking-wider text-foreground group-hover/item:text-primary transition-colors">{n.title}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight leading-relaxed">{n.message}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-[1px] bg-primary/10 mx-2 hidden sm:block" />

                <Button
                    variant="ghost"
                    className="h-10 px-4 text-[10px] font-black uppercase tracking-[0.2em] italic hover:text-primary hover:bg-primary/5 rounded-none transition-all hidden sm:flex items-center gap-2"
                    onClick={handleLogout}
                >
                    Shutdown
                </Button>
            </div>
        </header>
    );
}
