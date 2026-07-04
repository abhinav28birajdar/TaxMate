'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    MessageSquare,
    CreditCard,
    FileText,
    Calendar,
    DollarSign,
    Settings,
    Users,
    LogOut,
    Star,
    BarChart3,
    ChevronRight,
    Briefcase,
    Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const caLinks = [
    {
        section: 'MAIN', items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        ]
    },
    {
        section: 'WORK', items: [
            { icon: Users, label: 'Clients', href: '/clients' },
            { icon: Briefcase, label: 'Tasks', href: '/tasks' },
            { icon: FileText, label: 'Documents', href: '/documents' },
            { icon: Star, label: 'Compliance', href: '/compliance' },
        ]
    },
    {
        section: 'FINANCE', items: [
            { icon: FileText, label: 'Invoices', href: '/invoices' },
            { icon: DollarSign, label: 'Expenses', href: '/expenses' },
            { icon: Clock, label: 'Time Tracking', href: '/time' },
        ]
    },
    {
        section: 'COMMUNICATION', items: [
            { icon: MessageSquare, label: 'Messages', href: '/messages' },
            { icon: Calendar, label: 'Appointments', href: '/appointments' },
        ]
    },
    {
        section: 'INSIGHTS', items: [
            { icon: BarChart3, label: 'Analytics', href: '/analytics' },
        ]
    },
    {
        section: 'ADMIN', items: [
            { icon: Settings, label: 'Admin Panel', href: '/admin' },
        ]
    }
];

const clientLinks = [
    {
        section: 'MAIN', items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/portal/dashboard' },
            { icon: MessageSquare, label: 'Messages', href: '/portal/messages' },
            { icon: Calendar, label: 'Appointments', href: '/portal/appointments' },
        ]
    },
    {
        section: 'FINANCE', items: [
            { icon: FileText, label: 'Invoices', href: '/portal/invoices' },
        ]
    },
    {
        section: 'COMPLIANCE', items: [
            { icon: FileText, label: 'Documents', href: '/portal/documents' },
            { icon: Star, label: 'Compliance', href: '/portal/compliance' },
        ]
    },
];

const CyberCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const positions = {
        'top-left': 'top-0 left-0 border-t border-l',
        'top-right': 'top-0 right-0 border-t border-r',
        'bottom-left': 'bottom-0 left-0 border-b border-l',
        'bottom-right': 'bottom-0 right-0 border-b border-r',
    };

    return (
        <div className={`absolute w-1.5 h-1.5 ${positions[position]} border-primary/50`} />
    );
};

export function DashboardSidebar() {
    const pathname = usePathname();
    const { role, user, isLoading, signOut } = useAuth();

    if (isLoading) {
        return (
            <div className="hidden lg:flex flex-col h-full border-r border-primary/10 bg-black w-64">
                <div className="h-16 flex items-center px-6 border-b border-primary/10">
                    <Skeleton className="h-8 w-32 bg-primary/5" />
                </div>
                <div className="flex-1 py-6 px-4 space-y-2">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full bg-primary/5" />
                    ))}
                </div>
            </div>
        );
    }

    const links = String(role).toLowerCase() === 'client' ? clientLinks : caLinks;
    const displayName = user?.name || 'User';
    const avatarUrl = user?.avatarUrl;

    return (
        <div className="hidden lg:flex flex-col h-full border-r border-lime-600/10 bg-black w-64 relative group">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-lime-600/10 relative">
                <Link href="/dashboard" className="flex items-center gap-3 font-black text-xl tracking-tighter uppercase italic text-foreground group/logo">
                    <div className="relative w-8 h-8 bg-lime-600/10 border border-lime-600/30 rounded flex items-center justify-center group-hover/logo:border-lime-600 transition-colors">
                        <CreditCard className="w-4 h-4 text-lime-500" />
                        <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-lime-600" />
                        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-lime-600" />
                    </div>
                    <span className="text-foreground text-lime-500">
                        TaxMate
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4 custom-scrollbar">
                <div className="px-3 space-y-6">
                    {links.map((section) => (
                        <div key={section.section} className="space-y-1">
                            <div className="px-3 mb-2">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-lime-600/50">
                                    {section.section}
                                </span>
                            </div>
                            {section.items.map((link) => {
                                const isActive = pathname === link.href ||
                                    (link.href !== '/dashboard' && pathname?.startsWith(link.href));
                                return (
                                    <Link key={link.href} href={link.href} className="block relative">
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start gap-4 h-11 transition-all rounded-none border-l-2",
                                                isActive
                                                    ? "bg-lime-600/5 text-lime-500 border-lime-600 font-black italic uppercase tracking-widest text-[11px]"
                                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5 font-bold uppercase tracking-widest text-[11px]"
                                            )}
                                        >
                                            <link.icon className={cn(
                                                "w-4 h-4",
                                                isActive ? "text-lime-500 animate-pulse" : "text-muted-foreground"
                                            )} />
                                            {link.label}
                                            {link.label === 'Messages' && (
                                                <div className="ml-auto w-2 h-2 bg-lime-600 animate-ping rounded-full" />
                                            )}
                                            {isActive && <ChevronRight className="ml-auto h-3 w-3 animate-in fade-in slide-in-from-left-2" />}
                                        </Button>
                                        {isActive && (
                                            <>
                                                <CyberCorner position="top-right" />
                                                <CyberCorner position="bottom-right" />
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* User Section */}
            <div className="p-4 border-t border-lime-600/10 space-y-4">
                <div className="relative p-3 bg-white/5 border border-lime-600/5 hover:border-lime-600/20 transition-all rounded-none group/user overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="relative">
                            <Avatar className="h-10 w-10 border border-lime-600/20 rounded-none p-0.5">
                                <AvatarImage src={avatarUrl} className="rounded-none object-cover" />
                                <AvatarFallback className="bg-lime-600/10 text-lime-500 font-black italic rounded-none">
                                    {displayName[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-lime-600 border-2 border-black rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase italic tracking-wider truncate text-foreground">{displayName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1 h-1 bg-lime-600 rounded-full animate-pulse" />
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold truncate">
                                    {String(role).toLowerCase() !== 'client' ? 'Operator: 01' : 'Level: 01'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-lime-500 hover:bg-lime-600/5 rounded-none font-bold uppercase tracking-widest text-[10px] transition-all"
                    onClick={signOut}
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                </Button>
            </div>
        </div>
    );
}
