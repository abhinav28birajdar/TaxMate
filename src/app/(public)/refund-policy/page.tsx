import React from 'react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-800 dark:text-slate-200">
      <h1 className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white">Refund & Cancellation Policy</h1>
      <p className="text-sm text-slate-500 mb-8">Last Updated: July 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">1. Subscription Cancellations</h2>
          <p>
            You can cancel your TaxMate SaaS subscription at any time from your Billing Settings. Your cancellation will take effect at the end of the current billing cycle.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">2. Refund Eligibility</h2>
          <p>
            Refund requests submitted within 7 days of initial subscription purchase are eligible for a 100% full refund. Professional fee payments made directly to Chartered Accountants for direct services are subject to individual agreement between client and firm.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">3. Contact Us</h2>
          <p>
            If you have any questions regarding refunds or payments, please reach out to our support desk at{' '}
            <a href="mailto:support@taxmate.in" className="text-lime-600 dark:text-lime-400 underline">support@taxmate.in</a>.
          </p>
        </section>
      </div>

      <div className="mt-8">
        <Link href="/" className="inline-block px-4 py-2 bg-lime-600 hover:bg-lime-500 text-white rounded-lg text-sm font-semibold">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
