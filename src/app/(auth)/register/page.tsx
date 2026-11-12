import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { UserPlus } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account - TaxMate',
  description: 'Create your TaxMate Client or Chartered Accountant account.',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">
          <UserPlus className="w-3.5 h-3.5" /> New Account Setup
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Create your account
        </h1>
        <p className="text-sm text-gray-400">
          Select your role and enter your verified details to get started.
        </p>
      </div>

      <div className="bg-[#111111]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/10 shadow-[0_0_50px_-15px_rgba(16,185,129,0.18)] space-y-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-white/5" />}>
          <RegisterForm />
        </Suspense>
      </div>

      <div className="space-y-3 text-center text-xs text-gray-400">
        <p className="px-4 leading-relaxed">
          By registering, you agree to our{' '}
          <Link
            href="/terms-of-service"
            className="text-gray-300 underline underline-offset-4 hover:text-emerald-400 transition-colors"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy-policy"
            className="text-gray-300 underline underline-offset-4 hover:text-emerald-400 transition-colors"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="pt-3 border-t border-white/10">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-emerald-400 font-semibold hover:text-emerald-300 underline underline-offset-4 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
