'use client';

import { useState } from 'react';
import { Receipt, Plus, Upload, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientExpensesPage() {
  const [expenses, setExpenses] = useState([
    { id: 'exp_1', category: 'Software & Cloud', vendor: 'AWS Services', date: '12 Oct 2026', amount: '₹18,500', receipt: 'aws_invoice.pdf', status: 'OCR Verified' },
    { id: 'exp_2', category: 'Office Rent', vendor: 'DLF Cybercity', date: '01 Oct 2026', amount: '₹45,000', receipt: 'rent_receipt.pdf', status: 'OCR Verified' },
    { id: 'exp_3', category: 'Professional Fees', vendor: 'TaxMate Advisory', date: '28 Sep 2026', amount: '₹12,000', receipt: 'ca_invoice.pdf', status: 'OCR Verified' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-lime-600" /> Business Expenses & Receipt OCR
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track business deductions and automatically scan receipts using AI OCR.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-xs">
            <Camera className="w-4 h-4 mr-1.5" /> Quick Receipt Scan
          </Button>
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-1.5" /> Log Expense
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Expense Category</th>
              <th className="py-3.5 px-4">Vendor / Merchant</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Receipt Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {expenses.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{exp.category}</td>
                <td className="py-3.5 px-4">{exp.vendor}</td>
                <td className="py-3.5 px-4">{exp.date}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{exp.amount}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30">
                    <Sparkles className="w-3 h-3 inline mr-1" /> {exp.status}
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
