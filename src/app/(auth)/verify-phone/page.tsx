"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Phone, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function VerifyPhonePage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("+91 98210 98210");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSent, setIsSent] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Phone number verified successfully!");
      router.push("/client/dashboard");
    }, 1000);
  };

  const handleResend = () => {
    toast.info("A fresh 6-digit code has been dispatched to your mobile.");
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5" /> SMS & WhatsApp Verification
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Verify Phone Number
        </h1>
        <p className="text-sm text-slate-400">
          We&apos;ve sent a 6-digit verification code to <span className="text-white font-medium">{phoneNumber}</span>.
        </p>
      </div>

      <div className="bg-[#111111] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <Input
                key={idx}
                id={`phone-otp-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                className="w-12 h-14 text-center text-xl font-bold bg-black/50 border-white/10 text-white rounded-xl focus:border-emerald-500 shadow-inner"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.4)]"
          >
            {loading ? "Verifying Token..." : "Confirm Phone Number"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/10">
          <span>Didn&apos;t receive code?</span>
          <button
            type="button"
            onClick={handleResend}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Resend via SMS
          </button>
        </div>
      </div>
    </div>
  );
}
