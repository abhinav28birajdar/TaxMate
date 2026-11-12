'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { toast } from 'sonner';

export default function SessionExpiredPage() {
  const router = useRouter();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleQuickUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (email || user?.email || '').trim();
    if (!targetEmail || !password) {
      toast.error('Please enter your email and password to sign back in.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(targetEmail, password);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Unable to re-authenticate.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-md mx-auto py-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" /> Security Timeout
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Session Expired</h1>
        <p className="text-sm text-gray-400">
          For your data privacy and compliance, please re-authenticate to continue to your workspace.
        </p>
      </div>

      <div className="bg-[#111111]/90 p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <form onSubmit={handleQuickUnlock} className="space-y-4">
          {!user?.email && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Account Email
              </label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-black/50 border-white/15 text-white rounded-xl"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
            </label>
            <Input
              type="password"
              placeholder="Enter password to resume"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 bg-black/50 border-white/15 text-white rounded-xl focus:border-amber-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] text-sm"
          >
            {isLoading ? 'Restoring Session...' : 'Sign In & Resume'}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <Link href="/login" className="hover:text-white transition-colors">
            Full Login Page
          </Link>
          <Link href="/landing" className="hover:text-white transition-colors">
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}
