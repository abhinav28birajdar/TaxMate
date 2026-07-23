'use client';

import { useState } from 'react';
import { CreditCard, Check, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SaaSPlansPage() {
  const plans = [
    { id: 'p1', name: 'Free Starter', priceMonthly: '₹0', priceYearly: '₹0', users: '1 CA', clients: 'Up to 10 Clients', storage: '2 GB Storage', features: ['Basic GST Returns', 'ITR 1 & 4 Filing', 'Community Support'] },
    { id: 'p2', name: 'Pro Practice', priceMonthly: '₹1,999', priceYearly: '₹19,990', users: '5 CA / Staff Users', clients: 'Up to 250 Clients', storage: '50 GB Vault Storage', features: ['All GST & ITR Forms', 'Double-Entry Ledger Accounting', 'LiveKit Video Consultations', 'Gemini AI Tax Assistant', 'WhatsApp Notifications'] },
    { id: 'p3', name: 'Enterprise Firm', priceMonthly: '₹4,999', priceYearly: '₹49,990', users: 'Unlimited Users', clients: 'Unlimited Clients', storage: '500 GB Storage', features: ['Custom Domain Branding', 'Dedicated Account Manager', 'Custom API Integrations', 'Full Audit Log Export', 'Priority SLA'] },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-lime-400" /> SaaS Subscription Plans
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure pricing tiers, features, client limits, and storage quotas.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-2" /> Add New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{p.name}</h3>
                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-lime-400">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-3xl font-extrabold text-white">
                {p.priceMonthly} <span className="text-xs text-slate-400 font-normal">/ month</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                <div className="font-semibold text-lime-400">{p.users}</div>
                <div className="font-semibold">{p.clients}</div>
                <div className="text-slate-400">{p.storage}</div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                {p.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold">
              Edit Plan Specs
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
