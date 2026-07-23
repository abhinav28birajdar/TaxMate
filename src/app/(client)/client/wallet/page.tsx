'use client';

import { useState } from 'react';
import { Wallet, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ClientWalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-lime-600" /> Client Tax Escrow & Pre-paid Wallet
          </h1>
          <p className="text-xs text-slate-500 mt-1">Pre-fund TaxMate wallet for instant CA consultations, advance tax payments, and statutory filings.</p>
        </div>
        <Button onClick={() => toast.success('Add Funds drawer opened!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Add Funds to Wallet
        </Button>
      </div>

      <div className="p-6 bg-gradient-to-r from-lime-900/40 via-slate-900 to-slate-900 text-white rounded-2xl border border-lime-500/30 max-w-md">
        <span className="text-xs font-semibold text-lime-400">Available Wallet Balance</span>
        <div className="text-3xl font-extrabold text-white mt-2">₹25,000</div>
        <span className="text-[10px] text-slate-400 mt-1 block">Ready for 1-click CA consultation payments</span>
      </div>
    </div>
  );
}
