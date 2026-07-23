'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PhoneCall, Mail, Building2, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TalkSalesPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Sales enquiry submitted! Our enterprise specialist will call you shortly.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Enterprise & CA Firm Sales Team
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Talk to Our CA Practice Solutions Team
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Looking for multi-partner seats, dedicated SLA migration support, custom domain white-labeling, or bulk client onboarding? Our sales engineers are here to assist.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" /> Custom ICAI Compliance & Data Migration
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" /> Dedicated Account Manager & 15-Minute Support SLA
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-lime-600 shrink-0" /> Custom Domain Integration (`tax.yourfirm.in`)
              </div>
            </div>

            <div className="p-4 bg-lime-600/10 border border-lime-500/30 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Direct Enterprise Sales Hotline</div>
              <div className="text-lime-600 dark:text-lime-400 font-extrabold text-sm">+91 1800-TAX-MATE / sales@taxmate.app</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-2">
              Request Enterprise Call Back
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Your Name *</label>
                <Input required placeholder="CA Rajesh Sharma" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Work Email *</label>
                <Input required type="email" placeholder="rajesh@apextax.in" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number *</label>
                <Input required placeholder="+91 98765 43210" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Firm Size / Active Client Count</label>
                <select className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                  <option>1-50 Active Clients (Solo Practice)</option>
                  <option>50-250 Clients (Medium Firm)</option>
                  <option>250+ Clients (Enterprise Audit Practice)</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-2.5 rounded-xl shadow-md shadow-lime-600/20 text-xs">
              Request Instant Call Back <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
