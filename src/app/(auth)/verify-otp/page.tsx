'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, RefreshCw, Mail, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { getDashboardPathForRole } from '@/lib/auth-routing';
import { toast } from 'sonner';

export default function VerifyOTPPage() {
  const router = useRouter();
  const { user, role, verifyOTP } = useAuth();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [channel, setChannel] = useState<'email' | 'phone'>('email');
  const [target, setTarget] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (user?.email && !target) {
      setTarget(user.email);
    }
  }, [user, target]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;
    const digits = pastedData.split('');
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);
    if (digits.length < 6) {
      inputRefs.current[digits.length]?.focus();
    }
  };

  const handleSendOtp = async () => {
    if (!target.trim()) {
      toast.error(
        channel === 'email'
          ? 'Please enter your email address first.'
          : 'Please enter your phone number in E.164 format (+91...).'
      );
      return;
    }

    setSending(true);
    try {
      if (channel === 'email') {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: target.trim() }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to dispatch OTP email');
      } else {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOtp({ phone: target.trim() });
        if (error) throw new Error(error.message);
      }
      setResendTimer(30);
      toast.success(`Verification OTP dispatched via ${channel === 'email' ? 'Email' : 'SMS'}.`);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6 || !target.trim()) {
      toast.error('Please provide your destination and complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      if (channel === 'email') {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: target.trim(), otp: code }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Invalid or expired OTP');
        }
        toast.success('Email OTP verified successfully!');
      } else {
        await verifyOTP(target.trim(), code);
      }

      router.push(user ? getDashboardPathForRole(role) : '/choose-role');
    } catch (err: any) {
      toast.error(err?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-white/10 bg-[#111111]/90 text-white shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1 border border-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Two-Step Verification</CardTitle>
          <CardDescription className="text-xs text-gray-400">
            Verify your identity with a 6-digit one-time password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant={channel === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChannel('email')}
              className={`text-xs rounded-xl ${
                channel === 'email'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
                  : 'border-white/15 bg-black/40 text-gray-300'
              }`}
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" /> Email OTP
            </Button>
            <Button
              type="button"
              variant={channel === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChannel('phone')}
              className={`text-xs rounded-xl ${
                channel === 'phone'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
                  : 'border-white/15 bg-black/40 text-gray-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 mr-1.5" /> Phone SMS
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type={channel === 'email' ? 'email' : 'tel'}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={channel === 'email' ? 'name@company.com' : '+919876543210'}
              className="h-10 bg-black/50 border-white/15 text-white text-xs rounded-xl"
            />
            <Button
              type="button"
              variant="outline"
              disabled={sending || resendTimer > 0}
              onClick={handleSendOtp}
              className="border-white/15 text-emerald-400 text-xs rounded-xl shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${sending ? 'animate-spin' : ''}`} />
              {resendTimer > 0 ? `${resendTimer}s` : 'Send OTP'}
            </Button>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <Input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-lg font-bold bg-black/50 border-white/15 text-white rounded-xl focus:border-emerald-500"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
            >
              {loading ? 'Verifying...' : 'Verify OTP Code'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
