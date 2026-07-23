"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  CheckSquare, 
  KanbanSquare,
  FileText, 
  ShieldCheck,
  FileSpreadsheet,
  Calendar,
  Receipt, 
  CreditCard,
  Wallet,
  BookOpen,
  BarChart3,
  Star,
  Bot,
  Calculator,
  Bell,
  Settings,
  MessageSquare,
  Video,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/ca/dashboard", icon: LayoutDashboard },
  { name: "Clients CRM", href: "/ca/clients", icon: Users },
  { name: "Projects", href: "/ca/projects", icon: Briefcase },
  { name: "Tasks List", href: "/ca/tasks", icon: CheckSquare },
  { name: "Kanban Board", href: "/ca/tasks/kanban", icon: KanbanSquare },
  { name: "Document Vault", href: "/ca/documents", icon: FileText },
  { name: "GST Returns & Notices", href: "/ca/gst", icon: ShieldCheck },
  { name: "Income Tax & ITR", href: "/ca/income-tax", icon: FileSpreadsheet },
  { name: "Compliance Calendar", href: "/ca/compliance", icon: Calendar },
  { name: "Invoices & Billing", href: "/ca/invoices", icon: Receipt },
  { name: "Payments Received", href: "/ca/payments", icon: CreditCard },
  { name: "CA Wallet", href: "/ca/wallet", icon: Wallet },
  { name: "Ledger Accounting", href: "/ca/accounting", icon: BookOpen },
  { name: "Analytics & Reports", href: "/ca/analytics", icon: BarChart3 },
  { name: "Client Reviews", href: "/ca/reviews", icon: Star },
  { name: "Services & Fees", href: "/ca/services", icon: Briefcase },
  { name: "AI Tax Assistant", href: "/ca/ai-assistant", icon: Bot },
  { name: "Tax Calculator", href: "/ca/tax-calculator", icon: Calculator },
  { name: "Live Chat", href: "/ca/chat", icon: MessageSquare },
  { name: "Video Calls", href: "/ca/calls", icon: Video },
  { name: "Notifications", href: "/ca/notifications", icon: Bell },
  { name: "Settings", href: "/ca/settings", icon: Settings },
  { name: "Support Desk", href: "/ca/support", icon: HelpCircle },
];

export function CASidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/ca/dashboard" className="font-display font-bold text-xl tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center text-white text-sm font-extrabold">T</span>
          Tax<span className="text-lime-600 dark:text-lime-500">Mate</span> <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">CA Portal</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4 pb-6">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/ca/dashboard");
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

