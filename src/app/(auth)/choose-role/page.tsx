'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, 
  Building2, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type RoleOption = {
  id: string;
  title: string;
  badge: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  route: string;
};

const ROLES: RoleOption[] = [
  {
    id: 'ca',
    title: 'Chartered Accountant (CA)',
    badge: 'Service Provider',
    description: 'For certified CAs & tax professionals managing multiple client compliance portfolios.',
    features: [
      'Client CRM & Project Management',
      'Automated GST & ITR Filing Workflows',
      'Digital Signatures & Document Vault',
      'Live Video Consultations & Billing'
    ],
    icon: Briefcase,
    route: '/ca/dashboard'
  },
  {
    id: 'client_business',
    title: 'Business / Enterprise Client',
    badge: 'Company & MSME',
    description: 'For company directors, CFOs & founders seeking full-spectrum corporate tax & GST compliance.',
    features: [
      'GSTR-1, 3B & TDS Filing Tracking',
      'Dedicated Assigned CA Workspace',
      'Bank Statement OCR & Bookkeeping',
      'Audit Trail & Statutory Reports'
    ],
    icon: Building2,
    route: '/client/dashboard'
  },
  {
    id: 'client_individual',
    title: 'Individual Taxpayer',
    badge: 'Personal Finance',
    description: 'For salaried employees, freelancers, and investors filing ITR-1 to ITR-4 effortlessly.',
    features: [
      'Form 16 & Capital Gains Auto-Import',
      'New vs Old Regime Tax Optimizer',
      '1-on-1 CA Tax Consultations',
      'Notice Handling & Refund Tracking'
    ],
    icon: User,
    route: '/client/dashboard'
  },
  {
    id: 'firm_admin',
    title: 'CA Firm / Partner Admin',
    badge: 'Multi-Tenant Firm',
    description: 'For CA firm partners managing staff accountants, multi-branch operations, and firm revenue.',
    features: [
      'Team & Staff Workload Allocation',
      'Consolidated Billing & Escrow Payouts',
      'White-Label Client Portal & Domain',
      'Enterprise Audit Logging'
    ],
    icon: Users,
    route: '/ca/dashboard'
  }
];

export default function ChooseRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('ca');
  const [loading, setLoading] = useState<boolean>(false);

  const handleContinue = () => {
    setLoading(true);
    const role = ROLES.find(r => r.id === selectedRole);
    toast.success(`Role set as ${role?.title}!`);
    setTimeout(() => {
      router.push('/accept-terms');
    }, 600);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="text-center space-y-2 mb-8">
        <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/20 text-xs font-semibold px-3 py-1">
          Account Personalization
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
          Choose Your TaxMate Workspace Role
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          We will tailor your dashboards, compliance calendars, and automated tax tools based on how you plan to use TaxMate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`cursor-pointer rounded-3xl p-6 border-2 transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'border-lime-600 bg-lime-600/5 dark:bg-lime-950/20 shadow-md shadow-lime-600/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-lime-600 text-white shadow-md shadow-lime-600/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${
                    isSelected ? 'border-lime-600 text-lime-700 dark:text-lime-400' : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}>
                    {role.badge}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {role.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {role.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  {role.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center text-[11px] text-slate-600 dark:text-slate-400 gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-lime-600' : 'text-slate-400'}`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 flex justify-end">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  isSelected ? 'border-lime-600 bg-lime-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <span className="text-xs text-slate-500">
          Selected workspace: <strong className="text-slate-800 dark:text-slate-200">{ROLES.find(r => r.id === selectedRole)?.title}</strong>
        </span>
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="w-full sm:w-auto bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl px-8 py-5 shadow-md shadow-lime-600/30"
        >
          {loading ? 'Configuring Role...' : 'Continue to Terms Agreement'} <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
}
