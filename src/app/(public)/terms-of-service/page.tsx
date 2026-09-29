'use client';

import { ShieldCheck, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-lime-600">
            <FileText className="w-4 h-4" /> SaaS Master Service Agreement
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-400">Last updated: October 2026 • TaxMate Platform Terms</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Provision of SaaS Services</h3>
          <p>
            TaxMate provides web and mobile application access for Chartered Accountants, firms, and clients to collaborate on income tax filings, GST returns, and accounting ledgers.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. User Responsibilities & ICAI Compliance</h3>
          <p>
            Chartered Accountants using TaxMate guarantee that they hold active ICAI membership status. Users are responsible for verifying accuracy of prepared returns before final submission to Income Tax & GST Portals.
          </p>

          <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Platform Contact</h3>
          <p>
            For legal notices, email <strong className="text-lime-600">support@taxmate.app</strong>.
          </p>
        </div>
      </main>

    </div>
  );
}
