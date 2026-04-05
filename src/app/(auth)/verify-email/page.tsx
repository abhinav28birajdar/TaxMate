'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function VerifyEmailPage() {
    const router = useRouter();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [cooldown, setCooldown] = useState(60);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        // Simulate API call
        setTimeout(() => {
            setIsVerifying(false);
            setIsDone(true);
            setTimeout(() => router.push('/dashboard/client'), 2000);
        }, 1500);
    };

    if (isDone) {
        return (
            <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Email Verified!</h2>
                    <p className="text-slate-500">Redirecting you to your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="text-left">
                <Link href="/register" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">

                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to registration
                </Link>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Verify your email
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    We&apos;ve sent a 6-digit code to <span className="font-semibold text-slate-900 dark:text-white">john@example.com</span>
                </p>
            </div>

            <div className="flex justify-between gap-2 md:gap-4">
                {otp.map((digit, idx) => (
                    <input
                        key={idx}
                        ref={el => { inputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(idx, e.target.value)}
                        onKeyDown={e => handleKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-input dark:border-input bg-background dark:bg-card dark:text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all"
                    />
                ))}
            </div>

            <div className="space-y-4">
                <Button
                    onClick={handleVerify}
                    disabled={isVerifying || otp.some(d => !d)}
                    className="w-full h-12 bg-primary hover:bg-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                    {isVerifying ? 'Verifying...' : 'Verify Account'}
                </Button>

                <div className="text-center space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Didn&apos;t receive the code?{' '}
                        {cooldown > 0 ? (
                            <span className="text-slate-400 font-medium whitespace-nowrap">Resend in {cooldown}s</span>
                        ) : (
                            <button
                                onClick={() => setCooldown(60)}
                                className="text-primary hover:underline font-semibold flex items-center justify-center gap-1 mx-auto"
                            >
                                <RefreshCw className="w-3 h-3" /> Resend now
                            </button>
                        )}
                    </p>
                    <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                        Change email address
                    </button>
                </div>
            </div>
        </div>
    );
}
