'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    LayoutDashboard, Users, CheckSquare, MessageSquare, Video,
    FileText, CreditCard, FolderOpen, FileCheck, Receipt, Calendar,
    BarChart2, Bell, Star, Clock, StickyNote, Settings, HelpCircle,
    ChevronLeft, ChevronRight, Building2, Users2, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { signOut } from 'next-auth/react';

const CA_NAV = [
    {
        section: 'MAIN', items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/clients', label: 'Clients', icon: Users },
            { href: '/tasks', label: 'Tasks', icon: CheckSquare, badge: 'tasks' },
            { href: '/chat', label: 'Messages', icon: MessageSquare, badge: 'messages' },
            { href: '/video-call', label: 'Video Calls', icon: Video },
        ]
    },
    {
        section: 'FINANCE', items: [
            { href: '/invoices', label: 'Invoices', icon: FileText },
            { href: '/payments', label: 'Payments', icon: CreditCard },
            { href: '/expenses', label: 'Expenses', icon: Receipt },
        ]
    },
    {
        section: 'COMPLIANCE', items: [
            { href: '/documents', label: 'Documents', icon: FolderOpen },
            { href: '/tax-filings', label: 'Tax Filings', icon: FileCheck },
            { href: '/appointments', label: 'Appointments', icon: Calendar },
        ]
    },
    {
        section: 'INSIGHTS', items: [
            { href: '/analytics', label: 'Analytics', icon: BarChart2 },
            { href: '/time-tracking', label: 'Time Tracking', icon: Clock },
            { href: '/reviews', label: 'Reviews', icon: Star },
        ]
    },
    {
        section: 'ACCOUNT', items: [
            { href: '/team', label: 'Team', icon: Users2 },
            { href: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
            { href: '/notes', label: 'Notes', icon: StickyNote },
            { href: '/settings', label: 'Settings', icon: Settings },
            { href: '/subscription', label: 'Subscription', icon: Building2 },
            { href: '/help', label: 'Help', icon: HelpCircle },
        ]
    },
];

const CLIENT_NAV = [
    {
        section: 'MAIN', items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/invoices', label: 'Invoices', icon: FileText },
            { href: '/payments', label: 'Payments', icon: CreditCard },
            { href: '/documents', label: 'Documents', icon: FolderOpen },
            { href: '/tax-filings', label: 'Tax Filings', icon: FileCheck },
            { href: '/tasks', label: 'My Tasks', icon: CheckSquare },
            { href: '/chat', label: 'Messages', icon: MessageSquare, badge: 'messages' },
            { href: '/video-call', label: 'Video Calls', icon: Video },
            { href: '/appointments', label: 'Appointments', icon: Calendar },
            { href: '/reviews', label: 'Write Review', icon: Star },
            { href: '/notifications', label: 'Notifications', icon: Bell, badge: 'notifications' },
            { href: '/settings', label: 'Settings', icon: Settings },
            { href: '/help', label: 'Help', icon: HelpCircle },
        ]
    },
];

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const userRole = session?.user?.role;
    const navSections = userRole === 'CLIENT' ? CLIENT_NAV : CA_NAV;

    return (
        <aside className={cn(
            'flex flex-col h-full bg-slate-900 text-slate-100 transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">TM</span>
                        </div>
                        <span className="font-bold text-lg text-white">TaxMate</span>
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors ml-auto"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {navSections.map(({ section, items }) => (
                    <div key={section}>
                        {!collapsed && (
                            <p className="px-4 py-1 text-xs font-semibold text-slate-500 tracking-wider uppercase mt-4">{section}</p>
                        )}
                        {items.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href || pathname.startsWith(href + '/');
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    title={collapsed ? label : undefined}
                                    className={cn(
                                        'flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    )}
                                >
                                    <Icon size={18} className="shrink-0" />
                                    {!collapsed && <span>{label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className="border-t border-slate-700 p-3">
                <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={session?.user?.image ?? ''} />
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {session?.user?.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
                            <p className="text-xs text-slate-400 truncate">{session?.user?.email}</p>
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
