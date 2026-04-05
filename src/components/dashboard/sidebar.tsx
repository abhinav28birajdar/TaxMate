'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    MessageSquare,
    Briefcase,
    FileText,
    Calendar,
    CreditCard,
    Settings,
    Users,
    LogOut,
    Star,
    BarChart3,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

const caLinks = [
    {
        section: 'MAIN', items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Users, label: 'Clients', href: '/clients' },
            { icon: Briefcase, label: 'Cases', href: '/cases' },
            { icon: MessageSquare, label: 'Messages', href: '/chat' },
            { icon: Calendar, label: 'Appointments', href: '/appointments' },
        ]
    },
    {
        section: 'FINANCE', items: [
            { icon: FileText, label: 'Invoices', href: '/invoices' },
            { icon: CreditCard, label: 'Payments', href: '/payments' },
            { icon: BarChart3, label: 'Analytics', href: '/billing' },
        ]
    },
    {
        section: 'COMPLIANCE', items: [
            { icon: FileText, label: 'Documents', href: '/documents' },
            { icon: Star, label: 'Tax Filings', href: '/tax-filings' },
        ]
    },
    {
        section: 'SETTINGS', items: [
            { icon: Settings, label: 'Settings', href: '/settings' },
        ]
    }
];

const clientLinks = [
    {
        section: 'MAIN', items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: MessageSquare, label: 'Messages', href: '/chat' },
            { icon: Calendar, label: 'Appointments', href: '/appointments' },
        ]
    },
    {
        section: 'FINANCE', items: [
            { icon: FileText, label: 'My Invoices', href: '/invoices' },
            { icon: CreditCard, label: 'Payments', href: '/payments' },
        ]
    },
    {
        section: 'COMPLIANCE', items: [
            { icon: FileText, label: 'My Documents', href: '/documents' },
            { icon: Star, label: 'My Filings', href: '/tax-filings' },
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
        <div className={`absolute w-1.5 h-1.5 ${positions[position]} border-primary opacity-50`} />
    );
};

export function DashboardSidebar() {
    const pathname = usePathname();
    const { role, user, profile, loading, signOut } = useAuth();

    if (loading) {
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

    const links = role === 'ca' ? caLinks : clientLinks;
    const displayName = profile?.first_name || user?.user_metadata?.first_name || 'User';
    const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

    return (
        <div className="hidden lg:flex flex-col h-full border-r border-primary/10 bg-black w-64 relative group">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-primary/10 relative">
                <Link href="/dashboard" className="flex items-center gap-3 font-black text-xl tracking-tighter uppercase italic text-foreground group/logo">
                    <div className="relative w-8 h-8 bg-primary/10 border border-primary/30 rounded flex items-center justify-center group-hover/logo:border-primary transition-colors">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-primary" />
                        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-primary" />
                    </div>
                    <span className="text-foreground">
                        Tax<span className="text-primary">Mate</span>
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4 custom-scrollbar">
                <div className="px-3 space-y-6">
                    {links.map((section) => (
                        <div key={section.section} className="space-y-1">
                            <div className="px-3 mb-2">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/50">
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
                                                    ? "bg-primary/5 text-primary border-primary font-black italic uppercase tracking-widest text-[11px]"
                                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-white/5 font-bold uppercase tracking-widest text-[11px]"
                                            )}
                                        >
                                            <link.icon className={cn(
                                                "w-4 h-4",
                                                isActive ? "text-primary animate-pulse" : "text-muted-foreground"
                                            )} />
                                            {link.label}
                                            {link.label === 'Messages' && (
                                                <div className="ml-auto w-2 h-2 bg-primary animate-ping rounded-full" />
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
            <div className="p-4 border-t border-primary/10 space-y-4">
                <div className="relative p-3 bg-white/5 border border-primary/5 hover:border-primary/20 transition-all rounded-none group/user overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="relative">
                            <Avatar className="h-10 w-10 border border-primary/20 rounded-none p-0.5">
                                <AvatarImage src={avatarUrl} className="rounded-none object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-black italic rounded-none">
                                    {displayName[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-black rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black uppercase italic tracking-wider truncate text-foreground">{displayName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                                <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold truncate">
                                    {role === 'ca' ? 'Operator: 01' : 'Level: 01'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-none font-bold uppercase tracking-widest text-[10px] transition-all"
                    onClick={signOut}
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                </Button>
            </div>
        </div>
    );
}
