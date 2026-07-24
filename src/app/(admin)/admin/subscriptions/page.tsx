"use client";

import React from 'react';
import { CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AdminSubscriptionsPage() {
  const subscriptions = [
    { firm: 'Sharma & Associates CA', plan: 'Pro Plan (Monthly)', amount: '₹4,999', renewal: '01 Aug 2026', gateway: 'Razorpay Sub', status: 'active' },
    { firm: 'Patel & Co Tax Consultants', plan: 'Pro Plan (Annual)', amount: '₹49,999', renewal: '15 Jan 2027', gateway: 'Stripe Sub', status: 'active' },
    { firm: 'Sundaram Financial Advisory', plan: 'Enterprise Plan', amount: '₹14,999', renewal: '10 Aug 2026', gateway: 'Razorpay Sub', status: 'active' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-lime-500" /> Active CA Firm Subscriptions
        </h1>
        <p className="text-sm text-slate-400">Monitor automated Razorpay & Stripe recurring subscription billing</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">CA Firm Name</TableHead>
                <TableHead className="text-slate-400">Subscription Tier</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Next Renewal</TableHead>
                <TableHead className="text-slate-400">Payment Gateway</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((s, idx) => (
                <TableRow key={idx} className="border-slate-800 hover:bg-slate-950/50">
                  <TableCell className="font-semibold text-slate-100">{s.firm}</TableCell>
                  <TableCell><Badge className="bg-slate-800 text-lime-400 border-slate-700">{s.plan}</Badge></TableCell>
                  <TableCell className="font-mono text-slate-200">{s.amount}</TableCell>
                  <TableCell className="text-slate-300 text-xs">{s.renewal}</TableCell>
                  <TableCell className="text-slate-400 text-xs">{s.gateway}</TableCell>
                  <TableCell>
                    <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 text-xs">
                      {s.status.toUpperCase()}
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
