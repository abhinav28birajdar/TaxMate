'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface KycApplicant {
  id: string;
  userId: string;
  name: string;
  email: string;
  firmName: string;
  icaiNumber: string;
  location: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

export default function AdminKYCVerificationPage() {
  const [applicants, setApplicants] = useState<KycApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadKycQueue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=kyc', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load KYC queue');
      setApplicants(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load KYC records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadKycQueue();
  }, [loadKycQueue]);

  const handleDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setBusyId(id);
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          section: 'kyc',
          id,
          status,
          reason: status === 'REJECTED' ? 'ICAI credential verification failed' : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'KYC decision failed');
      toast.success(`Practitioner ${status.toLowerCase()}`);
      await loadKycQueue();
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lime-500" /> CA ICAI &amp; KYC Verification Queue
          </h1>
          <p className="text-sm text-slate-400">Review ICAI membership credentials and approve CA firm onboarding</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadKycQueue} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Applicant / Firm</TableHead>
                <TableHead className="text-slate-400">ICAI Membership #</TableHead>
                <TableHead className="text-slate-400">Location</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading verification queue...
                  </TableCell>
                </TableRow>
              ) : applicants.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    No CA KYC applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applicants.map((k) => (
                  <TableRow key={k.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{k.name}</div>
                      <div className="text-xs text-slate-400">{k.firmName || k.email}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-lime-400">{k.icaiNumber}</TableCell>
                    <TableCell className="text-xs text-slate-400">{k.location}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          k.status === 'APPROVED'
                            ? 'bg-lime-600/20 text-lime-400 border-lime-500/30 text-[10px]'
                            : k.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 text-[10px]'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]'
                        }
                      >
                        {k.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {k.status !== 'APPROVED' && (
                        <Button
                          size="sm"
                          disabled={busyId === k.id}
                          onClick={() => handleDecision(k.id, 'APPROVED')}
                          className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold h-7 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}
                      {k.status !== 'REJECTED' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busyId === k.id}
                          onClick={() => handleDecision(k.id, 'REJECTED')}
                          className="text-red-400 hover:bg-red-500/10 h-7 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
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
