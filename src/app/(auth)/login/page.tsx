import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login - TaxMate',
  description: 'Login to your TaxMate account.',
};

export default function LoginPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Welcome back
        </h1>
        <p className="text-sm text-slate-400">
          Enter your email and password to sign in to TaxMate
        </p>
      </div>

      <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-6">
        <LoginForm />
      </div>

      <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/60">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-4 transition-colors">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
