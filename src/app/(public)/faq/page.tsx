'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is TaxMate compliant with ICAI guidelines?',
      a: 'Yes, TaxMate is engineered in full compliance with the Council of the Institute of Chartered Accountants of India (ICAI) ethics, client confidentiality norms, and document retention rules.',
    },
    {
      q: 'How does client document collection work?',
      a: 'Clients can upload Form 16, bank statements, and deduction proofs directly into their encrypted Document Vault. Tesseract OCR automatically extracts key figures (PAN, TDS, Gross Income) for 1-click CA review.',
    },
    {
      q: 'Can I use my own custom domain for my CA firm?',
      a: 'Yes! CA Firm & Enterprise plans include custom domain white-labeling (e.g. `tax.yourfirmname.com`) with custom logo branding and partner signatures.',
    },
    {
      q: 'Is there a free trial period?',
      a: 'Yes, TaxMate offers a 14-day unrestricted free trial for CAs and accounting firms. You can invite team members and test client portals with zero upfront credit card requirement.',
    },
    {
      q: 'How are client fee payments collected?',
      a: 'TaxMate integrates directly with Razorpay and Stripe. Clients can pay retainer invoices using UPI, Net Banking, or Credit Cards with instant payout settlements into your CA firm bank account.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Everything You Need to Know About TaxMate
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Got questions? We have answers. Contact support@taxmate.app for technical help.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-4 text-left font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-lime-600 shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
