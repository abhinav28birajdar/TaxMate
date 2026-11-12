'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Download,
  ShieldCheck,
  Search,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface NormalizedFiling {
  id: string;
  compliance_type: string;
  title: string;
  financial_year: string;
  due_date: string;
  filing_date: string | null;
  status: string;
  acknowledgement_number: string | null;
  notes: string | null;
}

function downloadAcknowledgementSlip(rec: NormalizedFiling, userEmail: string) {
  const slip = [
    '====================================================',
    '        TAXMATE COMPLIANCE FILING ACKNOWLEDGEMENT   ',
    '====================================================',
    `Filing Title          : ${rec.title}`,
    `Return / Form Type    : ${rec.compliance_type.replace(/_/g, ' ').toUpperCase()}`,
    `Financial Year        : ${rec.financial_year}`,
    `Taxpayer Account      : ${userEmail || 'Verified Client'}`,
    `Status                : ${rec.status.toUpperCase()}`,
    `Due Date              : ${rec.due_date || 'N/A'}`,
    `Filing Date           : ${rec.filing_date || 'Recorded'}`,
    `Acknowledgement / ARN : ${rec.acknowledgement_number || rec.id}`,
    `Remarks               : ${rec.notes || 'Processed via TaxMate CA Portal'}`,
    '====================================================',
  ].join('\n');

  const blob = new Blob([slip], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ACK_${(rec.acknowledgement_number || rec.id).replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded acknowledgement slip ${rec.acknowledgement_number || rec.id}`);
}

export default function ClientCompliance() {
  const { user } = useAuth();
  const [complianceRecords, setComplianceRecords] = useState<NormalizedFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadCompliance = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, deadRes, itrRes] = await Promise.all([
        fetch('/api/compliance', { credentials: 'include' }),
        fetch('/api/compliance/deadlines', { credentials: 'include' }),
        fetch('/api/itr', { credentials: 'include' }),
      ]);

      const merged: NormalizedFiling[] = [];
      const seenIds = new Set<string>();

      if (compRes.ok) {
        const compJson = await compRes.json();
        for (const item of compJson.data || []) {
          seenIds.add(item.id);
          const rawStatus = String(item.status || 'pending').toLowerCase();
          merged.push({
            id: item.id,
            compliance_type: item.compliance_type || item.type || 'compliance',
            title: item.title || String(item.compliance_type || 'Filing').replace(/_/g, ' '),
            financial_year: item.financial_year || item.metadata?.financial_year || 'Current FY',
            due_date: item.due_date ? String(item.due_date).split('T')[0] : '',
            filing_date: item.metadata?.filing_date || null,
            status: rawStatus === 'completed' ? 'filed' : rawStatus.replace(/-/g, '_'),
            acknowledgement_number: item.metadata?.acknowledgement_number || null,
            notes: item.notes || item.description || null,
          });
        }
      }

      if (deadRes.ok) {
        const deadJson = await deadRes.json();
        for (const d of deadJson.data || []) {
          if (seenIds.has(d.id)) continue;
          seenIds.add(d.id);
          const rawStatus = String(d.status || 'pending').toLowerCase();
          merged.push({
            id: d.id,
            compliance_type: d.compliance_type || d.deadline_type || 'deadline',
            title: d.title || String(d.deadline_type || 'Compliance Deadline'),
            financial_year: 'Current FY',
            due_date: d.due_date ? String(d.due_date).split('T')[0] : '',
            filing_date: d.completed_at ? String(d.completed_at).split('T')[0] : null,
            status: rawStatus === 'completed' ? 'filed' : rawStatus,
            acknowledgement_number: null,
            notes: d.description || null,
          });
        }
      }

      if (itrRes.ok) {
        const itrJson = await itrRes.json();
        for (const r of itrJson.data || []) {
          if (seenIds.has(r.id)) continue;
          seenIds.add(r.id);
          const s = String(r.status || 'DRAFT').toLowerCase();
          const mappedStatus =
            s === 'filed' || s === 'verified'
              ? 'filed'
              : s === 'review' || s === 'computed'
                ? 'in_progress'
                : 'pending';
          merged.push({
            id: r.id,
            compliance_type: r.itr_type || 'ITR',
            title: `${r.itr_type || 'Income Tax'} Return (AY ${r.assessment_year || 'N/A'})`,
            financial_year: r.financial_year || r.assessment_year || 'N/A',
            due_date: r.due_date ? String(r.due_date).split('T')[0] : '',
            filing_date: r.filed_at ? String(r.filed_at).split('T')[0] : null,
            status: mappedStatus,
            acknowledgement_number: r.acknowledgement_number || null,
            notes: r.ca_remarks || null,
          });
        }
      }

      merged.sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''));
      setComplianceRecords(merged);
    } catch (err: any) {
      toast.error(err.message || 'Could not load compliance ledger.');
      setComplianceRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadCompliance();
    } else {
      setLoading(false);
    }
  }, [user, loadCompliance]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'filed':
        return (
          <span className="flex items-center gap-1 bg-lime-950 text-lime-500 border border-lime-600/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            FILED
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center gap-1 bg-red-950/50 text-red-500 border border-red-900/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
            <AlertCircle className="w-3 h-3" />
            OVERDUE
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 bg-blue-950 text-blue-500 border border-blue-600/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
            <Clock className="w-3 h-3" />
            IN PROGRESS
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-slate-900 text-slate-400 border border-slate-700/50 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
            <Calendar className="w-3 h-3" />
            {status.toUpperCase()}
          </span>
        );
    }
  };

  const filteredRecords = complianceRecords.filter((rec) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rec.compliance_type.toLowerCase().includes(q) ||
      rec.title.toLowerCase().includes(q) ||
      (rec.acknowledgement_number && rec.acknowledgement_number.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">
            Compliance Center
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
            Filing Returns Radar
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
            TRACK AND ACCESS ALL GST AND INCOME TAX RETURNS FILED BY OPERATORS
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadCompliance}
          disabled={loading}
          className="border-slate-800 text-slate-300 hover:bg-slate-800 rounded-none self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-none">
        <CardHeader className="border-b border-slate-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                Returns Ledger
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                Authorized list of tax filings and compliance timelines
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value)
                }
                className="bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-8 rounded-none focus:border-lime-600/50 outline-none"
              >
                <option value="all">ALL STATUSES</option>
                <option value="filed">FILED ONLY</option>
                <option value="pending">PENDING ONLY</option>
                <option value="in_progress">IN PROGRESS ONLY</option>
                <option value="overdue">OVERDUE ONLY</option>
              </select>
            </div>
          </div>

          <div className="relative w-full group mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-lime-500 transition-colors" />
            <Input
              type="text"
              placeholder="SEARCH FILING TYPES OR ACKS..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full bg-black border-slate-800 focus:border-lime-600/50 pl-10 h-9 rounded-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600 transition-all"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="w-6 h-6 text-lime-500 animate-spin" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
              No compliance filings or deadlines recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-black border border-slate-800 hover:border-slate-700 transition-all gap-4 rounded-none"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-900 border border-slate-800 text-lime-500 rounded-none">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-black uppercase text-white tracking-wider">
                          {rec.title}
                        </p>
                        {getStatusBadge(rec.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        <span>FY: {rec.financial_year}</span>
                        {rec.due_date && (
                          <>
                            <span>•</span>
                            <span>DUE: {rec.due_date}</span>
                          </>
                        )}
                        {rec.filing_date && (
                          <>
                            <span>•</span>
                            <span className="text-lime-500">FILED: {rec.filing_date}</span>
                          </>
                        )}
                      </div>
                      {rec.acknowledgement_number && (
                        <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                          ACK: {rec.acknowledgement_number}
                        </p>
                      )}
                      {rec.notes && (
                        <p className="text-[10px] text-slate-400 italic font-medium mt-1">
                          {rec.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {rec.status === 'filed' && (
                    <Button
                      onClick={() => downloadAcknowledgementSlip(rec, user?.email || '')}
                      className="bg-transparent hover:bg-lime-600 hover:text-black border border-lime-600/30 hover:border-lime-600 text-lime-500 font-black uppercase tracking-widest text-[9px] px-3 h-8 rounded-none flex items-center gap-1.5 transition-all self-end sm:self-center"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Slip
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
