"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden">
      {/* Background Subtleties */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative bg-[#0D0D0D]/60 border-r border-white/10 flex-col justify-between p-12 text-white backdrop-blur-md">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-2xl tracking-tight text-white mb-10">
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black shadow-[0_0_20px_rgba(5,150,105,0.4)]">
              T
            </div>
            Tax<span className="text-emerald-500">Mate</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 max-w-md"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>The Operating System for Indian CAs</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
              Manage your practice with <span className="text-emerald-500 underline decoration-emerald-500/40">complete precision.</span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed font-light">
              Join 2,000+ Chartered Accountants delivering excellence with automated GST returns, ITR filings, and instant client collaboration.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 space-y-4 pt-6 border-t border-white/10"
        >
          <div className="space-y-2.5">
            {[
              "Military-grade 256-bit Encrypted Storage",
              "Real-time Client & CA Collaboration Suite",
              "Automated CBDT Statutory Reminders & KYC"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-gray-500">
            © 2026 TaxMate Inc. Cloud Vault & ITD API Gateway Protected.
          </div>
        </motion.div>
      </div>

      {/* Right Side - Form Container */}
      <div className="lg:col-span-7 xl:col-span-7 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
