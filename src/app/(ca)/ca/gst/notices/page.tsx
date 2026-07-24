"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Download, FileText, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CAGSTNoticesPage() {
  const notices = [
    {
      id: 'n1',
      noticeNo: 'GST-ASMT-10/2026/092',
      client: 'Acme Solutions Pvt Ltd',
      section: 'Section 61 (Discrepancy in Return)',
      issuedDate: '2026-07-02',
      dueDate: '2026-07-30',
      demandAmount: '₹1,42,500',
      status: 'open'
    },
    {
      id: 'n2',
      noticeNo: 'GST-DRC-01/2026/104',
      client: 'Mehta Logistics',
      section: 'Section 73 (ITC Mismatch GSTR-2B)',
      issuedDate: '2026-06-15',
      dueDate: '2026-07-15',
      demandAmount: '₹85,000',
      status: 'responded'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/ca/gst">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-lime-500" /> GST Notices & Scrutiny Management
            </h1>
            <p className="text-sm text-slate-400">Track and respond to ASMT-10, DRC-01, and DRC-01A departmental notices</p>
          </div>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Notice Ref Number</TableHead>
                <TableHead className="text-slate-400">Client Name</TableHead>
                <TableHead className="text-slate-400">Section / Category</TableHead>
                <TableHead className="text-slate-400">Demand Amount</TableHead>
                <TableHead className="text-slate-400">Response Due Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map(n => (
                <TableRow key={n.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-mono text-xs text-lime-400 font-semibold">{n.noticeNo}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{n.client}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{n.section}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{n.demandAmount}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{n.dueDate}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${
                      n.status === 'open' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-lime-600/20 text-lime-400 border-lime-500/30'
                    }`}>
                      {n.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 gap-1">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </Button>
                    <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1">
                      <Send className="w-3.5 h-3.5" /> Reply
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
