"use client";

import React from 'react';
import Link from 'next/link';
import { BarChart3, ArrowLeft, Download, FileText, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CAFinancialReportsPage() {
  const reportsList = [
    { title: 'Profit & Loss Statement (P&L)', desc: 'Revenue, direct costs, overhead expenses and net margin calculation', icon: BarChart3 },
    { title: 'Balance Sheet', desc: 'Assets, liabilities, capital and reserves statement as of date', icon: FileText },
    { title: 'Trial Balance', desc: 'Summary of debit and credit balances for all general ledger accounts', icon: FileText },
    { title: 'Cash Flow Statement', desc: 'Operating, investing, and financing cash movement analysis', icon: BarChart3 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ca/accounting">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-lime-500" /> Financial Statements & Audit Reports
            </h1>
            <p className="text-sm text-slate-400">Generate P&L, Balance Sheet, Trial Balance, and Cash Flow statements</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((rep, idx) => (
          <Card key={idx} className="bg-slate-900 border-slate-800 p-6 space-y-4 hover:border-lime-500/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-lime-600/10 text-lime-500 rounded-xl">
                <rep.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-lg">{rep.title}</h3>
                <p className="text-xs text-slate-400">{rep.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="outline" className="border-slate-800 text-slate-300 gap-1.5">
                <Printer className="w-4 h-4 text-slate-400" /> Print
              </Button>
              <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1.5">
                <Download className="w-4 h-4" /> Download PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
