'use client';

import { useState } from 'react';
import { Calendar, Bell, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientCompliancePage() {
  const deadlines = [
    { title: 'GSTR-3B Filing September 2026', type: 'GST Statutory', dueDate: '20 Oct 2026', daysLeft: '3 Days', urgency: 'HIGH' },
    { title: 'Corporate ITR Audit Return Filing (AY 2026-27)', type: 'Income Tax Audit', dueDate: '31 Oct 2026', daysLeft: '14 Days', urgency: 'MEDIUM' },
    { title: 'TDS Quarter 2 Return Filing (Form 26Q)', type: 'TDS Compliance', dueDate: '31 Oct 2026', daysLeft: '14 Days', urgency: 'MEDIUM' },
    { title: 'Advance Tax 3rd Installment (75%)', type: 'Income Tax Advance', dueDate: '15 Dec 2026', daysLeft: '53 Days', urgency: 'LOW' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-lime-600" /> Compliance Calendar & Due Dates
        </h1>
        <p className="text-xs text-slate-500 mt-1">Automatic statutory compliance schedule for GST, Income Tax, Advance Tax, and TDS.</p>
      </div>

      <div className="space-y-3">
        {deadlines.map((d, i) => (
          <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{d.title}</h4>
                <p className="text-xs text-slate-400">{d.type} • Due: {d.dueDate}</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              d.urgency === 'HIGH'
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
            }`}>
              {d.daysLeft}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
