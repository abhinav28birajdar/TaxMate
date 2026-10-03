"use client";

import React from "react";
import Link from "next/link";
import { UserX, ShieldAlert, ArrowRight, RefreshCw, HelpCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerificationFailedPage() {
  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Verification Notice
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Verification Failed
        </h1>
        <p className="text-sm text-slate-400">
          The Income Tax Department or ICAI identity database returned a mismatch with your submitted details.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <UserX className="w-8 h-8" />
        </div>

        <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 space-y-2 text-xs">
          <div className="font-bold text-white flex items-center justify-between">
            <span>Primary Cause:</span>
            <span className="text-amber-400 font-mono">ERR_PAN_AADHAAR_MISMATCH</span>
          </div>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Name on PAN Card does not match Aadhaar registry exactly (e.g., initials or surname ordering). CBDT Section 139AA requires identical phonetic match for e-filing authorization.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/onboarding/client">
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] text-xs">
              <RefreshCw className="w-4 h-4 mr-1.5" /> Update & Re-Upload Documents
            </Button>
          </Link>
          <Link href="/client/support">
            <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:bg-white/5 text-xs py-2.5 rounded-xl">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Contact CA Verification Desk
            </Button>
          </Link>
        </div>

        <div className="pt-2 border-t border-white/10 text-center">
          <Link href="/client/dashboard" className="text-xs text-gray-400 hover:text-white transition-colors">
            ← Continue in Restricted Read-Only Mode
          </Link>
        </div>
      </div>
    </div>
  );
}
