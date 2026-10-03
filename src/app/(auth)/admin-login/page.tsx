"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@taxmate.internal");
  const [password, setPassword] = useState("••••••••••••");
  const [securityToken, setSecurityToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Admin clearance verified. Entering Super Admin Console...");
      router.push("/admin/dashboard");
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Restricted System Access
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Super Admin Console
        </h1>
        <p className="text-sm text-slate-400">
          Enter root-level credentials with YubiKey / TOTP authorization token.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-rose-400" /> Admin Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Root Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-rose-400" /> Hardware / Authenticator 6-Digit Code
            </label>
            <Input
              type="text"
              placeholder="e.g. 849201"
              value={securityToken}
              onChange={(e) => setSecurityToken(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl tracking-widest text-center text-lg focus:border-rose-500"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] mt-2"
          >
            {isLoading ? "Authenticating Clearance..." : "Authorize Admin Session"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/admin/forgot-password" className="hover:text-rose-400 transition-colors">
            Forgot Password?
          </Link>
          <Link href="/admin/2fa" className="hover:text-rose-400 transition-colors">
            Configure 2FA Token →
          </Link>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
          <Link href="/login" className="hover:text-white transition-colors">
            ← Back to Customer Login
          </Link>
          <span className="text-[11px]">Security Clearance Level 4</span>
        </div>
      </div>
    </div>
  );
}
