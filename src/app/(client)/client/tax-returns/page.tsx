'use client';

import { useState } from 'react';
import { ShieldCheck, Download, CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientTaxReturnsPage() {
  const returns = [
    { ay: 'AY 2026-27 (FY 2025-26)', form: 'ITR-2 (Capital Gains & Salary)', status: 'CA Review Pending', ackNo: 'Pending Verification', filedDate: 'In Progress', caName: 'CA Rajesh Sharma' },
    { ay: 'AY 2025-26 (FY 2024-25)', form: 'ITR-1 Sahaj', status: 'Filed & Verified', ackNo: 'ACK-9876543210', filedDate: '24 Jul 2025', caName: 'CA Rajesh Sharma' },
    { ay: 'AY 2024-25 (FY 2023-24)', form: 'ITR-1 Sahaj', status: 'Filed & Verified', ackNo: 'ACK-8765432109', filedDate: '19 Jul 2024', caName: 'CA Rajesh Sharma' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-600" /> Income Tax Returns & Timeline
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track return preparation, review draft calculations, and download official ITR-V acknowledgements.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-lime-600" /> Active Return Workflow (AY 2026-27)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
          {[
            { step: '1. Add Details', done: true },
            { step: '2. Upload Documents', done: true },
            { step: '3. CA Review', active: true },
            { step: '4. Client Approval', done: false },
            { step: '5. E-Filing Complete', done: false },
          ].map((s, i) => (
            <div key={i} className={`p-3 rounded-xl text-center border text-xs font-semibold ${
              s.active
                ? 'bg-lime-600/20 text-lime-600 border-lime-500/40 dark:text-lime-400 font-bold ring-1 ring-lime-500/30'
                : s.done
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-900/50 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60'
            }`}>
              {s.step}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Assessment Year</th>
              <th className="py-3.5 px-4">ITR Form</th>
              <th className="py-3.5 px-4">Assigned CA</th>
              <th className="py-3.5 px-4">Ack Number</th>
              <th className="py-3.5 px-4">Filing Status</th>
              <th className="py-3.5 px-4 text-right">ITR-V Download</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {returns.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.ay}</td>
                <td className="py-3.5 px-4">{r.form}</td>
                <td className="py-3.5 px-4">{r.caName}</td>
                <td className="py-3.5 px-4 font-mono">{r.ackNo}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    r.status.includes('Filed')
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-lime-600 dark:text-lime-400">
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
