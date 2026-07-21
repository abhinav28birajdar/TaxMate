'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  FileText,
  Users,
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  LayoutDashboard,
  DollarSign,
  ClipboardList,
  Lock,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const auth: any = useAuth();
  const { user, signOut, organization } = auth;
  const [collapsed, setCollapsed] = useState(false);

  // Determine nav sections based on user role
  const getNavSections = (): NavSection[] => {
    const role = user?.role ? String(user.role).toLowerCase() : '';
    const isAdmin = role === 'super_admin';
    const isCA = role === 'ca';
    const isStaff = role === 'staff';
    const isClient = role === 'client';

    if (isClient) {
      return [
        {
          title: 'Portal',
          items: [
            { label: 'Dashboard', href: '/portal', icon: <LayoutDashboard className="w-5 h-5" /> },
            { label: 'My Documents', href: '/portal/documents', icon: <FileText className="w-5 h-5" /> },
            { label: 'Invoices', href: '/portal/invoices', icon: <DollarSign className="w-5 h-5" /> },
            { label: 'Tasks', href: '/portal/tasks', icon: <CheckSquare className="w-5 h-5" /> },
            { label: 'Compliance', href: '/portal/compliance', icon: <ClipboardList className="w-5 h-5" /> },
            { label: 'Messages', href: '/portal/messages', icon: <MessageSquare className="w-5 h-5" /> },
          ],
        },
      ];
    }

    const mainNav: NavItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Clients', href: '/dashboard/clients', icon: <Users className="w-5 h-5" /> },
      { label: 'Tasks', href: '/dashboard/tasks', icon: <CheckSquare className="w-5 h-5" /> },
      { label: 'Documents', href: '/dashboard/documents', icon: <FileText className="w-5 h-5" /> },
    ];

    const financeNav: NavItem[] = [
      { label: 'Invoices', href: '/dashboard/invoices', icon: <DollarSign className="w-5 h-5" /> },
      { label: 'Expenses', href: '/dashboard/expenses', icon: <FileText className="w-5 h-5" /> },
      { label: 'Time Tracking', href: '/dashboard/time-tracking', icon: <Clock className="w-5 h-5" /> },
    ];

    const operationsNav: NavItem[] = [
      { label: 'Compliance', href: '/dashboard/compliance', icon: <ClipboardList className="w-5 h-5" /> },
      { label: 'Appointments', href: '/dashboard/appointments', icon: <Calendar className="w-5 h-5" /> },
      { label: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="w-5 h-5" /> },
    ];

    const sections: NavSection[] = [
      { title: 'Main', items: mainNav },
      { title: 'Finance', items: financeNav },
      { title: 'Operations', items: operationsNav },
      { title: 'Analytics', items: [{ label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 className="w-5 h-5" /> }] },
      { title: 'Settings', items: [{ label: 'Settings', href: '/dashboard/settings/profile', icon: <Settings className="w-5 h-5" /> }] },
    ];

    if (isAdmin) {
      sections.push({
        title: 'Administration',
        items: [
          { label: 'Admin Panel', href: '/admin', icon: <AlertCircle className="w-5 h-5" /> },
          { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
          { label: 'Audit Logs', href: '/admin/audit-logs', icon: <Lock className="w-5 h-5" /> },
          { label: 'Feature Flags', href: '/admin/feature-flags', icon: <BarChart3 className="w-5 h-5" /> },
        ],
      });
    }

    return sections;
  };

  const navSections = getNavSections();
  const isActive = (href: string) => pathname.startsWith(href) && href !== '/dashboard';

  return (
    <div
      className={cn(
        'fixed left-0 top-0 h-screen border-r border-slate-200 bg-white transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-60'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-lime-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-bold text-slate-900">TaxMate</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-8">
        {navSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative group',
                    isActive(item.href)
                      ? 'bg-lime-50 text-lime-600 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className={cn('flex-shrink-0', isActive(item.href) && 'text-lime-600')}>
                    {item.icon}
                  </span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && isActive(item.href) && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-lime-600 rounded-r" />
                  )}
                  {!collapsed && item.badge && item.badge > 0 && (
                    <span className="ml-auto text-xs bg-lime-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-slate-200 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn('w-full', collapsed ? 'h-10 w-10 p-0' : 'justify-start')}>
              <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-600 font-bold flex items-center justify-center flex-shrink-0">
                {(user?.email?.charAt(0) || 'U').toUpperCase()}
              </div>
              {!collapsed && (
                <div className="ml-3 text-left flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.name || user?.email || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 capitalize truncate">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/profile">Profile Settings</Link>
            </DropdownMenuItem>
            {(String(user?.role).toLowerCase() === 'super_admin' || String(user?.role).toLowerCase() === 'ca') && (
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/organization">Organization</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
