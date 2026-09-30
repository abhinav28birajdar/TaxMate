"use client";

import React from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Calculator, 
  FileText, 
  Clock, 
  Zap, 
  HelpCircle,
  FileCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TaxServicesPage() {
  const taxServices = [
    {
      title: "Individual & Salaried ITR (ITR-1 Sahaj / ITR-2)",
      description: "Automated Form 16 Part A & B ingestion, multi-employer salary reconciliation, and maximum Chapter VI-A deductions under Section 80C, 80D, and 80CCD.",
      price: "₹1,499",
      turnaround: "24 Hours",
      features: [
        "Instant Form 16 PDF OCR parser with AIS match",
        "Section 115BAC Old vs New regime computation comparison",
        "E-filing acknowledgment (ITR-V) generation",
        "Free revision guarantee within 15 days"
      ]
    },
    {
      title: "Capital Gains & Stock Trader Returns (ITR-2 / ITR-3)",
      description: "Direct import of Zerodha, Groww, AngelOne & Upstox P&L statements with grandfathering clauses for LTCG under Section 112A and STCG under 111A.",
      price: "₹3,499",
      turnaround: "48 Hours",
      features: [
        "Unlimited broker trade import and FIFO cost matching",
        "F&O, Intraday speculative & non-speculative turnover",
        "Set-off and carry forward of short & long-term capital losses",
        "Cryptocurrency & Virtual Digital Asset (VDA) disclosures"
      ]
    },
    {
      title: "Freelancers & Professionals (ITR-4 Sugam / Section 44ADA)",
      description: "Presumptive taxation scheme for software engineers, consultants, doctors, and legal professionals declaring 50% profits with zero book maintenance.",
      price: "₹2,999",
      turnaround: "24 Hours",
      features: [
        "Section 44ADA gross receipts evaluation up to ₹75 Lakhs",
        "Advance tax schedule computation across all 4 quarters",
        "International client remittance & foreign invoice reconciliation",
        "Digital signature & Aadhaar OTP e-verification"
      ]
    },
    {
      title: "NRI & Foreign Asset Compliance (Schedule FA & FSI)",
      description: "Comprehensive tax advisory for Non-Resident Indians with DTAA relief under Section 90/91, NRE/NRO accounts, and FEMA compliance.",
      price: "₹6,999",
      turnaround: "3 Business Days",
      features: [
        "Schedule FSI & TR double taxation relief calculation",
        "DTAA double-taxation exemption claim and Form 67 filing",
        "Form 10F and Tax Residency Certificate (TRC) validation",
        "Foreign bank accounts, ESOPs, and stock holding disclosure"
      ]
    },
    {
      title: "CBDT Notice Defense & Rectification (Sec 139(9) / 143(1))",
      description: "Expert CA representation for defective return notices, outstanding demand disputes, and AIS vs Form 26AS mismatch inquiries.",
      price: "₹2,999",
      turnaround: "48 Hours",
      features: [
        "Notice legal analysis by Senior Fellow Chartered Accountant",
        "Section 154 rectification petition e-filing",
        "Condonation of delay under Section 119(2)(b)",
        "Faceless assessment written submission support"
      ]
    },
    {
      title: "Corporate & LLP Tax Return (ITR-6 / Tax Audit Sec 44AB)",
      description: "Audited balance sheet computation, MAT calculations under Section 115JB, and statutory reporting for private limited entities and LLPs.",
      price: "₹14,999",
      turnaround: "5 Business Days",
      features: [
        "Form 3CA/3CD statutory tax audit documentation",
        "Transfer pricing certification under Section 92E",
        "Depreciation schedule as per Income Tax Act vs Companies Act",
        "MCA annual return synchronization"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> Direct CBDT E-Filing Services
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Comprehensive Tax Filing & Compliance Services
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            From single-salary Form 16 filers to complex capital gains, foreign ESOPs, and corporate tax audits — handled with 100% precision by certified Chartered Accountants.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/tax-calculator">
              <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                <Calculator className="w-4 h-4 mr-2 text-emerald-400" /> Calculate Tax Liability
              </Button>
            </Link>
            <Link href="/tax-calendar">
              <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                <Clock className="w-4 h-4 mr-2 text-emerald-400" /> View Deadline Calendar
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxServices.map((svc, i) => (
            <div 
              key={i} 
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/30 transition-all group hover:shadow-[0_0_30px_rgba(5,150,105,0.15)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Turnaround: {svc.turnaround}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">{svc.price}</span>
                    <span className="text-[10px] text-gray-400 block">+ GST</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-gray-300 block">Package Inclusions:</span>
                  <ul className="space-y-1.5">
                    {svc.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5">
                <Link href="/client/tax-returns">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.25)]">
                    File Now with Expert CA <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#111111] to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Need Help Choosing the Right ITR Form?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload your Form 16 PDF or chat with our verified Chartered Accountants for free instant classification and regime recommendation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/find-ca">
              <Button className="bg-white text-black hover:bg-gray-100 font-semibold text-xs rounded-xl">
                Consult a CA
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
