'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { getDashboardPathForRole } from '@/lib/auth-routing';
import { toast } from 'sonner';

export default function VerifyPhonePage() {
  const router = useRouter();
  const { role, verifyOTP } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`phone-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSendSms = async () => {
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 10) {
      toast.error('Please enter your phone number in international format (e.g. +919876543210).');
      return;
    }

    setSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ phone: cleanPhone });
      if (error) throw new Error(error.message);
      setOtpSent(true);
      toast.success(`Verification OTP sent via SMS to ${cleanPhone}`);
    } catch (err: any) {
      toast.error(err?.message || 'Could not dispatch SMS OTP');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6 || !phoneNumber.trim()) {
      toast.error('Please enter your phone number and complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(phoneNumber.trim(), code);
      router.push(getDashboardPathForRole(role));
    } catch (err: any) {
      toast.error(err?.message || 'Phone OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Phone className="w-3.5 h-3.5" /> SMS Verification
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Verify Phone Number</h1>
        <p className="text-sm text-gray-400">
          Enter your mobile number to receive a 6-digit SMS verification code.
        </p>
      </div>

      <div className="bg-[#111111]/90 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex gap-2">
          <Input
            type="tel"
            placeholder="+919876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-11 bg-black/50 border-white/15 text-white rounded-xl text-sm"
          />
          <Button
            type="button"
            variant="outline"
            disabled={sending}
            onClick={handleSendSms}
            className="h-11 border-white/15 text-emerald-400 rounded-xl shrink-0 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${sending ? 'animate-spin' : ''}`} />
            {otpSent ? 'Resend' : 'Send Code'}
          </Button>
        </div>

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
                className="w-11 h-13 text-center text-xl font-bold bg-black/50 border-white/15 text-white rounded-xl focus:border-emerald-500"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.35)]"
          >
            {loading ? 'Verifying Token...' : 'Confirm Phone Number'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center text-xs text-gray-400 pt-2 border-t border-white/10">
          <Link href="/login" className="hover:text-white transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
