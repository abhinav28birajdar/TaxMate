'use client';

import { useState } from 'react';
import { CreditCard, Download, Search, CheckCircle2, ArrowDownLeft, Clock, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CAPaymentsPage() {
  const [search, setSearch] = useState('');

  const payments = [
    { id: 'PAY-8901', client: 'TechNova Solutions Pvt Ltd', invoiceNo: 'INV-1004', method: 'Razorpay UPI', amount: '₹1,50,000', date: '22 Oct 2026', status: 'SETTLED' },
    { id: 'PAY-8902', client: 'Dr. Vikramaditya Rao', invoiceNo: 'INV-1002', method: 'Bank Transfer (NEFT)', amount: '₹15,000', date: '20 Oct 2026', status: 'SETTLED' },
    { id: 'PAY-8903', client: 'Apex Logistics India LLP', invoiceNo: 'INV-1001', method: 'Credit Card (Stripe)', amount: '₹85,000', date: '18 Oct 2026', status: 'SETTLED' },
    { id: 'PAY-8904', client: 'Mehta Consultancy', invoiceNo: 'INV-1005', method: 'Direct Bank Deposit', amount: '₹35,000', date: '15 Oct 2026', status: 'PROCESSING' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-lime-600" /> Payments Received & Gateway Settlements
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track Razorpay, Stripe, and direct bank fee collections with automatic reconciliation.</p>
        </div>
        <Button onClick={() => toast.success('Manual payment entry logged!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Log Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-2xl">
          <span className="text-xs font-bold text-lime-700 dark:text-lime-400">Total Collections (Current FY)</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">₹28,50,000</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Settled to Bank Vault</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">₹26,80,000</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Gateway Payouts</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">₹1,70,000</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Payment Ref #</th>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Method / Channel</th>
              <th className="py-3.5 px-4">Received Date</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{p.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.client}</td>
                <td className="py-3.5 px-4 font-mono">{p.invoiceNo}</td>
                <td className="py-3.5 px-4">{p.method}</td>
                <td className="py-3.5 px-4">{p.date}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{p.amount}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    p.status === 'SETTLED'
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Downloading payment receipt for ${p.id}`)} className="text-lime-600">
                    <Download className="w-3.5 h-3.5" />
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
