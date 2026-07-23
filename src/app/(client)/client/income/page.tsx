'use client';

import { useState } from 'react';
import { IndianRupee, Plus, Briefcase, Building, TrendingUp, Coins, Globe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClientIncomeManagementPage() {
  const [incomes, setIncomes] = useState([
    { id: 'inc_1', category: 'Salary', source: 'Acme Corp Technologies', amount: '₹14,50,000', fy: 'FY 2025-26', tds: '₹1,85,000' },
    { id: 'inc_2', category: 'Freelance / Professional', source: 'Consulting Projects', amount: '₹3,80,000', fy: 'FY 2025-26', tds: '₹38,000' },
    { id: 'inc_3', category: 'Capital Gains', source: 'Zerodha Equity Sales', amount: '₹1,20,000', fy: 'FY 2025-26', tds: '₹0' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-lime-600" /> Income Sources & Tax Disclosures
          </h1>
          <p className="text-xs text-slate-500 mt-1">Declare Salary, Business, Freelance, Rental, Capital Gains, and Crypto Income.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-2" /> Add Income Source
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Gross Total Income</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹19,50,000</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">TDS Deducted (Form 26AS)</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">₹2,23,000</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Income Tax Year</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">AY 2026-27</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Income Category</th>
              <th className="py-3.5 px-4">Source / Employer</th>
              <th className="py-3.5 px-4">Financial Year</th>
              <th className="py-3.5 px-4">Gross Amount</th>
              <th className="py-3.5 px-4">TDS Deducted</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {incomes.map((inc) => (
              <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{inc.category}</td>
                <td className="py-3.5 px-4">{inc.source}</td>
                <td className="py-3.5 px-4">{inc.fy}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">{inc.amount}</td>
                <td className="py-3.5 px-4 font-mono text-lime-600 dark:text-lime-400 font-bold">{inc.tds}</td>
                <td className="py-3.5 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
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
