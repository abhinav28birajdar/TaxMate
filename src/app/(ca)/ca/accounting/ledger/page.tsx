"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Plus, Search, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CALedgerPage() {
  const accounts = [
    { code: '1001', name: 'HDFC Bank Primary A/c', type: 'Asset', opening: '₹14,50,000', current: '₹22,80,450' },
    { code: '1002', name: 'Petty Cash Account', type: 'Asset', opening: '₹25,000', current: '₹18,200' },
    { code: '2001', name: 'GST Payable - CGST/SGST', type: 'Liability', opening: '₹0', current: '₹1,42,000' },
    { code: '3001', name: 'Retained Earnings Equity', type: 'Equity', opening: '₹50,000,000', current: '₹62,100,000' },
    { code: '4001', name: 'Professional Tax Consultancy Revenue', type: 'Income', opening: '₹0', current: '₹48,90,000' },
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
              <BookOpen className="w-6 h-6 text-lime-500" /> Chart of Ledger Accounts
            </h1>
            <p className="text-sm text-slate-400">Master double-entry general ledger accounts for accounting clients</p>
          </div>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add Ledger Account
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Account Code</TableHead>
                <TableHead className="text-slate-400">Account Title</TableHead>
                <TableHead className="text-slate-400">Category Type</TableHead>
                <TableHead className="text-slate-400">Opening Balance</TableHead>
                <TableHead className="text-slate-400">Current Balance</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map(a => (
                <TableRow key={a.code} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-mono text-xs text-lime-400 font-semibold">{a.code}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{a.name}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-slate-300 border-slate-700">{a.type}</Badge></TableCell>
                  <TableCell className="text-slate-300 text-xs">{a.opening}</TableCell>
                  <TableCell className="font-semibold text-lime-400">{a.current}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-lime-400 hover:text-lime-300 hover:bg-slate-800">
                      View Transactions
                    </Button>
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
