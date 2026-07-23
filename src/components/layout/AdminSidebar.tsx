"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert,
  Users,
  Building2,
  Activity,
  CreditCard,
  Settings,
  Database,
  FileCheck,
  Megaphone,
  LifeBuoy,
  ToggleLeft,
  KeyRound,
  Wrench,
  HelpCircle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: Activity },
  { name: "Users Management", href: "/admin/users", icon: Users },
  { name: "Firms", href: "/admin/firms", icon: Building2 },
  { name: "CA Approvals", href: "/admin/ca-approvals", icon: ShieldAlert },
  { name: "KYC Reviews", href: "/admin/kyc", icon: FileCheck },
  { name: "Subscriptions & Plans", href: "/admin/plans", icon: CreditCard },
  { name: "Revenue & Analytics", href: "/admin/revenue", icon: Activity },
  { name: "CMS Content & FAQs", href: "/admin/content", icon: HelpCircle },
  { name: "Support Tickets", href: "/admin/support-tickets", icon: LifeBuoy },
  { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Database },
  { name: "Feature Flags", href: "/admin/feature-flags", icon: ToggleLeft },
  { name: "Maintenance & Health", href: "/admin/maintenance", icon: Wrench },
  { name: "Global Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-100">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-800 bg-slate-950/50">
        <Link href="/admin/dashboard" className="font-display font-bold text-xl tracking-tight text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center text-white text-sm font-extrabold">T</span>
          Tax<span className="text-lime-500">Mate</span>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-lime-600/20 text-lime-400 px-2 py-0.5 rounded border border-lime-500/30 ml-1">Admin</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-lime-600/20 text-lime-400 font-semibold border-l-4 border-lime-500 pl-2"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-lime-400" : "text-slate-400 group-hover:text-slate-200",
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

