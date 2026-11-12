'use client';

import { useState } from 'react';
import { PhoneCall, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TalkSalesPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [teamSize, setTeamSize] = useState('1-50 Active Clients (Solo Practice)');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please fill out your name, work email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inquiryType: 'sales',
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          company: company.trim() || undefined,
          teamSize,
          subject: `Enterprise CA Firm Sales Request (${teamSize})`,
          message:
            message.trim() ||
            `Enterprise practice consultation callback requested for ${company.trim() || name.trim()} (${teamSize}).`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not submit enquiry.');
      }

      setSubmitted(true);
      toast.success(json.message || 'Sales enquiry submitted! Our specialist will reach out shortly.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit enquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-white">
      <main className="flex-1 container mx-auto px-4 py-14 max-w-5xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full inline-flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" /> Enterprise &amp; CA Firm Sales Team
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Talk to Our CA Practice Solutions Team
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Looking for multi-partner seats, dedicated data migration, custom white-label portals, or bulk client onboarding? Connect directly with our solutions team.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> ICAI Compliance &amp; Guided Practice Migration
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Dedicated Account Onboarding &amp; Priority SLA
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Multi-Partner Practice Roles &amp; Audit Trails
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-white">Direct Enterprise Sales Desk</div>
              <div className="text-emerald-400 font-semibold text-sm">sales@taxmate.app</div>
            </div>
          </div>

          {submitted ? (
            <div className="bg-[#111111] border border-emerald-500/30 rounded-3xl p-8 shadow-xl space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Callback Request Received</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                Thank you, {name}. Your enquiry has been saved to our sales queue and we will contact you at {email}.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="border-white/10 text-gray-200 text-xs rounded-xl"
              >
                Submit Another Enquiry
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-[#111111] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <h3 className="font-bold text-white text-base border-b border-white/10 pb-2">
                Request Enterprise Call Back
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Name *</label>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="text-xs bg-[#181818] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Work Email *</label>
                  <Input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partner@yourfirm.in"
                    className="text-xs bg-[#181818] border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1">Phone Number *</label>
                    <Input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="text-xs bg-[#181818] border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-300 mb-1">Firm / Company</label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Firm name"
                      className="text-xs bg-[#181818] border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Firm Size / Active Client Count</label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full p-2.5 bg-[#181818] border border-white/10 rounded-xl text-xs text-white"
                  >
                    <option>1-50 Active Clients (Solo Practice)</option>
                    <option>50-250 Clients (Medium Firm)</option>
                    <option>250+ Clients (Enterprise Audit Practice)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Requirements / Notes</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share seats needed, GST/ITR workflows, or timeline..."
                    className="w-full p-2.5 bg-[#181818] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 text-xs"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Request Instant Call Back <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
