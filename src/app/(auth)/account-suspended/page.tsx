"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertOctagon, Mail, ShieldAlert, FileText, ArrowRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AccountSuspendedPage() {
  const [appealSent, setAppealSent] = useState(false);
  const [appealNotes, setAppealNotes] = useState("");

  const handleAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealNotes) return;
    setAppealSent(true);
    toast.success("Appeal ticket submitted. Compliance team will review within 24 hours.");
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <AlertOctagon className="w-3.5 h-3.5" /> Security Enforcement
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Account Suspended
        </h1>
        <p className="text-sm text-slate-400">
          Access to this TaxMate dossier has been temporarily restricted by the Compliance & Security Division.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-rose-500/20 shadow-2xl space-y-6">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-400 uppercase tracking-wider text-[11px]">
            <ShieldAlert className="w-4 h-4" /> Case ID: #TM-SEC-882190
          </div>
          <p>
            Reason: Multiple geographic logins detected within 10 minutes without 2FA confirmation. Account locked to prevent unauthorized tax file tampering.
          </p>
        </div>

        {!appealSent ? (
          <form onSubmit={handleAppeal} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Submit Appeal / Provide Verification Info
              </label>
              <textarea
                value={appealNotes}
                onChange={(e) => setAppealNotes(e.target.value)}
                placeholder="Explain the circumstances or request manual review by your assigned Chartered Accountant..."
                className="w-full mt-2 bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 h-24 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] text-xs"
            >
              Submit Reinstatement Appeal <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Appeal Submitted</h4>
            <p className="text-[11px] text-gray-400">
              Our Security Officer has received your explanation. You will receive an update at your registered email address.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <Link href="/contact" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-rose-400" /> Contact Support Team
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Back to Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
