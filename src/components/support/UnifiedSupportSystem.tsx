"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  HelpCircle, 
  Search, 
  MessageSquare, 
  FileText, 
  LifeBuoy, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  ArrowRight,
  UserX,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Ticket {
  id: string;
  subject: string;
  category: "Billing" | "ITR Filing Error" | "CA Consultation" | "KYC / Account";
  status: "Open" | "In Review" | "Resolved";
  date: string;
  priority: "High" | "Normal" | "Low";
  lastReply: string;
}

export function UnifiedSupportSystem() {
  const [activeTab, setActiveTab] = useState<"help" | "ticket" | "my-tickets" | "live-chat" | "report">("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Ticket Form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState<"Billing" | "ITR Filing Error" | "CA Consultation" | "KYC / Account">("ITR Filing Error");
  const [ticketPriority, setTicketPriority] = useState<"High" | "Normal" | "Low">("High");
  const [ticketDesc, setTicketDesc] = useState("");

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TICK-8812",
      subject: "Error syncing Form 26AS AIS for AY 2026-27",
      category: "ITR Filing Error",
      status: "In Review",
      date: "Today, 10:15 AM",
      priority: "High",
      lastReply: "Support Eng. Neha: Investigating CBDT gateway response schema."
    },
    {
      id: "TICK-8790",
      subject: "GST Input Tax Credit missing on invoice INV-9012",
      category: "Billing",
      status: "Resolved",
      date: "18 Sep 2026",
      priority: "Normal",
      lastReply: "Billing Desk: Revised invoice with B2B GSTIN dispatched."
    }
  ]);

  // Live chat messages simulation
  const [chatMessages, setChatMessages] = useState<{ sender: "bot" | "user"; text: string; time: string }[]>([
    { sender: "bot", text: "Namaste! Welcome to TaxMate 24/7 Priority Support. How can we assist your CA practice or tax return today?", time: "11:00 AM" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: "user" as const, text: chatInput, time: "Just now" };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: "bot", text: "Thank you for reaching out. A Senior Technical Compliance Specialist has joined the room and will respond in ~60 seconds.", time: "Just now" }
      ]);
    }, 1000);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;
    const newT: Ticket = {
      id: `TICK-${Math.floor(8900 + Math.random() * 900)}`,
      subject: ticketSubject,
      category: ticketCategory,
      status: "Open",
      date: "Just now",
      priority: ticketPriority,
      lastReply: "Assigned to Support Tier 2 queue."
    };
    setTickets([newT, ...tickets]);
    setTicketSubject("");
    setTicketDesc("");
    setActiveTab("my-tickets");
    toast.success("Support ticket created! SLA turnaround is < 2 hours.");
  };

  const faqs = [
    {
      q: "How does TaxMate integrate with the Income Tax Department (ITD) e-Filing 2.0 portal?",
      a: "TaxMate connects directly with the CBDT and GSTN APIs via licensed Application Service Providers (ASPs). CAs can bulk upload JSON payloads, verify pre-filled XMLs, and auto-fetch Form 26AS / AIS without manual portal logins."
    },
    {
      q: "Is client tax and financial data confidential and encrypted?",
      a: "Yes. All documents (Form 16s, bank statements, ledger exports) are encrypted at rest with AES-256 and in transit via TLS 1.3. Each CA practice and client retains dedicated cryptographic keys adhering to Section 138 of the Income-tax Act, 1961."
    },
    {
      q: "Can clients and CAs share screens during video consultations?",
      a: "Yes! The integrated Video Consultation Room (Module 9) allows synchronized dual-pane viewing of computation sheets, Section 115BAC regime comparisons, and instant in-call annotations."
    },
    {
      q: "What payment modes are supported for CA retainer fees?",
      a: "TaxMate supports Instant UPI (Google Pay, PhonePe, Paytm), Visa/Mastercard credit and debit cards, and NetBanking across all major Indian scheduled banks via Razorpay with automated GST tax invoice generation (SAC 998231)."
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" /> Module 19: Support & Help Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Help Center, FAQs & Live Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Get instant assistance for tax filing issues, CBDT gateway sync, billing inquiries, or speak with an agent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setActiveTab("ticket")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Support Ticket
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {[
          { id: "help", label: "Help Center & FAQs", icon: HelpCircle },
          { id: "ticket", label: "Submit Ticket", icon: Plus },
          { id: "my-tickets", label: `My Tickets (${tickets.length})`, icon: FileText },
          { id: "live-chat", label: "Live Support Chat", icon: MessageSquare },
          { id: "report", label: "Report Incident / User", icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-2.5 rounded-t-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? "bg-[#111111] text-emerald-400 border-t-2 border-emerald-500 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Help Center & FAQs */}
      {activeTab === "help" && (
        <div className="space-y-6">
          {/* Search box */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">How can our compliance team assist you?</h2>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search ITR guides, GST errors, refund timelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick Category Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/30 transition-all">
              <FileText className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-white">ITR & GST Filing Guides</h4>
              <p className="text-xs text-gray-400 mt-1">Step-by-step documentation for filing ITR-1 to ITR-6 and GST returns.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/30 transition-all">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-white">KYC & Digital Signatures</h4>
              <p className="text-xs text-gray-400 mt-1">Class-3 DSC USB token setup, PAN-Aadhaar linking verification.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/30 transition-all">
              <MessageSquare className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-white">CA Consultations & Escrow</h4>
              <p className="text-xs text-gray-400 mt-1">Retainer terms, refund timelines, and screen-sharing consultation protocols.</p>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div 
                  key={i} 
                  className="rounded-xl border border-white/5 bg-[#161616] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-emerald-400"
                  >
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 shrink-0 text-emerald-400" /> : <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Submit Ticket */}
      {activeTab === "ticket" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-5 shadow-2xl">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">Create New Support Ticket</h3>
            <p className="text-xs text-gray-400 mt-0.5">Tickets are routed to ICAI-certified compliance specialists and software engineers.</p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Issue Subject *</label>
              <input 
                type="text" 
                required
                placeholder="e.g. AIS TDS Mismatch on AY 2026-27 computation"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Category</label>
                <select 
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ITR Filing Error">ITR Filing Error</option>
                  <option value="Billing">Billing & GST Invoices</option>
                  <option value="CA Consultation">CA Consultation Dispute</option>
                  <option value="KYC / Account">KYC / NSDL Account Sync</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Priority</label>
                <select 
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="High">High (Impacting deadline)</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low / General Inquiry</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Detailed Description *</label>
              <textarea 
                rows={4}
                required
                placeholder="Please describe the steps to reproduce or transaction reference..."
                value={ticketDesc}
                onChange={(e) => setTicketDesc(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("help")} className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
                Submit Support Ticket
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: My Tickets */}
      {activeTab === "my-tickets" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-base font-semibold text-white">Your Support History</h3>
            <span className="text-xs text-gray-400 font-mono">{tickets.length} total tickets</span>
          </div>

          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold">{t.id}</span>
                    <span className="font-semibold text-white">{t.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      t.status === "Open" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" :
                      t.status === "In Review" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" :
                      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-gray-400 text-[10px]">{t.date}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111111] text-gray-400 text-[11px]">
                  {t.lastReply}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Live Support Chat */}
      {activeTab === "live-chat" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl flex flex-col h-[520px]">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                TM
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">TaxMate Priority Live Desk</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Support Online
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">End-to-End Encrypted</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-2xl max-w-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-[#181818] border border-white/10 text-gray-200 rounded-tl-none"
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Ask about filing, invoices, or CA assignment..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-4">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {/* Tab 5: Report Incident / User */}
      {activeTab === "report" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-4 shadow-2xl text-xs">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Report Compliance or Conduct Incident
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Confidential report submitted directly to the TaxMate Ethics & Compliance Committee.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Incident Type</label>
              <select className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500">
                <option>Professional Misconduct / Delay</option>
                <option>Unauthorized Data Sharing</option>
                <option>Payment Overcharging / Extortion</option>
                <option>Bug / Data Exposure Incident</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Details & Evidence</label>
              <textarea 
                rows={4}
                placeholder="Include client names, dates, or relevant transaction IDs..."
                className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <Button 
              onClick={() => {
                toast.success("Incident dossier submitted. Reference #INC-9912 generated.");
                setActiveTab("help");
              }}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl"
            >
              Submit Confidential Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
