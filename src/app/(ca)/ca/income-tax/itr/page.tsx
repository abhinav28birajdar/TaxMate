"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, ArrowLeft, Plus, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface ITRRecord {
  id: string;
  clientId: string;
  taxpayerName: string;
  pan: string;
  itrType: string;
  assessmentYear: string;
  grossIncome: number;
  refundAmount: number;
  taxAmount: number;
  status: string;
  acknowledgeNumber: string;
}

export default function CAITRFilingsPage() {
  const [filings, setFilings] = useState<ITRRecord[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string; pan: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [itrType, setItrType] = useState('ITR_1');
  const [assessmentYear, setAssessmentYear] = useState('AY 2026-27');
  const [grossIncome, setGrossIncome] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itrRes, clientRes] = await Promise.all([
        fetch('/api/itr', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);
      const itrJson = await itrRes.json();
      const clientJson = await clientRes.json();

      const clientList = (clientJson.clients || clientJson.data || []).map((c: any) => ({
        id: c.id,
        name: c.display_name || c.full_name || c.email || 'Client',
        pan: c.pan || '',
      }));
      setClients(clientList);
      if (clientList.length > 0) {
        setSelectedClientId((prev) => prev || clientList[0].id);
      }

      const clientMap = new Map<string, { name: string; pan: string }>(
        clientList.map((c: any) => [c.id, { name: c.name, pan: c.pan }])
      );

      const rawFilings = Array.isArray(itrJson.data) ? itrJson.data : [];
      setFilings(
        rawFilings.map((f: any) => {
          const fallback = clientMap.get(f.clientId);
          return {
            ...f,
            taxpayerName: f.taxpayerName || fallback?.name || 'Client',
            pan: f.pan || fallback?.pan || '-',
          };
        })
      );
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load ITR records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateITR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error('Please select a client first.');
      return;
    }
    const client = clients.find((c) => c.id === selectedClientId);
    setSubmitting(true);
    try {
      const res = await fetch('/api/itr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: selectedClientId,
          itrType,
          financialYear: '2025-26',
          assessmentYear,
          grossIncome: Number(grossIncome || 0),
          taxAmount: Number(taxAmount || 0),
          refundAmount: Number(refundAmount || 0),
          pan: client?.pan || '',
          taxpayerName: client?.name || '',
          status: 'in-progress',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to start ITR computation');
      }
      setShowCreate(false);
      setGrossIncome('');
      setTaxAmount('');
      setRefundAmount('');
      toast.success('ITR record created');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create ITR');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkFiled = async (id: string) => {
    try {
      const res = await fetch('/api/itr', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status: 'submitted', eVerified: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success('ITR marked as submitted');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
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
              <FileSpreadsheet className="w-6 h-6 text-lime-500" /> Income Tax Returns (ITR) Filing
            </h1>
            <p className="text-sm text-slate-400">Income Tax computation, filing tracker &amp; e-verification status</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setShowCreate((p) => !p)} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Plus className="w-4 h-4" /> {showCreate ? 'Close' : 'Start New ITR Computation'}
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <form onSubmit={handleCreateITR} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Client *</label>
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs">
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">ITR Form</label>
              <select value={itrType} onChange={(e) => setItrType(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs">
                <option value="ITR_1">ITR-1</option>
                <option value="ITR_2">ITR-2</option>
                <option value="ITR_3">ITR-3</option>
                <option value="ITR_4">ITR-4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Assessment Year</label>
              <Input value={assessmentYear} onChange={(e) => setAssessmentYear(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Gross Income (₹)</label>
              <Input type="number" min="0" value={grossIncome} onChange={(e) => setGrossIncome(e.target.value)} placeholder="1500000" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Refund Due (₹)</label>
              <Input type="number" min="0" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div className="md:col-span-5 flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                {submitting ? 'Creating...' : 'Create ITR Computation'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Assessee Name</TableHead>
                <TableHead className="text-slate-400">PAN Number</TableHead>
                <TableHead className="text-slate-400">Form Type</TableHead>
                <TableHead className="text-slate-400">Assessment Year</TableHead>
                <TableHead className="text-slate-400">Gross Income</TableHead>
                <TableHead className="text-slate-400">Refund / Payable</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Ack / Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading ITR filings...
                  </TableCell>
                </TableRow>
              ) : filings.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={8} className="py-12 text-center text-slate-400">
                    No ITR filings recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                filings.map((f) => (
                  <TableRow key={f.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-semibold text-slate-100">{f.taxpayerName}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">{f.pan}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700">{f.itrType}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-300 text-xs">{f.assessmentYear}</TableCell>
                    <TableCell className="font-semibold text-slate-100">₹{Number(f.grossIncome || 0).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="text-lime-400 font-medium">
                      {f.refundAmount > 0 ? `Refund ₹${f.refundAmount.toLocaleString('en-IN')}` : `Tax ₹${Number(f.taxAmount || 0).toLocaleString('en-IN')}`}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-slate-200 border-slate-700 text-xs">
                        {String(f.status || 'in-progress').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-slate-400">
                      {f.acknowledgeNumber ? (
                        f.acknowledgeNumber
                      ) : f.status !== 'submitted' && f.status !== 'completed' ? (
                        <Button size="sm" variant="outline" onClick={() => handleMarkFiled(f.id)} className="border-slate-700 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Filed
                        </Button>
                      ) : (
                        '-'
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
