"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Users, 
  Calculator, 
  FileText, 
  Clock, 
  Zap, 
  PhoneCall 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<"tax" | "ca">("tax");

  const taxServices = [
    {
      title: "Individual & Salaried ITR (ITR-1 / ITR-2)",
      description: "Automated Form 16 Part A & B ingestion, multi-employer salary reconciliation, and maximum Chapter VI-A deductions.",
      price: "₹1,499",
      turnaround: "24 Hours",
      features: ["Instant Form 16 PDF OCR parser", "Section 115BAC Old vs New regime advice", "E-filing acknowledgment (ITR-V)", "Free revision guarantee"]
    },
    {
      title: "Capital Gains & Stock Trader Returns (ITR-2 / ITR-3)",
      description: "Direct import of Zerodha, Groww, AngelOne & Upstox P&L reports with grandfathering clauses for LTCG & STCG.",
      price: "₹3,499",
      turnaround: "48 Hours",
      features: ["Unlimited broker trade import", "F&O, Intraday turnover calculation", "Set-off and carry forward of losses", "Cryptocurrency & VDA disclosures"]
    },
    {
      title: "NRI & Foreign Asset Compliance (Schedule FA)",
      description: "Comprehensive tax advisory for Non-Resident Indians with DTAA relief (Section 90/91), NRE/NRO accounts, and FEMA compliance.",
      price: "₹6,999",
      turnaround: "3 Business Days",
      features: ["Schedule FSI & TR compliance", "DTAA double-taxation exemption claim", "Form 10F and TRC validation", "Foreign bank accounts disclosure"]
    },
    {
      title: "CBDT Notice Response & Rectification (Sec 139(9) / 143(1))",
      description: "Expert CA defense for defective return notices, outstanding demand disputes, and AIS TDS reconciliation mismatches.",
      price: "₹2,999",
      turnaround: "48 Hours",
      features: ["Notice legal analysis by Senior FCA", "Form 154 rectification petition filing", "Condonation of delay under 119(2)(b)", "Hearing representation support"]
    }
  ];

  const caServices = [
    {
      title: "GST Return Filings & 2B ITC Reconciliation",
      description: "End-to-end monthly GSTR-1, GSTR-3B filings, automated supplier invoice matching, and mismatch notice defense.",
      price: "₹3,999/mo",
      turnaround: "Monthly Recurring",
      features: ["Auto GSTR-2B input credit match", "Vendor follow-up for missing invoices", "LUT generation for export of services", "Annual return GSTR-9/9C audit"]
    },
    {
      title: "Corporate Statutory Audit & Tax Audit (Form 3CA/3CD)",
      description: "Comprehensive audit services under the Companies Act 2013 and Section 44AB of the Income-tax Act.",
      price: "₹24,999",
      turnaround: "7 Business Days",
      features: ["ICAI certified peer-reviewed audit", "Form 3CD tax audit schedule sign-off", "Balance sheet & ledger vetting", "ROC statutory filing assistance"]
    },
    {
      title: "Pvt Ltd & LLP Incorporation (SPICe+)",
      description: "Turnkey incorporation service with RUN name reservation, DSC, MOA/AOA drafting, PAN, TAN, and EPFO/ESIC registrations.",
      price: "₹7,999",
      turnaround: "5-7 Days",
      features: ["MCA SPICe+ Part A & Part B", "Director Identification Numbers (DIN)", "Zero-fee bank current a/c opening", "First 3 months complimentary bookkeeping"]
    },
    {
      title: "Virtual CFO & Monthly Retainer Practice",
      description: "Dedicated Chartered Accountant team managing cash flow forecasting, board reporting, payroll TDS, and MIS dashboards.",
      price: "₹14,999/mo",
      turnaround: "Dedicated Team",
      features: ["Weekly financial health sync", "Advance tax forecasting (Q1-Q4)", "Investor diligence & cap-table review", "Real-time Slack / WhatsApp access"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background orbs matching HeroSection */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[350px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Comprehensive Financial & Legal Solutions
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Specialized Tax & Chartered <br />
            <span className="text-emerald-500">Accountancy Services.</span>
          </h1>
          <p className="text-base text-gray-400 font-light leading-relaxed">
            From individual salaried filings to complex cross-border corporate audits, TaxMate pairs proprietary automation with ICAI-registered practitioners.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center">
          <div className="p-1 bg-[#141414] border border-white/10 rounded-2xl flex gap-1">
            <button
              onClick={() => setActiveTab("tax")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "tax"
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Tax Services (ITR, TDS, NRI)
            </button>
            <button
              onClick={() => setActiveTab("ca")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === "ca"
                  ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-4 h-4" /> CA Firm Services (GST, Audit, CFO)
            </button>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(activeTab === "tax" ? taxServices : caServices).map((svc, idx) => (
            <div 
              key={idx}
              className="bg-[#111111] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-extrabold text-white font-mono">{svc.price}</div>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {svc.turnaround}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  {svc.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <Link href="/register" className="flex-1 mr-3">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                    Get Started with this Service
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                    <PhoneCall className="w-3.5 h-3.5 mr-1" /> Talk to CA
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="p-8 rounded-3xl bg-[#141414] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Need a customized practice retainer?</h3>
            <p className="text-xs text-gray-400">Our senior partner CAs will draft a bespoke engagement letter tailored to your turnover.</p>
          </div>
          <Link href="/contact">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]">
              Schedule Free Advisory Call <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
