'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    Briefcase,
    FileText,
    MessageSquare,
    Video,
    Calendar,
    CreditCard,
    Settings,
    ChevronLeft,
    LogOut,
    PieChart,
    Zap,
    HelpCircle,
    LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface SidebarLinkProps {
    icon: LucideIcon;
    label: string;
    href: string;
    badge?: string;
    active?: boolean;
    collapsed?: boolean;
}

const SidebarLink = ({ icon: Icon, label, href, badge, active, collapsed }: SidebarLinkProps) => {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative group ${active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
            >
                <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-white' : 'group-hover:text-blue-600 transition-colors'}`} />
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-bold text-sm whitespace-nowrap"
                    >
                        {label}
                    </motion.span>
                )}
                {!collapsed && badge && (
                    <Badge className="ml-auto bg-red-500 text-white border-none text-[10px] h-5 px-1.5 min-w-[20px] flex items-center justify-center">
                        {badge}
                    </Badge>
                )}
                {active && (
                    <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                    />
                )}
            </motion.div>
        </Link>
    );
};

export default function Sidebar({ role = 'ca' }: { role?: string }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { icon: Home, label: 'Overview', href: `/dashboard/${role}` },
        { icon: Users, label: 'Clients', href: `/dashboard/${role}/clients`, badge: '12' },
        { icon: Briefcase, label: 'Cases', href: '/cases' },
        { icon: FileText, label: 'Documents', href: '/documents' },
        { icon: MessageSquare, label: 'Messages', href: '/chat', badge: '5' },
        { icon: Video, label: 'Video Calls', href: '/calls' },
        { icon: Calendar, label: 'Schedule', href: '/appointments' },
        { icon: CreditCard, label: 'Payments', href: '/payments' },
        { icon: PieChart, label: 'Analytics', href: '/analytics' },
    ];

    return (
        <motion.aside
            animate={{ width: collapsed ? 88 : 280 }}
            className="h-screen fixed left-0 top-0 glass border-r border-white/20 z-40 hidden lg:flex flex-col p-4 shadow-2xl transition-all duration-300"
        >
            {/* Brand */}
            <div className={`flex items-center gap-3 mb-10 px-2 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                </div>
                {!collapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate"
                    >
                        CAConnect
                    </motion.span>
                )}
            </div>

            {/* Main Nav */}
            <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar py-4">
                {menuItems.map((item) => (
                    <SidebarLink
                        key={item.href}
                        {...item}
                        active={pathname === item.href}
                        collapsed={collapsed}
                    />
                ))}
            </div>

            {/* Upgrade Card / Support */}
            {!collapsed && (
                <div className="mb-6 px-2">
                    <Card className="p-4 bg-gradient-to-br from-blue-600 to-purple-700 text-white rounded-3xl relative overflow-hidden group border-none">
                        <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                        <div className="relative z-10 space-y-3">
                            <p className="text-xs font-black uppercase opacity-60 tracking-widest">Enterprise</p>
                            <h4 className="font-bold text-sm">Professional Plan</h4>
                            <Button size="sm" className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold h-8 rounded-xl">
                                Upgrade Now
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Footer Nav */}
            <div className="space-y-2 pt-4 border-t border-white/10">
                <SidebarLink icon={Settings} label="Settings" href="/settings" collapsed={collapsed} />
                <SidebarLink icon={HelpCircle} label="Support" href="/support" collapsed={collapsed} />

                <div className={`p-4 mt-2 ${collapsed ? 'flex justify-center' : 'glass rounded-3xl flex items-center gap-3'}`}>
                    <Avatar className="w-10 h-10 ring-2 ring-blue-500/20" />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">Rajesh Kumar, CA</p>
                            <p className="text-[10px] opacity-60 font-black uppercase tracking-tighter">Senior Partner</p>
                        </div>
                    )}
                    {!collapsed && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                            <LogOut className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            <Button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-blue-600 text-white p-0 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
                <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </Button>
        </motion.aside>
    );
}
