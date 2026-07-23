'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function IncomeTaxPage() {
  const filings = [
    { id: 'itr1', client: 'Ananya Deshmukh', form: 'ITR-1 (Sahaj)', ay: '2026-27', totalIncome: '₹24,50,000', taxPayable: '₹4,12,000', tds: '₹4,12,000', status: 'Filed & E-Verified' },
    { id: 'itr2', client: 'Dr. Vikramaditya Rao', form: 'ITR-3', ay: '2026-27', totalIncome: '₹45,00,000', taxPayable: '₹10,50,000', tds: '₹8,20,000', status: 'Under Review' },
    { id: 'itr3', client: 'TechNova Solutions', form: 'ITR-6', ay: '2026-27', totalIncome: '₹1,50,00,000', taxPayable: '₹37,50,000', tds: '₹35,00,000', status: 'In Progress' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-lime-600" /> Income Tax & ITR Filings
          </h1>
          <p className="text-xs text-slate-500 mt-1">ITR-1 through ITR-7 filings, Form 26AS reconciliation, and TDS returns.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-2" /> Start ITR Filing
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">ITR Form</th>
              <th className="py-3.5 px-4">Assessment Year</th>
              <th className="py-3.5 px-4">Gross Income</th>
              <th className="py-3.5 px-4">TDS Claimed</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filings.map((itr) => (
              <tr key={itr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{itr.client}</td>
                <td className="py-3.5 px-4 font-semibold text-lime-600 dark:text-lime-400">{itr.form}</td>
                <td className="py-3.5 px-4">{itr.ay}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{itr.totalIncome}</td>
                <td className="py-3.5 px-4 font-mono">{itr.tds}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      itr.status.includes('Filed')
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    {itr.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
