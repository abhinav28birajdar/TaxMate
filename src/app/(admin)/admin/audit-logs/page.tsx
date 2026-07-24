"use client";

import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminAuditLogsPage() {
  const logs = [
    { id: '1', action: 'USER_LOGIN_2FA', user: 'rajesh.sharma@taxmate.in', ip: '103.21.124.9', resource: 'auth.users', timestamp: '2026-07-24 14:32:10' },
    { id: '2', action: 'INVOICE_GENERATED', user: 'rajesh.sharma@taxmate.in', ip: '103.21.124.9', resource: 'invoices/INV-2026-0928', timestamp: '2026-07-24 14:15:02' },
    { id: '3', action: 'KYC_DOCUMENT_UPLOAD', user: 'anjali.patel@pateltax.in', ip: '49.36.192.12', resource: 'kyc-documents/pan_patel.pdf', timestamp: '2026-07-24 13:40:55' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-6 h-6 text-lime-500" /> Security & System Audit Trail
        </h1>
        <p className="text-sm text-slate-400">Immutable audit logs for compliance verification and security monitoring</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Action Event</TableHead>
                <TableHead className="text-slate-400">User Identity</TableHead>
                <TableHead className="text-slate-400">IP Address</TableHead>
                <TableHead className="text-slate-400">Resource URI</TableHead>
                <TableHead className="text-slate-400">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map(l => (
                <TableRow key={l.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell><Badge className="bg-slate-800 text-lime-400 border-slate-700 font-mono text-xs">{l.action}</Badge></TableCell>
                  <TableCell className="font-semibold text-slate-100">{l.user}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{l.ip}</TableCell>
                  <TableCell className="text-slate-300 text-xs font-mono">{l.resource}</TableCell>
                  <TableCell className="text-slate-400 text-xs">{l.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
