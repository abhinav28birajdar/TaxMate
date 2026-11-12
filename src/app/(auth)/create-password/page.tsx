'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, KeyRound, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

function CreatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const supabase = useMemo(() => createClient(), []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains at least 1 uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains at least 1 number', met: /[0-9]/.test(password) },
    { label: 'Contains at least 1 special character (!@#$%^&*)', met: /[^A-Za-z0-9]/.test(password) },
    { label: 'Passwords match exactly', met: password.length > 0 && password === confirmPassword },
  ];

  const allMet = checks.every((c) => c.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMet) {
      toast.error('Please satisfy all password security criteria');
      return;
    }

    setLoading(true);
    try {
      const apiRes = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...(token ? { token } : {}),
          newPassword: password,
        }),
      });

      const apiJson = await apiRes.json().catch(() => ({}));
      if (!apiRes.ok) {
        // Fallback to Supabase active recovery session if token wasn't passed explicitly
        if (!token && apiRes.status === 401) {
          const { error: supErr } = await supabase.auth.updateUser({ password });
          if (supErr) throw new Error(supErr.message);
        } else {
          throw new Error(apiJson.error || 'Password update failed');
        }
      }

      toast.success('New password saved! Please sign in with your new credentials.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <KeyRound className="w-3.5 h-3.5" /> Credential Hardening
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Create New Password</h1>
        <p className="text-sm text-gray-400">
          Establish a strong password to protect your tax returns and financial vault.
        </p>
      </div>

      <div className="bg-[#111111]/90 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> New Password
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-white text-xs"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-black/50 border-white/15 text-white rounded-xl focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Confirm New Password
            </label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 bg-black/50 border-white/15 text-white rounded-xl focus:border-emerald-500"
              required
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Security Requirements
            </span>
            {checks.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    item.met ? 'text-emerald-400' : 'text-gray-600'
                  }`}
                />
                <span className={item.met ? 'text-gray-200 font-medium' : 'text-gray-500'}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !allMet}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.35)] mt-2"
          >
            {loading ? 'Saving Password...' : 'Save Password & Sign In'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <Link href="/login" className="text-xs text-gray-400 hover:text-white">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/5" />}>
      <CreatePasswordContent />
    </Suspense>
  );
}
