"use client";

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Plus, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CAJournalPage() {
  const journalEntries = [
    { id: 'JV-2026-001', date: '2026-07-22', desc: 'Consultancy Service Billing to Acme Pvt Ltd', totalDebit: '₹1,50,000', totalCredit: '₹1,50,000', status: 'posted' },
    { id: 'JV-2026-002', date: '2026-07-23', desc: 'Quarterly Advance Tax Payment Entry', totalDebit: '₹45,000', totalCredit: '₹45,000', status: 'posted' },
    { id: 'JV-2026-003', date: '2026-07-24', desc: 'Depreciation Adjustment Booking', totalDebit: '₹12,400', totalCredit: '₹12,400', status: 'draft' }
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
              <FileText className="w-6 h-6 text-lime-500" /> Journal Entries
            </h1>
            <p className="text-sm text-slate-400">Post balanced debit and credit journal voucher entries</p>
          </div>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Create Journal Entry
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Entry Number</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Particulars / Description</TableHead>
                <TableHead className="text-slate-400">Debit (₹)</TableHead>
                <TableHead className="text-slate-400">Credit (₹)</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journalEntries.map(j => (
                <TableRow key={j.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-mono text-xs text-lime-400 font-semibold">{j.id}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{j.date}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{j.desc}</TableCell>
                  <TableCell className="font-mono text-slate-200">{j.totalDebit}</TableCell>
                  <TableCell className="font-mono text-slate-200">{j.totalCredit}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${
                      j.status === 'posted' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {j.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
