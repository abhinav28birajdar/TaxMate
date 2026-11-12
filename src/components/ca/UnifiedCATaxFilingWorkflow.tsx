"use client";

import React, { useEffect, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  FileText,
  Download,
  X,
  ArrowRight,
  Send,
  RefreshCw,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/UnifiedAuthContext";

interface TaxCase {
  id: string;
  clientId: string;
  clientName: string;
  pan: string;
  formType: string;
  ay: string;
  status: string;
  grossIncome: number;
  taxPayable: number;
  tdsCredits: number;
  refundOrBalance: number;
  documents: { name: string; status: "Received" | "Requested" | "Missing" }[];
  ackNumber?: string;
  filingDate?: string;
}

interface ClientOption {
  id: string;
  full_name: string;
  pan?: string;
}

function downloadItrVReceipt(taxCase: TaxCase) {
  const receiptHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>ITR-V Receipt - ${taxCase.clientName}</title>
<style>body{font-family:monospace;padding:32px;color:#111}h2{border-bottom:2px solid #000;padding-bottom:8px}.row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #ddd}</style>
</head>
<body>
<h2>Government of India • Income Tax Filing Acknowledgement [ITR-V]</h2>
<div class="row"><span>Client / Assessee</span><strong>${taxCase.clientName}</strong></div>
<div class="row"><span>PAN</span><strong>${taxCase.pan || "N/A"}</strong></div>
<div class="row"><span>Assessment Year</span><strong>${taxCase.ay}</strong></div>
<div class="row"><span>Form</span><strong>${taxCase.formType}</strong></div>
<div class="row"><span>Acknowledgement No</span><strong>${taxCase.ackNumber || "Pending"}</strong></div>
<div class="row"><span>Filing Date</span><strong>${taxCase.filingDate || new Date().toISOString().split("T")[0]}</strong></div>
<div class="row"><span>Gross Total Income</span><strong>₹${taxCase.grossIncome.toLocaleString("en-IN")}</strong></div>
<div class="row"><span>Total Tax Liability</span><strong>₹${taxCase.taxPayable.toLocaleString("en-IN")}</strong></div>
<div class="row"><span>Pre-Paid Taxes / TDS</span><strong>₹${taxCase.tdsCredits.toLocaleString("en-IN")}</strong></div>
</body></html>`;

  const blob = new Blob([receiptHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ITR-V_${(taxCase.pan || taxCase.clientName).replace(/\s+/g, "_")}_${taxCase.ay.replace(/\s+/g, "")}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function UnifiedCATaxFilingWorkflow() {
  const { user } = useAuth();
  const [cases, setCases] = useState<TaxCase[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedCase, setSelectedCase] = useState<TaxCase | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [newPan, setNewPan] = useState("");
  const [newForm, setNewForm] = useState("ITR_2");
  const [newFinancialYear, setNewFinancialYear] = useState("2025-26");
  const [ackInput, setAckInput] = useState("");

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      const [itrRes, clientsRes] = await Promise.all([
        fetch("/api/itr"),
        fetch("/api/clients?take=100"),
      ]);

      const itrJson = await itrRes.json().catch(() => ({}));
      const clientsJson = await clientsRes.json().catch(() => ({}));

      const loadedClients: ClientOption[] = clientsJson.clients || clientsJson.data || [];
      setClients(loadedClients);
      if (loadedClients.length > 0 && !selectedClientId) {
        setSelectedClientId(loadedClients[0].id);
        if (loadedClients[0].pan) setNewPan(loadedClients[0].pan);
      }

      const clientMap = new Map(loadedClients.map((c) => [c.id, c]));

      const itrRows: any[] = itrJson.data || [];
      const mappedCases: TaxCase[] = itrRows.map((row) => {
        const cli = clientMap.get(row.clientId);
        const gross = Number(row.grossIncome || 0);
        const tax = Number(row.taxAmount || 0);
        const tds = Number(row.prepaidTaxes || 0);
        const refund = Number(row.refundAmount || 0);
        const docs = Array.isArray(row.documents) && row.documents.length > 0
          ? row.documents
          : [
              { name: "Form 16 / Income Proofs", status: "Requested" as const },
              { name: "Form 26AS / AIS Reconciliation", status: "Requested" as const },
            ];

        return {
          id: row.id,
          clientId: row.clientId,
          clientName: row.taxpayerName || cli?.full_name || "Client Record",
          pan: row.pan || cli?.pan || "PENDING PAN",
          formType: String(row.itrType || "ITR_2").replace(/_/g, "-"),
          ay: row.assessmentYear || `AY ${row.financialYear || "2026-27"}`,
          status: (row.status || "in-progress")
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          grossIncome: gross,
          taxPayable: tax,
          tdsCredits: tds,
          refundOrBalance: refund > 0 ? refund : tax - tds,
          documents: docs,
          ackNumber: row.acknowledgeNumber || undefined,
          filingDate: row.filingDate || undefined,
        };
      });

      setCases(mappedCases);
    } catch (error: any) {
      console.error("Failed to load CA tax workflow:", error);
      toast.error(error?.message || "Failed to load tax filing engagements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadWorkflowData();
    }
  }, [user]);

  const handleCreateNewCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error("Please select a client from your practice roster.");
      return;
    }

    setSaving(true);
    try {
      const chosenClient = clients.find((c) => c.id === selectedClientId);
      const res = await fetch("/api/itr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          itrType: newForm,
          financialYear: newFinancialYear,
          assessmentYear: newFinancialYear === "2025-26" ? "AY 2026-27" : "AY 2025-26",
          pan: (newPan || chosenClient?.pan || "").toUpperCase(),
          taxpayerName: chosenClient?.full_name || "Taxpayer",
          caName: user?.name || user?.email || "Practicing CA",
          status: "document-collection",
          documents: [
            { name: "Form 16 / Salary Certificate", status: "Requested" },
            { name: "Form 26AS / AIS / TIS", status: "Requested" },
            { name: "Bank Statements (All accounts)", status: "Requested" },
          ],
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to create tax filing case");
      }

      toast.success("Tax filing case created & saved to database.");
      setShowNewCaseModal(false);
      await loadWorkflowData();
    } catch (err: any) {
      toast.error(err.message || "Could not create tax filing case");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmEFiling = async (taxCase: TaxCase) => {
    const cleanAck = ackInput.trim() || `ITD-ACK-${Date.now()}`;
    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/itr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taxCase.id,
          status: "submitted",
          acknowledgeNumber: cleanAck,
          filingDate: today,
          eVerified: true,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Failed to record e-filing");
      }

      toast.success(`Filing recorded with Acknowledgement ARN: ${cleanAck}`);
      setAckInput("");
      await loadWorkflowData();
      setSelectedCase((prev) =>
        prev ? { ...prev, status: "Submitted", ackNumber: cleanAck, filingDate: today } : null
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update e-filing status");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleChecklistItem = async (taxCase: TaxCase, idx: number) => {
    const nextStatusOrder: ("Requested" | "Received" | "Missing")[] = ["Requested", "Received", "Missing"];
    const updatedDocs = taxCase.documents.map((d, i) => {
      if (i !== idx) return d;
      const next = nextStatusOrder[(nextStatusOrder.indexOf(d.status) + 1) % nextStatusOrder.length];
      return { ...d, status: next };
    });

    try {
      const res = await fetch("/api/itr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taxCase.id,
          documents: updatedDocs,
        }),
      });
      if (!res.ok) throw new Error("Failed to update checklist");
      setSelectedCase({ ...taxCase, documents: updatedDocs });
      setCases((prev) => prev.map((c) => (c.id === taxCase.id ? { ...c, documents: updatedDocs } : c)));
      toast.success("Checklist item updated.");
    } catch {
      toast.error("Could not persist checklist change");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> CA Tax Filing Workflow & Case Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete lifecycle: Document Checklist → Income Verification → Draft Approval → E-Filing & Ack Receipt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadWorkflowData}
            disabled={loading}
            className="border-white/10 text-gray-300 hover:text-white text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Sync
          </Button>
          <Button
            onClick={() => setShowNewCaseModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Start New Tax Case
          </Button>
        </div>
      </div>

      {/* Tax Cases Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Active Tax Filing Engagements</h3>
          <span className="text-xs text-gray-400 font-mono">{cases.length} Client Cases Recorded</span>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-gray-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading tax filing engagements...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Client Name & PAN</th>
                  <th className="py-3.5 px-4">ITR Form</th>
                  <th className="py-3.5 px-4">Gross Income</th>
                  <th className="py-3.5 px-4">TDS Credits</th>
                  <th className="py-3.5 px-4">Balance / Refund</th>
                  <th className="py-3.5 px-4">Filing Stage</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {cases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      No ITR filing cases found yet. Click &ldquo;Start New Tax Case&rdquo; to initiate a client return.
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.id} className="hover:bg-[#18181b]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{c.clientName}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">PAN: {c.pan} • {c.ay}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-200">{c.formType}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white">₹{c.grossIncome.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">₹{c.tdsCredits.toLocaleString("en-IN")}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                        {c.refundOrBalance > 0 ? `₹${c.refundOrBalance.toLocaleString("en-IN")}` : "Settled"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          c.ackNumber || c.status === "Submitted" || c.status === "Completed"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setAckInput(c.ackNumber || "");
                            setSelectedCase(c);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                        >
                          Open Case File <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  {selectedCase.ay} • {selectedCase.formType}
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedCase.clientName}</h3>
                <span className="text-xs text-gray-400 font-mono">PAN: {selectedCase.pan} • Status: {selectedCase.status}</span>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 bg-[#18181b] p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-400" /> Document Checklist (Click badge to toggle)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedCase.documents.map((doc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#111111] border border-white/5 flex items-center justify-between gap-2">
                    <span className="truncate text-gray-300">{doc.name}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleChecklistItem(selectedCase, idx)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        doc.status === "Received"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : doc.status === "Requested"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                      }`}
                    >
                      {doc.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* E-Filing Actions */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              {selectedCase.ackNumber ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs space-y-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Return E-Filed & Recorded
                    </span>
                    <p className="text-gray-400 font-mono text-[11px]">Acknowledgement ARN: {selectedCase.ackNumber}</p>
                  </div>
                  <Button
                    onClick={() => {
                      downloadItrVReceipt(selectedCase);
                      toast.success("ITR-V receipt downloaded.");
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download ITR-V Receipt
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-gray-400">
                    Enter the Income Tax Portal Acknowledgement Number (ARN) after submitting on e-Filing 2.0 to lock this return:
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={ackInput}
                      onChange={(e) => setAckInput(e.target.value)}
                      placeholder="Optional ARN (auto-generated if omitted)"
                      className="flex-1 bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <Button
                      disabled={saving}
                      onClick={() => handleConfirmEFiling(selectedCase)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 rounded-xl"
                    >
                      <Send className="w-4 h-4 mr-1.5" /> {saving ? "Saving..." : "Record E-Filing"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Start New Tax Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Start New Tax Case
              </h3>
              <button onClick={() => setShowNewCaseModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Select Client *</label>
                {clients.length === 0 ? (
                  <p className="text-amber-400 text-[11px] bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5">
                    No clients in your roster yet. Add a client in Client Management first.
                  </p>
                ) : (
                  <select
                    required
                    value={selectedClientId}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value);
                      const matched = clients.find((c) => c.id === e.target.value);
                      if (matched?.pan) setNewPan(matched.pan);
                    }}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} {c.pan ? `(${c.pan})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Client 10-Digit PAN</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="e.g. AABCT1928K"
                  value={newPan}
                  onChange={(e) => setNewPan(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">ITR Return Form</label>
                  <select
                    value={newForm}
                    onChange={(e) => setNewForm(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ITR_1">ITR-1 (Sahaj)</option>
                    <option value="ITR_2">ITR-2 (Capital Gains)</option>
                    <option value="ITR_3">ITR-3 (Business/Prof)</option>
                    <option value="ITR_4">ITR-4 (Sugam)</option>
                    <option value="OTHER">ITR-6 (Corporate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Financial Year</label>
                  <select
                    value={newFinancialYear}
                    onChange={(e) => setNewFinancialYear(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="2025-26">FY 2025-26 (AY 2026-27)</option>
                    <option value="2024-25">FY 2024-25 (AY 2025-26)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setShowNewCaseModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || clients.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {saving ? "Creating..." : "Initiate Case"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
