"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, Download, Send, Plus, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface GSTNoticeItem {
  id: string;
  title: string;
  description: string;
  client_id: string;
  clientName?: string;
  due_date: string;
  status: string;
  priority: string;
}

export default function CAGSTNoticesPage() {
  const [notices, setNotices] = useState<GSTNoticeItem[]>([]);
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, clientRes] = await Promise.all([
        fetch('/api/compliance', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);
      const compJson = await compRes.json();
      const clientJson = await clientRes.json();

      const clientList = (clientJson.clients || clientJson.data || []).map((c: any) => ({
        id: c.id,
        name: c.display_name || c.full_name || c.email || 'Client',
      }));
      setClients(clientList);
      if (clientList.length > 0) {
        setClientId((prev) => prev || clientList[0].id);
      }

      const clientMap = new Map<string, string>(clientList.map((c: any) => [c.id, c.name]));
      const rawItems = Array.isArray(compJson.data) ? compJson.data : [];
      const gstItems = rawItems
        .filter((item: any) => String(item.type || item.compliance_type || '').toUpperCase().includes('GST'))
        .map((item: any) => ({
          ...item,
          clientName: clientMap.get(item.client_id) || 'Assigned Client',
        }));

      setNotices(gstItems);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load GST notices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error('Please enter notice reference / section and response due date.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: clientId || undefined,
          title: title.trim(),
          description: description.trim() || 'GST Scrutiny / Departmental Notice',
          type: 'GST_NOTICE',
          priority: 'high',
          dueDate,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to log GST notice');
      }
      setTitle('');
      setDescription('');
      setShowAdd(false);
      toast.success('GST notice logged successfully');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Could not log notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResponded = async (item: GSTNoticeItem) => {
    try {
      const res = await fetch('/api/compliance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: item.id, status: 'completed' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success('Notice marked as responded');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update notice');
    }
  };

  const handleDownloadBrief = (item: GSTNoticeItem) => {
    const content = `TAXMATE GST NOTICE BRIEF\nNotice/Title: ${item.title}\nClient: ${item.clientName}\nDue Date: ${item.due_date}\nStatus: ${item.status}\nDetails: ${item.description || 'N/A'}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gst-notice-${item.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
              <AlertCircle className="w-6 h-6 text-lime-500" /> GST Notices &amp; Scrutiny Management
            </h1>
            <p className="text-sm text-slate-400">Track and respond to ASMT-10, DRC-01, and departmental notices</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={() => setShowAdd((p) => !p)} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'Log GST Notice'}
          </Button>
        </div>
      </div>

      {showAdd && (
        <Card className="bg-slate-900 border-slate-800 p-6">
          <form onSubmit={handleLogNotice} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs">
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Notice Ref &amp; Section *</label>
              <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="GST-ASMT-10 / Sec 61" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Summary / Demand Note</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ITC GSTR-2B mismatch reconciliation" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Reply Due Date *</label>
              <Input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                {submitting ? 'Saving...' : 'Save Notice'}
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
                <TableHead className="text-slate-400">Notice / Section</TableHead>
                <TableHead className="text-slate-400">Client Name</TableHead>
                <TableHead className="text-slate-400">Details</TableHead>
                <TableHead className="text-slate-400">Response Due Date</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading GST compliance notices...
                  </TableCell>
                </TableRow>
              ) : notices.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No active GST notices or scrutiny items found.
                  </TableCell>
                </TableRow>
              ) : (
                notices.map((n) => (
                  <TableRow key={n.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-mono text-xs text-lime-400 font-semibold">{n.title}</TableCell>
                    <TableCell className="font-semibold text-slate-100">{n.clientName}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{n.description || 'GST Compliance Item'}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{n.due_date ? String(n.due_date).slice(0, 10) : '-'}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${
                          n.status === 'completed'
                            ? 'bg-lime-600/20 text-lime-400 border-lime-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}
                      >
                        {String(n.status || 'open').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadBrief(n)} className="border-slate-800 text-slate-300 gap-1">
                        <Download className="w-3.5 h-3.5" /> Brief
                      </Button>
                      {n.status !== 'completed' && (
                        <Button size="sm" onClick={() => handleMarkResponded(n)} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-1">
                          <Send className="w-3.5 h-3.5" /> Mark Responded
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
