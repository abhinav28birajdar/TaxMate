'use client';

import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useAuth } from '@/hooks/UnifiedAuthContext';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<'request' | 'sent'>('request');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await resetPassword(email);
            setStep('sent');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) return;
        setIsLoading(true);

        try {
            await resetPassword(email);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="text-left">
                <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">

                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                </Link>

                {step === 'request' && (
                    <>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Forgot password?
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            No worries, we&apos;ll send you reset instructions.
                        </p>
                    </>
                )}

                {step === 'sent' && (
                    <div className="text-center space-y-4 pt-4">
                        <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Check your email
                        </h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            We&apos;ve sent a password reset link to <br /><span className="font-semibold text-slate-900 dark:text-white">{email}</span>
                        </p>
                    </div>
                )}

            </div>

            {step === 'request' && (
                <form onSubmit={handleRequest} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                type="email"
                                required
                                placeholder="name@company.com"
                                className="pl-10 h-12"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20"
                    >
                        {isLoading ? 'Sending...' : 'Reset password'}
                    </Button>
                </form>
            )}

            {step === 'sent' && (
                <div className="space-y-6">
                    <Button
                        asChild
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20"
                    >
                        <a href="mailto:">Open email app</a>
                    </Button>
                    <p className="text-center text-sm text-slate-500">
                        Didn&apos;t receive the email?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isLoading}
                            className="text-primary font-bold hover:underline disabled:opacity-60"
                        >
                            Click to resend
                        </button>
                    </p>
                </div>
            )}
        </div>
    );
}
