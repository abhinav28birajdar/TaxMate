"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Video, Calendar, Clock, Plus, User, CheckCircle2, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CAMeetingsPage() {
  const meetings = [
    {
      id: 'm1',
      title: 'Q2 Tax Strategy & GST Reconciliation',
      client: 'Acme Technologies Pvt Ltd',
      date: 'Today',
      time: '03:30 PM - 04:30 PM',
      medium: 'Video Call (LiveKit)',
      status: 'upcoming',
      roomId: 'room-acme-q2'
    },
    {
      id: 'm2',
      title: 'Individual ITR Filing Assistance',
      client: 'Pooja Verma',
      date: 'Tomorrow',
      time: '11:00 AM - 11:45 AM',
      medium: 'Video Call (Jitsi)',
      status: 'scheduled',
      roomId: 'room-pooja-itr'
    },
    {
      id: 'm3',
      title: 'Annual Statutory Audit Kickoff',
      client: 'Global Logistics Corp',
      date: '24 July 2026',
      time: '04:00 PM - 05:00 PM',
      medium: 'In Person',
      status: 'completed',
      roomId: 'room-global-audit'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Video className="w-6 h-6 text-lime-500" /> Consultations & Meetings
          </h1>
          <p className="text-sm text-slate-400">Manage client video meetings, LiveKit sessions, and phone calls</p>
        </div>
        <Link href="/ca/meetings/schedule">
          <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Plus className="w-4 h-4" /> Schedule New Meeting
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {meetings.map((m) => (
          <Card key={m.id} className="p-5 bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-100 text-lg">{m.title}</h3>
                <Badge className={`text-xs ${
                  m.status === 'upcoming' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' :
                  m.status === 'scheduled' ? 'bg-slate-800 text-slate-300 border-slate-700' :
                  'bg-slate-800 text-slate-500 border-slate-700'
                }`}>
                  {m.status.toUpperCase()}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-lime-500" /> {m.client}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> {m.date}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /> {m.time}</span>
                <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5 text-slate-500" /> {m.medium}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/ca/meetings/${m.id}`}>
                <Button variant="outline" className="border-slate-800 bg-slate-950 text-slate-300">View Details</Button>
              </Link>
              {m.status === 'upcoming' && (
                <Link href={`/ca/calls/${m.roomId}`}>
                  <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
                    <Play className="w-4 h-4 fill-slate-950" /> Join Meeting Room
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
