"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Receipt, 
  Settings,
  Calendar,
  MessageSquare,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Portal Home", href: "/portal", icon: LayoutDashboard },
  { name: "Find a CA", href: "/portal/search", icon: Search },
  { name: "My Documents", href: "/portal/documents", icon: FileText },
  { name: "Invoices", href: "/portal/invoices", icon: Receipt },
  { name: "Calendar", href: "/portal/calendar", icon: Calendar },
  { name: "Messages", href: "/portal/chat", icon: MessageSquare },
  { name: "Settings", href: "/portal/settings", icon: Settings },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <Link href="/portal" className="font-display font-bold text-xl tracking-tight">
          Tax<span className="text-primary">Mate</span> <span className="text-sm font-normal text-muted-foreground ml-2">Client</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/portal");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
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
