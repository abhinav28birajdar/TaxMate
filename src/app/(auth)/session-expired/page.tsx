"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Lock, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SessionExpiredPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Session refreshed! Restoring your workspace...");
      router.push("/client/dashboard");
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" /> Security Timeout
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Session Expired
        </h1>
        <p className="text-sm text-slate-400">
          For your data privacy and compliance with Indian financial data protection regulations, sessions lock after 15 minutes of idle time.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#161616] border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
            AB
          </div>
          <div className="truncate">
            <h4 className="text-xs font-bold text-white truncate">Abhinav Birajdar</h4>
            <p className="text-[11px] text-gray-400 truncate">abhinav@example.com</p>
          </div>
        </div>

        <form onSubmit={handleQuickUnlock} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Enter Password to Resume
            </label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-amber-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] text-xs"
          >
            {isLoading ? "Restoring Session..." : "Quick Unlock Session"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors">
            Sign In with Different Account
          </Link>
          <Link href="/" className="hover:text-white transition-colors">
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
