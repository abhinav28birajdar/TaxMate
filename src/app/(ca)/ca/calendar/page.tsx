"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Filter, CheckCircle, AlertTriangle, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CACalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [events, setEvents] = useState([
    { id: '1', title: 'GSTR-3B Monthly Filing Due', client: 'Acme Corp', date: '2026-08-20', time: '11:59 PM', category: 'gst', priority: 'high' },
    { id: '2', title: 'Advance Tax Q2 Consultation', client: 'Mehta Logistics', date: '2026-08-25', time: '02:00 PM', category: 'meeting', priority: 'medium' },
    { id: '3', title: 'TDS Return Filing (Form 26Q)', client: 'TechNova Solutions', date: '2026-08-31', time: '05:00 PM', category: 'income_tax', priority: 'urgent' },
    { id: '4', title: 'Statutory Audit Review', client: 'Apex Infra Ltd', date: '2026-09-05', time: '11:00 AM', category: 'audit', priority: 'medium' }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newCategory, setNewCategory] = useState('gst');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDate, setNewDate] = useState('2026-08-15');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newEvt = {
      id: Date.now().toString(),
      title: newTitle,
      client: newClient || 'General Client',
      date: newDate,
      time: '10:00 AM',
      category: newCategory,
      priority: newPriority,
    };
    setEvents([newEvt, ...events]);
    setNewTitle('');
    setNewClient('');
    setShowModal(false);
  };

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
        <Button onClick={() => setShowModal(true)} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2 shadow-md shadow-lime-600/20">
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
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Upcoming Schedule ({filteredEvents.length})</h2>
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
          <h2 className="text-lg font-semibold text-slate-100">Statutory Deadlines (August 2026)</h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-lime-400 font-bold block mb-0.5">August 11</span>
              <span className="text-slate-200 font-medium">GSTR-1 Monthly Return (July)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-lime-400 font-bold block mb-0.5">August 20</span>
              <span className="text-slate-200 font-medium">GSTR-3B Monthly Return (July)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-lime-400 font-bold block mb-0.5">September 15</span>
              <span className="text-slate-200 font-medium">Advance Tax Quarter 2 Installment</span>
            </div>
          </div>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-lime-400" /> Add Tax Reminder
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300 font-medium">Reminder Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., File Form 10IEA for Tax Regime"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-lime-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-300 font-medium">Client Name</label>
                <input
                  type="text"
                  placeholder="Client or Business Name"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-lime-500"
                  >
                    <option value="gst">GST</option>
                    <option value="income_tax">Income Tax</option>
                    <option value="meeting">Meeting</option>
                    <option value="audit">Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-slate-300 font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-lime-500"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-300 font-medium">Due Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-lime-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-800 text-slate-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold">
                  Save Reminder
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
