"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Background Subtleties */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="fixed top-0 left-0 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Left Side - Desktop Brand Showcase */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-[#0D0D0D]/80 border-r border-white/10 flex-col justify-between p-10 xl:p-12 text-white backdrop-blur-md">
        <div className="relative z-10">
          <Link
            href="/landing"
            className="inline-flex items-center gap-2.5 font-extrabold text-2xl tracking-tight text-white mb-12 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black shadow-[0_0_20px_rgba(5,150,105,0.4)]">
              T
            </div>
            <span>
              Tax<span className="text-emerald-500">Mate</span>
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6 max-w-md"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>The Operating System for Indian Tax</span>
            </div>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight text-white">
              Manage filings &amp; clients with{" "}
              <span className="text-emerald-400 underline decoration-emerald-500/40 underline-offset-4">
                complete precision.
              </span>
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trusted by Chartered Accountants and taxpayers for automated GST reconciliation, ITR filing workflows, encrypted document vaults, and direct CA collaboration.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="relative z-10 space-y-4 pt-6 border-t border-white/10"
        >
          <div className="space-y-2.5">
            {[
              "Role-based access with Row Level Security",
              "Real-time Client & CA Consultation Suite",
              "Automated CBDT / GSTN Statutory Reminders",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 flex items-center justify-between text-[11px] text-gray-500">
            <span>© {new Date().getFullYear()} TaxMate Inc.</span>
            <Link
              href="/landing"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back to website
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Auth Content Container */}
      <div className="lg:col-span-7 flex flex-col justify-center min-h-screen px-4 py-8 sm:px-8 lg:p-12 relative z-10">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between w-full max-w-md mx-auto mb-6 pb-4 border-b border-white/10">
          <Link href="/landing" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-[0_0_16px_rgba(5,150,105,0.4)]">
              T
            </div>
            <span>
              Tax<span className="text-emerald-500">Mate</span>
            </span>
          </Link>
          <Link
            href="/landing"
            className="text-xs text-gray-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto space-y-6">{children}</div>
      </div>
    </div>
  );
}
