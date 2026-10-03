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
  FileText,
  Layers,
  Sparkles,
  Calendar,
  FolderLock,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "All 47 Modules Hub", href: "/modules", icon: Layers, highlight: true },
  { name: "Dashboard", href: "/admin/dashboard", icon: Activity },
  { name: "Users Management", href: "/admin/users", icon: Users },
  { name: "Customers Hub", href: "/admin/customers", icon: Users },
  { name: "Firms & Practices", href: "/admin/firms", icon: Building2 },
  { name: "CA Approvals", href: "/admin/ca-approvals", icon: ShieldAlert },
  { name: "KYC Reviews", href: "/admin/kyc", icon: FileCheck },
  { name: "Tax Configuration", href: "/admin/tax-management", icon: FileSpreadsheet },
  { name: "Documents Vault", href: "/admin/documents", icon: FolderLock },
  { name: "Appointments Hub", href: "/admin/appointments", icon: Calendar },
  { name: "Payments & Escrow", href: "/admin/payments", icon: CreditCard },
  { name: "Subscriptions & Plans", href: "/admin/plans", icon: CreditCard },
  { name: "Revenue & Analytics", href: "/admin/revenue", icon: Activity },
  { name: "Communications", href: "/admin/communication", icon: Megaphone },
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
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-[#0A0A0A] text-white">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/10 bg-[#0E0E0E]">
        <Link href="/admin/dashboard" className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-sm font-extrabold shadow-[0_0_15px_rgba(5,150,105,0.4)]">
            T
          </span>
          Tax<span className="text-emerald-500">Mate</span>
          <span className="text-[10px] uppercase tracking-wider font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 ml-1">
            Admin
          </span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-4 scrollbar-thin">
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold"
                    : item.highlight
                    ? "bg-white/5 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                  "group flex items-center px-3 py-2 text-xs font-medium rounded-xl transition-all"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-white",
                    "mr-3 h-4 w-4 shrink-0"
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {item.highlight && (
                  <Sparkles className="w-3 h-3 text-emerald-400 ml-auto shrink-0 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 text-[11px] text-gray-500 bg-[#0E0E0E]">
        TaxMate SuperAdmin Gateway • v2.0
      </div>
    </div>
  );
}
