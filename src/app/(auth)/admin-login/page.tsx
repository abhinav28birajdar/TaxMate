"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { normalizeRole } from "@/lib/auth-routing";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityToken, setSecurityToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        throw new Error(error?.message || "Invalid administrator credentials");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, two_factor_enabled")
        .eq("id", data.user.id)
        .maybeSingle();

      const resolvedRole = normalizeRole(
        profile?.role || data.user.app_metadata?.role || data.user.user_metadata?.role
      );

      if (resolvedRole !== "SUPER_ADMIN") {
        await supabase.auth.signOut();
        throw new Error("Access denied: This account does not hold administrator privileges.");
      }

      if (profile?.two_factor_enabled) {
        if (securityToken.trim().length !== 6) {
          await supabase.auth.signOut();
          throw new Error("Please enter your 6-digit authenticator code for this admin account.");
        }
        const verifyRes = await fetch("/api/auth/verify-2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: securityToken.trim() }),
        });
        const verifyJson = await verifyRes.json();
        if (!verifyRes.ok || !verifyJson.success) {
          await supabase.auth.signOut();
          throw new Error(verifyJson.error || "Invalid 2FA authenticator code.");
        }
      }

      toast.success("Admin clearance verified. Entering Super Admin Console...");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      const message = err?.message || "Admin authentication failed";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Restricted System Access
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Super Admin Console
        </h1>
        <p className="text-sm text-gray-400">
          Authenticate with a verified TaxMate administrator account.
        </p>
      </div>

      <div className="bg-[#111111]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-5">
        {errorMsg && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-rose-400" /> Admin Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              className="h-11 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-rose-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400" /> Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="h-11 pr-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl focus:border-rose-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-rose-400" /> Authenticator 6-Digit Code (if 2FA active)
            </label>
            <Input
              type="text"
              placeholder="000000"
              value={securityToken}
              onChange={(e) => setSecurityToken(e.target.value.replace(/\D/g, ""))}
              className="h-11 bg-black/50 border-white/15 text-white placeholder:text-gray-600 rounded-xl tracking-widest text-center text-base font-mono focus:border-rose-500"
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.35)] mt-2"
          >
            {isLoading ? "Authenticating Clearance..." : "Authorize Admin Session"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/admin/forgot-password" className="hover:text-rose-400 transition-colors">
            Forgot Password?
          </Link>
          <Link href="/2fa-setup" className="hover:text-rose-400 transition-colors">
            Configure 2FA Token →
          </Link>
        </div>

        <div className="pt-1 flex items-center justify-between text-xs text-gray-500">
          <Link href="/login" className="hover:text-white transition-colors">
            ← Back to Standard Login
          </Link>
          <span className="text-[11px]">RBAC Protected</span>
        </div>
      </div>
    </div>
  );
}
