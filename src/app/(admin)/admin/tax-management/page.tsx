"use client";

import React, { useState } from "react";
import { 
  FileSpreadsheet, 
  Settings, 
  Plus, 
  ShieldCheck, 
  Clock, 
  Tag, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Layers,
  ArrowRight,
  Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminTaxManagementPage() {
  const [activeTab, setActiveTab] = useState<"rules" | "deadlines" | "pricing" | "categories">("rules");

  const taxRules = [
    {
      regime: "Section 115BAC (New Tax Regime)",
      status: "Default Regime (Budget 2026)",
      standardDeduction: "₹75,000",
      rebate87A: "Full rebate up to ₹7,00,000 net taxable income",
      cessRate: "4% Health & Education Cess",
      surchargeSlabs: "10% (>₹50L), 15% (>₹1Cr), 25% (>₹2Cr)"
    },
    {
      regime: "Old Tax Regime (Section 115BAC Opt-Out)",
      status: "Optional (Form 10-IEA Required)",
      standardDeduction: "₹50,000",
      rebate87A: "Rebate up to ₹12,500 for taxable income <= ₹5,00,000",
      cessRate: "4% Health & Education Cess",
      surchargeSlabs: "10% (>₹50L), 15% (>₹1Cr), 25% (>₹2Cr), 37% (>₹5Cr)"
    }
  ];

  const statutoryDeadlines = [
    { form: "ITR-1 / ITR-2 / ITR-4 (Non-Audit)", ay: "AY 2026-27", deadline: "31 July 2026", penaltyPerDay: "₹5,000 under Sec 234F" },
    { form: "Tax Audit Report Sec 44AB (Form 3CA/3CD)", ay: "AY 2026-27", deadline: "30 September 2026", penaltyPerDay: "0.5% turnover or ₹1.5L" },
    { form: "ITR-3 / ITR-6 (Audit Cases)", ay: "AY 2026-27", deadline: "31 October 2026", penaltyPerDay: "Interest under Sec 234A" },
    { form: "Belated / Revised Return (Sec 139(4)/(5))", ay: "AY 2026-27", deadline: "31 December 2026", penaltyPerDay: "Final cut-off" }
  ];

  const servicePricing = [
    { service: "ITR-1 Sahaj (Salaried)", defaultPrice: "₹1,499", caShare: "80%", platformFee: "20%", tat: "24h" },
    { service: "ITR-2 (Capital Gains & RSUs)", defaultPrice: "₹3,499", caShare: "85%", platformFee: "15%", tat: "48h" },
    { service: "ITR-3 (Business & Freelance 44ADA)", defaultPrice: "₹5,999", caShare: "85%", platformFee: "15%", tat: "72h" },
    { service: "Section 44AB Corporate Tax Audit", defaultPrice: "₹14,999", caShare: "90%", platformFee: "10%", tat: "5 Days" }
  ];

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" /> Platform Tax Rules & Configuration Engine
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Global tax regime slabs, statutory CBDT deadlines, Section 87A rebate rules, and platform filing pricing schedules.
          </p>
        </div>

        <Button
          onClick={() => toast.success("Tax configurations reloaded & synced to engine.")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
        >
          <Settings className="w-3.5 h-3.5 mr-1.5" /> Deploy Rule Updates
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
        {[
          { key: "rules", label: "Tax Regime Rules & Slabs" },
          { key: "deadlines", label: "Statutory Filing Deadlines" },
          { key: "pricing", label: "Service Pricing & Commission" },
          { key: "categories", label: "ITR Categories & Forms" }
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              activeTab === t.key
                ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] font-bold"
                : "bg-[#141414] hover:bg-[#1A1A1A] text-gray-400 hover:text-white border border-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RULES & SLABS */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {taxRules.map((rule, idx) => (
            <div key={idx} className="p-6 bg-[#111111] rounded-2xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{rule.regime}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {rule.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-gray-300 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Standard Deduction:</span>
                  <span className="font-mono font-bold text-white">{rule.standardDeduction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Section 87A Rebate:</span>
                  <span className="font-mono text-emerald-400 text-right max-w-[240px]">{rule.rebate87A}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Health & Education Cess:</span>
                  <span className="font-mono text-white">{rule.cessRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Surcharge Rates:</span>
                  <span className="font-mono text-white text-right">{rule.surchargeSlabs}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end">
                <Button size="sm" variant="outline" onClick={() => toast.info("Opening Rule Editor")} className="border-white/10 text-xs">
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Slabs
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: STATUTORY DEADLINES */}
      {activeTab === "deadlines" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">ITR Form Scope</th>
                <th className="py-3.5 px-4">Assessment Year</th>
                <th className="py-3.5 px-4">Statutory Deadline</th>
                <th className="py-3.5 px-4">Late Fee / Interest Rule</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {statutoryDeadlines.map((d, i) => (
                <tr key={i} className="hover:bg-[#18181b]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{d.form}</td>
                  <td className="py-3.5 px-4 font-mono">{d.ay}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{d.deadline}</td>
                  <td className="py-3.5 px-4 text-amber-400 font-mono text-[11px]">{d.penaltyPerDay}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.info("Adjusting statutory deadline")} className="text-xs text-gray-300">
                      Configure
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: SERVICE PRICING */}
      {activeTab === "pricing" && (
        <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#18181b] text-white font-semibold border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Filing Service</th>
                <th className="py-3.5 px-4">Base Market Fee</th>
                <th className="py-3.5 px-4">CA Payout Share</th>
                <th className="py-3.5 px-4">Platform Fee</th>
                <th className="py-3.5 px-4">SLA Turnaround</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {servicePricing.map((s, i) => (
                <tr key={i} className="hover:bg-[#18181b]/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{s.service}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">{s.defaultPrice}</td>
                  <td className="py-3.5 px-4 font-mono">{s.caShare}</td>
                  <td className="py-3.5 px-4 font-mono">{s.platformFee}</td>
                  <td className="py-3.5 px-4 text-gray-300">{s.tat}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Button size="sm" variant="ghost" onClick={() => toast.info("Updating fee structure")} className="text-xs text-gray-300">
                      Edit Fee
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: CATEGORIES & FORMS */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {[
            { form: "ITR-1 (Sahaj)", desc: "Individuals with income from salary, one house property, and interest < ₹50 Lakhs" },
            { form: "ITR-2", desc: "Individuals & HUFs with Capital Gains (stocks, property), foreign assets, and multiple house properties" },
            { form: "ITR-3", desc: "Individuals & HUFs having income from proprietary business, profession (Sec 44ADA/44AD), or freelancing" },
            { form: "ITR-4 (Sugam)", desc: "Presumptive taxation scheme for individuals, HUFs, and partnership firms" },
            { form: "ITR-5", desc: "Firms, LLPs, AOPs, BOIs, and cooperative societies" },
            { form: "ITR-6", desc: "Companies other than those claiming exemption under Section 11 (Charitable/Religious trusts)" }
          ].map((cat, i) => (
            <div key={i} className="p-4 bg-[#111111] rounded-2xl border border-white/10 space-y-2">
              <span className="font-bold text-emerald-400 text-sm">{cat.form}</span>
              <p className="text-gray-400 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
