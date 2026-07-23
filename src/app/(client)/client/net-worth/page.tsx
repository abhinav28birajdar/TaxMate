'use client';

import { useState } from 'react';
import { Wallet, TrendingUp, ShieldAlert, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientNetWorthDashboardPage() {
  const assets = [
    { type: 'Real Estate Property', name: 'Residential Apartment (Pune)', value: '₹85,00,000' },
    { type: 'Mutual Funds & Equity', name: 'Zerodha Demat Portfolio', value: '₹24,50,000' },
    { type: 'Bank Deposits & PPF', name: 'HDFC Bank & PPF Balance', value: '₹12,80,000' },
    { type: 'Gold & Assets', name: 'Physical Gold & Sovereign Gold Bonds', value: '₹6,40,000' },
  ];

  const liabilities = [
    { type: 'Home Loan', lender: 'SBI Home Finance', balance: '₹38,50,000' },
    { type: 'Car Loan', lender: 'HDFC Bank', balance: '₹4,20,000' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-lime-600" /> Wealth & Net Worth Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1">Consolidated view of real estate, stocks, bank deposits, gold, and loan liabilities.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Add Asset / Loan
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-lime-600/10 border border-lime-600/20 rounded-2xl">
          <span className="text-xs font-bold text-lime-700 dark:text-lime-400">Total Net Worth</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">₹85,50,000</div>
          <span className="text-[11px] text-lime-600 dark:text-lime-400 flex items-center gap-1 mt-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% YoY Growth
          </span>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Gross Total Assets</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹1,28,70,000</div>
        </div>
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Outstanding Liabilities</span>
          <div className="text-2xl font-extrabold text-red-500 mt-1">₹42,70,000</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            Assets Portfolio Breakdown
          </h3>
          <div className="space-y-3">
            {assets.map((a, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{a.name}</div>
                  <div className="text-slate-400 text-[10px]">{a.type}</div>
                </div>
                <div className="font-mono font-extrabold text-slate-900 dark:text-white">{a.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            Loans & Liabilities
          </h3>
          <div className="space-y-3">
            {liabilities.map((l, i) => (
              <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{l.type}</div>
                  <div className="text-slate-400 text-[10px]">{l.lender}</div>
                </div>
                <div className="font-mono font-extrabold text-red-500">{l.balance}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
