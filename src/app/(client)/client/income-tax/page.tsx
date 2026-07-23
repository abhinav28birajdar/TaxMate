'use client';

import { useState } from 'react';
import { FileSpreadsheet, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientIncomeTaxPage() {
  const filings = [
    { ay: 'AY 2026-27 (FY 2025-26)', form: 'ITR-2 (Capital Gains & Salary)', status: 'CA Review Pending', grossIncome: '₹19,50,000', taxLiability: '₹2,84,000', tds: '₹2,23,000', refund: '₹0' },
    { ay: 'AY 2025-26 (FY 2024-25)', form: 'ITR-1 Sahaj', status: 'Filed & Processed', grossIncome: '₹16,20,000', taxLiability: '₹1,95,000', tds: '₹2,10,000', refund: '₹15,000' },
    { ay: 'AY 2024-25 (FY 2023-24)', form: 'ITR-1 Sahaj', status: 'Filed & Processed', grossIncome: '₹14,00,000', taxLiability: '₹1,42,000', tds: '₹1,50,000', refund: '₹8,000' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-lime-600" /> Income Tax & Annual Return Filings
        </h1>
        <p className="text-xs text-slate-500 mt-1">View annual ITR submissions, Form 26AS TDS credits, and IT Department refund status.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Assessment Year</th>
              <th className="py-3.5 px-4">ITR Form</th>
              <th className="py-3.5 px-4">Gross Income</th>
              <th className="py-3.5 px-4">Tax Liability</th>
              <th className="py-3.5 px-4">TDS Paid</th>
              <th className="py-3.5 px-4">Refund Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Acknowledgement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filings.map((f, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{f.ay}</td>
                <td className="py-3.5 px-4">{f.form}</td>
                <td className="py-3.5 px-4 font-mono">{f.grossIncome}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{f.taxLiability}</td>
                <td className="py-3.5 px-4 font-mono text-lime-600 dark:text-lime-400 font-bold">{f.tds}</td>
                <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">{f.refund}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    f.status.includes('Filed')
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {f.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" className="text-lime-600">
                    <Download className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
