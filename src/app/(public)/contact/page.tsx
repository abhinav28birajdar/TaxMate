'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const name = String(data.get('name') || '');
    const email = String(data.get('email') || '');
    const subject = String(data.get('subject') || 'TaxMate enquiry');
    const message = String(data.get('message') || '');
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    window.location.href = `mailto:support@taxmate.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
    toast.success('Your email client is ready with the support message.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">

      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> 24/7 Priority Support Desk
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Contact Support & Customer Care
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Have questions about your CA account, subscription billing, or API integrations? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Official Support Email</h3>
            <p className="text-xs text-slate-500">For platform assistance & SLA tickets.</p>
            <a href="mailto:support@taxmate.app" className="text-xs font-mono font-extrabold text-lime-600 dark:text-lime-400 block hover:underline">
              support@taxmate.app
            </a>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Toll Free Helpline</h3>
            <p className="text-xs text-slate-500">Mon - Sat (9:00 AM - 8:00 PM IST)</p>
            <div className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
              +91 1800-TAX-MATE
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Guaranteed Response SLA</h3>
            <p className="text-xs text-slate-500">Fastest response for CA practice firms.</p>
            <div className="text-xs font-extrabold text-lime-600 dark:text-lime-400">
              &lt; 15 Minutes Response Time
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl max-w-3xl mx-auto space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">
            Send Message to Support Desk
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Your Name *</label>
              <Input name="name" required placeholder="Abhinav Birajdar" className="text-xs" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email Address *</label>
              <Input name="email" required type="email" placeholder="name@example.com" className="text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Subject / Technical Issue *</label>
            <Input name="subject" required placeholder="How can we help you?" className="text-xs" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Detailed Message *</label>
            <textarea name="message" required rows={4} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-lime-600 focus:outline-none" placeholder="Provide details about your query..." />
          </div>

          <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-3 rounded-xl shadow-md shadow-lime-600/20 text-xs">
            <Send className="w-4 h-4 mr-2" /> Send Message to support@taxmate.app
          </Button>
          {submitted && <p className="text-center text-xs text-lime-600">Message prepared. Complete sending it in your email client.</p>}
        </form>
      </main>

    </div>
  );
}
