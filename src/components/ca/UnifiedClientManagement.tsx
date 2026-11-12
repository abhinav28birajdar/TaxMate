"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  CheckCircle2,
  X,
  Video,
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/UnifiedAuthContext";

interface Client {
  id: string;
  name: string;
  rawType: string;
  typeLabel: string;
  pan: string;
  gstin: string;
  status: string;
  assignedCA: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  notes: string;
  kycVerified: boolean;
  portalAccess: boolean;
}

interface ClientDetailsPayload {
  documents: any[];
  tasks: any[];
  invoices: any[];
  returns: any[];
  notes: any[];
}

function mapClientTypeLabel(raw?: string | null): string {
  const clean = String(raw || "individual").toLowerCase();
  if (clean === "company" || clean === "business") return "Business / Corporate";
  if (clean === "llp" || clean === "partnership") return "LLP / Partnership";
  if (clean === "huf" || clean === "trust") return clean.toUpperCase();
  return "Individual / Salaried";
}

export function UnifiedClientManagement() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [clientDetails, setClientDetails] = useState<ClientDetailsPayload>({
    documents: [],
    tasks: [],
    invoices: [],
    returns: [],
    notes: [],
  });
  const [clientDetailTab, setClientDetailTab] = useState<
    "profile" | "docs" | "returns" | "tasks" | "notes"
  >("profile");

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Add client form states
  const [newClientName, setNewClientName] = useState("");
  const [newClientType, setNewClientType] = useState<
    "individual" | "company" | "llp" | "partnership" | "huf" | "trust"
  >("company");
  const [newClientPan, setNewClientPan] = useState("");
  const [newClientGstin, setNewClientGstin] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");

  // Invite form states
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteService, setInviteService] = useState("Annual Retainer & GST Compliance");

  // Editable note state inside drawer
  const [noteDraft, setNoteDraft] = useState("");

  const caDisplayName = user?.name || user?.email?.split("@")[0] || "CA Partner";

  const fetchClients = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clients?take=100");
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to fetch clients");
      }

      const mapped: Client[] = (json.clients || []).map((c: any) => ({
        id: c.id,
        name: c.display_name || c.full_name || c.email || "Client Entity",
        rawType: c.client_type || "individual",
        typeLabel: mapClientTypeLabel(c.client_type),
        pan: c.pan || "N/A",
        gstin: c.gstin || "N/A",
        status: String(c.status || "active").replace(/^./, (m) => m.toUpperCase()),
        assignedCA: caDisplayName,
        email: c.email || "Not provided",
        phone: c.phone || "Not provided",
        city: c.city || "",
        state: c.state || "",
        notes: c.notes || "",
        kycVerified: Boolean(c.kyc_verified),
        portalAccess: Boolean(c.portal_access),
      }));

      setClients(mapped);
    } catch (err: any) {
      console.error("Clients fetch error:", err);
      toast.error(err.message || "Could not load client portfolio.");
    } finally {
      setLoading(false);
    }
  }, [user, caDisplayName]);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, fetchClients]);

  const openClientDetails = async (cli: Client) => {
    setSelectedClient(cli);
    setClientDetailTab("profile");
    setNoteDraft(cli.notes || "");
    setDetailsLoading(true);
    setClientDetails({ documents: [], tasks: [], invoices: [], returns: [], notes: [] });

    try {
      const [detailRes, itrRes] = await Promise.all([
        fetch(`/api/clients/${cli.id}`),
        fetch(`/api/itr?clientId=${cli.id}`),
      ]);
      const detailJson = detailRes.ok ? await detailRes.json().catch(() => ({})) : {};
      const itrJson = itrRes.ok ? await itrRes.json().catch(() => ({})) : {};

      setClientDetails({
        documents: detailJson.documents || [],
        tasks: detailJson.tasks || [],
        invoices: detailJson.invoices || [],
        returns: itrJson.data || itrJson.filings || [],
        notes: detailJson.notes || [],
      });
    } catch (err) {
      console.error("Failed loading client dossier:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) {
      toast.error("Client name and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newClientName.trim(),
          email: newClientEmail.trim(),
          phone: newClientPhone.trim() || undefined,
          clientType: newClientType,
          pan: newClientPan.trim().toUpperCase() || undefined,
          gstin: newClientGstin.trim().toUpperCase() || undefined,
          notes: newClientNotes.trim() || "Newly onboarded client dossier.",
          status: "active",
          portalAccess: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to add client");
      }

      setShowAddClientModal(false);
      setNewClientName("");
      setNewClientPan("");
      setNewClientGstin("");
      setNewClientEmail("");
      setNewClientPhone("");
      setNewClientNotes("");
      toast.success(`Client ${newClientName} saved to your practice portfolio.`);
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Could not create client.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInviteClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      toast.error("Client name and email are required to create a portal invite.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: inviteName.trim(),
          email: inviteEmail.trim(),
          phone: invitePhone.trim() || undefined,
          clientType: "individual",
          notes: `Portal Invite Service Scope: ${inviteService}`,
          status: "prospect",
          portalAccess: true,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to provision client portal access");
      }

      setShowInviteModal(false);
      setInviteName("");
      setInviteEmail("");
      setInvitePhone("");
      toast.success(`Client record and portal access created for ${inviteName.trim()}.`);
      await fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Could not send portal invite.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: noteDraft }),
      });
      if (!res.ok) throw new Error("Failed to save notes");
      setClients((prev) =>
        prev.map((c) => (c.id === selectedClient.id ? { ...c, notes: noteDraft } : c))
      );
      setSelectedClient({ ...selectedClient, notes: noteDraft });
      toast.success("Client advisory notes saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove client");
      setClients((prev) => prev.filter((c) => c.id !== clientId));
      if (selectedClient?.id === clientId) setSelectedClient(null);
      toast.info("Client record removed from portfolio.");
    } catch (err: any) {
      toast.error(err.message || "Could not remove client.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.pan.toLowerCase().includes(q) ||
      c.gstin.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);

    if (filterType === "corporate") {
      return matchesSearch && ["company", "llp", "partnership"].includes(c.rawType);
    }
    if (filterType === "individual") {
      return matchesSearch && ["individual", "huf", "trust"].includes(c.rawType);
    }
    if (filterType === "prospect") {
      return matchesSearch && c.status.toLowerCase() === "prospect";
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> Module 5: Client Management & CRM
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Practice Client Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage client profiles, KYC records, tax returns, communications, and retainers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={fetchClients}
            variant="outline"
            disabled={loading}
            className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#111111] p-3 rounded-2xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by client name, PAN, GSTIN, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Clients" },
            { id: "corporate", label: "Corporate / LLP" },
            { id: "individual", label: "Individual / HUF" },
            { id: "prospect", label: "Prospects" },
          ].map((f) => (
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

      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading client portfolio...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No matching clients found</h3>
            <p className="text-xs text-gray-400">
              {clients.length === 0
                ? "Add your first client or accept a client engagement request to build your practice portfolio."
                : "Adjust your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1A1A1A] text-gray-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Client Name & Contact</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">PAN / GSTIN</th>
                  <th className="py-3.5 px-4">Portal</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((cli) => (
                  <tr key={cli.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <div
                        onClick={() => openClientDetails(cli)}
                        className="font-bold text-white hover:text-emerald-400 cursor-pointer"
                      >
                        {cli.name}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {cli.email} {cli.phone !== "Not provided" ? `• ${cli.phone}` : ""}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300">{cli.typeLabel}</td>
                    <td className="py-4 px-4 font-mono">
                      <div className="text-emerald-400 font-semibold">{cli.pan}</div>
                      <div className="text-[10px] text-gray-500">{cli.gstin}</div>
                    </td>
                    <td className="py-4 px-4">
                      {cli.portalAccess ? (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500">Offline</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {cli.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-1">
                      <Button
                        onClick={() => openClientDetails(cli)}
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs text-gray-300 hover:text-white hover:bg-white/5"
                      >
                        Details
                      </Button>
                      <Link href={`/ca/chat`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/ca/calls`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Video className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

            <div className="flex items-start gap-4 border-b border-white/10 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                {selectedClient.name[0]}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{selectedClient.name}</h3>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {selectedClient.typeLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Assigned CA: <strong className="text-gray-200">{selectedClient.assignedCA}</strong>
                </p>
                <div className="flex gap-4 text-xs text-gray-400 pt-1">
                  <span>
                    PAN: <strong className="text-gray-200 font-mono">{selectedClient.pan}</strong>
                  </span>
                  <span>
                    GSTIN: <strong className="text-gray-200 font-mono">{selectedClient.gstin}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex border-b border-white/10 gap-4 text-xs font-semibold overflow-x-auto">
              {[
                { id: "profile", label: "Profile & KYC" },
                { id: "docs", label: `Documents (${clientDetails.documents.length})` },
                { id: "returns", label: `Tax Returns (${clientDetails.returns.length})` },
                { id: "tasks", label: `Tasks (${clientDetails.tasks.length})` },
                { id: "notes", label: "Notes" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setClientDetailTab(t.id as any)}
                  className={`pb-2.5 whitespace-nowrap transition-colors ${
                    clientDetailTab === t.id
                      ? "text-emerald-400 border-b-2 border-emerald-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {detailsLoading ? (
              <div className="py-10 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading client dossier...
              </div>
            ) : (
              <>
                {clientDetailTab === "profile" && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#181818] border border-white/5">
                      <div>
                        <span className="text-gray-400 block">Primary Email</span>
                        <span className="font-semibold text-white">{selectedClient.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Phone Number</span>
                        <span className="font-semibold text-white">{selectedClient.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Client Portal Access</span>
                        <span className="font-semibold text-emerald-400">
                          {selectedClient.portalAccess ? "Enabled" : "Not Enabled"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">KYC Status</span>
                        <span className="font-semibold text-emerald-400">
                          {selectedClient.kycVerified ? "Verified" : "Pending Verification"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link href="/ca/chat" className="flex-1">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" /> Open Messaging
                        </Button>
                      </Link>
                      <Link href="/ca/calls" className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                        >
                          <Video className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Consultation Call
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={() => handleDeleteClient(selectedClient.id)}
                        disabled={submitting}
                        className="text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )}

                {clientDetailTab === "docs" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Client Document Vault</span>
                      <Link href="/ca/documents">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Open Vault
                        </Button>
                      </Link>
                    </div>
                    {clientDetails.documents.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 bg-[#181818] rounded-xl">
                        No documents uploaded for this client yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clientDetails.documents.map((doc: any) => (
                          <div
                            key={doc.id}
                            className="p-3 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <div>
                                <div className="font-bold text-white">
                                  {doc.file_name || doc.name || "Document"}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {doc.document_type || doc.category || "TAX_DOCUMENT"}
                                </div>
                              </div>
                            </div>
                            <span className="text-emerald-400 text-[10px] font-bold uppercase">
                              {doc.status || "UPLOADED"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {clientDetailTab === "returns" && (
                  <div className="space-y-3 text-xs">
                    {clientDetails.returns.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 bg-[#181818] rounded-xl">
                        No tax returns filed for this client yet.
                      </div>
                    ) : (
                      clientDetails.returns.map((ret: any) => (
                        <div
                          key={ret.id}
                          className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-bold text-white">
                              {ret.filing_type || "ITR"} ({ret.financial_year || "FY 2025-26"})
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Status: {ret.status} • Ack: {ret.acknowledgement_number || "Pending"}
                            </div>
                          </div>
                          <Link href="/ca/income-tax/itr">
                            <Button
                              size="sm"
                              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs rounded-xl"
                            >
                              Open Filing
                            </Button>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {clientDetailTab === "tasks" && (
                  <div className="space-y-3 text-xs">
                    {clientDetails.tasks.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 bg-[#181818] rounded-xl">
                        No compliance tasks assigned yet.
                      </div>
                    ) : (
                      clientDetails.tasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl bg-[#181818] border border-white/5 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-bold text-white">{task.title}</div>
                            <div className="text-[10px] text-gray-400">
                              Priority: {task.priority} • Due:{" "}
                              {task.due_date ? new Date(task.due_date).toLocaleDateString("en-IN") : "Flexible"}
                            </div>
                          </div>
                          <span className="text-amber-400 text-[10px] font-bold uppercase">
                            {task.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {clientDetailTab === "notes" && (
                  <div className="space-y-3 text-xs">
                    <textarea
                      rows={4}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Write persistent advisory notes for this client..."
                      className="w-full bg-[#181818] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={submitting}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                      >
                        {submitting ? "Saving..." : "Save Notes"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
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
                <label className="block mb-1 text-gray-300 font-medium">
                  Client / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Legal or Individual Name"
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
                  <option value="company">Business / Corporate</option>
                  <option value="individual">Individual / Salaried</option>
                  <option value="llp">LLP</option>
                  <option value="partnership">Partnership</option>
                  <option value="huf">HUF</option>
                  <option value="trust">Trust</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">PAN Number</label>
                  <input
                    type="text"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    value={newClientPan}
                    onChange={(e) => setNewClientPan(e.target.value.toUpperCase())}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">GSTIN (Optional)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="15-char GSTIN"
                    value={newClientGstin}
                    onChange={(e) => setNewClientGstin(e.target.value.toUpperCase())}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98XXXXXXXX"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Advisory Notes</label>
                <textarea
                  rows={2}
                  placeholder="Initial filing notes or scope..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddClientModal(false)}
                  className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  {submitting ? "Saving..." : "Save Client"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <Send className="w-4 h-4 text-emerald-400" /> Provision Client Portal Invite
            </h3>
            <p className="text-xs text-gray-400">
              Creates a client account with TaxMate portal access for document upload and review.
            </p>

            <form onSubmit={handleInviteClient} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Client Name *</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full Name or Entity"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Recipient Email *</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="client@company.com"
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Phone (Optional)</label>
                <input
                  type="text"
                  value={invitePhone}
                  onChange={(e) => setInvitePhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Assigned Scope</label>
                <select
                  value={inviteService}
                  onChange={(e) => setInviteService(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Annual Retainer & GST Compliance">Annual Retainer & GST Compliance</option>
                  <option value="Salaried ITR Filing Only">Salaried ITR Filing Only</option>
                  <option value="Ad-hoc Statutory Advisory">Ad-hoc Statutory Advisory</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  {submitting ? "Provisioning..." : "Create & Invite"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
