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
  HelpCircle,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "All 20 Modules", href: "/modules", icon: Layers, highlight: true },
  { name: "CA Dashboard", href: "/ca/dashboard", icon: LayoutDashboard },
  { name: "Client Management", href: "/ca/clients", icon: Users },
  { name: "Tax Work Dashboard", href: "/ca/income-tax", icon: FileSpreadsheet },
  { name: "Tasks & Workflow", href: "/ca/tasks", icon: CheckSquare },
  { name: "Tasks Kanban (6 Stages)", href: "/ca/tasks/kanban", icon: KanbanSquare },
  { name: "Document Vault", href: "/ca/documents", icon: FileText },
  { name: "GST Compliance & ITC", href: "/ca/gst", icon: ShieldCheck },
  { name: "Appointments & Schedule", href: "/ca/appointments", icon: Calendar },
  { name: "Real-Time Messages", href: "/ca/chat", icon: MessageSquare },
  { name: "Video Consultations", href: "/ca/calls", icon: Video },
  { name: "Invoices & Billing", href: "/ca/invoices", icon: Receipt },
  { name: "Payments Received", href: "/ca/payments", icon: CreditCard },
  { name: "Firm Wallet & Payouts", href: "/ca/wallet", icon: Wallet },
  { name: "Tax Calendar", href: "/ca/calendar", icon: Calendar },
  { name: "Analytics & Reports", href: "/ca/analytics", icon: BarChart3 },
  { name: "Services & Fee Pricing", href: "/ca/services", icon: Briefcase },
  { name: "Client Reviews", href: "/ca/reviews", icon: Star },
  { name: "Public CA Profile", href: "/ca/profile", icon: Star },
  { name: "Firm Settings", href: "/ca/settings", icon: Settings },
  { name: "Support Desk", href: "/ca/support", icon: HelpCircle },
];

export function CASidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-[#0A0A0A] text-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10 bg-[#111111]/50 backdrop-blur-sm">
        <Link href="/ca/dashboard" className="font-display font-bold text-xl tracking-tight flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-[0_0_15px_rgba(5,150,105,0.4)]">
            T
          </span>
          <span className="text-white">Tax<span className="text-emerald-500">Mate</span></span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-1">
            CA Portal
          </span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-3 pb-6">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/ca/dashboard" && item.href !== "/modules");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 font-semibold border-l-4 border-emerald-500 pl-2 shadow-[inset_0_0_12px_rgba(16,185,129,0.1)]"
                    : item.highlight
                    ? "text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20"
                    : "text-gray-400 hover:bg-[#141414] hover:text-white",
                  "group flex items-center rounded-xl px-3 py-2 text-xs font-medium transition-all"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-emerald-400" : item.highlight ? "text-emerald-400" : "text-gray-500 group-hover:text-gray-300",
                    "mr-3 h-4 w-4 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Hub
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}


