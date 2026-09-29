'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-slate-950 text-slate-100 font-sans selection:bg-fuchsia-500 selection:text-slate-950">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative bg-slate-950 border-r border-slate-800/80 flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tight text-white mb-10">
            <div className="w-9 h-9 bg-fuchsia-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-fuchsia-600/30">
              T
            </div>
              Tax<span className="text-fuchsia-400">Mate</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 max-w-md"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enterprise CA Platform</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Manage your CA practice with <span className="text-fuchsia-400 underline decoration-fuchsia-500/40">precision.</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join 12,000+ Chartered Accountants delivering excellence with automated GST returns, ITR filings, and double-entry ledger accounting.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 space-y-4 pt-6 border-t border-slate-800/80"
        >
          <div className="space-y-2.5">
            {[
              "Military-grade 256-bit Encrypted Storage",
              "Real-time Client & Workspace Collaboration",
              "Automated Statutory Compliance Reminders"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-fuchsia-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-500">
            © 2026 TaxMate Inc. Row Level Security & Cloud Vault Protected.
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Container */}
      <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center p-6 sm:p-12 bg-slate-900/60 backdrop-blur-xl">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
