'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Loader2,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, type UserRole } from '@/hooks/UnifiedAuthContext';

const registerSchema = z
  .object({
    role: z.enum(['client', 'ca', 'firm_admin']),
    fullName: z.string().trim().min(2, { message: 'Full name must be at least 2 characters' }),
    email: z.string().trim().email({ message: 'Invalid email address' }),
    phone: z.string().trim().min(10, { message: 'Enter a valid 10-digit phone number' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string(),
    firmName: z.string().optional(),
    membershipNumber: z.string().optional(),
    pan: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export function RegisterForm({
  initialRole = 'client',
}: {
  initialRole?: 'client' | 'ca' | 'firm_admin';
}) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { signUp } = useAuth();

  const paramRole = searchParams.get('role') as 'client' | 'ca' | 'firm_admin' | null;
  const activeInitialRole =
    paramRole && ['client', 'ca', 'firm_admin'].includes(paramRole) ? paramRole : initialRole;

  const [role, setRole] = useState<'client' | 'ca' | 'firm_admin'>(activeInitialRole);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: activeInitialRole,
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      firmName: '',
      membershipNumber: '',
      pan: '',
    },
  });

  useEffect(() => {
    if (paramRole && ['client', 'ca', 'firm_admin'].includes(paramRole)) {
      setRole(paramRole);
      form.setValue('role', paramRole);
    }
  }, [paramRole, form]);

  const handleRoleSwitch = (newRole: 'client' | 'ca' | 'firm_admin') => {
    setRole(newRole);
    form.setValue('role', newRole);
    setFormError(null);
  };

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    setFormError(null);

    try {
      const mappedRole: UserRole = role === 'client' ? 'CLIENT' : role === 'ca' ? 'CA' : 'STAFF';
      await signUp(values.email, values.password, values.fullName, mappedRole, {
        phone: values.phone,
        firmName: values.firmName || '',
        membershipNumber: values.membershipNumber || '',
        pan: values.pan || '',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setFormError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex p-1 bg-black/60 rounded-xl border border-white/10">
        {[
          { id: 'client', label: 'Client', icon: User },
          { id: 'ca', label: 'CA / Tax Pro', icon: ShieldCheck },
          { id: 'firm_admin', label: 'CA Firm', icon: Building2 },
        ].map((item) => {
          const Icon = item.icon;
          const active = role === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleRoleSwitch(item.id as any)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                active
                  ? 'bg-emerald-600 text-white shadow-[0_0_16px_rgba(16,185,129,0.3)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {item.label}
            </button>
          );
        })}
      </div>

      <div className="px-3.5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center justify-between font-medium">
        <span>
          Account type:{' '}
          <strong className="text-emerald-200">
            {role === 'client'
              ? 'Client (Taxpayer / Business)'
              : role === 'ca'
                ? 'Chartered Accountant'
                : 'CA Practice / Firm Staff'}
          </strong>
        </span>
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      </div>

      {formError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-semibold text-gray-300">
                  Full Legal Name *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    {...field}
                    disabled={isLoading}
                    className="h-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm"
                  />
                </FormControl>
                <FormMessage className="text-xs text-rose-400" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-300">
                    Email Address *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      {...field}
                      disabled={isLoading}
                      className="h-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-300">
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 98765 43210"
                      {...field}
                      disabled={isLoading}
                      className="h-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
          </div>

          {(role === 'ca' || role === 'firm_admin') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <FormField
                control={form.control}
                name="membershipNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs text-emerald-400 font-semibold">
                      ICAI Membership #
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ICAI-123456"
                        {...field}
                        disabled={isLoading}
                        className="h-10 text-xs font-mono uppercase bg-black/50 border-white/15 text-white rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs text-emerald-400 font-semibold">
                      PAN Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="ABCDE1234F"
                        {...field}
                        disabled={isLoading}
                        className="h-10 text-xs font-mono uppercase bg-black/50 border-white/15 text-white rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-rose-400" />
                  </FormItem>
                )}
              />
            </div>
          )}

          {role === 'firm_admin' && (
            <FormField
              control={form.control}
              name="firmName"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-300">
                    CA Firm Registered Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Registered CA Firm Name"
                      {...field}
                      disabled={isLoading}
                      className="h-10 bg-black/50 border-white/15 text-white rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-300">Password *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 chars"
                        {...field}
                        disabled={isLoading}
                        className="h-10 pr-9 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold text-gray-300">
                    Confirm Password *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repeat password"
                      {...field}
                      disabled={isLoading}
                      className="h-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm"
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-rose-400" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.28)] transition-all mt-2 text-sm"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Create {role === 'client' ? 'Client' : role === 'ca' ? 'CA Practice' : 'Firm'}{' '}
                Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
