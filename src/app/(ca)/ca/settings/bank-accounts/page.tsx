"use client";

import React from 'react';
import { Building2, Plus, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CABankAccountsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-lime-500" /> Payout Bank Accounts & UPI
          </h1>
          <p className="text-sm text-slate-400">Receiving accounts for client invoice payouts via Razorpay & Stripe</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add Bank Account
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100">HDFC Bank Ltd (Current A/c)</span>
              <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30">PRIMARY PAYOUT</Badge>
            </div>
            <p className="text-xs text-slate-400 font-mono">A/c No: XXXXXX981240 | IFSC: HDFC0000128</p>
            <p className="text-xs text-slate-400">Account Holder: Sharma & Associates CA</p>
          </div>
          <Badge className="bg-slate-800 text-slate-300 border-slate-700">Verified</Badge>
        </div>
      </Card>
    </div>
  );
}
