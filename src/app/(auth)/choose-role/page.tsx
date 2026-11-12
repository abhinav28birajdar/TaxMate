'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  Building2,
  User,
  ArrowRight,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type RoleOption = {
  id: string;
  title: string;
  badge: string;
  description: string;
  features: string[];
  icon: React.ElementType;
};

const ROLES: RoleOption[] = [
  {
    id: 'ca',
    title: 'Chartered Accountant (CA)',
    badge: 'Service Provider',
    description:
      'For certified CAs & tax professionals managing multiple client compliance portfolios.',
    features: [
      'Client CRM & Project Management',
      'Automated GST & ITR Filing Workflows',
      'Digital Signatures & Document Vault',
      'Live Video Consultations & Billing',
    ],
    icon: Briefcase,
  },
  {
    id: 'client_business',
    title: 'Business / Enterprise Client',
    badge: 'Company & MSME',
    description:
      'For company directors, CFOs & founders seeking full-spectrum corporate tax & GST compliance.',
    features: [
      'GSTR-1, 3B & TDS Filing Tracking',
      'Dedicated Assigned CA Workspace',
      'Statement Vault & Bookkeeping',
      'Audit Trail & Statutory Reports',
    ],
    icon: Building2,
  },
  {
    id: 'client_individual',
    title: 'Individual Taxpayer',
    badge: 'Personal Finance',
    description:
      'For salaried employees, freelancers, and investors filing ITR-1 to ITR-4 effortlessly.',
    features: [
      'Form 16 & Capital Gains Vault',
      'New vs Old Regime Tax Optimizer',
      '1-on-1 CA Tax Consultations',
      'Notice Handling & Refund Tracking',
    ],
    icon: User,
  },
  {
    id: 'firm_admin',
    title: 'CA Firm / Practice Staff',
    badge: 'Multi-Client Team',
    description:
      'For CA firm teams collaborating on client returns, compliance schedules, and invoicing.',
    features: [
      'Team & Staff Workload Allocation',
      'Consolidated Billing & Settlements',
      'Shared Client Portal & Vault',
      'Enterprise Audit Logging',
    ],
    icon: Users,
  },
];

export default function ChooseRolePage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>('client_individual');
  const [loading, setLoading] = useState<boolean>(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const role = ROLES.find((r) => r.id === selectedRole);
      await fetch('/api/v1/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          step: 1,
          preferences: { selectedWorkspaceProfile: selectedRole },
          interests: role ? [role.title] : [],
          completed: false,
        }),
      }).catch(() => {});

      toast.success(`Workspace tailored for ${role?.title || selectedRole}.`);
      router.push('/accept-terms');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4">
      <div className="text-center space-y-2 mb-6">
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold px-3 py-1">
          Workspace Setup
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Choose Your TaxMate Role
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
          Select the focus area that best matches how you use TaxMate.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const active = selectedRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`text-left p-5 rounded-2xl border transition-all ${
                active
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.18)]'
                  : 'bg-[#111111]/90 border-white/10 hover:border-white/25'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{role.title}</h3>
                    <span className="text-[11px] text-emerald-400">{role.badge}</span>
                  </div>
                </div>
                {active && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-xs text-gray-400 mb-3">{role.description}</p>
              <ul className="space-y-1">
                {role.features.map((f, i) => (
                  <li key={i} className="text-[11px] text-gray-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
        >
          {loading ? 'Saving...' : 'Continue'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
