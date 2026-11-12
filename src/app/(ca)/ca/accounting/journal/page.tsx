"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, Plus, CheckCircle2, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  voucherNumber: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  status: 'draft' | 'posted';
}

export default function CAJournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');
  const [debitAccount, setDebitAccount] = useState('Accounts Receivable');
  const [creditAccount, setCreditAccount] = useState('Consultancy Revenue');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'draft' | 'posted'>('posted');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounting/journal', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load journal entries');
      }
      setEntries(Array.isArray(json.entries) ? json.entries : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load journal entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    if (!description.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.error('Provide a description and valid amount greater than ₹0.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/accounting/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date,
          description: description.trim(),
          debitAccount: debitAccount.trim(),
          creditAccount: creditAccount.trim(),
          amount: numericAmount,
          status,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save journal entry');
      }
      setEntries(json.entries || []);
      setDescription('');
      setAmount('');
      setShowForm(false);
      toast.success(`Created voucher ${json.entry?.voucherNumber || ''}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePost = async (id: string) => {
    try {
      const res = await fetch('/api/accounting/journal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status: 'posted' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to post voucher');
      setEntries(json.entries || []);
      toast.success('Journal entry posted');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/accounting/journal?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Delete failed');
      setEntries(json.entries || []);
      toast.success('Journal voucher deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/ca/accounting">
            <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-lime-500" /> Journal Entries
            </h1>
            <p className="text-sm text-slate-400">Post balanced debit and credit journal voucher entries</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadEntries} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setShowForm((prev) => !prev)} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Plus className="w-4 h-4" /> {showForm ? 'Close Form' : 'Create Journal Entry'}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Voucher Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Particulars / Narration *</label>
              <Input required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Monthly retainer fee accrual" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Debit Ledger</label>
              <Input value={debitAccount} onChange={(e) => setDebitAccount(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Credit Ledger</label>
              <Input value={creditAccount} onChange={(e) => setCreditAccount(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Balanced Amount (₹) *</label>
              <Input required type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="25000" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div className="md:col-span-6 flex items-center justify-between pt-2">
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={status === 'posted'} onChange={() => setStatus('posted')} /> Post Immediately
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" checked={status === 'draft'} onChange={() => setStatus('draft')} /> Save as Draft
                </label>
              </div>
              <Button type="submit" disabled={submitting} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                {submitting ? 'Saving...' : 'Save Journal Voucher'}
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
                <TableHead className="text-slate-400">Entry Number</TableHead>
                <TableHead className="text-slate-400">Date</TableHead>
                <TableHead className="text-slate-400">Particulars / Ledgers</TableHead>
                <TableHead className="text-slate-400">Debit (₹)</TableHead>
                <TableHead className="text-slate-400">Credit (₹)</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading journal entries...
                  </TableCell>
                </TableRow>
              ) : entries.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                    No journal vouchers recorded yet. Click &ldquo;Create Journal Entry&rdquo; to post your first voucher.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((j) => (
                  <TableRow key={j.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-mono text-xs text-lime-400 font-semibold">{j.voucherNumber}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{j.date}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{j.description}</div>
                      <div className="text-[11px] text-slate-400">
                        Dr: {j.debitAccount} → Cr: {j.creditAccount}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-slate-200">₹{Number(j.amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell className="font-mono text-slate-200">₹{Number(j.amount).toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          j.status === 'posted' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {j.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {j.status === 'draft' && (
                        <Button size="sm" variant="outline" onClick={() => handlePost(j.id)} className="border-slate-700 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Post
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(j.id)} aria-label="Delete voucher" className="text-red-400 hover:bg-red-500/10 h-7">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
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
