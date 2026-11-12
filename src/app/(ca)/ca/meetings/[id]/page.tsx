"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, Play, Copy, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CAMeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? String(params.id) : '';
  const router = useRouter();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadAppointment = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/appointments/${encodeURIComponent(id)}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.appointment) {
        throw new Error(json.error || 'Meeting not found');
      }
      setAppointment(json.appointment);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load meeting details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  const updateStatus = async (status: string) => {
    if (!appointment) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/appointments/${encodeURIComponent(appointment.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Status update failed');
      toast.success(`Meeting marked as ${status}`);
      await loadAppointment();
    } catch (err: any) {
      toast.error(err?.message || 'Could not update meeting');
    } finally {
      setUpdating(false);
    }
  };

  const roomPath = `/ca/calls/${id}`;
  const fullRoomUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${roomPath}` : roomPath;

  const copyRoomLink = () => {
    navigator.clipboard?.writeText(fullRoomUrl);
    toast.success('Meeting room link copied to clipboard');
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading meeting details...
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <p className="text-slate-300">Appointment not found or you do not have access.</p>
        <Button variant="outline" onClick={() => router.push('/ca/meetings')}>
          Back to Meetings
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              {appointment.title || appointment.consultation_type || 'Client Consultation'}
            </h1>
            <p className="text-xs font-mono text-slate-400">Meeting ID: {appointment.id}</p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {appointment.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-800 pb-6 text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-xs">Client</span>
              <span className="font-semibold text-slate-100 text-base">
                {appointment.client_name || appointment.metadata?.client_name || 'Assigned Client'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Format</span>
              <span className="text-slate-200 uppercase">{appointment.meeting_type || 'Video Consultation'}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-xs">Scheduled Date &amp; Time</span>
              <span className="font-semibold text-lime-400 text-base flex items-center gap-1.5">
                <Clock className="w-4 h-4" />{' '}
                {appointment.scheduled_at
                  ? new Date(appointment.scheduled_at).toLocaleString('en-IN')
                  : 'Pending schedule'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Duration</span>
              <span className="text-slate-200">{appointment.duration_minutes || 45} Minutes</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300">Agenda &amp; Notes</h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm whitespace-pre-line">
            {appointment.notes || appointment.description || 'No additional discussion notes added.'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs space-y-1">
            <span className="text-slate-400">Consultation Room Link:</span>
            <p className="font-mono text-slate-300 break-all">{fullRoomUrl}</p>
          </div>
          <Button variant="outline" className="border-slate-800 text-slate-300 gap-2 shrink-0" onClick={copyRoomLink}>
            <Copy className="w-4 h-4 text-lime-500" /> Copy Link
          </Button>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 pt-2">
          <div className="flex gap-2">
            {appointment.status === 'PENDING' && (
              <Button disabled={updating} variant="outline" onClick={() => updateStatus('CONFIRMED')} className="border-lime-500/40 text-lime-400">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm Slot
              </Button>
            )}
            {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
              <>
                <Button disabled={updating} variant="outline" onClick={() => updateStatus('COMPLETED')} className="border-slate-700 text-slate-200">
                  Mark Completed
                </Button>
                <Button disabled={updating} variant="ghost" onClick={() => updateStatus('CANCELLED')} className="text-red-400 hover:bg-red-500/10">
                  <XCircle className="w-4 h-4 mr-1.5" /> Cancel
                </Button>
              </>
            )}
          </div>

          <Link href={roomPath}>
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2 py-5 px-6">
              <Play className="w-4 h-4 fill-slate-950" /> Start Meeting Session
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
