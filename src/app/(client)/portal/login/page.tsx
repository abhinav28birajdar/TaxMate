'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldAlert, KeyRound, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function PortalLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;

            toast.success('Access granted. Authenticated successfully.');

            // Check metadata role and direct accordingly
            const userRole = data.user?.app_metadata?.role || 'client';
            
            if (userRole === 'client') {
                const redirectTo = searchParams.get('redirectTo') || '/portal/dashboard';
                router.push(redirectTo);
            } else {
                toast.warning('Operator account detected. Redirecting to CA Dashboard...');
                router.push('/dashboard');
            }
            router.refresh();
        } catch (error: any) {
            console.error('Portal login error:', error);
            toast.error(error.message || 'Access denied. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-600 rounded-full blur-[140px]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Tech logo frame */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-12 h-12 bg-lime-600/10 border border-lime-600/30 rounded flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-lime-500" />
                        <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-lime-600" />
                        <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-lime-600" />
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-[0.2em] italic text-foreground">
                        TaxMate <span className="text-lime-500">Client Portal</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                        SECURED CLIENT VERIFICATION GATEWAY
                    </p>
                </div>

                <div className="relative bg-slate-900 border border-slate-800 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                    {/* Glowing corners */}
                    <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-lime-600" />
                    <div className="absolute -top-px -right-px w-3 h-3 border-t-2 border-r-2 border-lime-600" />
                    <div className="absolute -bottom-px -left-px w-3 h-3 border-b-2 border-l-2 border-lime-600" />
                    <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-lime-600" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                                ENTER USER EMAIL
                            </Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-lime-500 transition-colors" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="client@taxmate.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 pl-10 h-11 rounded-none text-xs text-white tracking-wide placeholder:text-slate-600 transition-all font-sans"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                                    ENTER PIN / PASSWORD
                                </Label>
                                <Link href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-lime-500 hover:text-lime-400 transition-colors">
                                    FORGOT PASSWORD?
                                </Link>
                            </div>
                            <div className="relative group">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-lime-500 transition-colors" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 pl-10 h-11 rounded-none text-xs text-white tracking-wide placeholder:text-slate-600 transition-all font-sans"
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    VERIFY & CONNECT
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            CA PRACTICE OWNER?{' '}
                            <Link href="/login" className="text-lime-500 hover:text-lime-400 font-black underline transition-colors ml-1">
                                GO TO OPERATOR PORTAL
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer status */}
                <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
                    <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">
                        TAX_GATEWAY_NODE_ONLINE: V2.1.0
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
