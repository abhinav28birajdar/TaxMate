"use client";

import React from 'react';
import { DollarSign, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminTransactionsPage() {
  const transactions = [
    { txId: 'TXN-981240', payer: 'Acme Solutions Pvt Ltd', payee: 'Sharma & Associates', amount: '₹20,650', gateway: 'Razorpay UPI', date: '2026-07-24 14:10', status: 'completed' },
    { txId: 'TXN-981241', payer: 'Sharma & Associates', payee: 'TaxMate SaaS', amount: '₹4,999', gateway: 'Stripe Card', date: '2026-07-24 12:00', status: 'completed' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-lime-500" /> Payment Ledger & Gateway Audit
        </h1>
        <p className="text-sm text-slate-400">All client-to-CA payouts and SaaS subscription transaction logs</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Transaction ID</TableHead>
                <TableHead className="text-slate-400">Payer Entity</TableHead>
                <TableHead className="text-slate-400">Beneficiary / Payee</TableHead>
                <TableHead className="text-slate-400">Gross Amount</TableHead>
                <TableHead className="text-slate-400">Gateway Method</TableHead>
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(t => (
                <TableRow key={t.txId} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-mono text-xs text-lime-400 font-semibold">{t.txId}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{t.payer}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{t.payee}</TableCell>
                  <TableCell className="font-mono text-slate-100 font-bold">{t.amount}</TableCell>
                  <TableCell className="text-slate-400 text-xs">{t.gateway}</TableCell>
                  <TableCell className="text-slate-400 text-xs">{t.date}</TableCell>
                  <TableCell>
                    <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 text-xs">
                      {t.status.toUpperCase()}
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
