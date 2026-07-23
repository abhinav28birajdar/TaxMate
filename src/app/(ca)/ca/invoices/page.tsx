'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt, DollarSign, Download, Send, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAInvoicesPage() {
  const invoices = [
    { id: 'inv_101', number: 'INV-2026-089', client: 'TechNova Solutions', date: '01 Oct 2026', due: '15 Oct 2026', amount: '₹35,400', gst: '₹5,400', status: 'Paid' },
    { id: 'inv_102', number: 'INV-2026-090', client: 'Apex Logistics', date: '05 Oct 2026', due: '19 Oct 2026', amount: '₹64,900', gst: '₹9,900', status: 'Sent' },
    { id: 'inv_103', number: 'INV-2026-091', client: 'Ananya Deshmukh', date: '10 Oct 2026', due: '24 Oct 2026', amount: '₹14,160', gst: '₹2,160', status: 'Overdue' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-lime-600" /> Invoices & GST Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generate compliant GST invoices, collect online via Razorpay/Stripe, and track outstanding balance.</p>
        </div>
        <Link href="/ca/invoices/create">
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-2" /> Create GST Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Billed (This Month)</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹1,14,460</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-slate-500">Paid Invoices</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">₹35,400</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-slate-500">Balance Pending</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">₹79,060</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Invoice Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Grand Total</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{inv.number}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{inv.client}</td>
                <td className="py-3.5 px-4">{inv.date}</td>
                <td className="py-3.5 px-4">{inv.due}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{inv.amount}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'Paid'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : inv.status === 'Overdue'
                        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Send className="w-4 h-4 text-lime-600" />
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
