"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, KeyRound, ShieldCheck, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function CreatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains at least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains at least 1 number", met: /[0-9]/.test(password) },
    { label: "Contains at least 1 special character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
    { label: "Passwords match exactly", met: password.length > 0 && password === confirmPassword }
  ];

  const allMet = checks.every((c) => c.met);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMet) {
      toast.error("Please satisfy all password security criteria");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("New password successfully encrypted and saved!");
      router.push("/login");
    }, 1000);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <KeyRound className="w-3.5 h-3.5" /> Credential Hardening
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Create New Password
        </h1>
        <p className="text-sm text-slate-400">
          Establish a high-entropy password to protect your tax returns and financial vault.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> New Password</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white text-xs"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Confirm New Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-emerald-500"
              required
            />
          </div>

          {/* Validation Checklist */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Security Requirements
            </span>
            {checks.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    item.met ? "text-emerald-400" : "text-gray-600"
                  }`}
                />
                <span className={item.met ? "text-gray-200 font-medium" : "text-gray-500"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !allMet}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)] mt-2"
          >
            {loading ? "Encrypting & Storing..." : "Save Password & Sign In"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400">
          <Link href="/login" className="text-emerald-400 hover:underline">
            ← Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
