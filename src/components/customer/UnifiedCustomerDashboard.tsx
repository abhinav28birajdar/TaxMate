"use client";

import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Receipt, 
  Clock, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Video, 
  MessageSquare, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function UnifiedCustomerDashboard() {
  const taxSummary = {
    grossIncome: "₹24,50,000",
    deductions: "₹2,25,000",
    taxLiability: "₹3,97,500",
    tdsPaid: "₹4,12,000",
    estimatedRefund: "₹14,500",
    filingStatus: "Draft Ready (Awaiting OTP)",
    ay: "AY 2026-27"
  };

  const quickActions = [
    { title: "Upload Form 16 / Docs", desc: "Drag & drop salary or bank PDFs", href: "/client/documents", icon: UploadCloud },
    { title: "Review Tax Computation", desc: "Old vs New Sec 115BAC comparison", href: "/client/tax-returns", icon: CalculatorIcon },
    { title: "Consult Assigned CA", desc: "Join 1-on-1 video room with screen share", href: "/client/calls", icon: Video },
    { title: "Pay Retainer / Invoices", desc: "Settle CA fee via Instant UPI", href: "/client/payments", icon: CreditCard },
  ];

  const pendingTasks = [
    { title: "E-Sign ITR-2 Computation Draft", due: "Due in 2 days", priority: "urgent", link: "/client/tax-returns" },
    { title: "Upload Q2 HDFC Bank Statement for 26AS Match", due: "Requested by CA Rajesh", priority: "normal", link: "/client/documents" }
  ];

  const upcomingDeadlines = [
    { date: "Oct 20, 2026", title: "GSTR-3B Filing Milestone", status: "Auto-reconciling" },
    { date: "Oct 31, 2026", title: "TDS Q2 Filing Confirmation", status: "Scheduled" },
    { date: "Dec 15, 2026", title: "Advance Tax Q3 Installment (75%)", status: "Upcoming" },
  ];

  const recentMessages = [
    { sender: "CA Rajesh Sharma, FCA", text: "I have applied the Section 87A rebate and verified your capital gains set-offs.", time: "25m ago", link: "/client/chat" },
    { sender: "TaxMate Support Bot", text: "Your Form 16 OCR parsing completed with 100% field accuracy.", time: "2h ago", link: "/client/chat" }
  ];

  const recentPayments = [
    { ref: "INV-TM-2026-0042", desc: "Annual Retainer & ITR-2 Advisory", amount: "₹4,999", status: "PAID", date: "Yesterday" }
  ];

  function CalculatorIcon(props: any) {
    return <FileSpreadsheet {...props} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" /> Assessment Year 2026-27 Active Dossier
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Customer Tax Command Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Welcome back, Abhinav. Your return computation is 90% complete with ₹14,500 estimated refund.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/client/tax-returns">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]">
              <FileSpreadsheet className="w-4 h-4 mr-1.5" /> View ITR Computation
            </Button>
          </Link>
          <Link href="/client/calls">
            <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
              <Video className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Call Assigned CA
            </Button>
          </Link>
        </div>
      </div>

      {/* Tax Liability & Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <span className="text-xs text-gray-400 font-medium">Gross Total Income</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">{taxSummary.grossIncome}</div>
          <p className="text-[11px] text-gray-400 mt-2">Salary + Mutual Fund LTCG</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <span className="text-xs text-gray-400 font-medium">Net Tax Liability</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">{taxSummary.taxLiability}</div>
          <p className="text-[11px] text-emerald-400 mt-2">Sec 115BAC New Regime Optimal</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-2xl">
          <span className="text-xs text-gray-400 font-medium">TDS Credits in 26AS</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-mono">{taxSummary.tdsPaid}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% matched with Form 16
          </div>
        </div>

        <div className="bg-[#111111] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl bg-gradient-to-br from-emerald-950/30 via-[#111111] to-[#111111]">
          <span className="text-xs text-emerald-400 font-semibold">Estimated Income Tax Refund</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 font-mono">{taxSummary.estimatedRefund}</div>
          <p className="text-[11px] text-gray-300 mt-2">Pre-validated to HDFC Bank A/C</p>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((qa, idx) => {
          const Icon = qa.icon;
          return (
            <Link key={idx} href={qa.href} className="block group">
              <div className="p-5 rounded-2xl bg-[#111111] border border-white/10 hover:border-emerald-500/40 transition-all shadow-2xl flex flex-col justify-between h-full">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                    {qa.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{qa.desc}</p>
                </div>
                <div className="pt-3 text-[11px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Proceed <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Filing Status & Pending Tasks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Return Status Banner */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">Filing Status Pipeline</span>
                <h3 className="text-lg font-bold text-white mt-0.5">AY 2026-27 (ITR-2 Salaried & Capital Gains)</h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start sm:self-auto">
                Customer Approval Pending
              </span>
            </div>

            {/* Stage Stepper */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                ✓ 1. Docs Ingested
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                ✓ 2. CA Reviewed
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold ring-1 ring-amber-500/30">
                ⏳ 3. OTP Sign-off
              </div>
              <div className="p-2.5 rounded-xl bg-[#181818] border border-white/5 text-gray-500">
                4. ITD E-filed
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">
                Assigned CA: <strong className="text-white">CA Rajesh Sharma, FCA</strong> • Draft ARN ready.
              </p>
              <Link href="/client/tax-returns">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                  Review & Approve Return
                </Button>
              </Link>
            </div>
          </div>

          {/* Pending Tasks & Documents */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Pending Action Items ({pendingTasks.length})</h3>
            <div className="space-y-3">
              {pendingTasks.map((t, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#161616] border border-white/5 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all">
                  <div className="space-y-0.5">
                    <h4 className="font-semibold text-xs sm:text-sm text-white">{t.title}</h4>
                    <p className="text-[11px] text-gray-400">{t.due}</p>
                  </div>
                  <Link href={t.link}>
                    <Button size="sm" variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                      Complete Action
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Deadlines, Messages & Payments */}
        <div className="space-y-6">
          {/* Statutory Deadlines */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> Upcoming Deadlines
            </h3>
            <div className="space-y-3 text-xs">
              {upcomingDeadlines.map((dl, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#161616] border border-white/5 space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-emerald-400 font-bold">{dl.date}</span>
                    <span className="text-gray-400">{dl.status}</span>
                  </div>
                  <p className="text-gray-200 font-semibold">{dl.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent CA Messages */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Messages
              </h3>
              <Link href="/client/chat" className="text-xs text-emerald-400 hover:underline">
                Open Chat
              </Link>
            </div>
            <div className="space-y-3 text-xs">
              {recentMessages.map((m, idx) => (
                <Link key={idx} href={m.link} className="block group">
                  <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5 space-y-1 group-hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">{m.sender}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{m.time}</span>
                    </div>
                    <p className="text-gray-400 line-clamp-2 leading-relaxed">{m.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Payment Receipts */}
          <div className="p-6 rounded-3xl bg-[#111111] border border-white/10 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" /> Recent Payment
            </h3>
            {recentPayments.map((p, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-emerald-400">{p.ref}</div>
                  <div className="text-gray-400 text-[11px]">{p.desc}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-white">{p.amount}</div>
                  <span className="text-[10px] text-emerald-400 font-bold">{p.status}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
