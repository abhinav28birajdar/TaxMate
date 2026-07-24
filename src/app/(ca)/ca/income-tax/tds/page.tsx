"use client";

import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Download, Plus, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CATDSPage() {
  const tdsReturns = [
    { id: '1', deductor: 'Acme Solutions Pvt Ltd', tan: 'MUMA12345B', form: 'Form 26Q (Non-Salary)', quarter: 'Q1 (Apr-Jun)', totalTDS: '₹2,45,000', status: 'filed' },
    { id: '2', deductor: 'Acme Solutions Pvt Ltd', tan: 'MUMA12345B', form: 'Form 24Q (Salary)', quarter: 'Q1 (Apr-Jun)', totalTDS: '₹8,10,000', status: 'filed' },
    { id: '3', deductor: 'TechNova Solutions', tan: 'BANG98765C', form: 'Form 26Q (Non-Salary)', quarter: 'Q1 (Apr-Jun)', totalTDS: '₹1,20,000', status: 'pending' }
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
              <FileText className="w-6 h-6 text-lime-500" /> TDS Quarterly Returns & Form 16/16A
            </h1>
            <p className="text-sm text-slate-400">Manage 24Q, 26Q, 27Q filings and Form 16 PDF certificate generation</p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Deductor Corporate</TableHead>
                <TableHead className="text-slate-400">TAN Number</TableHead>
                <TableHead className="text-slate-400">Form Type</TableHead>
                <TableHead className="text-slate-400">Quarter</TableHead>
                <TableHead className="text-slate-400">Total TDS Deposited</TableHead>
                <TableHead className="text-slate-400">Filing Status</TableHead>
                <TableHead className="text-slate-400 text-right">Form 16 Certs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tdsReturns.map(t => (
                <TableRow key={t.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{t.deductor}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-300">{t.tan}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-lime-400 border-slate-700">{t.form}</Badge></TableCell>
                  <TableCell className="text-slate-300 text-xs">{t.quarter}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{t.totalTDS}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${
                      t.status === 'filed' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 gap-1">
                      <Download className="w-3.5 h-3.5 text-lime-500" /> Generate Zip
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
