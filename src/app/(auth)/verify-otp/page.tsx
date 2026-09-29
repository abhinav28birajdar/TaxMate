'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles, 
  Smartphone, 
  Mail,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [channel, setChannel] = useState<'phone' | 'email'>('phone');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
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

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Identity verified successfully!');
      router.push('/choose-role');
    }, 1000);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    toast.success(`New verification code sent via ${channel === 'phone' ? 'SMS / WhatsApp' : 'Email'}.`);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-lime-600/10 text-lime-600 flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            Two-Step Verification
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            We sent a 6-digit one-time password (OTP) to your registered {channel === 'phone' ? 'phone +91 ••••• ••412' : 'email a••••@domain.com'}.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant={channel === 'phone' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChannel('phone')}
              className={`text-xs rounded-xl ${
                channel === 'phone' 
                  ? 'bg-lime-600 hover:bg-lime-500 text-white font-semibold' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 mr-1" /> Via SMS / WhatsApp
            </Button>
            <Button
              type="button"
              variant={channel === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChannel('email')}
              className={`text-xs rounded-xl ${
                channel === 'email' 
                  ? 'bg-lime-600 hover:bg-lime-500 text-white font-semibold' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5 mr-1" /> Via Email
            </Button>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-extrabold rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:border-lime-600 focus:outline-none transition-colors"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold rounded-xl py-5 shadow-md shadow-lime-600/30 text-xs"
            >
              {loading ? 'Verifying OTP...' : 'Confirm & Continue'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
            <span>Didn't receive the code?</span>
            {resendTimer > 0 ? (
              <span className="font-semibold text-slate-700 dark:text-slate-300">Resend in {resendTimer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-lime-600 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            )}
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80 py-4 flex justify-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
