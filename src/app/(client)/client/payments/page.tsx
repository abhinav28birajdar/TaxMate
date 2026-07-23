'use client';

import { useState } from 'react';
import { CreditCard, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientPaymentsPage() {
  const payments = [
    { ref: 'PAY-9012', desc: 'Annual Tax Audit & GSTR Retainer Fee', amount: '₹1,50,000', method: 'Razorpay UPI', date: '18 Oct 2026', status: 'PAID' },
    { ref: 'PAY-8910', desc: 'ITR-2 Filing & Advisory Fee', amount: '₹15,000', method: 'Net Banking HDFC', date: '20 Jul 2026', status: 'PAID' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-lime-600" /> Payments & Fee Receipts
        </h1>
        <p className="text-xs text-slate-500 mt-1">Payment receipts for CA retainer fees, consultation charges, and tax filing packages.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Payment Ref</th>
              <th className="py-3.5 px-4">Service Description</th>
              <th className="py-3.5 px-4">Payment Method</th>
              <th className="py-3.5 px-4">Date Paid</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {payments.map((p) => (
              <tr key={p.ref} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{p.ref}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.desc}</td>
                <td className="py-3.5 px-4">{p.method}</td>
                <td className="py-3.5 px-4">{p.date}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{p.amount}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30">
                    {p.status}
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
