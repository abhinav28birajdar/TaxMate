'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, FileText, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAAccountingPage() {
  const [activeTab, setActiveTab] = useState<'ledger' | 'journal'>('ledger');

  const accounts = [
    { code: '1001', name: 'HDFC Current Account', type: 'Asset', balance: '₹4,82,500', status: 'Active' },
    { code: '2001', name: 'Sundry Creditors (Suppliers)', type: 'Liability', balance: '₹1,24,000', status: 'Active' },
    { code: '3001', name: 'Professional Service Fees Income', type: 'Income', balance: '₹18,50,000', status: 'Active' },
    { code: '4001', name: 'Office Rent & Electricity', type: 'Expense', balance: '₹2,40,000', status: 'Active' },
  ];

  const journals = [
    { id: 'j1', entryNo: 'JV-2026-042', date: '20 Oct 2026', desc: 'Client Audit Fee Realization', debit: '₹35,400', credit: '₹35,400', status: 'Posted' },
    { id: 'j2', entryNo: 'JV-2026-043', date: '21 Oct 2026', desc: 'Software License Renewal Expense', debit: '₹14,900', credit: '₹14,900', status: 'Posted' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-lime-600" /> Double-Entry Ledger Accounting
          </h1>
          <p className="text-xs text-slate-500 mt-1">Chart of Accounts, Journal Vouchers, General Ledger, and Balance Sheets.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-2" /> New Journal Entry
          </Button>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'ledger'
              ? 'border-lime-600 text-lime-600 dark:text-lime-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Chart of Accounts & General Ledger
        </button>
        <button
          onClick={() => setActiveTab('journal')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'journal'
              ? 'border-lime-600 text-lime-600 dark:text-lime-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Journal Entries & Vouchers
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Account Code</th>
                <th className="py-3.5 px-4">Account Name</th>
                <th className="py-3.5 px-4">Category Type</th>
                <th className="py-3.5 px-4">Current Balance</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {accounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{acc.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{acc.name}</td>
                  <td className="py-3.5 px-4 font-semibold">{acc.type}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{acc.balance}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/10 text-lime-600 border border-lime-600/20">
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Entry #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Total Debit</th>
                <th className="py-3.5 px-4">Total Credit</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {journals.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{j.entryNo}</td>
                  <td className="py-3.5 px-4">{j.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{j.desc}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{j.debit}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{j.credit}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {j.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
