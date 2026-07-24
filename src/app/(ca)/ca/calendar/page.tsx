"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CACalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const events = [
    { id: '1', title: 'GSTR-3B Monthly Filing Due', client: 'Acme Corp', date: '2026-07-20', time: '11:59 PM', category: 'gst', priority: 'high' },
    { id: '2', title: 'Advance Tax Q2 Consultation', client: 'Mehta Logistics', date: '2026-07-25', time: '02:00 PM', category: 'meeting', priority: 'medium' },
    { id: '3', title: 'TDS Return Filing (Form 26Q)', client: 'TechNova Solutions', date: '2026-07-31', time: '05:00 PM', category: 'income_tax', priority: 'urgent' },
    { id: '4', title: 'Statutory Audit Review', client: 'Apex Infra Ltd', date: '2026-08-05', time: '11:00 AM', category: 'audit', priority: 'medium' }
  ];

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-lime-500" /> Tax & Compliance Calendar
          </h1>
          <p className="text-sm text-slate-400">Track statutory filing deadlines, client reviews, and appointments</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
          <Plus className="w-4 h-4" /> Add Calendar Reminder
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'gst', 'income_tax', 'meeting', 'audit'].map(cat => (
          <Button
            key={cat}
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className={`border-slate-800 capitalize ${
              selectedCategory === cat 
                ? 'bg-lime-600 text-slate-950 font-semibold border-lime-500' 
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {cat.replace('_', ' ')}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Upcoming Schedule</h2>
          <div className="space-y-3">
            {filteredEvents.map(evt => (
              <div key={evt.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-lime-500/40 transition-colors flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{evt.title}</span>
                    <Badge className={`text-xs ${
                      evt.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      evt.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-lime-600/20 text-lime-400 border-lime-500/30'
                    }`}>
                      {evt.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500" /> {evt.client}
                  </p>
                </div>
                <div className="text-right text-xs space-y-1">
                  <div className="text-lime-400 font-medium flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5" /> {evt.date}
                  </div>
                  <div className="text-slate-400 flex items-center gap-1 justify-end">
                    <Clock className="w-3.5 h-3.5" /> {evt.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-100">Statutory Deadlines (July 2026)</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-lime-400 font-bold block mb-0.5">July 20</span>
              <span className="text-slate-200 font-medium">GSTR-3B Filing for June</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-lime-400 font-bold block mb-0.5">July 31</span>
              <span className="text-slate-200 font-medium">ITR Filing Non-Audit Cases</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-lime-400 font-bold block mb-0.5">August 15</span>
              <span className="text-slate-200 font-medium">Form 16 / TDS Certificates</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
