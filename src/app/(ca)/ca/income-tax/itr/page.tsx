"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowLeft, Search, Plus, Download, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CAITRFilingsPage() {
  const filings = [
    { id: '1', client: 'Rajesh Malhotra', pan: 'ABCDE1234F', form: 'ITR-2', ay: '2026-27', totalIncome: '₹18,50,000', refund: '₹34,200', status: 'e_verified', ackNo: '98124091283' },
    { id: '2', client: 'Acme Solutions Pvt Ltd', pan: 'AABCU9603R', form: 'ITR-6', ay: '2026-27', totalIncome: '₹1,24,00,000', refund: '₹0', status: 'submitted', ackNo: '10293847561' },
    { id: '3', client: 'Ananya Roy', pan: 'XYZPK9876M', form: 'ITR-1', ay: '2026-27', totalIncome: '₹9,20,000', refund: '₹12,500', status: 'draft', ackNo: '-' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ca/income-tax">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-lime-500" /> Income Tax Returns (ITR) Filing
            </h1>
            <p className="text-sm text-slate-400">AY 2026-27 Income Tax computation, JSON export & e-verification tracking</p>
          </div>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Start New ITR Computation
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Assessee Name</TableHead>
                <TableHead className="text-slate-400">PAN Number</TableHead>
                <TableHead className="text-slate-400">Form Type</TableHead>
                <TableHead className="text-slate-400">Assessment Year</TableHead>
                <TableHead className="text-slate-400">Total Income</TableHead>
                <TableHead className="text-slate-400">Refund / Payable</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Ack No.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filings.map(f => (
                <TableRow key={f.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{f.client}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">{f.pan}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-lime-400 border-slate-700">{f.form}</Badge></TableCell>
                  <TableCell className="text-slate-300 text-xs">{f.ay}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{f.totalIncome}</TableCell>
                  <TableCell className="text-lime-400 font-medium">{f.refund}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${
                      f.status === 'e_verified' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' :
                      f.status === 'submitted' ? 'bg-slate-800 text-slate-200 border-slate-700' :
                      'bg-slate-800 text-slate-500 border-slate-700'
                    }`}>
                      {f.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-400">{f.ackNo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
