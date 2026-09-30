"use client";

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  FileText, 
  Download, 
  UserCheck, 
  IndianRupee, 
  X, 
  Sparkles,
  ArrowRight,
  Eye,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TaxCase {
  id: string;
  clientName: string;
  pan: string;
  formType: string;
  ay: string;
  status: "Checklist" | "Income Verification" | "Draft Ready" | "Customer Approval" | "E-Filed" | "Completed";
  grossIncome: string;
  taxPayable: string;
  tdsCredits: string;
  refundOrBalance: string;
  documents: { name: string; status: "Received" | "Requested" | "Missing" }[];
  verification: {
    salary: boolean;
    capitalGains: boolean;
    deductions: boolean;
    form26AS: boolean;
  };
  ackNumber?: string;
}

export function UnifiedCATaxFilingWorkflow() {
  const [selectedCase, setSelectedCase] = useState<TaxCase | null>(null);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newClient, setNewClient] = useState("");
  const [newPan, setNewPan] = useState("");
  const [newForm, setNewForm] = useState("ITR-2 (Capital Gains & Salary)");

  const [cases, setCases] = useState<TaxCase[]>([
    {
      id: "case-1",
      clientName: "TechNova Solutions Pvt Ltd",
      pan: "AABCT1928K",
      formType: "ITR-6 (Corporate)",
      ay: "AY 2026-27",
      status: "Income Verification",
      grossIncome: "₹1,85,00,000",
      taxPayable: "₹46,25,000",
      tdsCredits: "₹48,10,000",
      refundOrBalance: "Refund ₹1,85,000",
      documents: [
        { name: "Audited Balance Sheet & P&L", status: "Received" },
        { name: "Form 26AS Tax Credit Statement", status: "Received" },
        { name: "GSTR-9C Annual Reconciliation", status: "Missing" },
        { name: "Transfer Pricing Form 3CEB", status: "Requested" }
      ],
      verification: { salary: true, capitalGains: true, deductions: false, form26AS: true }
    },
    {
      id: "case-2",
      clientName: "Ananya Deshmukh",
      pan: "ABCPD1234E",
      formType: "ITR-2 (Capital Gains & Salary)",
      ay: "AY 2026-27",
      status: "Customer Approval",
      grossIncome: "₹24,50,000",
      taxPayable: "₹2,68,400",
      tdsCredits: "₹2,95,000",
      refundOrBalance: "Refund ₹26,600",
      documents: [
        { name: "Form 16 Part A & B", status: "Received" },
        { name: "Zerodha Broker Capital Gains Statement", status: "Received" },
        { name: "Health Insurance 80D Receipt", status: "Received" },
        { name: "HDFC Bank Statement Q2", status: "Received" }
      ],
      verification: { salary: true, capitalGains: true, deductions: true, form26AS: true }
    },
    {
      id: "case-3",
      clientName: "Dr. Vikramaditya Rao",
      pan: "AAAPR4910M",
      formType: "ITR-3 (Business & Profession)",
      ay: "AY 2026-27",
      status: "Draft Ready",
      grossIncome: "₹48,20,000",
      taxPayable: "₹10,50,000",
      tdsCredits: "₹8,90,000",
      refundOrBalance: "Payable ₹1,60,000",
      documents: [
        { name: "Clinic Receipts Ledger (44ADA)", status: "Received" },
        { name: "Form 26AS TDS 194J Credits", status: "Received" },
        { name: "Advance Tax Challan 280", status: "Requested" }
      ],
      verification: { salary: true, capitalGains: false, deductions: true, form26AS: true }
    },
    {
      id: "case-4",
      clientName: "Sharma Exports Pvt Ltd",
      pan: "AABCS9012N",
      formType: "ITR-6 (Corporate)",
      ay: "AY 2025-26",
      status: "E-Filed",
      grossIncome: "₹3,40,00,000",
      taxPayable: "₹85,00,000",
      tdsCredits: "₹85,00,000",
      refundOrBalance: "Zero Balance (Paid in Full)",
      ackNumber: "ITD-ACK-901928019201",
      documents: [
        { name: "Audit Report Form 3CA/3CD", status: "Received" },
        { name: "TDS Annual Returns Form 26Q", status: "Received" }
      ],
      verification: { salary: true, capitalGains: true, deductions: true, form26AS: true }
    }
  ]);

  const handleCreateNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.trim() || !newPan.trim()) return;

    const newCaseItem: TaxCase = {
      id: `case-${Date.now()}`,
      clientName: newClient,
      pan: newPan.toUpperCase(),
      formType: newForm,
      ay: "AY 2026-27",
      status: "Checklist",
      grossIncome: "Pending Computation",
      taxPayable: "₹0",
      tdsCredits: "₹0",
      refundOrBalance: "Pending",
      documents: [
        { name: "Form 16 / Salary Certificate", status: "Requested" },
        { name: "Form 26AS / AIS / TIS", status: "Requested" },
        { name: "Bank Statements (All accounts)", status: "Requested" }
      ],
      verification: { salary: false, capitalGains: false, deductions: false, form26AS: false }
    };

    setCases([newCaseItem, ...cases]);
    setShowNewCaseModal(false);
    setNewClient("");
    setNewPan("");
    toast.success("New Tax Case initiated. Document checklist dispatched to client.");
  };

  const handleSimulateEFiling = (taxCase: TaxCase) => {
    const ack = `ITD-ACK-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setCases(cases.map(c => c.id === taxCase.id ? { ...c, status: "E-Filed", ackNumber: ack } : c));
    setSelectedCase(prev => prev ? { ...prev, status: "E-Filed", ackNumber: ack } : null);
    toast.success(`E-Filing confirmed with Income Tax Portal. Acknowledgement ARN: ${ack}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> CA Tax Filing Workflow & Case Management
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete lifecycle: Document Checklist → Income Verification → Draft Approval → E-Filing & Ack Receipt.
          </p>
        </div>

        <Button
          onClick={() => setShowNewCaseModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Start New Tax Case
        </Button>
      </div>

      {/* Tax Cases Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Active Tax Filing Engagements</h3>
          <span className="text-xs text-gray-400 font-mono">{cases.length} Client Cases Under Audit</span>
        </div>

        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Client Name & PAN</th>
              <th className="py-3.5 px-4">ITR Form</th>
              <th className="py-3.5 px-4">Gross Income</th>
              <th className="py-3.5 px-4">TDS Credits</th>
              <th className="py-3.5 px-4">Tax Balance / Refund</th>
              <th className="py-3.5 px-4">Filing Stage</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-[#18181b]/50 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{c.clientName}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">PAN: {c.pan}</div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-gray-200">{c.formType}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-white">{c.grossIncome}</td>
                <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{c.tdsCredits}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">{c.refundOrBalance}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    c.status === "E-Filed" || c.status === "Completed"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : c.status === "Customer Approval"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button
                    size="sm"
                    onClick={() => setSelectedCase(c)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Open Case File <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                <span className="text-xs text-gray-400 font-mono">PAN: {selectedCase.pan} • Case Status: {selectedCase.status}</span>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Checklist (Requested, Received, Missing) */}
            <div className="space-y-3 bg-[#18181b] p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" /> Document Checklist & Verification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedCase.documents.map((doc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#111111] border border-white/5 flex items-center justify-between">
                    <span className="truncate text-gray-300">{doc.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      doc.status === "Received" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" :
                      doc.status === "Requested" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                      "bg-red-500/20 text-red-300 border-red-500/30"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Income & Deduction Verification Checkpoints */}
            <div className="space-y-3 bg-[#18181b] p-4 rounded-xl border border-white/5 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider">CA Verification Checkpoints</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg bg-[#111111] flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> <span>Salary Income</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111111] flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> <span>Form 26AS Credits</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111111] flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> <span>Chapter VI-A</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111111] flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> <span>Sec 115BAC Check</span>
                </div>
              </div>
            </div>

            {/* E-Filing Actions */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              {selectedCase.ackNumber ? (
                <div className="text-xs space-y-1">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Return Successfully E-Filed
                  </span>
                  <p className="text-gray-400 font-mono text-[11px]">Acknowledgement ARN: {selectedCase.ackNumber}</p>
                </div>
              ) : (
                <div className="text-xs text-gray-400">
                  Ready to submit to the official Income Tax Department E-Filing Gateway.
                </div>
              )}

              <div className="flex gap-2">
                {!selectedCase.ackNumber && (
                  <Button
                    onClick={() => handleSimulateEFiling(selectedCase)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                  >
                    <Send className="w-4 h-4 mr-1.5" /> Submit E-Filing to ITD
                  </Button>
                )}
                {selectedCase.ackNumber && (
                  <Button
                    onClick={() => toast.success("ITR-V official filing receipt downloaded.")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download ITR-V Receipt
                  </Button>
                )}
              </div>
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
                <label className="block text-gray-300 mb-1">Client Entity Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Logistics India Pvt Ltd"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Client 10-Digit PAN *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AABCT1928K"
                  value={newPan}
                  onChange={(e) => setNewPan(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white uppercase font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1">ITR Return Form</label>
                <select
                  value={newForm}
                  onChange={(e) => setNewForm(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ITR-1 (Sahaj - Salaried)">ITR-1 (Sahaj - Salaried)</option>
                  <option value="ITR-2 (Capital Gains & Salary)">ITR-2 (Capital Gains & Salary)</option>
                  <option value="ITR-3 (Business & Profession)">ITR-3 (Business & Profession)</option>
                  <option value="ITR-4 (Sugam - Presumptive)">ITR-4 (Sugam - Presumptive)</option>
                  <option value="ITR-6 (Corporate / Companies)">ITR-6 (Corporate / Companies)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button type="button" variant="outline" onClick={() => setShowNewCaseModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Initiate Case
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
