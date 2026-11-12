'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Menu,
  CheckCircle2,
  FileText,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  LogOut,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { CASidebar } from '@/components/layout/CASidebar';
import { ClientSidebar } from '@/components/layout/ClientSidebar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ThemeToggle } from './ThemeToggle';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { GlobalSearchDialog } from '@/components/shared/GlobalSearchDialog';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useRealtimeNotifications } from '@/hooks/use-realtime';
import Link from 'next/link';

interface RecentNotification {
  id: string;
  title: string;
  message?: string;
  description?: string;
  type?: string;
  is_read?: boolean;
  read?: boolean;
  created_at?: string;
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingNotifs(true);
      const res = await fetch('/api/v1/notifications?limit=5');
      if (!res.ok) return;
      const json = await res.json();
      const rows: RecentNotification[] = json.data?.notifications || json.notifications || [];
      setRecentNotifications(rows.slice(0, 5));
      const unread = rows.filter((n) => !(n.is_read ?? n.read)).length;
      setUnreadCount(json.data?.unreadCount ?? unread);
    } catch {
      // Silently preserve empty feed
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications, pathname]);

  useRealtimeNotifications(user?.id || '', () => {
    void loadNotifications();
  });

  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleNotificationClick = async (notifId?: string) => {
    if (notifId) {
      fetch('/api/v1/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notifId }),
      }).catch(() => null);
    }
    if (pathname.startsWith('/client')) {
      router.push('/client/notifications');
    } else if (pathname.startsWith('/admin')) {
      router.push('/admin/audit-logs');
    } else {
      router.push('/ca/notifications');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      router.push('/login');
    }
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userName =
    user?.name ||
    user?.email?.split('@')[0] ||
    (role === 'CLIENT' ? 'Client' : role === 'SUPER_ADMIN' ? 'Super Admin' : 'CA Partner');
  const userInitials = userName.slice(0, 2).toUpperCase();
  const accountLabel =
    role === 'SUPER_ADMIN'
      ? 'Super Admin Console'
      : role === 'CLIENT'
      ? 'Taxpayer Portal'
      : 'CA Practice Account';

  const getNotifIcon = (type?: string) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('payment') || t.includes('invoice')) {
      return <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
    }
    if (t.includes('message') || t.includes('chat')) {
      return <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
    }
    if (t.includes('compliance') || t.includes('alert') || t.includes('deadline')) {
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
    }
    if (t.includes('doc')) {
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 text-white">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-[#0A0A0A] border-r border-white/10 text-white">
            {pathname.startsWith('/admin') ? (
              <AdminSidebar />
            ) : pathname.startsWith('/client') ? (
              <ClientSidebar />
            ) : (
              <CASidebar />
            )}
          </SheetContent>
        </Sheet>

        {/* Separator for mobile */}
        <div className="h-6 w-px bg-white/10 lg:hidden" aria-hidden="true" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center max-w-lg h-9 px-3 text-xs text-gray-400 bg-[#141414] hover:bg-[#1A1A1A] border border-white/10 rounded-xl transition-all shadow-inner group"
          >
            <Search className="h-4 w-4 mr-2.5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
            <span className="flex-1 text-left">Search clients, documents, returns, messages (Ctrl+K)...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono text-gray-400">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-x-3 lg:gap-x-4 ml-auto">
            {pathname.startsWith('/ca') && <WorkspaceSwitcher />}
            <ThemeToggle />

            {/* Interactive Notifications Bell Dropdown */}
            <DropdownMenu onOpenChange={(open) => { if (open) loadNotifications(); }}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-white relative"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-[#111111] border-white/10 text-white p-2 shadow-2xl">
                <DropdownMenuLabel className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2">
                  <span>Recent Notifications</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30">
                    {unreadCount > 0 ? `${unreadCount} Unread` : 'Live Feed'}
                  </span>
                </DropdownMenuLabel>

                <div className="py-2 space-y-1 text-xs max-h-64 overflow-y-auto">
                  {loadingNotifs ? (
                    <div className="py-6 flex items-center justify-center text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin mr-2 text-emerald-400" />
                      Loading notifications...
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="py-6 text-center text-gray-400 text-[11px]">
                      You are all caught up. No recent notifications.
                    </div>
                  ) : (
                    recentNotifications.map((item) => (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handleNotificationClick(item.id)}
                        className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-[#1A1A1A] rounded-lg"
                      >
                        {getNotifIcon(item.type)}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white truncate">{item.title}</div>
                          {(item.message || item.description) && (
                            <div className="text-[11px] text-gray-400 line-clamp-2">
                              {item.message || item.description}
                            </div>
                          )}
                        </div>
                        {!(item.is_read ?? item.read) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </div>

                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => handleNotificationClick()}
                  className="text-center font-bold text-emerald-400 text-xs justify-center cursor-pointer py-2 hover:bg-[#1A1A1A]"
                >
                  View All Notifications →
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Separator */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-white/10" aria-hidden="true" />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="-m-1.5 flex items-center p-1.5 hover:bg-transparent">
                  <span className="sr-only">Open user menu</span>
                  <Avatar className="h-8 w-8 bg-emerald-600/20 border border-emerald-500/30">
                    <AvatarImage src={user?.avatarUrl || ''} alt={userName} />
                    <AvatarFallback className="text-emerald-400 font-bold text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-3 text-xs font-bold text-white" aria-hidden="true">
                      {userName}
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#111111] border-white/10 text-white">
                <DropdownMenuLabel className="text-xs text-gray-400">{accountLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                {role === 'CLIENT' ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/client/profile')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/client/tax-returns')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      ITR & Tax Returns
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/client/invoices')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Invoices & Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/client/settings')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Account Settings
                    </DropdownMenuItem>
                  </>
                ) : role === 'SUPER_ADMIN' ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Super Admin Console
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/users')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      User Management
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Platform Settings
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/ca/settings')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Profile & Practice Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/ca/wallet')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Wallet & Payouts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/ca/services')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                      Services & Fee Plans
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleSignOut} className="text-xs text-red-400 cursor-pointer font-bold hover:bg-[#1A1A1A] flex items-center justify-between">
                  <span>Log out</span>
                  <LogOut className="w-3.5 h-3.5" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default TopBar;
