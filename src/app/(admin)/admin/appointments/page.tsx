'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Search, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminAppointment {
  id: string;
  title: string;
  caName: string;
  clientName: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingType: string;
  status: string;
}

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=appointments', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load appointments');
      setAppointments(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section: 'appointments', id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success(`Appointment updated to ${status}`);
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    }
  };

  const filtered = appointments.filter((a) => {
    const q = search.trim().toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.caName.toLowerCase().includes(q) || a.clientName.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-lime-500" /> Platform Consultations &amp; Appointments
          </h1>
          <p className="text-sm text-slate-400">Monitor and moderate CA consultation schedules across the platform</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <Input
          placeholder="Search client, CA, or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
        />
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Session</TableHead>
                <TableHead className="text-slate-400">Client</TableHead>
                <TableHead className="text-slate-400">CA Partner</TableHead>
                <TableHead className="text-slate-400">Scheduled Time</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading appointments...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No consultation bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{a.title}</div>
                      <div className="text-[11px] text-slate-500">{a.durationMinutes} min • {a.meetingType}</div>
                    </TableCell>
                    <TableCell className="text-slate-300 text-xs">{a.clientName}</TableCell>
                    <TableCell className="text-slate-300 text-xs">{a.caName}</TableCell>
                    <TableCell className="text-slate-400 text-xs">
                      {a.scheduledAt ? new Date(a.scheduledAt).toLocaleString('en-IN') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700 text-xs">{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {a.status === 'PENDING' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, 'CONFIRMED')} className="border-lime-500/30 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Confirm
                        </Button>
                      )}
                      {a.status !== 'CANCELLED' && a.status !== 'COMPLETED' && (
                        <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, 'CANCELLED')} className="text-red-400 hover:bg-red-500/10 h-7 text-xs">
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
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
