"use client";

import React from "react";
import Link from "next/link";
import { 
  Briefcase, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Users, 
  FileText, 
  Clock, 
  Award,
  PhoneCall
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CAServicesPage() {
  const caServices = [
    {
      title: "GST Return Filings & 2B ITC Reconciliation",
      description: "End-to-end monthly GSTR-1, GSTR-3B filings, automated supplier invoice matching, and mismatch notice defense under Section 73/74.",
      price: "₹3,999/mo",
      turnaround: "Monthly Retainer",
      features: [
        "Automated GSTR-2B purchase vs book register comparison",
        "E-Way bill generation and consolidated dispatch logging",
        "HSN-wise turnover summary and rate audit",
        "Annual GSTR-9 and GSTR-9C reconciliation certification"
      ]
    },
    {
      title: "Statutory Tax Audit (Section 44AB & Form 3CD)",
      description: "Certified audit for business turnover exceeding ₹10 Crore (or ₹1 Crore cash) with detailed Form 3CA/3CD disclosures.",
      price: "₹18,500",
      turnaround: "7 Business Days",
      features: [
        "Rigorous verification of 44 clauses in Form 3CD",
        "Related party transactions under Section 40A(2)(b)",
        "TDS deduction & payment compliance audit",
        "UDIN generation on ICAI portal with official certification"
      ]
    },
    {
      title: "Virtual CFO & Strategic Financial Advisory",
      description: "Fractional CFO services for high-growth startups and SMEs covering cash-flow forecasting, MIS reporting, and investor due diligence.",
      price: "₹24,999/mo",
      turnaround: "Ongoing Dedicated CA",
      features: [
        "Bi-weekly executive financial review sessions",
        "Cap table management, ESOP schemes, and valuations",
        "Budget vs Actual burn rate and working capital optimization",
        "Board meeting attendance and investor MIS decks"
      ]
    },
    {
      title: "Company & LLP Incorporation with MCA Compliance",
      description: "SPICe+ e-incorporation with ROC, PAN/TAN generation, GST registration, bank account setup, and initial board resolutions.",
      price: "₹7,499",
      turnaround: "5 Business Days",
      features: [
        "RUN name approval and DSC for 2 directors",
        "Drafting MoA, AoA, and customized partnership deeds",
        "INC-20A Commencement of Business filing",
        "First statutory auditor appointment ADT-1 compliance"
      ]
    },
    {
      title: "TDS / TCS Quarterly Filing & Form 16 Generation",
      description: "Preparation of Form 24Q, 26Q, 27Q, TRACES challan matching, lower deduction certificate 197 applications, and Form 16A issuance.",
      price: "₹2,499/qtr",
      turnaround: "Quarterly Milestone",
      features: [
        "Salary & vendor TDS deduction accuracy check",
        "TRACES BFN status and challan OLTAS verification",
        "Zero default notice guarantee",
        "Bulk signed Form 16 PDF generation for employees"
      ]
    },
    {
      title: "Transfer Pricing & Cross-Border Advisory (Sec 92E)",
      description: "Arm's length price determination, master file and local file maintenance, and Form 3CEB certification for multinational groups.",
      price: "₹35,000",
      turnaround: "10 Business Days",
      features: [
        "Benchmark economic analysis on Prowess/Capitaline",
        "Inter-company management fee and royalty scrutiny",
        "Form 3CEB e-filing with ICAI UDIN",
        "Country-by-Country Reporting (CbCR) advisory"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide">
            <Award className="w-3.5 h-3.5" /> ICAI Verified Chartered Accountants
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Chartered Accountant Services & Corporate Advisory
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Partner with top-tier FCAs and specialized accounting firms for GST, Statutory Audits, ROC filings, and Strategic CFO leadership.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/find-ca">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                <Users className="w-4 h-4 mr-2" /> Browse CA Directory
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                <PhoneCall className="w-4 h-4 mr-2 text-emerald-400" /> Book Free Strategy Call
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {caServices.map((svc, i) => (
            <div 
              key={i} 
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/30 transition-all group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                    {svc.turnaround}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white">{svc.price}</span>
                    <span className="text-[10px] text-gray-400 block">excl. taxes</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-semibold text-gray-300 block">Deliverables & UDIN:</span>
                  <ul className="space-y-1.5">
                    {svc.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-white/5">
                <Link href="/find-ca">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.25)]">
                    Engage Dedicated CA <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="w-5 h-5 text-blue-400" /> Are you a practicing Chartered Accountant?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Grow your practice by joining the verified TaxMate CA Network. Get qualified high-ticket clients, automated Form 16 OCR, and secure client communication tools.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/register/ca">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl">
                Apply as CA Partner
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
