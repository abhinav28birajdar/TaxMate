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
  X,
  LayoutDashboard,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const mainNav: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Clients', href: '/dashboard/clients', icon: <Users className="w-5 h-5" /> },
    { label: 'Tasks', href: '/dashboard/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'Invoices', href: '/dashboard/invoices', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Compliance', href: '/dashboard/compliance', icon: <ClipboardList className="w-5 h-5" /> },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <SheetHeader className="h-16 border-b border-slate-200 flex items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 bg-lime-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-bold text-slate-900">TaxMate</span>
          </Link>
        </SheetHeader>

        <nav className="p-4 space-y-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-lime-50 text-lime-600 font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
              )}
              onClick={() => setOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="border-t border-slate-200 pt-4 mt-4">
            <Link
              href="/dashboard/settings/profile"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
            <button
              onClick={() => {
                signOut();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
