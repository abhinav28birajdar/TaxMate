'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, ShieldCheck, Building2, ArrowRight, CheckCircle2 } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuth, type UserRole } from '@/hooks/UnifiedAuthContext';

const registerSchema = z.object({
  role: z.enum(['client', 'ca', 'firm_admin']),
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  phone: z.string().min(10, { message: 'Enter a valid 10-digit phone number' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
  firmName: z.string().optional(),
  membershipNumber: z.string().optional(),
  pan: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export function RegisterForm({ initialRole = 'client' }: { initialRole?: 'client' | 'ca' | 'firm_admin' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const paramRole = searchParams.get('role') as 'client' | 'ca' | 'firm_admin' | null;
  const activeInitialRole = paramRole || initialRole;

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
    const roleLabels = {
      client: 'Taxpayer / Business Client',
      ca: 'CA / Tax Professional',
      firm_admin: 'CA Firm Practice Admin',
    };
    toast.info(`Switched registration role to ${roleLabels[newRole]}`);
  };

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);

    try {
      const mappedRole: UserRole = role === 'client' ? 'CLIENT' : role === 'ca' ? 'CA' : 'STAFF';
      await signUp(values.email, values.password, values.fullName, mappedRole);
      toast.success('Registration successful. Check your email to verify your account.');
      router.push('/verify-email');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => handleRoleSwitch('client')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            role === 'client'
              ? 'bg-lime-600 text-white shadow-md shadow-lime-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <User className="w-4 h-4" /> Client
        </button>
        <button
          type="button"
          onClick={() => handleRoleSwitch('ca')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            role === 'ca'
              ? 'bg-lime-600 text-white shadow-md shadow-lime-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> CA / Tax Pro
        </button>
        <button
          type="button"
          onClick={() => handleRoleSwitch('firm_admin')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
            role === 'firm_admin'
              ? 'bg-lime-600 text-white shadow-md shadow-lime-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" /> CA Firm Admin
        </button>
      </div>

      <div className="p-3 bg-lime-600/10 border border-lime-500/30 rounded-xl text-xs text-lime-700 dark:text-lime-400 flex items-center justify-between font-semibold">
        <span>
          Registering as: <strong>{role === 'client' ? 'Client (Taxpayer / Business)' : role === 'ca' ? 'Chartered Accountant (Individual Practice)' : 'CA Accounting Firm'}</strong>
        </span>
        <CheckCircle2 className="w-4 h-4 text-lime-600" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Full Legal Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Abhinav Birajdar" {...field} disabled={isLoading} className="text-xs" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Email Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} disabled={isLoading} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Phone Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} disabled={isLoading} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {(role === 'ca' || role === 'firm_admin') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-lime-600/10 border border-lime-600/20 rounded-xl">
              <FormField
                control={form.control}
                name="membershipNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-lime-700 dark:text-lime-400 font-bold">ICAI Reg / Membership # *</FormLabel>
                    <FormControl>
                      <Input placeholder="ICAI-123456" {...field} disabled={isLoading} className="text-xs font-mono uppercase bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-lime-700 dark:text-lime-400 font-bold">PAN Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCDE1234F" {...field} disabled={isLoading} className="text-xs font-mono uppercase bg-white dark:bg-slate-900" />
                    </FormControl>
                    <FormMessage />
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
                <FormItem>
                  <FormLabel className="text-xs font-bold text-slate-900 dark:text-white">CA Firm Registered Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Apex Tax & Audit Services Pvt Ltd" {...field} disabled={isLoading} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Confirm Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} className="text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full bg-lime-600 hover:bg-lime-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-lime-600/20 mt-2 text-xs" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Complete {role === 'client' ? 'Client' : role === 'ca' ? 'CA Practice' : 'Firm Admin'} Registration
                <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}