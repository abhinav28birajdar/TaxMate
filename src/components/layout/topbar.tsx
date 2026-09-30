'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Menu, CheckCircle2, FileText, CreditCard, MessageSquare, AlertTriangle, Layers } from 'lucide-react';
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
import { GlobalSearchDialog } from '@/components/shared/GlobalSearchDialog';
import Link from 'next/link';

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNotificationClick = () => {
    if (pathname.startsWith('/client')) {
      router.push('/client/notifications');
    } else {
      router.push('/ca/notifications');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-[#0A0A0A]/90 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 text-white">
        <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-gray-400 hover:text-white lg:hidden">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>

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
            {/* Quick access to 20 Modules Portal */}
            <Link
              href="/modules"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
            >
              <Layers className="w-3.5 h-3.5" /> 20 Modules Hub
            </Link>

            {pathname.startsWith('/ca') && <WorkspaceSwitcher />}
            <ThemeToggle />

            {/* Interactive Notifications Bell Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-white relative"
                >
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-[#111111] border-white/10 text-white p-2 shadow-2xl">
                <DropdownMenuLabel className="flex items-center justify-between text-xs font-bold border-b border-white/10 pb-2">
                  <span>Recent Notifications</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded-full border border-emerald-500/30">
                    3 New
                  </span>
                </DropdownMenuLabel>

                <div className="py-2 space-y-1 text-xs">
                  <DropdownMenuItem onClick={handleNotificationClick} className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-[#1A1A1A] rounded-lg">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">New Document Uploaded</div>
                      <div className="text-[11px] text-gray-400">TechNova Solutions uploaded Form 26AS.pdf</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleNotificationClick} className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-[#1A1A1A] rounded-lg">
                    <CreditCard className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Payment Received</div>
                      <div className="text-[11px] text-gray-400">Razorpay settled ₹1,50,000 to Bank Vault</div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handleNotificationClick} className="cursor-pointer flex items-start gap-2.5 p-2 focus:bg-[#1A1A1A] rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">GSTR-3B Deadline Alert</div>
                      <div className="text-[11px] text-gray-400">Compliance due in 3 days (20 Oct 2026)</div>
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleNotificationClick}
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
                    <AvatarImage src="" alt="CA Profile" />
                    <AvatarFallback className="text-emerald-400 font-bold text-xs">CA</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="ml-3 text-xs font-bold text-white" aria-hidden="true">
                      CA Rajesh Sharma
                    </span>
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#111111] border-white/10 text-white">
                <DropdownMenuLabel className="text-xs text-gray-400">CA Practice Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => router.push('/ca/settings')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/ca/wallet')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                  Wallet & Payouts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/ca/services')} className="text-xs cursor-pointer hover:bg-[#1A1A1A]">
                  Services & Fee Plans
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => router.push('/login')} className="text-xs text-red-400 cursor-pointer font-bold hover:bg-[#1A1A1A]">
                  Log out
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

