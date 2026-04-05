'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Bell,
    Search as SearchIcon,
    Command,
    Plus,
    Moon,
    Sun,
    Globe
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 right-0 left-0 lg:left-[var(--sidebar-width)] h-20 glass border-b border-white/20 z-30 px-6 py-4 flex items-center justify-between transition-all duration-300"
            style={{
                // @ts-expect-error - custom property for sidebar width
                '--sidebar-width': '280px'
            }}
        >
            {/* Search Bar */}
            <div className="hidden md:flex items-center flex-1 max-w-xl relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                    placeholder="Search for clients, cases, or documents..."
                    className="pl-12 h-12 rounded-2xl glass border-none ring-1 ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 glass px-2 py-1 rounded-lg border-white/20 pointer-events-none opacity-40">
                    <Command className="w-3 h-3" />
                    <span className="text-[10px] font-black tracking-tight">K</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                {/* Quick Create */}
                <Button className="hidden sm:flex bg-blue-600 text-white font-bold h-10 px-5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform gap-2">
                    <Plus className="w-4 h-4" />
                    Quick Action
                </Button>

                {/* System Buttons */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                    </Button>

                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10 hidden sm:flex">
                        <Globe className="w-5 h-5" />
                    </Button>

                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/50 dark:hover:bg-white/10">
                        <Moon className="w-5 h-5 dark:hidden" />
                        <Sun className="w-5 h-5 hidden dark:block" />
                    </Button>
                </div>

                <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block" />

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-1 rounded-2xl flex items-center gap-3 hover:bg-white/50 dark:hover:bg-white/10">
                            <Avatar className="w-9 h-9 border-2 border-blue-500/20" />
                            <div className="hidden sm:block text-left">
                                <p className="text-xs font-black truncate max-w-[100px]">Rajesh Kumar</p>
                                <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10 font-black tracking-tight">PRO</Badge>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass border-white/20 rounded-2xl p-2 mt-2" align="end">
                        <DropdownMenuLabel className="font-bold px-3 py-2">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="rounded-xl font-medium focus:bg-blue-600 focus:text-white transition-colors">
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl font-medium focus:bg-blue-600 focus:text-white transition-colors">
                            Support
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="rounded-xl font-bold text-red-500 focus:bg-red-500 focus:text-white transition-colors">
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
}
