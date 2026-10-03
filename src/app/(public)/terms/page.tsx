"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, ArrowLeft, CheckCircle2, Lock, Scale, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" /> Legal Framework & Governance
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Terms & <span className="text-emerald-500">Conditions</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Effective Date: October 1, 2026 • Master Subscription & Service Level Agreement for TaxMate SaaS Platform
          </p>
        </motion.div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">ICAI Compliant</h4>
              <p className="text-xs text-gray-400 mt-1">Structured in accordance with Chartered Accountants Act & IT Act guidelines.</p>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bank-Grade Privacy</h4>
              <p className="text-xs text-gray-400 mt-1">End-to-end encrypted storage for PAN, Form 16, and bank statements.</p>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Audit Trail</h4>
              <p className="text-xs text-gray-400 mt-1">Immutable time-stamped logs of all return filings and CA approvals.</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-8 text-gray-300 text-sm leading-relaxed shadow-2xl">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">1</span>
              Acceptance of Platform Terms
            </h2>
            <p>
              By accessing, registering with, or utilizing the TaxMate website, mobile application, APIs, or CA collaboration suite (collectively, the &quot;Platform&quot;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms and Conditions (&quot;Terms&quot;) as well as our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">2</span>
              Chartered Accountant Obligations & Licensure
            </h2>
            <p>
              Professionals registering as Chartered Accountants or CA Practice Firms represent and warrant that they hold valid, active membership with the Institute of Chartered Accountants of India (ICAI) and possess valid Certificates of Practice (CoP) where mandatory. CAs remain solely responsible for the technical accuracy of final computations and statutory submissions made via their digital signatures or credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">3</span>
              Taxpayer Responsibilities & Truth in Disclosure
            </h2>
            <p>
              Individual and Corporate Taxpayers agree to upload genuine, authentic documentation (Form 16, AIS, Form 26AS, Books of Accounts). TaxMate and assigned CAs do not assume liability for penalties, demand notices, or scrutiny arising from false declarations or omitted income.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">4</span>
              Payments, Escrow & Refund Policy
            </h2>
            <p>
              All advisory retainer fees, consultation charges, and SaaS subscription fees are processed securely via approved payment gateways. In accordance with our <Link href="/refund-policy" className="text-emerald-400 underline underline-offset-4">Refund Policy</Link>, consultation fees may be cancelled up to 2 hours prior to scheduled meeting slots.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-black">5</span>
              Limitation of Liability & Jurisdiction
            </h2>
            <p>
              TaxMate provides tax calculation tools and practice management software. We do not offer legal or sovereign tax advisory directly. In the event of any disputes, jurisdiction shall strictly rest with the competent courts located in Mumbai / Pune, Maharashtra, India.
            </p>
          </section>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/">
              <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Homepage
              </Button>
            </Link>
            <div className="flex gap-3">
              <Link href="/privacy-policy">
                <Button variant="ghost" className="text-xs text-gray-400 hover:text-white">
                  Privacy Policy
                </Button>
              </Link>
              <Link href="/refund-policy">
                <Button variant="ghost" className="text-xs text-gray-400 hover:text-white">
                  Refund Policy
                </Button>
              </Link>
              <Link href="/contact">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                  Contact Legal Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
