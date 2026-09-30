"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20" />
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Homepage
        </Link>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Cookie className="w-3.5 h-3.5" /> Legal & Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Cookie & Local Storage Policy</h1>
          <p className="text-xs text-gray-400">Last updated: Assessment Year 2026-27 • Effective immediately</p>
        </div>

        <div className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 text-xs text-gray-300 leading-relaxed shadow-2xl">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">1. Introduction</h2>
            <p>
              TaxMate uses cookies, local browser storage, and related session technologies to ensure high-security authentication, maintain your encrypted document workspace, and provide seamless Chartered Accountant video consultations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">2. Essential & Security Cookies</h2>
            <p>
              These cookies are strictly required for the core functionality of the platform. Without them, secure authentication with CBDT e-filing gateways and WebRTC consultation rooms cannot function:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-400">
              <li><strong className="text-white">taxmate_session:</strong> Encrypted JWT bearer token verifying your authenticated user identity.</li>
              <li><strong className="text-white">csrf_protection_token:</strong> Cryptographic token mitigating Cross-Site Request Forgery attacks.</li>
              <li><strong className="text-white">vault_cache_token:</strong> Temporary client-side decryption key held in volatile memory only.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">3. Functional & Preference Cookies</h2>
            <p>
              These store your UI configuration preferences including your chosen tax regime comparison view, active dark mode palette, and language selection.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-white">4. No Third-Party Tracking Advertisers</h2>
            <p>
              TaxMate does <strong className="text-white">not</strong> sell your browsing habits or tax records to third-party ad networks. We respect the Digital Personal Data Protection (DPDP) Act of India.
            </p>
          </section>

          <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[11px] text-gray-500">
            <span>Questions? Contact privacy@taxmate.in</span>
            <Link href="/privacy-policy" className="text-emerald-400 hover:underline">
              Read Complete Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
