'use client';

import { useState } from 'react';
import { Sparkles, Calendar, Clock, CheckCircle2, User, Building2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DemoPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Product Demo session scheduled! Check your email for calendar invite.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 1-on-1 Personalized Product Walkthrough
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Schedule a Live TaxMate Product Demo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            See how TaxMate automates GST return reconciliation, client document requests, ITR filing pipelines, and fee collections for over 1,500+ CA practice firms.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white dark:bg-slate-900 border border-lime-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-lime-600 text-white font-bold flex items-center justify-center mx-auto shadow-lg shadow-lime-600/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Demo Scheduled Successfully!</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Our Senior SaaS Solutions Specialist will reach out to you within 2 business hours with a Google Meet join link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <Input required placeholder="CA Abhinav Birajdar" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Work Email *</label>
                <Input required type="email" placeholder="abhinav@apextax.in" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone Number *</label>
                <Input required placeholder="+91 98765 43210" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Firm Name / Practice Size *</label>
                <Input required placeholder="Apex Audit Partners (5-10 Staff)" className="text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Preferred Date & Time</label>
              <Input type="datetime-local" className="text-xs" />
            </div>

            <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-lime-600/20 text-xs">
              <Send className="w-4 h-4 mr-2" /> Confirm & Schedule Demo
            </Button>
          </form>
        )}
      </main>

    </div>
  );
}
