"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Plus, 
  UserCheck, 
  ShieldCheck, 
  Mail, 
  Phone, 
  MoreVertical, 
  Filter, 
  Building, 
  FileText, 
  CheckCircle2, 
  Clock, 
  X, 
  Video, 
  MessageSquare, 
  Receipt, 
  ExternalLink,
  Send,
  Calendar,
  IndianRupee,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Client {
  id: string;
  name: string;
  type: "Business / Corporate" | "Individual / Salaried" | "LLP / Partnership";
  pan: string;
  gstin: string;
  turnover: string;
  status: "Active" | "Pending KYC" | "Archived";
  assignedCA: string;
  email: string;
  phone: string;
  pendingDocsCount: number;
  returnsCount: number;
  retainerFee: string;
  notes: string;
}

export function UnifiedClientManagement() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [clientDetailTab, setClientDetailTab] = useState<"profile" | "docs" | "returns" | "tasks" | "notes">("profile");

  const [clients, setClients] = useState<Client[]>([
    { 
      id: "cli_1", 
      name: "TechNova Solutions Pvt Ltd", 
      type: "Business / Corporate", 
      pan: "AAACT1234F", 
      gstin: "27AAACT1234F1Z5", 
      turnover: "₹1.50 Cr", 
      status: "Active", 
      assignedCA: "CA Rajesh Sharma, FCA",
      email: "finance@technovasolutions.in",
      phone: "+91 98210 98210",
      pendingDocsCount: 1,
      returnsCount: 4,
      retainerFee: "₹1,50,000/yr",
      notes: "Annual statutory audit underway. Form 3CD schedules verified."
    },
    { 
      id: "cli_2", 
      name: "Ananya Deshmukh", 
      type: "Individual / Salaried", 
      pan: "BKPD19876K", 
      gstin: "N/A", 
      turnover: "₹24.50 L", 
      status: "Active", 
      assignedCA: "CA Rajesh Sharma, FCA",
      email: "ananya.d@gmail.com",
      phone: "+91 98111 22334",
      pendingDocsCount: 0,
      returnsCount: 2,
      retainerFee: "₹4,999/yr",
      notes: "Sec 115BAC choice confirmed. Foreign stock RSUs declared."
    },
    { 
      id: "cli_3", 
      name: "Apex Logistics India LLP", 
      type: "LLP / Partnership", 
      pan: "BBBCA5678G", 
      gstin: "27BBBCA5678G2Z1", 
      turnover: "₹4.20 Cr", 
      status: "Active", 
      assignedCA: "CA Priya Mehta",
      email: "accounts@apexlogistics.in",
      phone: "+91 98765 43210",
      pendingDocsCount: 3,
      returnsCount: 5,
      retainerFee: "₹85,000/yr",
      notes: "Waiting on diesel expense ledger reconciliation."
    },
    { 
      id: "cli_4", 
      name: "Dr. Vikramaditya Rao", 
      type: "Individual / Salaried", 
      pan: "CHIPR4321M", 
      gstin: "N/A", 
      turnover: "₹45.00 L", 
      status: "Active", 
      assignedCA: "CA Rajesh Sharma, FCA",
      email: "dr.rao@apollo.org",
      phone: "+91 99220 11223",
      pendingDocsCount: 0,
      returnsCount: 3,
      retainerFee: "₹15,000/yr",
      notes: "Sec 44ADA presumptive taxation consultation scheduled."
    },
  ]);

  // Form states
  const [newClientName, setNewClientName] = useState("");
  const [newClientType, setNewClientType] = useState<"Business / Corporate" | "Individual / Salaried" | "LLP / Partnership">("Business / Corporate");
  const [newClientPan, setNewClientPan] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientPan) return;
    const newCli: Client = {
      id: `cli_${Date.now()}`,
      name: newClientName,
      type: newClientType,
      pan: newClientPan.toUpperCase(),
      gstin: newClientType.includes("Business") ? "27" + newClientPan.toUpperCase() + "1Z5" : "N/A",
      turnover: "₹0.00",
      status: "Active",
      assignedCA: "CA Rajesh Sharma, FCA",
      email: newClientEmail,
      phone: newClientPhone,
      pendingDocsCount: 1,
      returnsCount: 0,
      retainerFee: "₹15,000/yr",
      notes: "Newly onboarded client dossier.",
    };
    setClients([newCli, ...clients]);
    setShowAddClientModal(false);
    setNewClientName("");
    setNewClientPan("");
    toast.success(`Client ${newCli.name} added to practice portfolio!`);
  };

  const filtered = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.pan.toLowerCase().includes(search.toLowerCase()) ||
                          c.gstin.toLowerCase().includes(search.toLowerCase());
    if (filterType === "all") return matchesSearch;
    if (filterType === "corporate") return matchesSearch && c.type.includes("Business");
    if (filterType === "individual") return matchesSearch && c.type.includes("Individual");
    if (filterType === "pending_docs") return matchesSearch && c.pendingDocsCount > 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Module 5: Client Management & CRM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Practice Client Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage client profiles, KYC documents, tax returns, communications, and retainer fees.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            onClick={() => setShowInviteModal(true)} 
            variant="outline" 
            className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" /> Invite Client
          </Button>
          <Button 
            onClick={() => setShowAddClientModal(true)} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add New Client
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client name, PAN, GSTIN, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Clients" },
            { id: "corporate", label: "Corporate" },
            { id: "individual", label: "Individual" },
            { id: "pending_docs", label: "Pending Docs" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterType === f.id
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "text-gray-400 hover:text-white bg-[#181818] border border-white/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1A] text-gray-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Client Name & Details</th>
                <th className="py-3.5 px-4">Entity Type</th>
                <th className="py-3.5 px-4">PAN / GSTIN</th>
                <th className="py-3.5 px-4">Turnover</th>
                <th className="py-3.5 px-4">Pending Docs</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((cli) => (
                <tr key={cli.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 px-4">
                    <div 
                      onClick={() => setSelectedClient(cli)}
                      className="font-bold text-white hover:text-emerald-400 cursor-pointer flex items-center gap-1.5"
                    >
                      {cli.name}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{cli.email} • {cli.phone}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-300">
                    {cli.type}
                  </td>
                  <td className="py-4 px-4 font-mono">
                    <div className="text-emerald-400 font-semibold">{cli.pan}</div>
                    <div className="text-[10px] text-gray-500">{cli.gstin}</div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-white">
                    {cli.turnover}
                  </td>
                  <td className="py-4 px-4">
                    {cli.pendingDocsCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {cli.pendingDocsCount} Pending
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {cli.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right space-x-1.5">
                    <Button 
                      onClick={() => setSelectedClient(cli)}
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                    >
                      Details
                    </Button>
                    <Link href="/ca/chat">
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-400 hover:bg-emerald-500/10">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href="/ca/calls">
                      <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-400 hover:bg-emerald-500/10">
                        <Video className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Details Drawer / Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141414] border border-white/10 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            <button 
              onClick={() => setSelectedClient(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Client Header Info */}
            <div className="flex items-start gap-4 border-b border-white/10 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                {selectedClient.name[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedClient.name}</h3>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {selectedClient.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Assigned CA: <strong className="text-gray-200">{selectedClient.assignedCA}</strong> • Retainer: <strong className="text-emerald-400 font-mono">{selectedClient.retainerFee}</strong>
                </p>
                <div className="flex gap-4 text-xs text-gray-400 pt-1">
                  <span>PAN: <strong className="text-gray-200 font-mono">{selectedClient.pan}</strong></span>
                  <span>GSTIN: <strong className="text-gray-200 font-mono">{selectedClient.gstin}</strong></span>
                </div>
              </div>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-white/10 gap-4 text-xs font-semibold">
              {[
                { id: "profile", label: "Profile & KYC" },
                { id: "docs", label: `Documents (${selectedClient.pendingDocsCount} Pending)` },
                { id: "returns", label: `Tax Returns (${selectedClient.returnsCount})` },
                { id: "tasks", label: "Workflow Tasks" },
                { id: "notes", label: "Notes & Timeline" },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setClientDetailTab(t.id as any)}
                  className={`pb-2.5 transition-colors ${
                    clientDetailTab === t.id 
                      ? "text-emerald-400 border-b-2 border-emerald-500" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Profile & KYC */}
            {clientDetailTab === "profile" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#181818] border border-white/5">
                  <div>
                    <span className="text-gray-400 block">Primary Email</span>
                    <span className="font-semibold text-white">{selectedClient.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Phone Number</span>
                    <span className="font-semibold text-white">{selectedClient.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Reported Annual Turnover</span>
                    <span className="font-semibold text-emerald-400 font-mono">{selectedClient.turnover}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">ITD E-filing Portal Status</span>
                    <span className="font-semibold text-emerald-400">Pre-validated & Linked</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href="/ca/chat" className="flex-1">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Open Messaging
                    </Button>
                  </Link>
                  <Link href="/ca/calls" className="flex-1">
                    <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                      <Video className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Start Consultation Call
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 2: Documents */}
            {clientDetailTab === "docs" && (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Client Document Repository</span>
                  <Link href="/ca/documents">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                      <Plus className="w-3 h-3 mr-1" /> Request New Document
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">Form 16 Part A & B (AY 2026-27).pdf</div>
                      <div className="text-[10px] text-gray-500">OCR parsed with 99.4% confidence</div>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-bold">VERIFIED</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">HDFC Bank Q2 Current A/C Statement.pdf</div>
                      <div className="text-[10px] text-gray-500">Uploaded 12 mins ago</div>
                    </div>
                    <span className="text-emerald-400 text-[10px] font-bold">RECEIVED</span>
                  </div>
                  {selectedClient.pendingDocsCount > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex justify-between items-center text-amber-300">
                      <div>
                        <div className="font-bold">Quarterly Capital Gains P&L (Zerodha)</div>
                        <div className="text-[10px] text-amber-400/80">Reminder sent via WhatsApp</div>
                      </div>
                      <span className="text-amber-400 text-[10px] font-bold">REQUESTED</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Tax Returns */}
            {clientDetailTab === "returns" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">ITR-6 Corporate Assessment (AY 2026-27)</div>
                    <div className="text-[10px] text-gray-400">Gross Income ₹1,50,00,000 • Tax Payable ₹37,50,000</div>
                  </div>
                  <Link href="/ca/income-tax">
                    <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs rounded-xl">
                      Open Work
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Tab 4: Tasks */}
            {clientDetailTab === "tasks" && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Perform GSTR-2B Input Tax Credit Reconciliation</div>
                    <div className="text-[10px] text-gray-400">Due 18 Oct 2026 • Priority: High</div>
                  </div>
                  <span className="text-amber-400 text-[10px] font-bold uppercase">In Progress</span>
                </div>
              </div>
            )}

            {/* Tab 5: Notes & Timeline */}
            {clientDetailTab === "notes" && (
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#181818] border border-white/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">Client Advisory Note</span>
                    <span className="text-[10px] text-gray-500">Yesterday by CA Rajesh</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic">
                    &ldquo;{selectedClient.notes}&rdquo;
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <Button 
                onClick={() => setSelectedClient(null)} 
                variant="outline" 
                className="border-white/10 text-xs text-gray-300 rounded-xl"
              >
                Close Drawer
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl relative">
            <button 
              onClick={() => setShowAddClientModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Add New Practice Client
            </h3>
            <form onSubmit={handleAddClient} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Client / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Reliance Retail / John Doe"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Entity Type</label>
                <select
                  value={newClientType}
                  onChange={(e) => setNewClientType(e.target.value as any)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Business / Corporate">Business / Corporate (ITR-6)</option>
                  <option value="Individual / Salaried">Individual / Salaried (ITR-1/2)</option>
                  <option value="LLP / Partnership">LLP / Partnership (ITR-5)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">PAN Number *</label>
                <input
                  type="text"
                  required
                  placeholder="ABCDE1234F"
                  value={newClientPan}
                  onChange={(e) => setNewClientPan(e.target.value.toUpperCase())}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98210..."
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddClientModal(false)} className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl">
                  Save Client
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Client Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl relative">
            <button 
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" /> Send Client Portal Invite
            </h3>
            <p className="text-xs text-gray-400">
              An onboarding link will be sent with automated KYC instructions and secure document upload vault access.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Recipient Email / WhatsApp</label>
                <input
                  type="text"
                  placeholder="client@company.com or +91 9821..."
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Assigned Services</label>
                <select className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500">
                  <option>Annual Retainer & GST Compliance</option>
                  <option>Salaried ITR-2 Filing Only</option>
                  <option>Ad-hoc Statutory Advisory</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)} className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  toast.success("Portal invitation link sent via SMS and Email!");
                  setShowInviteModal(false);
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
