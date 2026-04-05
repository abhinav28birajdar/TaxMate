'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Side - Visuals */}
            <div className="hidden lg:flex relative bg-primary flex-col justify-between p-12 text-primary-foreground overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-white mb-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        TaxMate
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6 max-w-lg"
                    >
                        <h1 className="text-5xl font-bold tracking-tight leading-tight">
                            Manage your practice with <span className="italic">precision.</span>
                        </h1>
                        <p className="text-xl text-primary-foreground/80">
                            Join 12,000+ Chartered Accountants delivering excellence with the world's most advanced financial platform.
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative z-10 space-y-4"
                >
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/20"></div>
                            ))}
                        </div>
                        <p>Trusted by professionals across India</p>
                    </div>

                    <div className="space-y-2">
                        {[
                            "Military-grade Data Security",
                            "Real-time Client Collaboration",
                            "Automated Compliance Tracking"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-300" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
                <div className="w-full max-w-md space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
