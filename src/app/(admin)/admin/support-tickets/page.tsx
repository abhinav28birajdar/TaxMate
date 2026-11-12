'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LifeBuoy, CheckCircle2, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/support-tickets', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load tickets');
      const list = json?.data?.tickets || json?.tickets || [];
      setTickets(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load support tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleUpdateTicket = async (ticketId: string, status: string) => {
    try {
      const res = await fetch('/api/v1/support-tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ticketId, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed');
      toast.success(`Ticket updated to ${status}`);
      await loadTickets();
    } catch (err: any) {
      toast.error(err?.message || 'Could not update ticket');
    }
  };

  const filtered = tickets.filter((t) => statusFilter === 'all' || String(t.status).toLowerCase() === statusFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-lime-500" /> Support Desk &amp; Escalations
          </h1>
          <p className="text-sm text-slate-400">Resolve customer and CA technical escalations across the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <Button variant="outline" size="sm" onClick={loadTickets} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Ticket #</TableHead>
                <TableHead className="text-slate-400">Subject</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Priority</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading tickets...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No support tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-mono text-xs text-lime-400">
                      {t.ticket_number || t.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{t.subject}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{t.description}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 uppercase">{t.category || 'general'}</TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-slate-200 text-[10px]">
                        {String(t.priority_label || t.priority || 'medium').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          t.status === 'resolved'
                            ? 'bg-lime-600/20 text-lime-400 text-[10px]'
                            : 'bg-amber-500/20 text-amber-400 text-[10px]'
                        }
                      >
                        {String(t.status || 'open').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/support-tickets/${t.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 h-7 text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Open
                        </Button>
                      </Link>
                      {t.status !== 'resolved' && (
                        <Button size="sm" variant="outline" onClick={() => handleUpdateTicket(t.id, 'resolved')} className="border-lime-500/30 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Resolve
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
