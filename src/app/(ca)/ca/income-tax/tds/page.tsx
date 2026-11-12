'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Download, Plus, RefreshCw, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface TdsRow {
  id: string;
  deductor: string;
  tan: string;
  form: string;
  dueDate: string;
  totalTDS: number;
  status: string;
}

export default function CATDSPage() {
  const [tdsReturns, setTdsReturns] = useState<TdsRow[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [formType, setFormType] = useState('Form 26Q (Non-Salary)');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [amountDeposited, setAmountDeposited] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, clientRes] = await Promise.all([
        fetch('/api/compliance', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);

      const clientList: any[] = clientRes.ok ? (await clientRes.json()).clients || [] : [];
      setClients(clientList);
      if (clientList.length > 0 && !selectedClientId) {
        setSelectedClientId(clientList[0].id);
      }

      const clientMap = new Map(clientList.map((c: any) => [c.id, c]));
      if (compRes.ok) {
        const compJson = await compRes.json();
        const rows: TdsRow[] = (compJson.data || [])
          .filter((item: any) => {
            const text = `${item.compliance_type || ''} ${item.title || ''} ${item.category || ''}`.toLowerCase();
            return (
              text.includes('tds') ||
              text.includes('24q') ||
              text.includes('26q') ||
              text.includes('27q') ||
              text.includes('form 16')
            );
          })
          .map((item: any) => {
            const c = item.client_id ? clientMap.get(item.client_id) : null;
            return {
              id: item.id,
              deductor: c?.display_name || c?.full_name || 'Deductor Entity',
              tan: c?.tan || 'Pending TAN',
              form: item.title || item.compliance_type || 'Form 26Q',
              dueDate: item.due_date ? String(item.due_date).split('T')[0] : 'TBD',
              totalTDS: Number(item.metadata?.tdsAmount || 0),
              status: String(item.status || 'pending').toLowerCase(),
            };
          });
        setTdsReturns(rows);
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load TDS returns');
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error('Please select a deductor client');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: selectedClientId,
          title: formType,
          complianceType: 'tds',
          category: 'tds',
          dueDate,
          priority: 'high',
          notes: `Total TDS Deposited: Rs. ${Number(amountDeposited || 0).toLocaleString('en-IN')}`,
          metadata: { tdsAmount: Number(amountDeposited || 0) },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not create TDS return record');
      }
      toast.success('TDS return record created!');
      setShowModal(false);
      setAmountDeposited('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add TDS record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCertificateSummary = (row: TdsRow) => {
    const content = [
      'TAXMATE TDS QUARTERLY COMPLIANCE SUMMARY',
      `Deductor   : ${row.deductor}`,
      `TAN        : ${row.tan}`,
      `Form       : ${row.form}`,
      `Due Date   : ${row.dueDate}`,
      `Total TDS  : Rs. ${row.totalTDS.toLocaleString('en-IN')}`,
      `Status     : ${row.status.toUpperCase()}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TDS_Summary_${row.tan}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded TDS summary for ${row.deductor}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            <p className="text-sm text-slate-400">
              Manage 24Q, 26Q, 27Q filings and Form 16 certificate summaries
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="border-slate-800 text-slate-300">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add TDS Return
          </Button>
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
                <TableHead className="text-slate-400">Due Date</TableHead>
                <TableHead className="text-slate-400">Total TDS</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading TDS filings...
                  </TableCell>
                </TableRow>
              ) : tdsReturns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 italic">
                    No quarterly TDS filings tracked yet. Click &ldquo;Add TDS Return&rdquo; to track 24Q/26Q/27Q filings.
                  </TableCell>
                </TableRow>
              ) : (
                tdsReturns.map((t) => (
                  <TableRow key={t.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-semibold text-slate-100">{t.deductor}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{t.tan}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700">
                        {t.form}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 text-xs">{t.dueDate}</TableCell>
                    <TableCell className="font-semibold text-slate-100">
                      ₹{t.totalTDS.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          t.status === 'completed' || t.status === 'filed'
                            ? 'bg-lime-600/20 text-lime-400 border-lime-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCertificateSummary(t)}
                        className="border-slate-800 text-slate-300 gap-1"
                      >
                        <Download className="w-3.5 h-3.5 text-lime-500" /> Summary
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Track Quarterly TDS Return</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTds} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300">Deductor Client *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  {clients.length === 0 ? (
                    <option value="">No clients available</option>
                  ) : (
                    clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name || c.full_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Form Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="Form 24Q (Salary TDS)">Form 24Q (Salary TDS)</option>
                  <option value="Form 26Q (Non-Salary TDS)">Form 26Q (Non-Salary TDS)</option>
                  <option value="Form 27Q (NRI Payments TDS)">Form 27Q (NRI Payments TDS)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300">Due Date</label>
                  <Input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">TDS Deposited (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 120000"
                    value={amountDeposited}
                    onChange={(e) => setAmountDeposited(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedClientId}
                  className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold"
                >
                  {submitting ? 'Saving...' : 'Save TDS Entry'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
