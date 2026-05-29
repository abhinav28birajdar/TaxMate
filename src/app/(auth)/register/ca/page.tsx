'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { signUpSchema } from '@/lib/validators-unified';
import type { SignUpInput } from '@/lib/validators-unified';

export default function CARegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

    // Step 1 Data
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
        
        // Combine names for validation
        const combinedName = `${formData.firstName} ${formData.lastName}`.trim();
        
        const result = signUpSchema.safeParse({
            name: combinedName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: 'CA',
            agreeToTerms: formData.acceptedTerms,
        });

        if (!result.success) {
            const formErrors: typeof errors = {};
            result.error.issues.forEach(issue => {
                const field = issue.path[0] as string;
                formErrors[field] = issue.message;
            });
            setErrors(formErrors);
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
            
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        phone: formData.phone,
                        role: 'ca',
                        onboarding_step: 1,
                        status: 'pending_onboarding'
                    },
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;

            if (data.user) {
                toast({
                    title: "Account Created",
                    description: data.user.identities?.length === 0 
                        ? "This email is already registered. Please login instead."
                        : "Please complete your profile details.",
                });

                // Redirect to onboarding to complete profile
                router.push('/auth/onboarding/ca');
            }

        } catch (error: any) {
            console.error('CA Registration error:', error);
            toast({
                title: "Registration Failed",
                description: error.message || "Failed to create account. Please check your internet connection and try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md mx-auto space-y-6"
        >
            <div className="flex items-center gap-2 mb-6">
                <Link href="/register">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <span className="text-sm font-medium text-muted-foreground">Back to role selection</span>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">CA Partner Registration</h2>
                <p className="text-muted-foreground">
                    Step 1: Create your secure account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                required
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                required
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className={errors.name ? 'border-red-500' : ''}
                            />
                        </div>
                    </div>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? 'border-red-500' : ''}
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex gap-2">
                            <div className="flex items-center justify-center px-3 border rounded-md bg-muted text-muted-foreground text-sm font-medium">
                                +91
                            </div>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                placeholder="98765 43210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                minLength={8}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        <p className="text-[0.8rem] text-muted-foreground">
                            Must be at least 8 characters, with uppercase, lowercase, and numbers.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            required
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="terms"
                            checked={formData.acceptedTerms}
                            onCheckedChange={(checked) => setFormData({ ...formData, acceptedTerms: checked as boolean })}
                        />
                        <label
                            htmlFor="terms"
                            className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            I accept the <Link href="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                        </label>
                    </div>
                    {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account & Continue"}
                </Button>
            </form>
        </motion.div>
    );
}
