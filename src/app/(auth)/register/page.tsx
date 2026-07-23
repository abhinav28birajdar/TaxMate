import { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register - TaxMate',
  description: 'Create your TaxMate Client or CA Professional account.',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Create an account
        </h1>
        <p className="text-sm text-slate-400">
          Select your user type and enter your details to get started.
        </p>
      </div>

      <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-6">
        <RegisterForm />
      </div>

      <div className="space-y-3 text-center text-xs text-slate-400">
        <p className="px-4 leading-relaxed">
          By registering, you agree to our{' '}
          <Link href="/terms-of-service" className="text-slate-300 underline underline-offset-4 hover:text-lime-400 transition-colors">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy-policy" className="text-slate-300 underline underline-offset-4 hover:text-lime-400 transition-colors">
            Privacy Policy
          </Link>.
        </p>

        <div className="pt-2 border-t border-slate-800/60">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-lime-400 font-bold hover:text-lime-300 underline underline-offset-4 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}