'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  User,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  client: string;
  date: string;
  time: string;
  category: string;
  priority: string;
}

export default function CACalendarPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newCategory, setNewCategory] = useState('gst');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDescription, setNewDescription] = useState('');

  const loadCalendar = useCallback(async () => {
    try {
      setLoading(true);
      const [deadRes, apptRes, taskRes, clientRes] = await Promise.all([
        fetch('/api/compliance/deadlines', { credentials: 'include' }),
        fetch('/api/appointments?limit=50', { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);

      const clientList: any[] = clientRes.ok ? (await clientRes.json()).clients || [] : [];
      setClients(clientList);

      const clientNameMap = new Map<string, string>();
      for (const c of clientList) {
        clientNameMap.set(c.id, c.display_name || c.full_name || 'Client');
      }

      const items: CalendarEvent[] = [];

      if (deadRes.ok) {
        const dJson = await deadRes.json();
        for (const d of dJson.data || []) {
          const catRaw = String(d.deadline_type || d.compliance_type || 'gst').toLowerCase();
          const cat = catRaw.includes('itr') || catRaw.includes('tds') || catRaw.includes('tax')
            ? 'income_tax'
            : catRaw.includes('audit')
              ? 'audit'
              : 'gst';

          items.push({
            id: `dead-${d.id}`,
            title: d.title || 'Compliance Deadline',
            client: clientNameMap.get(d.client_id) || 'Statutory Compliance',
            date: d.due_date ? String(d.due_date).split('T')[0] : 'TBD',
            time: '11:59 PM',
            category: cat,
            priority: d.status === 'overdue' ? 'urgent' : 'high',
          });
        }
      }

      if (apptRes.ok) {
        const aJson = await apptRes.json();
        for (const a of aJson.data?.appointments || []) {
          const dt = new Date(a.startTime);
          items.push({
            id: `appt-${a.id}`,
            title: a.title || 'Client Consultation',
            client: a.clientName || 'Client',
            date: Number.isNaN(dt.getTime()) ? 'TBD' : dt.toISOString().split('T')[0],
            time: Number.isNaN(dt.getTime())
              ? 'Scheduled'
              : dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            category: 'meeting',
            priority: 'medium',
          });
        }
      }

      if (taskRes.ok) {
        const tJson = await taskRes.json();
        for (const t of tJson.tasks || []) {
          if (!t.due_date || t.status === 'COMPLETED') continue;
          const typeRaw = String(t.task_type || '').toLowerCase();
          const cat = typeRaw.includes('audit')
            ? 'audit'
            : typeRaw.includes('gst')
              ? 'gst'
              : 'income_tax';
          items.push({
            id: `task-${t.id}`,
            title: t.title,
            client: t.client_name || clientNameMap.get(t.client_id) || 'Practice Task',
            date: String(t.due_date).split('T')[0],
            time: '05:00 PM',
            category: cat,
            priority: String(t.priority || 'medium').toLowerCase(),
          });
        }
      }

      items.sort((a, b) => a.date.localeCompare(b.date));
      setEvents(items);
    } catch (err: any) {
      toast.error(err.message || 'Could not load calendar schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    setSaving(true);
    try {
      const res = await fetch('/api/compliance/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle.trim(),
          deadlineType: newCategory,
          dueDate: newDate,
          clientId: newClientId || undefined,
          description: newDescription.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not save reminder');
      }

      toast.success('Calendar reminder saved to database!');
      setNewTitle('');
      setNewDescription('');
      setShowModal(false);
      await loadCalendar();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save calendar reminder');
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents =
    selectedCategory === 'all'
      ? events
      : events.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" /> Tax & Statutory Calendar
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Tax Calendar & Filing Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Unified schedule of compliance deadlines, client consultations, and task due dates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCalendar}
            className="border-white/10 text-gray-300 text-xs rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Custom Reminder
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'gst', 'income_tax', 'meeting', 'audit'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'bg-[#111111] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-base font-semibold text-white">
              Upcoming Practice Schedule ({filteredEvents.length})
            </h2>
            <span className="text-xs text-emerald-400 font-mono">Live Calendar</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs flex items-center justify-center">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading calendar items...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs italic">
              No scheduled deadlines, consultations, or task due dates found in this view.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-emerald-500/30 transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-white">{evt.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          evt.priority === 'urgent'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : evt.priority === 'high'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {evt.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-500" /> {evt.client}
                    </p>
                  </div>
                  <div className="text-right text-xs space-y-1 shrink-0">
                    <div className="text-emerald-400 font-mono font-medium flex items-center gap-1 justify-end">
                      <CalendarIcon className="w-3.5 h-3.5" /> {evt.date}
                    </div>
                    <div className="text-gray-400 flex items-center gap-1 justify-end text-[11px]">
                      <Clock className="w-3 h-3" /> {evt.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-emerald-400" /> Statutory Indian Tax Cadence
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-0.5">11th Monthly</span>
                <span className="text-gray-200 font-medium">GSTR-1 Outward Supplies Return</span>
                <p className="text-[10px] text-gray-500 mt-1">13th under QRMP scheme</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-0.5">20th Monthly</span>
                <span className="text-gray-200 font-medium">GSTR-3B Monthly Return & Tax</span>
                <p className="text-[10px] text-gray-500 mt-1">ITC matching & net GST liability</p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#161616] border border-white/5">
                <span className="text-emerald-400 font-bold block mb-0.5">31st Oct / 31st Jul</span>
                <span className="text-gray-200 font-medium">TDS Quarterly / ITR Statutory Filings</span>
                <p className="text-[10px] text-gray-500 mt-1">Form 24Q / 26Q & non-audit / audit ITR</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-white shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" /> Add Tax Calendar Reminder
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-gray-300 font-medium">Reminder Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., File Form 10IEA for Tax Regime Choice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Client (Optional)</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">General Practice Reminder</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name || c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gst">GST</option>
                    <option value="income_tax">Income Tax / TDS</option>
                    <option value="audit">Audit</option>
                    <option value="roc">ROC / Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-gray-300 font-medium">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-300 font-medium">Notes</label>
                <input
                  type="text"
                  placeholder="Filing notes or preparation checklist"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-white/10 text-gray-300 hover:bg-white/5 text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  {saving ? 'Saving...' : 'Save Reminder'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
