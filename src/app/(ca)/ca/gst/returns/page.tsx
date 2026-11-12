'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Search, Upload, RefreshCw, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';

interface ReturnRow {
  id: string;
  gstin: string;
  client: string;
  returnType: string;
  period: string;
  dueDate: string;
  status: string;
  taxAmount: number;
}

export default function CAGSTReturnsPage() {
  const [search, setSearch] = useState('');
  const [returns, setReturns] = useState<ReturnRow[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [gstrType, setGstrType] = useState('GSTR_3B');
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalTax, setTotalTax] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [gstRes, clientRes] = await Promise.all([
        fetch('/api/gst', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);

      const clientList: any[] = clientRes.ok ? (await clientRes.json()).clients || [] : [];
      setClients(clientList);
      if (clientList.length > 0 && !selectedClientId) {
        setSelectedClientId(clientList[0].id);
      }

      const clientMap = new Map(clientList.map((c: any) => [c.id, c]));
      if (gstRes.ok) {
        const gJson = await gstRes.json();
        setReturns(
          (gJson.data || []).map((item: any) => {
            const c = item.clientId ? clientMap.get(item.clientId) : null;
            return {
              id: item.id,
              gstin: c?.gstin || 'N/A',
              client: c?.display_name || c?.full_name || 'Client',
              returnType: String(item.gstrType || 'GSTR_1').replace('_', '-'),
              period: `FY ${item.year || new Date().getFullYear()}`,
              dueDate: item.dueDate ? String(item.dueDate).split('T')[0] : 'TBD',
              status: String(item.status || 'not-started'),
              taxAmount: Number(item.totalTax || 0),
            };
          })
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load GST tracker');
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error('Please select a client');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/gst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: selectedClientId,
          gstrType,
          year: new Date().getFullYear().toString(),
          month: new Date().getMonth() + 1,
          dueDate,
          totalTax: Number(totalTax || 0),
          status: 'in-progress',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not create GST filing');
      }
      toast.success('GST return tracking entry created!');
      setShowModal(false);
      setTotalTax('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add filing');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = returns.filter(
    (r) =>
      r.client.toLowerCase().includes(search.toLowerCase()) ||
      r.gstin.toLowerCase().includes(search.toLowerCase()) ||
      r.returnType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/ca/gst">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-lime-500" /> GST Returns Filing Management
            </h1>
            <p className="text-sm text-slate-400">
              Track GSTR-1, GSTR-3B, GSTR-9 annual returns for all assigned clients
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
            className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2"
          >
            <Upload className="w-4 h-4" /> File New Return
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <Input
            placeholder="Search by Client Name, Form, or GSTIN..."
            className="pl-9 bg-slate-950 border-slate-800 text-slate-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Client Name</TableHead>
                <TableHead className="text-slate-400">GSTIN</TableHead>
                <TableHead className="text-slate-400">Form Type</TableHead>
                <TableHead className="text-slate-400">Period</TableHead>
                <TableHead className="text-slate-400">Due Date</TableHead>
                <TableHead className="text-slate-400">Tax Liability</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    Loading GST filings...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 italic">
                    No GST returns found. Click &ldquo;File New Return&rdquo; to track a client return.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-semibold text-slate-100">{r.client}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{r.gstin}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700">
                        {r.returnType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 text-xs">{r.period}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{r.dueDate}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-200">
                      ₹{r.taxAmount.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          r.status === 'completed'
                            ? 'bg-lime-600/20 text-lime-400 border-lime-500/30'
                            : r.status === 'in-progress'
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {r.status.replace(/-/g, ' ').toUpperCase()}
                      </Badge>
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
              <h3 className="font-bold text-base">Track GST Return Filing</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateReturn} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300">Client *</label>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300">Form Type</label>
                  <select
                    value={gstrType}
                    onChange={(e) => setGstrType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="GSTR_1">GSTR-1</option>
                    <option value="GSTR_3B">GSTR-3B</option>
                    <option value="GSTR_9">GSTR-9</option>
                  </select>
                </div>
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
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Estimated Liability (₹)</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="e.g. 45200"
                  value={totalTax}
                  onChange={(e) => setTotalTax(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                />
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
                  {submitting ? 'Saving...' : 'Create Filing'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
