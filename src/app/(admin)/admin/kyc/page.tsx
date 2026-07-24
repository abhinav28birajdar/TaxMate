"use client";

import React from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Download, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminKYCPage() {
  const kycQueue = [
    { id: 'k1', applicant: 'CA Rajesh Sharma', docType: 'ICAI COP Certificate', regNo: 'FCA-402918', date: '2026-07-22', status: 'pending' },
    { id: 'k2', applicant: 'CA Anjali Patel', docType: 'PAN & GST Certificate', regNo: '24AABCP1234R1ZM', date: '2026-07-23', status: 'pending' }
  ];

  const handleApprove = (name: string) => {
    toast.success(`Approved KYC verification for ${name}`);
  };

  const handleReject = (name: string) => {
    toast.error(`Rejected verification for ${name}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-500" /> KYC & ICAI Document Approvals
        </h1>
        <p className="text-sm text-slate-400">Review submitted ICAI COP certificates, PAN cards, and firm registration credentials</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Applicant Name</TableHead>
                <TableHead className="text-slate-400">Document Type</TableHead>
                <TableHead className="text-slate-400">Registration Ref</TableHead>
                <TableHead className="text-slate-400">Submitted Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycQueue.map(k => (
                <TableRow key={k.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{k.applicant}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{k.docType}</TableCell>
                  <TableCell className="font-mono text-xs text-lime-400">{k.regNo}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{k.date}</TableCell>
                  <TableCell>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      {k.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="border-slate-800 text-slate-300 gap-1">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </Button>
                    <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1" onClick={() => handleApprove(k.applicant)}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleReject(k.applicant)}>
                      <XCircle className="w-3.5 h-3.5" /> Reject
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
