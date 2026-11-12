'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not initiate reset');
      setSent(true);
      toast.success('Password reset instructions sent if the account exists.');
    } catch (err: any) {
      toast.error(err?.message || 'Reset request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800 p-6 sm:p-8 space-y-6">
        <Link href="/admin-login" className="inline-flex items-center text-xs text-slate-400 hover:text-lime-400">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Admin Login
        </Link>

        <div>
          <h1 className="text-xl font-bold text-slate-100">Admin Password Recovery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Enter your administrator email address to receive a secure password reset link.
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-lime-600/10 border border-lime-500/30 text-center space-y-3">
            <CheckCircle2 className="w-9 h-9 text-lime-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-100">Check Your Inbox</p>
            <p className="text-xs text-slate-400">
              If an administrator account matches <strong className="text-slate-200">{email}</strong>, a recovery link has been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="pl-10 bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending Link...
                </>
              ) : (
                'Send Recovery Link'
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
