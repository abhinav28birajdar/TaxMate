'use client';

import { Building2, ShieldCheck, Users, Award, CheckCircle2, Lock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl space-y-12">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> India&apos;s Premier CA Practice SaaS
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Empowering Chartered Accountants & Taxpayers Worldwide
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            TaxMate is an enterprise-grade multi-tenant SaaS platform engineered specifically for Chartered Accountants, accounting firms, and business clients to streamline compliance, GST filings, statutory audits, and client management.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-sm">
            <div className="text-3xl font-black text-lime-600 dark:text-lime-400">1,500+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Verified CA Firms</div>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-sm">
            <div className="text-3xl font-black text-slate-900 dark:text-white">1.2 Lakh+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Clients Onboarded</div>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-sm">
            <div className="text-3xl font-black text-lime-600 dark:text-lime-400">₹450 Cr+</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">GST & Tax Processed</div>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-sm">
            <div className="text-3xl font-black text-slate-900 dark:text-white">99.9%</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Uptime SLA</div>
          </div>
        </div>

        {/* Mission Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">256-bit Bank Security</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              All financial ledgers, bank statements, and tax proofs are encrypted at rest with AES-256 and TOTP 2FA access controls.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">ICAI Guidelines Compliant</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Built strictly adhering to ICAI professional ethics guidelines, client confidentiality protocols, and document audit trails.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">AI-Powered Automation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Native Tesseract OCR extraction for Form 26AS, bank statements, and Gemini AI legal notice response generation.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
}
