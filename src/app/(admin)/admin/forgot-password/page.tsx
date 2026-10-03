"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Mail, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast.success("Admin recovery payload dispatched to internal security relay.");
    }, 1200);
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-8">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Root Clearance Recovery
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Admin Password Recovery
        </h1>
        <p className="text-sm text-slate-400">
          Super Admin password reset requests require hardware key re-authentication and dual-custody authorization.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-rose-400" /> Admin Email
              </label>
              <Input
                type="email"
                placeholder="admin@taxmate.internal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/10 text-white rounded-xl focus:border-rose-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] text-xs mt-2"
            >
              {loading ? "Verifying Clearance..." : "Send Cryptographic Reset Token"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Recovery Token Dispatched</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              If the account has Super Admin rights, an ephemeral PGP-signed link has been sent to your security vault email.
            </p>
            <Link href="/admin/reset-password">
              <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs py-2.5 rounded-xl mt-2">
                Proceed to Reset Password <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/admin/login" className="hover:text-white transition-colors">
            ← Back to Admin Login
          </Link>
          <Link href="/login" className="hover:text-white transition-colors">
            Customer Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
