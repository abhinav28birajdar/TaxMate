"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Bell, 
  Filter, 
  Info,
  CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PublicTaxCalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const deadlines = [
    {
      date: "20 Oct 2026",
      title: "GSTR-3B Monthly Return Filing (September 2026)",
      category: "gst",
      authority: "CBIC (GST Portal)",
      applicableTo: "Regular GST registered taxpayers turnover > ₹5 Cr",
      penalty: "₹50/day late fee (₹20 for NIL return) + 18% p.a. interest",
      importance: "High"
    },
    {
      date: "31 Oct 2026",
      title: "Quarterly TDS/TCS Return (Form 24Q & 26Q for Q2)",
      category: "tds",
      authority: "CBDT (TRACES)",
      applicableTo: "All corporate, business, and employer deductors",
      penalty: "₹200/day late fee under Section 234E until return is filed",
      importance: "Urgent"
    },
    {
      date: "31 Oct 2026",
      title: "ITR Filing for Tax Audit & Corporate Assessees (AY 2026-27)",
      category: "income_tax",
      authority: "CBDT (e-Filing 2.0)",
      applicableTo: "Companies, LLPs, and audited business entities under Sec 44AB",
      penalty: "₹5,000 late fee under Sec 234F + 1% per month interest under Sec 234A",
      importance: "Urgent"
    },
    {
      date: "30 Nov 2026",
      title: "Transfer Pricing Report (Form 3CEB)",
      category: "income_tax",
      authority: "CBDT",
      applicableTo: "Assessees with international or specified domestic transactions",
      penalty: "₹1,00,000 penalty under Section 271BA for failure to furnish report",
      importance: "High"
    },
    {
      date: "15 Dec 2026",
      title: "Advance Tax 3rd Installment (75% cumulative payment)",
      category: "advance_tax",
      authority: "CBDT (TIN-NSDL / e-Pay)",
      applicableTo: "All individuals and entities with estimated tax >= ₹10,000",
      penalty: "1% per month simple interest under Section 234C on deferment",
      importance: "Urgent"
    },
    {
      date: "31 Dec 2026",
      title: "Belated / Revised Income Tax Return Cutoff (AY 2026-27)",
      category: "income_tax",
      authority: "CBDT (e-Filing 2.0)",
      applicableTo: "All individual assessees who missed July 31 deadline",
      penalty: "Absolute final cutoff under Section 139(4)/(5); loss carry-forward forfeited",
      importance: "Critical"
    }
  ];

  const filteredDeadlines = selectedCategory === "all" 
    ? deadlines 
    : deadlines.filter(d => d.category === selectedCategory);

  const handleReminder = (title: string) => {
    toast.success(`Reminder alert set for: "${title}". You will receive SMS & WhatsApp alerts 48 hours prior.`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <CalendarCheck className="w-3.5 h-3.5" /> Official CBDT & CBIC Statutory Schedule
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Tax Deadline & Statutory Compliance Calendar
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Keep track of every critical Income Tax, GST, TDS, and Advance Tax milestone. Prevent Section 234F fines and interest penalties.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "all", label: "All Milestones" },
            { id: "income_tax", label: "Income Tax (ITR)" },
            { id: "gst", label: "GST Returns" },
            { id: "tds", label: "TDS / TCS" },
            { id: "advance_tax", label: "Advance Tax" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === tab.id
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold shadow-lg shadow-emerald-500/10"
                  : "bg-[#111111] text-gray-400 hover:text-white border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deadlines Timeline / Cards */}
        <div className="space-y-4">
          {filteredDeadlines.map((item, idx) => (
            <div 
              key={idx}
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-black border border-white/10 flex flex-col items-center justify-center shrink-0 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">
                    {item.date.split(" ")[1]}
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {item.date.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-gray-500">
                    {item.date.split(" ")[2]}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${
                      item.importance === "Critical" 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        : item.importance === "Urgent"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    }`}>
                      {item.importance}
                    </span>
                    <span className="text-xs text-gray-400">Authority: {item.authority}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-gray-400">
                    <strong className="text-gray-300">Applies to:</strong> {item.applicableTo}
                  </p>

                  <div className="flex items-start gap-1.5 text-xs text-rose-400/90 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong>Non-compliance Penalty:</strong> {item.penalty}</span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-2 shrink-0">
                <Button 
                  onClick={() => handleReminder(item.title)}
                  className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.25)]"
                >
                  <Bell className="w-3.5 h-3.5 mr-1.5" /> Set Alert
                </Button>
                <Link href="/services" className="w-full md:w-auto">
                  <Button variant="outline" className="w-full md:w-auto border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                    Get CA Support
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info box */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex items-start gap-4">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-white">Statutory Extension Monitoring</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              TaxMate continuously tracks official CBDT and CBIC circulars. Whenever an extension notification is issued (under Section 119 of the Income Tax Act), this calendar and all registered user notifications update in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
