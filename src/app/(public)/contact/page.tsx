'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Phone,
  Send,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Copy,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const TOPICS = [
  'General & CA Account Support',
  'Subscription & Razorpay Billing',
  'API & Webhook Integration',
  'ICAI Verification & Onboarding',
  'Security & Bug Report',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('support@taxmate.app');
    toast.success('Copied support@taxmate.app to clipboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (subject.trim().length < 3) {
      setErrorMsg('Please provide a brief subject for your request.');
      return;
    }
    if (message.trim().length < 10) {
      setErrorMsg('Detailed message must be at least 10 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType: 'contact',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          subject: `[${topic}] ${subject.trim()}`,
          message: message.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not submit your support request.');
      }

      setSubmittedRef(json.inquiryId ? String(json.inquiryId).slice(0, 8).toUpperCase() : 'RECORDED');
      toast.success('Support message received! Our priority desk will respond shortly.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRef(null);
    setSubject('');
    setMessage('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      {/* Subtle Grid & Ambient Emerald Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[680px] h-[340px] bg-emerald-600/12 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 24/7 Priority Support Desk
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Contact Support &amp; Customer Care
          </h1>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Have questions about your CA account, subscription billing, client portal, or API integrations? Reach our specialist desk directly.
          </p>
        </div>

        {/* Top 3 Support Channel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 bg-[#111111]/95 border border-white/10 hover:border-emerald-500/30 rounded-3xl space-y-3 transition-colors shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Official Support Email</h2>
              <p className="text-xs text-gray-400 mt-1">For platform assistance &amp; SLA tickets.</p>
            </div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <a
                href="mailto:support@taxmate.app"
                className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:underline truncate"
              >
                support@taxmate.app
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy support email"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-[#111111]/95 border border-white/10 hover:border-emerald-500/30 rounded-3xl space-y-3 transition-colors shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Toll Free Helpline</h2>
              <p className="text-xs text-gray-400 mt-1">Mon – Sat (9:00 AM – 8:00 PM IST)</p>
            </div>
            <a
              href="tel:+9118008296283"
              className="text-sm font-mono font-bold text-white hover:text-emerald-400 transition block pt-1"
            >
              +91 1800-TAX-MATE
            </a>
          </div>

          <div className="p-6 bg-[#111111]/95 border border-white/10 hover:border-emerald-500/30 rounded-3xl space-y-3 transition-colors shadow-xl">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Guaranteed Response SLA</h2>
              <p className="text-xs text-gray-400 mt-1">Fastest response for CA practice firms.</p>
            </div>
            <div className="text-xs font-bold text-emerald-400 pt-1">
              &lt; 15 Minutes Response Time
            </div>
          </div>
        </div>

        {/* Main 2-Column Interactive Ticket & Helpful Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Guidance Panel */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 sm:p-7 rounded-3xl bg-[#111111] border border-white/10 space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" /> Before You Write In
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Your enquiry is saved directly to our support operations queue and routed to an engineering or compliance specialist.
              </p>

              <div className="space-y-3 text-xs">
                <Link
                  href="/faq"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#171717] border border-white/5 hover:border-emerald-500/30 transition group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                      Frequently Asked Questions
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Filing timelines, security &amp; pricing answers
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/talk-sales"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#171717] border border-white/5 hover:border-emerald-500/30 transition group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                      Enterprise CA Firm Solutions
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Multi-partner seats &amp; custom onboarding
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                </Link>

                <Link
                  href="/login"
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#171717] border border-white/5 hover:border-emerald-500/30 transition group"
                >
                  <div>
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition">
                      Already Have an Account?
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Sign in for in-portal priority ticket tracking
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7">
            {submittedRef ? (
              <div className="bg-[#111111] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    Ticket Ref: #{submittedRef}
                  </span>
                  <h2 className="text-xl font-bold text-white pt-2">Message Received by Support Desk</h2>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-white font-medium">{name}</span>. Our team has logged your inquiry and will reply to{' '}
                    <span className="text-emerald-400 font-medium">{email}</span>.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={handleReset}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl px-5"
                  >
                    Send Another Message
                  </Button>
                  <a
                    href={`mailto:support@taxmate.app?subject=${encodeURIComponent(subject || 'TaxMate Support Enquiry')}`}
                    className="inline-flex items-center px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-gray-300 hover:bg-white/5 transition"
                  >
                    Open in Email App
                  </a>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h2 className="font-bold text-white text-lg">Send Message to Support Desk</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Direct route to support@taxmate.app • Audited SLA tracking
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Your Name <span className="text-emerald-400">*</span>
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full legal name"
                      className="h-11 bg-[#181818] border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Email Address <span className="text-emerald-400">*</span>
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="h-11 bg-[#181818] border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <Input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="h-11 bg-[#181818] border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-topic" className="block text-xs font-semibold text-gray-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      id="contact-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full h-11 px-3 bg-[#181818] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Subject / Technical Issue <span className="text-emerald-400">*</span>
                  </label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your question or issue"
                    className="h-11 bg-[#181818] border-white/10 text-white placeholder:text-gray-500 rounded-xl focus-visible:ring-emerald-500"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Detailed Message <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Include account email, error details, or relevant invoice/order ID..."
                    className="w-full p-3.5 bg-[#181818] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.28)] text-xs sm:text-sm transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending to Support Desk...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send Message to support@taxmate.app
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
