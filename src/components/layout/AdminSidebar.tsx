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
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/admin", icon: Activity },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "CA Approvals", href: "/admin/ca-management", icon: ShieldAlert },
  { name: "Firms", href: "/admin/firms", icon: Building2 },
  { name: "Revenue", href: "/admin/revenue", icon: CreditCard },
  { name: "System Logs", href: "/admin/audit-logs", icon: Database },
  { name: "Global Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border bg-red-500/10">
        <Link href="/admin" className="font-display font-bold text-xl tracking-tight text-red-500">
          Tax<span className="text-foreground">Mate</span> <span className="text-xs uppercase tracking-wider font-bold ml-1">Admin</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-red-500" : "text-muted-foreground group-hover:text-foreground",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
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
