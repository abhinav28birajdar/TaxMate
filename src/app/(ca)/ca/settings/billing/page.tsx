"use client";

import React from 'react';
import { CreditCard, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CABillingSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-lime-500" /> Firm Subscription & Billing Plan
        </h1>
        <p className="text-sm text-slate-400">Manage TaxMate Pro tier, seats, storage, and payment methods</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 mb-2">CURRENT PLAN</Badge>
            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              TaxMate Pro for CA Firms <Sparkles className="w-5 h-5 text-lime-400 fill-lime-400" />
            </h2>
            <p className="text-sm text-slate-400">Renews on August 1, 2026 (₹4,999 / month)</p>
          </div>
          <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
            Upgrade to Enterprise
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">CA & Staff Seats</span>
            <span className="text-xl font-bold text-slate-100">8 / 15 Used</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Active Client Slots</span>
            <span className="text-xl font-bold text-slate-100">185 / 500 Used</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 block">Cloud Document Storage</span>
            <span className="text-xl font-bold text-lime-400">42 GB / 100 GB</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
