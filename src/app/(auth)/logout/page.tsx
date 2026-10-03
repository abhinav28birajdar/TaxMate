"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoutConfirmationPage() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure Session Termination
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Logged Out Successfully
        </h1>
        <p className="text-sm text-slate-400">
          Your credentials and encrypted tax tokens have been cleared from this browser session.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Thank you for using TaxMate</h3>
          <p className="text-xs text-gray-400">
            For shared or public workstations, we recommend closing your browser window.
          </p>
        </div>

        <div className="pt-2 space-y-3">
          <Link href="/login">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)] text-xs">
              Log Back In <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:bg-white/5 text-xs py-2.5 rounded-xl">
              Return to Homepage
            </Button>
          </Link>
        </div>

        <p className="text-[11px] text-gray-500">
          Redirecting to homepage in {countdown}s...
        </p>
      </div>
    </div>
  );
}
