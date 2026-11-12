'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminPaymentRow {
  id: string;
  txId: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  caName: string;
  clientName: string;
  paidAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=payments', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load payments');
      setPayments(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load payment ledger');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleMarkReconciled = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section: 'payments', id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success(`Payment updated to ${status}`);
      await loadPayments();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const totalVolume = payments
    .filter((p) => p.status === 'COMPLETED' || p.status === 'PAID' || p.status === 'CAPTURED')
    .reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-lime-500" /> Platform Payments &amp; Escrow Ledger
          </h1>
          <p className="text-sm text-slate-400">Settled Volume: ₹{totalVolume.toLocaleString('en-IN')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPayments} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Transaction ID</TableHead>
                <TableHead className="text-slate-400">Client</TableHead>
                <TableHead className="text-slate-400">CA Partner</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400">Gateway</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading transactions...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    No platform payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-mono text-xs text-lime-400">{p.txId}</TableCell>
                    <TableCell className="text-xs text-slate-200">{p.clientName}</TableCell>
                    <TableCell className="text-xs text-slate-300">{p.caName}</TableCell>
                    <TableCell className="font-mono text-slate-100 font-semibold">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{p.gateway}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700 text-[10px]">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === 'PENDING' && (
                        <Button size="sm" variant="outline" onClick={() => handleMarkReconciled(p.id, 'COMPLETED')} className="border-lime-500/30 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Reconcile
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
