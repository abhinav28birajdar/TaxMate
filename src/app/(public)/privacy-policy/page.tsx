'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-lime-600">
            <Lock className="w-4 h-4" /> 256-bit AES Encrypted Data Protection
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Legal Privacy Policy</h1>
          <p className="text-xs text-slate-400">Last updated: October 2026 • Official TaxMate Compliance Document</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Data Ownership & Confidentiality</h3>
          <p>
            TaxMate SaaS Platform recognizes that client financial records, PAN, Aadhaar, Form 16, and GST filings remain the sole property of the user and Chartered Accountant. We never sell, monetize, or expose client documents to third parties.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Encryption & Security Standards</h3>
          <p>
            All uploaded tax returns and bank statements are stored using 256-bit AES encryption at rest and TLS 1.3 in transit. Multi-factor authentication (TOTP & SMS OTP) ensures unauthorized access prevention.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Official Inquiries</h3>
          <p>
            For privacy inquiries or data deletion requests, contact our Data Protection Officer at <strong className="text-lime-600">support@taxmate.app</strong>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
