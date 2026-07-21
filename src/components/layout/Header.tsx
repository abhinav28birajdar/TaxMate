'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { cn } from '@/lib/utils';
import {
  Search,
  Bell,
  Plus,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTheme } from 'next-themes';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
}

export default function Header({ title, subtitle, showSearch = true }: HeaderProps) {
  const auth: any = useAuth();
  const { user, signOut, notifications } = auth;
  const { theme, setTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (notifications?.length) {
      const unread = notifications.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    }
  }, [notifications]);

  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white border-b border-slate-200 z-30 transition-all">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left: Title & Search */}
        <div className="flex-1 min-w-0">
          {title && (
            <div>
              <h1 className="text-xl font-bold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 ml-6">
          {/* Global Search */}
          {showSearch && (
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-500">
                  <Search className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline text-sm text-slate-400">Search...</span>
                  <kbd className="ml-2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded hidden sm:inline">
                    ⌘K
                  </kbd>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                <div className="flex items-center gap-2 p-3 border-b">
                  <Search className="w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search clients, tasks, invoices..."
                    className="border-0 outline-none focus:ring-0"
                    autoFocus
                  />
                </div>
                <div className="p-3 text-sm text-slate-500">
                  Start typing to search across TaxMate...
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Quick Add Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-lime-600 hover:bg-lime-700 text-white">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/clients/new">New Client</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/tasks/new">New Task</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/invoices/new">New Invoice</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/appointments">Schedule Appointment</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/documents">Upload Document</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-lime-600 rounded-full" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-lime-100 text-lime-600 px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif: any) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'px-4 py-3 border-b text-sm hover:bg-slate-50 cursor-pointer transition',
                        !notif.is_read && 'bg-lime-50'
                      )}
                    >
                      <p className="font-medium text-slate-900">{notif.title}</p>
                      <p className="text-slate-600 text-xs mt-1">{notif.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-slate-500 text-sm">
                    No notifications
                  </div>
                )}
              </div>
              <Link href="/dashboard/notifications">
                <Button variant="ghost" size="sm" className="w-full rounded-none border-t">
                  View All Notifications
                </Button>
              </Link>
            </PopoverContent>
          </Popover>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-2">
                <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-600 font-semibold flex items-center justify-center">
                  {(user?.email?.charAt(0) || 'U').toUpperCase()}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/organization">Organization</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/notifications">Notification Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
