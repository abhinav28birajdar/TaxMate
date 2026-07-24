"use client";

import React from 'react';
import Link from 'next/link';
import { LifeBuoy, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminSupportTicketsPage() {
  const tickets = [
    { id: 'T-901', user: 'CA Rajesh Sharma', subject: 'Issue with GST portal automated API sync', priority: 'high', status: 'in_progress', date: '2026-07-22' },
    { id: 'T-902', user: 'Priya Mehta', subject: 'Razorpay UPI payment receipt generation issue', priority: 'medium', status: 'open', date: '2026-07-24' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-lime-500" /> System Support Ticket Queue
        </h1>
        <p className="text-sm text-slate-400">Resolve platform technical queries and billing requests</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Ticket Ref</TableHead>
                <TableHead className="text-slate-400">User / Firm</TableHead>
                <TableHead className="text-slate-400">Subject</TableHead>
                <TableHead className="text-slate-400">Priority</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map(t => (
                <TableRow key={t.id} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-mono text-xs text-lime-400 font-semibold">{t.id}</TableCell>
                  <TableCell className="font-semibold text-slate-100">{t.user}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{t.subject}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-slate-300 border-slate-700">{t.priority}</Badge></TableCell>
                  <TableCell>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                      {t.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/support-tickets/${t.id}`}>
                      <Button variant="ghost" size="sm" className="text-lime-400 hover:bg-slate-800 gap-1">
                        Respond <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
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
