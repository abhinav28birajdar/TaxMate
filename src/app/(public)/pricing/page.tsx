'use client';

import { useState } from 'react';
import { Check, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      name: 'Solo CA Practitioner',
      price: billingCycle === 'annual' ? '₹1,999' : '₹2,499',
      period: '/ month billed annually',
      desc: 'Ideal for individual Chartered Accountants & tax consultants.',
      features: [
        'Up to 100 Active Clients',
        'GSTR-1 & 3B Auto-reconciliation',
        'ITR-1 to ITR-4 Filing Manager',
        'Secure 256-bit Document Vault (10 GB)',
        'Client Live Chat & Appointment Desk',
        'Standard Email & SMS Reminders',
      ],
      cta: 'Start 14-Day Free Trial',
      highlighted: false,
    },
    {
      name: 'CA Practice Firm',
      price: billingCycle === 'annual' ? '₹4,999' : '₹5,999',
      period: '/ month billed annually',
      desc: 'For multi-partner CA firms & growing audit practices.',
      features: [
        'Up to 500 Active Clients',
        '5 Partner / Staff User Seats',
        'GSTR-9 Annual Return & 2B Matching',
        'ITR-1 to ITR-7 Corporate Audit Suite',
        'Razorpay & Stripe Fee Gateways',
        'Kanban Audit Task & SLA Manager',
        'Gemini AI Tax Assistant & Notice Drafting',
        'Custom Domain White-labeling (`tax.firm.in`)',
      ],
      cta: 'Start 14-Day Free Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise Audit Network',
      price: 'Custom Tier',
      period: 'Contact Sales for Custom Quote',
      desc: 'For large national accounting networks with 1,000+ clients.',
      features: [
        'Unlimited Active Clients & Staff Seats',
        'Multi-GSTIN Corporate Filings',
        'Dedicated SLA & 15-Minute Response',
        'Tally & Zoho Books API Sync',
        'Custom Legal Terms & On-Premises Option',
        'Dedicated Solutions Architect',
      ],
      cta: 'Talk to Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl space-y-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent CA Practice Pricing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Plans Billed for Growth. Zero Hidden Fees.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            All plans come with a 14-day full feature free trial. No credit card required to get started.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'text-slate-500'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual' ? 'bg-lime-600 text-white shadow-md shadow-lime-600/30' : 'text-slate-500'
              }`}
            >
              Annual Billing <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border flex flex-col justify-between transition-all ${
                p.highlighted
                  ? 'border-lime-500 shadow-2xl ring-2 ring-lime-500/20 relative'
                  : 'border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-lime-600 text-white text-[10px] font-extrabold tracking-wider uppercase rounded-full shadow-md">
                  Most Popular for CA Firms
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                </div>

                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{p.price}</div>
                  <div className="text-[11px] text-slate-400 font-semibold mt-0.5">{p.period}</div>
                </div>

                <ul className="space-y-2.5 text-xs">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-lime-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link href={p.name.includes('Enterprise') ? '/talk-sales' : '/register?role=ca'}>
                  <Button
                    className={`w-full font-bold text-xs py-3 rounded-xl shadow-md ${
                      p.highlighted
                        ? 'bg-lime-600 hover:bg-lime-500 text-white shadow-lime-600/30'
                        : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800'
                    }`}
                  >
                    {p.cta} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}
