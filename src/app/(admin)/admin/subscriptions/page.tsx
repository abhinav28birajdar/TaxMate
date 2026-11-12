'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CreditCard, Loader2, RefreshCw, XCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminSubRow {
  id: string;
  userId: string;
  subscriberName: string;
  subscriberEmail: string;
  plan: string;
  billingCycle: string;
  status: string;
  gateway: string;
  renewalDate: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=subscriptions', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load subscriptions');
      setSubscriptions(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubs();
  }, [loadSubs]);

  const updateSubStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section: 'subscriptions', id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success(`Subscription set to ${status}`);
      await loadSubs();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-lime-500" /> Active Subscriptions &amp; SaaS Billing
          </h1>
          <p className="text-sm text-slate-400">Monitor recurring plan entitlements and manage subscription lifecycles</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadSubs} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Subscriber / Firm</TableHead>
                <TableHead className="text-slate-400">Plan Tier</TableHead>
                <TableHead className="text-slate-400">Billing Cycle</TableHead>
                <TableHead className="text-slate-400">Next Renewal</TableHead>
                <TableHead className="text-slate-400">Payment Gateway</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : subscriptions.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    No active subscriptions found.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.map((s) => (
                  <TableRow key={s.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{s.subscriberName}</div>
                      <div className="text-xs text-slate-400">{s.subscriberEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700">{s.plan}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 uppercase">{s.billingCycle}</TableCell>
                    <TableCell className="text-slate-300 text-xs">
                      {s.renewalDate ? new Date(s.renewalDate).toLocaleDateString('en-IN') : '-'}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">{s.gateway}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          s.status === 'active'
                            ? 'bg-lime-600/20 text-lime-400 border-lime-500/30 text-xs'
                            : 'bg-slate-800 text-slate-400 text-xs'
                        }
                      >
                        {s.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {s.status === 'active' ? (
                        <Button size="sm" variant="ghost" onClick={() => updateSubStatus(s.id, 'CANCELLED')} className="text-red-400 h-7 text-xs">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => updateSubStatus(s.id, 'ACTIVE')} className="border-lime-500/30 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Reactivate
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
