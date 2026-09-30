"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Download, 
  Calendar, 
  FileCheck, 
  PieChart, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UnifiedAnalyticsReportsProps {
  portal?: "ca" | "customer";
}

export function UnifiedAnalyticsReports({ portal = "ca" }: UnifiedAnalyticsReportsProps) {
  const [role, setRole] = useState<"ca" | "customer">(portal);
  const [period, setPeriod] = useState<"fy2627" | "fy2526" | "q2">("fy2627");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" /> Module 15: Reports & Analytics Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            {role === "ca" ? "Practice Analytics & Filing Reports" : "Tax Summary & Financial Analytics"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {role === "ca" 
              ? "Comprehensive practice metrics, client growth, billing analytics, and statutory turnaround times."
              : "Detailed breakdown of your gross income, deductions under Chapter VI-A, and historic tax liabilities."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-1 flex">
            <button
              onClick={() => setRole("ca")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                role === "ca" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white"
              }`}
            >
              CA Practice View
            </button>
            <button
              onClick={() => setRole("customer")}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                role === "customer" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-gray-400 hover:text-white"
              }`}
            >
              Customer View
            </button>
          </div>

          <Button 
            onClick={() => toast.success("Exported comprehensive audit report (PDF & Excel)!")} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* CA Analytics View */}
      {role === "ca" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Practice Revenue (YTD)</span>
              <div className="text-3xl font-extrabold text-white mt-1">₹28,50,000</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                <TrendingUp className="w-3.5 h-3.5" /> +28.4% YoY Growth
              </div>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Active Client Dossiers</span>
              <div className="text-3xl font-extrabold text-white mt-1">380 Clients</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                <Users className="w-3.5 h-3.5" /> +14 new corporate clients
              </div>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Filing SLA Compliance</span>
              <div className="text-3xl font-extrabold text-white mt-1">99.2%</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 0 CBDT penalty notices
              </div>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Retainer Renewal Rate</span>
              <div className="text-3xl font-extrabold text-white mt-1">96.5%</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Top 5% practice rating
              </div>
            </div>
          </div>

          {/* Practice Work Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-semibold text-white">Monthly Returns Filed vs Pending</h3>
                <span className="text-xs text-gray-400 font-mono">AY 2026-27</span>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { month: "July 2026 (Salaried Rush)", filed: 180, pending: 12, max: 200 },
                  { month: "August 2026 (GST Annual)", filed: 64, pending: 8, max: 200 },
                  { month: "September 2026 (Corporate Audits)", filed: 92, pending: 15, max: 200 },
                  { month: "October 2026 (TDS Q2)", filed: 44, pending: 19, max: 200 },
                ].map((m, i) => (
                  <div key={i} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span className="font-semibold">{m.month}</span>
                      <span className="font-mono text-emerald-400">{m.filed} Filed • <span className="text-amber-400">{m.pending} Pending</span></span>
                    </div>
                    <div className="w-full bg-[#1F1F1F] h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${(m.filed / m.max) * 100}%` }} />
                      <div className="bg-amber-500 h-full" style={{ width: `${(m.pending / m.max) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-white">Revenue by Service Vertical</h3>
              <div className="space-y-3 text-xs">
                {[
                  { label: "Corporate Tax & Audits", amount: "₹14,50,000", pct: 51, color: "text-emerald-400" },
                  { label: "GST Compliance & ITC Audits", amount: "₹8,20,000", pct: 29, color: "text-blue-400" },
                  { label: "Individual Salaried ITRs", amount: "₹3,80,000", pct: 13, color: "text-amber-400" },
                  { label: "Consultation & Litigation", amount: "₹2,00,000", pct: 7, color: "text-purple-400" },
                ].map((s, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#161616] border border-white/5 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{s.label}</div>
                      <div className="text-[10px] text-gray-500">{s.pct}% of gross revenue</div>
                    </div>
                    <div className={`font-mono font-bold ${s.color}`}>{s.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Tax Analytics View */}
      {role === "customer" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Gross Total Income</span>
              <div className="text-3xl font-extrabold text-white mt-1">₹24,50,000</div>
              <p className="text-[11px] text-gray-400 mt-2">Salary + Capital Gains</p>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Deductions Claimed</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">₹2,25,000</div>
              <p className="text-[11px] text-gray-400 mt-2">Sec 80C, 80D & Standard</p>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">TDS Credits in 26AS</span>
              <div className="text-3xl font-extrabold text-white mt-1">₹4,12,000</div>
              <p className="text-[11px] text-emerald-400 mt-2">100% matched with Form 16</p>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
              <span className="text-xs text-gray-400 font-medium">Estimated Tax Refund</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">₹14,500</div>
              <p className="text-[11px] text-gray-400 mt-2">To be credited to HDFC A/C</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-white">Income Sources Breakdown</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex justify-between items-center">
                  <span className="text-gray-300">Salary & Allowances (Form 16)</span>
                  <span className="font-mono font-bold text-white">₹18,50,000</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex justify-between items-center">
                  <span className="text-gray-300">Short-Term & Long-Term Capital Gains</span>
                  <span className="font-mono font-bold text-white">₹4,20,000</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex justify-between items-center">
                  <span className="text-gray-300">Rental & Bank Savings Interest</span>
                  <span className="font-mono font-bold text-white">₹1,80,000</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-semibold text-white">Historic Tax Filing & Returns</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">AY 2026-27 (ITR-2)</div>
                    <div className="text-[10px] text-gray-400">Filed via TaxMate • Verified</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">Processed</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">AY 2025-26 (ITR-1)</div>
                    <div className="text-[10px] text-gray-400">Refund ₹8,200 issued</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">Processed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
