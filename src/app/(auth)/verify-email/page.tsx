'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/UnifiedAuthContext';

export default function VerifyEmailPage() {
  const { resendEmailVerification } = useAuth();
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    setEmail(window.localStorage.getItem('taxmate.pendingVerificationEmail') || '');
  }, []);

  async function handleResend(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    setIsSending(true);
    try {
      await resendEmailVerification(email);
      setSent(true);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Mail className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Check your email</h1>
        <p className="text-sm leading-6 text-slate-400">
          We sent a secure verification link to your email address. Open it to verify your account and continue to your TaxMate dashboard.
        </p>
      </div>
      <form onSubmit={handleResend} className="space-y-3 text-left">
        <label htmlFor="verification-email" className="text-xs font-medium text-slate-300">Email address</label>
        <Input id="verification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@example.com" />
        <Button type="submit" disabled={isSending} className="w-full">
          <RefreshCw className={isSending ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          {isSending ? 'Sending...' : 'Resend verification email'}
        </Button>
        {sent && <p className="text-center text-xs text-emerald-400">A new verification link has been sent.</p>}
      </form>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        After verification, you will be redirected automatically.
      </div>
      <Link href="/login" className="text-sm font-medium text-primary hover:underline">Back to login</Link>
    </div>
  );
}
