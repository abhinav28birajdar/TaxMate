'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, HelpCircle, FileText, MessageSquare, Shield, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function HelpCenterPage() {
  const [search, setSearch] = useState('');

  const categories = [
    { title: 'Getting Started', icon: HelpCircle, count: '8 articles', desc: 'Onboarding for CAs, firms, and business clients.' },
    { title: 'GST & Income Tax Filings', icon: FileText, count: '14 articles', desc: 'How to prepare GSTR, ITRs, TDS, and notice responses.' },
    { title: 'Billing & Subscriptions', icon: Shield, count: '6 articles', desc: 'Razorpay, Stripe payments, invoices, and plans.' },
    { title: 'Video Calls & Chat', icon: MessageSquare, count: '5 articles', desc: 'Consultations, LiveKit video rooms, and encrypted chat.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-600/20 text-xs font-semibold rounded-full uppercase tracking-wider">
            Help & Knowledge Base
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight">How can we help you today?</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Search our documentation, user guides, or reach out directly to support.
          </p>

          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search tax tools, filing guides, invoice setup..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 pr-4 py-6 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 rounded-2xl shadow-sm text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {categories.map((cat) => (
            <div
              key={cat.title}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:border-lime-600 transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 bg-lime-600/10 text-lime-600 dark:text-lime-400 rounded-xl flex items-center justify-center mb-4 group-hover:bg-lime-600 group-hover:text-white transition-colors">
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
                {cat.title}
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-lime-600 transition-colors" />
              </h3>
              <p className="text-xs text-lime-600 dark:text-lime-400 font-medium mt-1">{cat.count}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-lime-600/10 border border-lime-600/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Still need assistance?</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Our customer care and technical support team is available 24/7.</p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-lime-600 hover:bg-lime-500 text-white font-semibold rounded-xl text-sm transition-all whitespace-nowrap shadow-md shadow-lime-600/20"
          >
            Contact Support Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
