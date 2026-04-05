'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Compass, FileUp, Bell, Search,
    Calendar, CheckCircle, ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const clientSteps = [
    {
        title: "How it works",
        icon: Compass,
        content: (
            <div className="grid grid-cols-1 gap-4">
                {[
                    { t: "Find an expert", d: "Browse through verified CAs or let AI match you." },
                    { t: "Secure space", d: "Each case gets a private room for chat and calls." },
                    { t: "Document Vault", d: "Encrypted storage for all your tax documents." }
                ].map((item, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {i + 1}
                        </div>
                        <div>
                            <p className="font-bold text-sm">{item.t}</p>
                            <p className="text-[11px] text-slate-500">{item.d}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    },
    {
        title: "Secure Your Documents",
        icon: FileUp,
        content: (
            <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-4">Start by uploading your PAN or ITR for faster expert matching.</p>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-2 hover:border-blue-500 cursor-pointer bg-slate-50 dark:bg-slate-950/50">
                    <FileUp className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-sm font-bold">Upload PAN / Aadhaar</p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</p>
                </div>
            </div>
        )
    },
    {
        title: "Notification Preferences",
        icon: Bell,
        content: (
            <div className="space-y-4">
                {[
                    { label: "WhatsApp Updates", sub: "Get deadline alerts on WhatsApp" },
                    { label: "Email Notifications", sub: "Summaries and case updates" },
                    { label: "Mobile Push", sub: "Instant chat & call alerts" }
                ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-sm font-bold">{pref.label}</p>
                            <p className="text-[10px] text-slate-500">{pref.sub}</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-800">
                            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }
];

export default function ClientOnboardingPage() {
    const [step, setStep] = useState(0);

    const nextStep = () => setStep(s => Math.min(s + 1, clientSteps.length - 1));

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Welcome to TaxMate AI
                </h2>
                <p className="text-slate-500">Let&apos;s personalize your financial experience.</p>
            </div>

            <ProgressDots current={step} total={clientSteps.length} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                >
                    <Card className="p-8 border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                {(() => {
                                    const Icon = clientSteps[step].icon;
                                    return <Icon className="w-6 h-6 text-blue-600" />;
                                })()}
                            </div>
                            <h3 className="text-xl font-bold">{clientSteps[step].title}</h3>
                        </div>

                        <div className="min-h-[200px]">
                            {clientSteps[step].content}
                        </div>

                        <div className="flex items-center justify-between pt-6">
                            <button
                                onClick={() => window.location.href = '/dashboard/client'}
                                className="text-sm font-medium text-slate-400 hover:text-slate-600 px-4"
                            >
                                Skip all
                            </button>
                            <Button
                                onClick={step === clientSteps.length - 1 ? () => window.location.href = '/dashboard/client' : nextStep}
                                className="bg-blue-600 px-8 flex items-center gap-2 group"
                            >
                                {step === clientSteps.length - 1 ? 'Start Exploring' : 'Next Step'}
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {step === clientSteps.length - 1 && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Recommended Expert Found
                        </p>
                        <p className="text-xs text-blue-100 leading-relaxed max-w-sm">
                            We&apos;ve found CA Anurag with expertise in GST that matches your profile.
                        </p>
                    </div>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-blue-600">
                        Book Demo
                    </Button>
                </div>
            )}
        </div>
    );
}

function ProgressDots({ current, total }: { current: number, total: number }) {
    return (
        <div className="flex justify-center gap-2">
            {[...Array(total)].map((_, i) => (
                <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200 dark:bg-slate-800'
                        }`}
                />
            ))}
        </div>
    );
}
