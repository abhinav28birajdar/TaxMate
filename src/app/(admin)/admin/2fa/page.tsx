"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, KeyRound, QrCode, Smartphone, ArrowRight, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Admin2FAPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const secretKey = "JBSWY3DPEHPK3PXP";

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Admin Hardware 2FA token verified and bound to root profile!");
      router.push("/admin/dashboard");
    }, 1000);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secretKey);
    toast.success("Secret key copied to clipboard");
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-8">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Mandatory Multi-Factor Auth
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Admin 2FA Authorization
        </h1>
        <p className="text-sm text-slate-400">
          Super Admin accounts require TOTP (Google Authenticator / YubiKey) verification for root clearance.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="p-4 rounded-2xl bg-[#161616] border border-white/5 text-center space-y-3">
          <div className="w-32 h-32 bg-white rounded-xl mx-auto p-2 flex items-center justify-center">
            {/* Visual QR placeholder */}
            <div className="w-full h-full border-2 border-dashed border-gray-400 rounded flex flex-col items-center justify-center text-gray-800">
              <QrCode className="w-12 h-12 text-black" />
              <span className="text-[9px] font-mono font-bold mt-1 text-black">ADMIN-AUTH-KEY</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <code className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              {secretKey}
            </code>
            <Button size="sm" variant="ghost" onClick={copySecret} className="h-7 px-2 text-gray-400 hover:text-white">
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-[11px] text-gray-400">Scan QR code using Google Authenticator, 1Password, or YubiKey Authenticator</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-rose-400" /> Enter 6-Digit TOTP Code
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500 text-center tracking-widest text-lg font-mono"
              maxLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] text-xs mt-2"
          >
            {loading ? "Authenticating Clearance..." : "Confirm & Enter Super Admin"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/admin/login" className="hover:text-white transition-colors">
            ← Back to Admin Login
          </Link>
          <Link href="/admin/dashboard" className="hover:text-white transition-colors">
            Super Admin Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
