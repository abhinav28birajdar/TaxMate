"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, KeyRound, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Root password updated successfully! Please re-authenticate.");
      router.push("/admin/login");
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-8">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Root Credential Rotation
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Reset Admin Password
        </h1>
        <p className="text-sm text-slate-400">
          Enter the cryptographically signed recovery token along with your new root password.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-rose-400" /> Security Token
            </label>
            <Input
              type="text"
              placeholder="e.g. SEC-TOKEN-8812-X"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500 font-mono"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> New Root Password
            </label>
            <Input
              type="password"
              placeholder="Minimum 16 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Confirm New Password
            </label>
            <Input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] text-xs mt-2"
          >
            {loading ? "Rotating Key..." : "Update Root Credentials"}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/admin/login" className="hover:text-white transition-colors">
            ← Back to Admin Login
          </Link>
          <Link href="/admin/2fa" className="hover:text-white transition-colors">
            Configure 2FA Token →
          </Link>
        </div>
      </div>
    </div>
  );
}
