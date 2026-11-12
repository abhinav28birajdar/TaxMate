"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Users,
  Receipt,
  CheckSquare,
  MessageSquare,
  ShieldCheck,
  X,
  ArrowRight,
  Sparkles,
  Loader2,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ALL_47_SECTIONS } from "@/lib/directory/all-modules-data";
import { useAuth } from "@/hooks/UnifiedAuthContext";

interface SearchItem {
  id: string;
  category:
    | "Clients"
    | "Documents"
    | "Tax Returns"
    | "Messages"
    | "Transactions"
    | "Tasks"
    | "Modules & Pages";
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

const moduleSearchItems: SearchItem[] = ALL_47_SECTIONS.flatMap((sec) => [
  {
    id: `sec-${sec.id}`,
    category: "Modules & Pages" as const,
    title: sec.title,
    subtitle: sec.tagline,
    url: sec.primaryHref,
    badge: sec.badge,
  },
  ...sec.items.map((sub, sIdx) => ({
    id: `sec-${sec.id}-sub-${sIdx}`,
    category: "Modules & Pages" as const,
    title: sub.name,
    subtitle: `Part of ${sec.title}`,
    url: sub.href,
    badge: sec.badge,
  })),
]);

export function GlobalSearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [liveItems, setLiveItems] = useState<SearchItem[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { user, role } = useAuth();

  const isCaContext = pathname?.startsWith("/ca") || role === "CA" || role === "STAFF";
  const prefix = pathname?.startsWith("/admin")
    ? "/admin"
    : isCaContext
    ? "/ca"
    : "/client";

  useEffect(() => {
    if (!isOpen || !user) return;

    let cancelled = false;
    const loadLiveRecords = async () => {
      setLoadingLive(true);
      try {
        const requests: Array<Promise<SearchItem[]>> = [];

        if (isCaContext || role === "SUPER_ADMIN") {
          requests.push(
            fetch("/api/clients?take=25")
              .then((r) => (r.ok ? r.json() : { clients: [] }))
              .then((res) =>
                (res.clients || []).map((c: any) => ({
                  id: `cli-${c.id}`,
                  category: "Clients" as const,
                  title: c.display_name || c.full_name || "Client",
                  subtitle: `${c.pan ? `PAN: ${c.pan}` : c.email || ""} • ${c.client_type || "individual"}`,
                  url: `/ca/clients/${c.id}`,
                  badge: c.status || "active",
                }))
              )
              .catch(() => [])
          );
        }

        requests.push(
          fetch("/api/documents?take=25")
            .then((r) => (r.ok ? r.json() : { documents: [] }))
            .then((res) =>
              (res.documents || []).map((d: any) => ({
                id: `doc-${d.id}`,
                category: "Documents" as const,
                title: d.name || d.file_name || "Document",
                subtitle: `${d.document_type || d.category || "Vault File"} • ${d.financial_year || "Latest"}`,
                url: `${prefix === "/admin" ? "/admin/documents" : `${prefix}/documents`}`,
                badge: d.status || "uploaded",
              }))
            )
            .catch(() => [])
        );

        requests.push(
          fetch("/api/itr")
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((res) =>
              (res.data || []).map((itr: any) => ({
                id: `itr-${itr.id}`,
                category: "Tax Returns" as const,
                title: `${itr.itrType || itr.filingType || "ITR"} (${itr.assessmentYear || itr.financialYear || ""})`,
                subtitle: `${itr.taxpayerName ? `${itr.taxpayerName} • ` : ""}Status: ${itr.status || "in-progress"}`,
                url: isCaContext ? "/ca/income-tax" : "/client/tax-returns",
                badge: itr.status || "Draft",
              }))
            )
            .catch(() => [])
        );

        requests.push(
          fetch("/api/tasks?limit=25")
            .then((r) => (r.ok ? r.json() : { tasks: [] }))
            .then((res) =>
              (res.tasks || []).map((t: any) => ({
                id: `tsk-${t.id}`,
                category: "Tasks" as const,
                title: t.title,
                subtitle: `${t.client_name ? `${t.client_name} • ` : ""}Assigned: ${t.assigned_to_name || "Team"}`,
                url: isCaContext ? "/ca/tasks/kanban" : "/client/compliance",
                badge: t.status || "TODO",
              }))
            )
            .catch(() => [])
        );

        requests.push(
          fetch("/api/payments?limit=20")
            .then((r) => (r.ok ? r.json() : { data: { invoices: [] } }))
            .then((res) => {
              const invoices = res.data?.invoices || res.invoices || [];
              return invoices.map((inv: any) => ({
                id: `inv-${inv.id}`,
                category: "Transactions" as const,
                title: `${inv.invoiceNumber || inv.invoice_number || "Invoice"} • ₹${Number(inv.amount || 0).toLocaleString("en-IN")}`,
                subtitle: inv.description || "Billing & Tax Advisory Fee",
                url: isCaContext ? "/ca/payments" : "/client/payments",
                badge: inv.status || "ISSUED",
              }));
            })
            .catch(() => [])
        );

        requests.push(
          fetch("/api/conversations")
            .then((r) => (r.ok ? r.json() : { conversations: [] }))
            .then((res) =>
              (res.conversations || []).map((conv: any) => ({
                id: `msg-${conv.id}`,
                category: "Messages" as const,
                title: conv.displayTitle || conv.title || "Consultation Chat",
                subtitle: conv.lastMessageText || conv.subject || "Direct encrypted channel",
                url: isCaContext ? "/ca/chat" : "/client/chat",
                badge: conv.unreadCount > 0 ? `${conv.unreadCount} unread` : "Chat",
              }))
            )
            .catch(() => [])
        );

        const chunks = await Promise.all(requests);
        if (!cancelled) {
          setLiveItems(chunks.flat());
        }
      } finally {
        if (!cancelled) {
          setLoadingLive(false);
        }
      }
    };

    loadLiveRecords();
    return () => {
      cancelled = true;
    };
  }, [isOpen, user, isCaContext, role, prefix]);

  const categories = [
    "All",
    "Modules & Pages",
    "Clients",
    "Documents",
    "Tax Returns",
    "Messages",
    "Transactions",
    "Tasks",
  ];

  const allItems = useMemo(() => [...liveItems, ...moduleSearchItems], [liveItems]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesCat = activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        q === "" ||
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [allItems, activeCategory, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory, isOpen]);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredResults.length > 0 ? Math.min(prev + 1, filteredResults.length - 1) : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filteredResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredResults[selectedIndex].url);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredResults, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl text-white relative"
          >
            {/* Top Search Input */}
            <div className="relative flex items-center px-4 py-3.5 border-b border-white/10 bg-[#111111]">
              <Search className="w-5 h-5 text-emerald-400 mr-3 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search live clients, documents, ITR returns, messages, payments, tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
              />
              {loadingLive && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin mr-2 shrink-0" />}
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-white mr-2">
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 px-2 py-0.5 rounded bg-white/5 border border-white/10 hidden sm:inline-block">
                  ESC to close
                </span>
                <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 p-3 px-4 border-b border-white/5 bg-[#0F0F0F] overflow-x-auto text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-emerald-600 text-white font-semibold shadow-[0_0_12px_rgba(5,150,105,0.4)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1 divide-y divide-white/5">
              {filteredResults.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-gray-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-300">
                    No records found{query ? ` for "${query}"` : ""}
                  </p>
                  <p className="text-xs text-gray-500">
                    Try searching for a module name, document title, filing period, or client record
                  </p>
                </div>
              ) : (
                filteredResults.slice(0, 60).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between group ${
                      idx === selectedIndex ? "bg-[#1A1A1A]" : "hover:bg-[#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        {item.category === "Clients" && <Users className="w-4 h-4" />}
                        {item.category === "Documents" && <FileText className="w-4 h-4" />}
                        {item.category === "Tax Returns" && <ShieldCheck className="w-4 h-4" />}
                        {item.category === "Messages" && <MessageSquare className="w-4 h-4" />}
                        {item.category === "Transactions" && <Receipt className="w-4 h-4" />}
                        {item.category === "Tasks" && <CheckSquare className="w-4 h-4" />}
                        {item.category === "Modules & Pages" && <Layers className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                            {item.title}
                          </h4>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-emerald-400 shrink-0 pl-3">
                      <span className="hidden sm:inline font-mono">{item.category}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Keyboard Shortcuts Bar */}
            <div className="px-4 py-2.5 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 text-[10px] bg-white/10 rounded font-mono">↵</kbd> Select
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Live Workspace Search
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
