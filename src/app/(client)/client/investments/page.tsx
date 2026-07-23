'use client';

import { useState } from 'react';
import { ShieldCheck, Plus, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientInvestmentsDeductionsPage() {
  const [deductions, setDeductions] = useState([
    { section: 'Section 80C', name: 'Public Providend Fund (PPF) & ELSS', maxLimit: '₹1,50,000', invested: '₹1,50,000', taxSaved: '₹46,800' },
    { section: 'Section 80D', name: 'Health Insurance (Self & Parents)', maxLimit: '₹75,000', invested: '₹42,000', taxSaved: '₹13,104' },
    { section: 'Section 80CCD(1B)', name: 'National Pension System (NPS)', maxLimit: '₹50,000', invested: '₹50,000', taxSaved: '₹15,600' },
    { section: 'Section 24(b)', name: 'Home Loan Interest Deduction', maxLimit: '₹2,00,000', invested: '₹1,85,000', taxSaved: '₹57,720' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lime-600" /> Tax Deductions & Chapter VI-A Investments
          </h1>
          <p className="text-xs text-slate-500 mt-1">Claim Sec 80C, 80D, 80E, NPS, Home Loan Interest, and HRA Tax Benefits.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Declare Investment Proof
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Eligible Deductions</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹4,27,000</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Estimated Tax Savings</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">₹1,33,224</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Recommended Tax Regime</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">Old Tax Regime</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">IT Act Section</th>
              <th className="py-3.5 px-4">Investment Head</th>
              <th className="py-3.5 px-4">Max Cap Limit</th>
              <th className="py-3.5 px-4">Claimed Amount</th>
              <th className="py-3.5 px-4">Tax Benefit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {deductions.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{d.section}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{d.name}</td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{d.maxLimit}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{d.invested}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-lime-600 dark:text-lime-400">{d.taxSaved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
