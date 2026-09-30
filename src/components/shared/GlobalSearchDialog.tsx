"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchItem {
  id: string;
  category: "Clients" | "Documents" | "Tax Returns" | "Messages" | "Transactions" | "Tasks";
  title: string;
  subtitle: string;
  url: string;
  badge?: string;
}

const mockSearchItems: SearchItem[] = [
  // Clients
  { id: "c1", category: "Clients", title: "TechNova Solutions Pvt Ltd", subtitle: "GSTIN: 07AAAAA0000A1Z5 • Pro Audit Client", url: "/ca/clients/c1", badge: "Active CA Client" },
  { id: "c2", category: "Clients", title: "Ananya Deshmukh", subtitle: "PAN: ABCPD1234E • Salaried & Stock Trader", url: "/ca/clients/c2", badge: "ITR-2 Filing" },
  { id: "c3", category: "Clients", title: "Apex Logistics India", subtitle: "TDS Q2 Review • Retainer Engagement", url: "/ca/clients/c3", badge: "Corporate" },

  // Documents
  { id: "d1", category: "Documents", title: "Form 16 Part A & B (AY 2026-27)", subtitle: "PDF • 2.4 MB • Employer: Infosys Ltd", url: "/client/documents", badge: "Form 16" },
  { id: "d2", category: "Documents", title: "HDFC Bank Statement Q2 (180 Pages)", subtitle: "PDF • 4.1 MB • OCR Extracted & Verified", url: "/client/documents", badge: "Bank Statement" },
  { id: "d3", category: "Documents", title: "Form 26AS Tax Credit Statement", subtitle: "Tax Vault • Verified by CA Rajesh Sharma", url: "/client/documents", badge: "Tax Credit" },
  { id: "d4", category: "Documents", title: "LIC & ELSS Investment Receipts Sec 80C", subtitle: "Proof of ₹1,50,000 deduction", url: "/client/documents", badge: "80C Proof" },

  // Tax Returns
  { id: "r1", category: "Tax Returns", title: "ITR-2 Annual Return Filing AY 2026-27", subtitle: "Status: Client Approval Pending • Refund: ₹42,500", url: "/client/tax-returns", badge: "ITR-2 Draft" },
  { id: "r2", category: "Tax Returns", title: "GSTR-3B Monthly Return (September 2026)", subtitle: "Status: Ready for E-Filing • Tax: ₹1,24,000", url: "/ca/gst", badge: "GST Return" },
  { id: "r3", category: "Tax Returns", title: "TDS Form 26Q Quarter 2 Filing", subtitle: "Challan 281 Attached • Due 31 Oct", url: "/ca/income-tax", badge: "TDS Filing" },

  // Messages
  { id: "m1", category: "Messages", title: "CA Rajesh Sharma", subtitle: "Please verify your foreign dividend withholding tax in draft ITR.", url: "/client/chat", badge: "Unread Msg" },
  { id: "m2", category: "Messages", title: "TechNova Q2 Tax Audit Team", subtitle: "Shared revised depreciation schedule for factory machinery.", url: "/ca/chat", badge: "Team Chat" },

  // Transactions
  { id: "t1", category: "Transactions", title: "CA Retainer & GST Advisory Fee (₹1,50,000)", subtitle: "Invoice #INV-2026-0042 • Razorpay UPI Paid", url: "/client/payments", badge: "Settled" },
  { id: "t2", category: "Transactions", title: "ITR Filing & Capital Gains Package (₹4,999)", subtitle: "Invoice #INV-2026-0019 • Paid via NetBanking", url: "/client/payments", badge: "Paid" },

  // Tasks
  { id: "k1", category: "Tasks", title: "Reconcile GSTR-2B Input Tax Credit with Purchase Register", subtitle: "Assigned to Senior CA • Due: 20 Oct", url: "/ca/tasks/kanban", badge: "In Progress" },
  { id: "k2", category: "Tasks", title: "Verify Sec 115BAC New Regime vs Old Regime Savings", subtitle: "Client Approval Required before Submission", url: "/ca/tasks/kanban", badge: "Review" },
];

export function GlobalSearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const categories = ["All", "Clients", "Documents", "Tax Returns", "Messages", "Transactions", "Tasks"];

  const filteredResults = mockSearchItems.filter((item) => {
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    const matchesQuery =
      query.trim() === "" ||
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

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
                placeholder="Search clients, documents, ITR returns, messages, payments, tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none"
              />
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
                  <p className="text-sm font-medium text-gray-300">No records found for &quot;{query}&quot;</p>
                  <p className="text-xs text-gray-500">Try searching for &quot;Form 16&quot;, &quot;TechNova&quot;, &quot;ITR-2&quot;, or &quot;GSTR&quot;</p>
                </div>
              ) : (
                filteredResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className="p-3 rounded-xl hover:bg-[#1A1A1A] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        {item.category === "Clients" && <Users className="w-4 h-4" />}
                        {item.category === "Documents" && <FileText className="w-4 h-4" />}
                        {item.category === "Tax Returns" && <ShieldCheck className="w-4 h-4" />}
                        {item.category === "Messages" && <MessageSquare className="w-4 h-4" />}
                        {item.category === "Transactions" && <Receipt className="w-4 h-4" />}
                        {item.category === "Tasks" && <CheckSquare className="w-4 h-4" />}
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
                <Sparkles className="w-3.5 h-3.5" /> Fast Unified Search
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
