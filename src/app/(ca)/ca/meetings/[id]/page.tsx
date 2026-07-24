"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Video, Calendar, Clock, User, ArrowLeft, Play, Copy, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CAMeetingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const meeting = {
    id: params.id,
    title: 'Q2 Tax Strategy & GST Reconciliation',
    clientName: 'Acme Solutions Pvt Ltd',
    clientEmail: 'contact@acmesolutions.in',
    date: 'Today, 24 July 2026',
    time: '03:30 PM - 04:30 PM (IST)',
    provider: 'LiveKit Cloud',
    roomUrl: `https://taxmate.in/call/room-acme-q2`,
    agenda: '1. Review Q2 Sales & Purchase Register\n2. Reconcile GSTR-2B with ITC Bookings\n3. Finalize Advance Tax installment computation',
    status: 'scheduled'
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(meeting.roomUrl);
    toast.success('Meeting URL copied to clipboard');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{meeting.title}</h1>
            <p className="text-sm text-slate-400">Meeting ID: {meeting.id}</p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {meeting.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-800 pb-6 text-sm">
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-xs">Client Name</span>
              <span className="font-semibold text-slate-100 text-base">{meeting.clientName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Client Contact</span>
              <span className="text-slate-200">{meeting.clientEmail}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-slate-400 block text-xs">Scheduled Time</span>
              <span className="font-semibold text-lime-400 text-base flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {meeting.date} ({meeting.time})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs">Video Provider</span>
              <span className="text-slate-200">{meeting.provider}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-slate-300">Agenda & Discussion Notes</h3>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm whitespace-pre-line">
            {meeting.agenda}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs space-y-1">
            <span className="text-slate-400">Secure Direct Room Link:</span>
            <p className="font-mono text-slate-300 break-all">{meeting.roomUrl}</p>
          </div>
          <Button variant="outline" className="border-slate-800 text-slate-300 gap-2 shrink-0" onClick={copyRoomLink}>
            <Copy className="w-4 h-4 text-lime-500" /> Copy Link
          </Button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link href={`/ca/calls/room-acme-q2`}>
            <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2 text-base py-6 px-8">
              <Play className="w-5 h-5 fill-slate-950" /> Start Meeting Session
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
