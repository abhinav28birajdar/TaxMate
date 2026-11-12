"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Calendar, Clock, Plus, User, Play, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CAMeetingItem {
  id: string;
  title: string;
  clientName: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingType: string;
  status: string;
}

export default function CAMeetingsPage() {
  const [meetings, setMeetings] = useState<CAMeetingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/appointments', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load meetings');

      const raw = json.appointments || json.data || [];
      const mapped = raw.map((a: any) => ({
        id: String(a.id),
        title: a.title || a.consultation_type || 'Client Consultation',
        clientName: a.client_name || a.client?.full_name || a.client?.name || 'Client',
        scheduledAt: a.scheduled_at || a.start_time || a.created_at,
        durationMinutes: Number(a.duration_minutes || 45),
        meetingType: a.meeting_type || 'video',
        status: String(a.status || 'PENDING').toLowerCase(),
      }));
      setMeetings(mapped);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load consultations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-6 h-6 text-lime-500" /> Consultations &amp; Meetings
          </h1>
          <p className="text-sm text-slate-400">Manage client video meetings and consultation sessions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadMeetings} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Link href="/ca/meetings/schedule">
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
              <Plus className="w-4 h-4" /> Schedule New Meeting
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading scheduled meetings...
        </div>
      ) : meetings.length === 0 ? (
        <Card className="p-10 bg-slate-900 border-slate-800 text-center space-y-3">
          <Video className="w-9 h-9 text-lime-500 mx-auto opacity-80" />
          <h2 className="text-base font-semibold text-slate-100">No Scheduled Meetings</h2>
          <p className="text-xs text-slate-400">Schedule a consultation with any client to see it listed here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((m) => (
            <Card key={m.id} className="p-5 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-slate-100 text-lg">{m.title}</h3>
                  <Badge
                    className={`text-xs ${
                      m.status === 'confirmed'
                        ? 'bg-lime-600/20 text-lime-400 border-lime-500/30'
                        : m.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {m.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-lime-500" /> {m.clientName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />{' '}
                    {m.scheduledAt ? new Date(m.scheduledAt).toLocaleDateString('en-IN') : 'TBD'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" /> {m.durationMinutes} mins
                  </span>
                  <span className="flex items-center gap-1.5 uppercase">
                    <Video className="w-3.5 h-3.5 text-slate-500" /> {m.meetingType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href={`/ca/meetings/${m.id}`}>
                  <Button variant="outline" className="border-slate-800 bg-slate-950 text-slate-300">
                    View Details
                  </Button>
                </Link>
                {m.status !== 'cancelled' && m.status !== 'completed' && (
                  <Link href={`/ca/calls/${m.id}`}>
                    <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
                      <Play className="w-4 h-4 fill-slate-950" /> Join Meeting Room
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
