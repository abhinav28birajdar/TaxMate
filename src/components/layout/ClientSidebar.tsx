"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search,
  Briefcase,
  CheckSquare,
  FileText, 
  Receipt,
  CreditCard,
  Wallet,
  Calendar,
  MessageSquare,
  Video,
  Bot,
  Bell,
  Star,
  Settings,
  User,
  Bookmark,
  HelpCircle,
  ShieldCheck,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "Find a CA", href: "/client/find-ca", icon: Search },
  { name: "My Projects", href: "/client/projects", icon: Briefcase },
  { name: "Tasks", href: "/client/tasks", icon: CheckSquare },
  { name: "Document Vault", href: "/client/documents", icon: FileText },
  { name: "GST Tracking", href: "/client/gst", icon: ShieldCheck },
  { name: "Income Tax & ITR", href: "/client/income-tax", icon: FileSpreadsheet },
  { name: "Compliance Calendar", href: "/client/compliance", icon: Calendar },
  { name: "Invoices", href: "/client/invoices", icon: Receipt },
  { name: "Payments & Receipts", href: "/client/payments", icon: CreditCard },
  { name: "Wallet", href: "/client/wallet", icon: Wallet },
  { name: "Meetings & Consultations", href: "/client/meetings", icon: Calendar },
  { name: "Messages & Chat", href: "/client/chat", icon: MessageSquare },
  { name: "Video Calls", href: "/client/calls", icon: Video },
  { name: "AI Tax Assistant", href: "/client/ai-assistant", icon: Bot },
  { name: "Tax Reports", href: "/client/tax-reports", icon: FileText },
  { name: "My Reviews", href: "/client/reviews", icon: Star },
  { name: "Notifications", href: "/client/notifications", icon: Bell },
  { name: "Bookmarks", href: "/client/bookmarks", icon: Bookmark },
  { name: "My Profile", href: "/client/profile", icon: User },
  { name: "Settings", href: "/client/settings", icon: Settings },
  { name: "Support Desk", href: "/client/support", icon: HelpCircle },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/client/dashboard" className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center text-white text-sm font-extrabold">T</span>
          Tax<span className="text-lime-600 dark:text-lime-500">Mate</span> <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Client</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-6">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/client/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-lime-600/10 text-lime-700 dark:text-lime-400 font-semibold border-l-4 border-lime-600 pl-2"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                  "group flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-lime-600 dark:text-lime-400" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200",
                    "mr-3 h-4 w-4 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

