'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, 
    User, 
    Users, 
    Mail, 
    Phone, 
    Eye, 
    EyeOff, 
    Loader2, 
    ArrowRight,
    Lock,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/utils/supabase/client';
import { signUpSchema } from '@/lib/validators-unified';

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'CA'>('CLIENT');
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false
    });

    const validateForm = () => {
        setErrors({});
        const combinedName = `${formData.firstName} ${formData.lastName}`.trim();
        
        // Zod validation using signUpSchema
        const result = signUpSchema.safeParse({
            name: combinedName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: selectedRole,
            agreeToTerms: formData.acceptedTerms,
        });

        const newErrors: Record<string, string> = {};

        if (!result.success) {
            result.error.issues.forEach(issue => {
                const field = issue.path[0] as string;
                newErrors[field] = issue.message;
            });
        }

        // Phone number validation: Indian format check
        const cleanPhone = formData.phone.replace(/\s+/g, '');
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!cleanPhone) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(cleanPhone)) {
            newErrors.phone = 'Invalid phone number. Must be a 10-digit Indian number starting with 6-9';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please check the form for errors",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();
            
            // Build metadata matching our Postgres trigger expectations
            const metadata: any = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: formData.phone,
                role: selectedRole.toLowerCase(),
            };

            if (selectedRole === 'CA') {
                metadata.onboarding_step = 1;
                metadata.status = 'pending_onboarding';
            }

            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: metadata,
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;

            if (data.user) {
                const isEmailTaken = data.user.identities?.length === 0;
                
                toast({
                    title: isEmailTaken ? "Already Registered" : "Account Created",
                    description: isEmailTaken 
                        ? "This email is already registered. Redirecting to login."
                        : "Please check your inbox to verify your email.",
                });

                if (isEmailTaken) {
                    router.push('/login');
                } else {
                    router.push('/verify-email');
                }
            }

        } catch (error: any) {
            console.error('Registration error:', error);
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to create account. Please check your credentials.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignup = async (provider: 'google' | 'azure') => {
        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?role=${selectedRole.toLowerCase()}`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('OAuth sign-up error:', error);
            toast({
                title: "OAuth Error",
                description: error.message || "Sign-up via third-party provider failed.",
                variant: "destructive"
            });
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto space-y-6"
        >
            <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-3xl font-black uppercase tracking-tight italic text-white">
                    Create Account
                </h2>
                <p className="text-sm text-slate-400 font-medium">
                    Select your platform role and establish your credentials.
                </p>
            </div>

            {/* Custom Tab Selector */}
            <div className="relative flex p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <motion.div
                    className="absolute top-1 bottom-1 bg-primary rounded-lg z-0"
                    layoutId="activeTabGlow"
                    animate={{
                        left: selectedRole === 'CLIENT' ? '4px' : '50%',
                        right: selectedRole === 'CLIENT' ? '50%' : '4px'
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
                <button
                    type="button"
                    onClick={() => setSelectedRole('CLIENT')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-wider relative z-10 transition-colors duration-250 ${
                        selectedRole === 'CLIENT' ? 'text-black' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <User className="w-4 h-4" />
                    I am a Client
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedRole('CA')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-wider relative z-10 transition-colors duration-250 ${
                        selectedRole === 'CA' ? 'text-black' : 'text-slate-400 hover:text-white'
                    }`}
                >
                    <Briefcase className="w-4 h-4" />
                    I am a CA
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            First Name
                        </Label>
                        <Input
                            id="firstName"
                            required
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className={`bg-slate-900/50 border-slate-800 focus:border-primary/50 text-white rounded-lg h-10 ${
                                errors.name ? 'border-red-500/50' : ''
                            }`}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Last Name
                        </Label>
                        <Input
                            id="lastName"
                            required
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className={`bg-slate-900/50 border-slate-800 focus:border-primary/50 text-white rounded-lg h-10 ${
                                errors.name ? 'border-red-500/50' : ''
                            }`}
                        />
                    </div>
                </div>
                {errors.name && <p className="text-xs text-red-500 font-semibold">{errors.name}</p>}

                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Email Address
                    </Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`pl-10 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-white rounded-lg h-10 ${
                                errors.email ? 'border-red-500/50' : ''
                            }`}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-semibold">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Phone Number
                    </Label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                        <div className="flex items-center justify-center px-3 border-r border-slate-800 bg-slate-900 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            +91
                        </div>
                        <div className="relative flex-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                                id="phone"
                                type="tel"
                                required
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={`pl-10 border-none bg-transparent focus:ring-0 focus:border-none text-white h-10 ${
                                    errors.phone ? 'border-red-500/50' : ''
                                }`}
                            />
                        </div>
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 font-semibold">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={`pl-10 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-white rounded-lg h-10 ${
                                errors.password ? 'border-red-500/50' : ''
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Confirm Password
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            id="confirmPassword"
                            type="password"
                            required
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={`pl-10 bg-slate-900/50 border-slate-800 focus:border-primary/50 text-white rounded-lg h-10 ${
                                errors.confirmPassword ? 'border-red-500/50' : ''
                            }`}
                        />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 font-semibold">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start gap-2 pt-2">
                    <Checkbox
                        id="terms"
                        checked={formData.acceptedTerms}
                        onCheckedChange={(checked) => setFormData({ ...formData, acceptedTerms: checked as boolean })}
                        className="border-slate-800 data-[state=checked]:bg-primary data-[state=checked]:text-black mt-0.5"
                    />
                    <Label
                        htmlFor="terms"
                        className="text-xs font-medium text-slate-400 leading-snug cursor-pointer select-none"
                    >
                        I accept the <Link href="/terms" className="text-primary hover:underline font-bold">Terms & Conditions</Link> and agree to data storage policies.
                    </Label>
                </div>
                {errors.agreeToTerms && <p className="text-xs text-red-500 font-semibold">{errors.agreeToTerms}</p>}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/95 text-black font-black uppercase tracking-wider text-xs h-11 rounded-lg mt-4 flex items-center justify-center gap-1.5"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-black" />
                            Provisioning Account...
                        </>
                    ) : (
                        <>
                            Register Profile
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </form>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-slate-500 bg-background px-2">
                    Or sign up with
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuthSignup('google')}
                    className="bg-slate-900/40 border-slate-800 hover:border-slate-700 text-white font-bold text-xs h-10 rounded-lg"
                >
                    Google
                </Button>
                <Button
                    variant="outline"
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuthSignup('azure')}
                    className="bg-slate-900/40 border-slate-800 hover:border-slate-700 text-white font-bold text-xs h-10 rounded-lg"
                >
                    Microsoft
                </Button>
            </div>

            {/* CA Firm Callout */}
            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl flex items-center justify-between text-left group hover:border-primary/30 transition-colors duration-250">
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">CA Organization</p>
                    <p className="text-xs font-bold text-white">Registering a CA Firm?</p>
                    <p className="text-[10px] text-slate-400">Establish a multi-CA managed firm account.</p>
                </div>
                <Link href="/register/firm">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-10 h-10 border border-slate-800 text-slate-400 group-hover:text-primary group-hover:border-primary/50 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <Building2 className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            <p className="text-center text-xs text-slate-400 font-medium pt-2">
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-primary hover:underline">
                    Sign in
                </Link>
            </p>
        </motion.div>
    );
}
