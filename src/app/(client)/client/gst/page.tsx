'use client';

import { useState } from 'react';
import { ShieldCheck, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientGSTPage() {
  const returns = [
    { period: 'September 2026', type: 'GSTR-3B', dueDate: '20 Oct 2026', status: 'CA Review Pending', outputTax: '₹1,24,000', inputTax: '₹41,600', netPayable: '₹82,400' },
    { period: 'August 2026', type: 'GSTR-3B', dueDate: '20 Sep 2026', status: 'Filed & Verified', outputTax: '₹98,000', inputTax: '₹32,000', netPayable: '₹66,000' },
    { period: 'Q1 FY26', type: 'GSTR-1', dueDate: '11 Jul 2026', status: 'Filed & Verified', outputTax: '₹3,40,000', inputTax: '-', netPayable: '-' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-600" /> GST Returns & Input Tax Credit (ITC) Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">Monitor monthly GSTR-1, GSTR-3B filings, output GST liabilities, and 2B ITC reconciliation.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Output GST Collected</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹1,24,000</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Input Tax Credit (GSTR-2B)</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">₹41,600</div>
        </div>
        <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-2xl">
          <span className="text-xs font-bold text-lime-700 dark:text-lime-400">Net Payable GST</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹82,400</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Return Type</th>
              <th className="py-3.5 px-4">Filing Period</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Output Tax</th>
              <th className="py-3.5 px-4">Claimed ITC</th>
              <th className="py-3.5 px-4">Net Tax</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {returns.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.type}</td>
                <td className="py-3.5 px-4">{r.period}</td>
                <td className="py-3.5 px-4">{r.dueDate}</td>
                <td className="py-3.5 px-4 font-mono">{r.outputTax}</td>
                <td className="py-3.5 px-4 font-mono text-lime-600 dark:text-lime-400 font-bold">{r.inputTax}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{r.netPayable}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    r.status.includes('Filed')
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {r.status}
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
