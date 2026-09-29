'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Menu, CheckCircle2, FileText, CreditCard, MessageSquare, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { ThemeToggle } from './ThemeToggle';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { toast } from 'sonner';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNotificationClick = () => {
    if (pathname.startsWith('/client')) {
      router.push('/client/dashboard');
    } else {
      router.push('/ca/notifications');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      {/* Separator for mobile */}
      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-slate-400"
            aria-hidden="true"
          />
          <Input
            id="search-field"
            className="block h-full w-full border-0 bg-transparent py-0 pl-8 pr-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-0 sm:text-sm shadow-none"
            placeholder="Search clients, tasks, or documents..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-3 lg:gap-x-4">
          {pathname.startsWith('/ca') && <WorkspaceSwitcher />}
          <ThemeToggle />

          {/* Interactive Notifications Bell Dropdown & Direct Link */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-m-2.5 p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 relative"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-lime-600 animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-2 shadow-xl">
              <DropdownMenuLabel className="flex items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                <span>Recent Notifications</span>
                <span className="px-2 py-0.5 bg-lime-600/20 text-lime-600 dark:text-lime-400 text-[10px] rounded-full">
                  3 New
                </span>
              </DropdownMenuLabel>

              <div className="py-2 space-y-1 text-xs">
                <DropdownMenuItem onClick={handleNotificationClick} className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-lg">
                  <FileText className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">New Document Uploaded</div>
                    <div className="text-[11px] text-slate-500">TechNova Solutions uploaded Form 26AS.pdf</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleNotificationClick} className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-lg">
                  <CreditCard className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Payment Received</div>
                    <div className="text-[11px] text-slate-500">Razorpay settled ₹1,50,000 to Bank Vault</div>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={handleNotificationClick} className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-slate-100 dark:focus:bg-slate-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">GSTR-3B Deadline Alert</div>
                    <div className="text-[11px] text-slate-500">Compliance due in 3 days (20 Oct 2026)</div>
                  </div>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={handleNotificationClick}
                className="text-center font-bold text-lime-600 dark:text-lime-400 text-xs justify-center cursor-pointer py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                View All Notifications →
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-800" aria-hidden="true" />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="-m-1.5 flex items-center p-1.5 hover:bg-transparent">
                <span className="sr-only">Open user menu</span>
                <Avatar className="h-8 w-8 bg-lime-600/20 border border-lime-500/30">
                  <AvatarImage src="" alt="CA Profile" />
                  <AvatarFallback className="text-lime-600 dark:text-lime-400 font-bold text-xs">CA</AvatarFallback>
                </Avatar>
                <span className="hidden lg:flex lg:items-center">
                  <span className="ml-3 text-xs font-bold text-slate-900 dark:text-white" aria-hidden="true">
                    CA Rajesh Sharma
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DropdownMenuLabel className="text-xs">CA Firm Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/ca/settings')} className="text-xs cursor-pointer">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/ca/wallet')} className="text-xs cursor-pointer">
                Wallet & Payouts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/ca/services')} className="text-xs cursor-pointer">
                Services & Fee Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/login')} className="text-xs text-red-500 cursor-pointer font-bold">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
