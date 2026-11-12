"use client";

import React, { useEffect, useState } from "react";
import {
  HelpCircle,
  Search,
  MessageSquare,
  FileText,
  LifeBuoy,
  Plus,
  AlertTriangle,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/UnifiedAuthContext";

interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  priority: string;
  description: string;
  admin_response?: string | null;
  resolution?: string | null;
}

const PRIORITY_MAP: Record<"High" | "Normal" | "Low", "high" | "medium" | "low"> = {
  High: "high",
  Normal: "medium",
  Low: "low",
};

export function UnifiedSupportSystem() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"help" | "ticket" | "my-tickets" | "live-chat" | "report">("help");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Ticket Form
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("ITR Filing Error");
  const [ticketPriority, setTicketPriority] = useState<"High" | "Normal" | "Low">("High");
  const [ticketDesc, setTicketDesc] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Incident Form
  const [incidentType, setIncidentType] = useState("Professional Misconduct / Delay");
  const [incidentDetails, setIncidentDetails] = useState("");
  const [submittingIncident, setSubmittingIncident] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Live Support AI / Concierge Chat backed by /api/ai/chat
  const [chatMessages, setChatMessages] = useState<{ sender: "bot" | "user"; text: string; time: string }[]>([
    {
      sender: "bot",
      text: "Namaste! Welcome to TaxMate Priority Support Desk. Ask about GST/ITR deadlines, invoices, or your active filings.",
      time: "Ready",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const fetchTickets = async () => {
    if (!user) return;
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/v1/support-tickets");
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setTickets(json.data?.tickets || json.tickets || []);
      }
    } catch (err) {
      console.error("Failed to fetch support tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || sendingChat) return;

    const nowLabel = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const historyPayload = chatMessages.slice(-8).map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    setChatMessages((prev) => [...prev, { sender: "user", text: trimmed, time: nowLabel }]);
    setChatInput("");
    setSendingChat(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Support assistant unavailable");
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: json.reply || "Our compliance team has logged your question.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: any) {
      toast.error(err.message || "Failed to reach support assistant. Try submitting a ticket.");
    } finally {
      setSendingChat(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketSubject.trim().length < 5 || ticketDesc.trim().length < 10) {
      toast.error("Please enter at least 5 characters for subject and 10 characters for description.");
      return;
    }

    setSubmittingTicket(true);
    try {
      const res = await fetch("/api/v1/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject.trim(),
          body: ticketDesc.trim(),
          category: ticketCategory,
          priority: PRIORITY_MAP[ticketPriority],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to submit support ticket");
      }

      const created: Ticket = json.data?.ticket || json.ticket;
      if (created) {
        setTickets((prev) => [created, ...prev]);
      } else {
        await fetchTickets();
      }

      setTicketSubject("");
      setTicketDesc("");
      setActiveTab("my-tickets");
      toast.success("Support ticket persisted! Our desk will respond shortly.");
    } catch (err: any) {
      toast.error(err.message || "Could not create ticket");
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSubmitIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (incidentDetails.trim().length < 10) {
      toast.error("Please describe the incident with at least 10 characters.");
      return;
    }

    setSubmittingIncident(true);
    try {
      const res = await fetch("/api/v1/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `Incident Report: ${incidentType}`.slice(0, 120),
          body: incidentDetails.trim(),
          category: "incident-report",
          priority: "high",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to submit incident dossier");
      }

      const created: Ticket = json.data?.ticket || json.ticket;
      if (created) {
        setTickets((prev) => [created, ...prev]);
      }
      setIncidentDetails("");
      setActiveTab("my-tickets");
      toast.success(`Confidential incident logged (${created?.ticket_number || "saved"}).`);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit incident report");
    } finally {
      setSubmittingIncident(false);
    }
  };

  const faqs = [
    {
      q: "How does TaxMate connect taxpayers with Chartered Accountants?",
      a: "Taxpayers can browse ICAI-verified practitioners in Find CAs, submit service requests, share documents securely through AES-encrypted Vault links, and collaborate on ITR, GST, and TDS filings.",
    },
    {
      q: "Is client tax and financial data confidential and encrypted?",
      a: "Yes. Documents uploaded to TaxMate Storage use private buckets with short-lived signed URLs, role-based access enforcement, and strict ownership isolation across client and CA workspaces.",
    },
    {
      q: "Can clients and CAs review computations during video consultations?",
      a: "Yes! The Consultation Room pairs WebRTC video/audio/screen sharing with synchronized viewing of shared tax return documents and live call history.",
    },
    {
      q: "What payment modes are supported for CA retainer fees?",
      a: "TaxMate supports UPI, Debit/Credit cards, and NetBanking through Razorpay orders with HMAC-SHA256 server signature verification and downloadable GST Tax Invoices (SAC 998231).",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      !searchQuery.trim() ||
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy className="w-4 h-4" /> Support & Help Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Help Center, FAQs & Support Desk
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Get instant assistance for tax filing issues, billing inquiries, or submit verified support tickets.
          </p>
        </div>

        <Button
          onClick={() => setActiveTab("ticket")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Create Support Ticket
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {[
          { id: "help", label: "Help Center & FAQs", icon: HelpCircle },
          { id: "ticket", label: "Submit Ticket", icon: Plus },
          { id: "my-tickets", label: `My Tickets (${tickets.length})`, icon: FileText },
          { id: "live-chat", label: "Compliance Assistant", icon: MessageSquare },
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

      {activeTab === "help" && (
        <div className="space-y-6">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 text-center space-y-4">
            <h2 className="text-xl font-bold text-white">How can our compliance team assist you?</h2>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search ITR guides, encryption, consultations, billing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setSearchQuery("ITR")}
              className="text-left p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/30 transition-all"
            >
              <FileText className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-white">ITR & GST Filing Guides</h4>
              <p className="text-xs text-gray-400 mt-1">Filter guides for filing ITR-1 to ITR-4 and GST returns.</p>
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery("encrypted")}
              className="text-left p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/30 transition-all"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-white">Security & Data Privacy</h4>
              <p className="text-xs text-gray-400 mt-1">Storage encryption, signed links & role-based controls.</p>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("live-chat")}
              className="text-left p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/30 transition-all"
            >
              <MessageSquare className="w-6 h-6 text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-white">Ask Compliance Assistant</h4>
              <p className="text-xs text-gray-400 mt-1">Check upcoming filing deadlines & tax guidance live.</p>
            </button>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {filteredFaqs.length === 0 ? (
                <p className="text-xs text-gray-400">No FAQs match &ldquo;{searchQuery}&rdquo;. Try creating a ticket or asking the assistant.</p>
              ) : (
                filteredFaqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border border-white/5 bg-[#161616] overflow-hidden transition-all">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-white hover:text-emerald-400"
                    >
                      <span>{faq.q}</span>
                      {openFaq === i ? (
                        <ChevronUp className="w-4 h-4 shrink-0 text-emerald-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 text-xs text-gray-300 leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ticket" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-5 shadow-2xl">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-lg font-bold text-white">Create New Support Ticket</h3>
            <p className="text-xs text-gray-400 mt-0.5">Tickets are persisted and routed to TaxMate compliance engineers.</p>
          </div>

          <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Issue Subject *</label>
              <input
                type="text"
                required
                minLength={5}
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
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ITR Filing Error">ITR Filing Error</option>
                  <option value="Billing">Billing & GST Invoices</option>
                  <option value="CA Consultation">CA Consultation Dispute</option>
                  <option value="KYC / Account">KYC / Account Sync</option>
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
                minLength={10}
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
              <Button
                type="submit"
                disabled={submittingTicket}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
              >
                {submittingTicket ? "Submitting..." : "Submit Support Ticket"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "my-tickets" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-base font-semibold text-white">Your Support History</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono">{tickets.length} total tickets</span>
              <Button size="sm" variant="ghost" onClick={fetchTickets} className="text-xs text-gray-400 hover:text-white h-7 px-2">
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {loadingTickets ? (
            <div className="py-8 flex justify-center text-xs text-gray-400 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading your tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <p className="text-xs text-gray-400">You have not created any support tickets yet.</p>
              <Button size="sm" onClick={() => setActiveTab("ticket")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                Submit Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">{t.ticket_number || t.id.slice(0, 8)}</span>
                      <span className="font-semibold text-white">{t.subject}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        t.status === "open"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : t.status === "in_progress"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      }`}>
                        {t.status.replace("_", " ")}
                      </span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-[11px]">{t.description}</p>
                  {(t.admin_response || t.resolution) && (
                    <div className="p-2.5 rounded-lg bg-[#111111] border border-emerald-500/20 text-emerald-300 text-[11px]">
                      <strong>Staff Response:</strong> {t.admin_response || t.resolution}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "live-chat" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 max-w-2xl mx-auto shadow-2xl flex flex-col h-[520px]">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                TM
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">TaxMate Compliance Assistant</h4>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected to Live Workspace Data
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">AI + Workspace Snapshot</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs scrollbar-thin">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-2xl max-w-md leading-relaxed whitespace-pre-wrap ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white rounded-tr-none"
                    : "bg-[#181818] border border-white/10 text-gray-200 rounded-tl-none"
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">{msg.time}</span>
                </div>
              </div>
            ))}
            {sendingChat && (
              <div className="text-xs text-emerald-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking compliance context...
              </div>
            )}
          </div>

          <form onSubmit={handleSendChatMessage} className="pt-3 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Ask about filing deadlines, GST ITC, ITR regimes, or billing..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#181818] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <Button type="submit" disabled={sendingChat || !chatInput.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl px-4">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}

      {activeTab === "report" && (
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-4 shadow-2xl text-xs">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Report Compliance or Conduct Incident
            </h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Confidential report saved directly to the TaxMate Ethics & Compliance queue.
            </p>
          </div>

          <form onSubmit={handleSubmitIncident} className="space-y-3">
            <div>
              <label className="block text-gray-300 font-medium mb-1">Incident Type</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Professional Misconduct / Delay">Professional Misconduct / Delay</option>
                <option value="Unauthorized Data Sharing">Unauthorized Data Sharing</option>
                <option value="Payment Overcharging / Dispute">Payment Overcharging / Dispute</option>
                <option value="Bug / Data Exposure Incident">Bug / Security Vulnerability</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-1">Details & Evidence *</label>
              <textarea
                rows={4}
                required
                minLength={10}
                value={incidentDetails}
                onChange={(e) => setIncidentDetails(e.target.value)}
                placeholder="Include relevant dates, case IDs, or transaction references..."
                className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingIncident}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl"
            >
              {submittingIncident ? "Submitting..." : "Submit Confidential Report"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
