'use client';

import { useState } from 'react';
import { Calendar, Video, Clock, Plus, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientMeetingsPage() {
  const meetings = [
    { title: 'Tax Planning & Sec 115BAC Regime Review', caName: 'CA Rajesh Sharma', date: '25 Oct 2026', time: '04:00 PM - 04:45 PM', status: 'CONFIRMED' },
    { title: 'GSTR-3B Input Tax Credit Reconciliation', caName: 'CA Ananya Deshmukh', date: '12 Oct 2026', time: '02:00 PM - 02:30 PM', status: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-lime-600" /> Booked Consultations & Meetings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Schedule video consultations and advisory calls with your assigned CA.</p>
        </div>
        <Link href="/client/find-ca">
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-1.5" /> Book Consultation
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {meetings.map((m, i) => (
          <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{m.title}</h4>
                <p className="text-xs text-slate-400">With {m.caName} • {m.date} ({m.time})</p>
              </div>
            </div>

            <Link href="/ca/calls">
              <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs">
                <Video className="w-3.5 h-3.5 mr-1" /> Join Call Room
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
