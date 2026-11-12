'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useAuth } from '@/hooks/UnifiedAuthContext';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'sent'>('request');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await resetPassword(email.trim());
      setStep('sent');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to send reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="text-left">
        <Link
          href="/login"
          className="inline-flex items-center text-xs text-gray-400 hover:text-emerald-400 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to login
        </Link>

        {step === 'request' ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Enter your registered email and we&apos;ll send a secure reset link.
            </p>
          </>
        ) : (
          <div className="text-center space-y-3 pt-2">
            <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Check your email
            </h1>
            <p className="text-sm text-gray-400">
              We&apos;ve sent password reset instructions to{' '}
              <span className="font-semibold text-white">{email}</span>.
            </p>
          </div>
        )}
      </div>

      <div className="bg-[#111111]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-5">
        {errorMsg && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="pl-10 h-11 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm focus:border-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.28)]"
            >
              {isLoading ? 'Sending instructions...' : 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Button
              asChild
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
            >
              <a href="mailto:">Open Email App</a>
            </Button>
            <p className="text-center text-xs text-gray-400">
              Didn&apos;t receive the email?{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={isLoading}
                className="text-emerald-400 font-semibold hover:underline disabled:opacity-60"
              >
                Click to resend
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
