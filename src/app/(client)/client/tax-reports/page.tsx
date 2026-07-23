'use client';

import { useState } from 'react';
import { FileText, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientTaxReportsPage() {
  const reports = [
    { title: 'Tax Computation Sheet AY 2026-27', date: '18 Oct 2026', type: 'Income Tax', size: '1.4 MB' },
    { title: 'Capital Gains Statement FY 2025-26', date: '15 Oct 2026', type: 'Capital Gains', size: '2.1 MB' },
    { title: 'Form 26AS Reconciliation Summary', date: '10 Oct 2026', type: 'TDS Report', size: '0.9 MB' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-lime-600" /> Generated Tax Reports & PDF Statements
        </h1>
        <p className="text-xs text-slate-500 mt-1">Download official CA tax computation statements, capital gains sheets, and TDS summaries.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Report Title</th>
              <th className="py-3.5 px-4">Report Type</th>
              <th className="py-3.5 px-4">Date Generated</th>
              <th className="py-3.5 px-4">File Size</th>
              <th className="py-3.5 px-4 text-right">Download PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {reports.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.title}</td>
                <td className="py-3.5 px-4">{r.type}</td>
                <td className="py-3.5 px-4">{r.date}</td>
                <td className="py-3.5 px-4 font-mono">{r.size}</td>
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
