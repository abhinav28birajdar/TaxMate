import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In - TaxMate',
  description: 'Sign in to your TaxMate Client or Chartered Accountant workspace.',
};

export default function LoginPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Secure Portal Sign In
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-gray-400">
          Sign in with your registered email and password to access your workspace.
        </p>
      </div>

      <div className="bg-[#111111]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_-15px_rgba(16,185,129,0.18)] space-y-6">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-white/5" />}>
          <LoginForm />
        </Suspense>
      </div>

      <div className="pt-2 space-y-3 text-center text-xs text-gray-400">
        <p>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-4 transition-colors"
          >
            Create free account
          </Link>
        </p>
        <div className="pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-gray-500">
          <Link href="/admin-login" className="hover:text-gray-300 transition-colors">
            Admin Console Login
          </Link>
          <span>•</span>
          <Link href="/help" className="hover:text-gray-300 transition-colors">
            Need Help?
          </Link>
        </div>
      </div>
    </div>
  );
}
