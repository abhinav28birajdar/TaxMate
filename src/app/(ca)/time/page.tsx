'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Play,
  Square,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorTimePage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerClient, setTimerClient] = useState('');
  const [timerTask, setTimerTask] = useState('');
  const [timerDesc, setTimerDesc] = useState('');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [manualClient, setManualClient] = useState('');
  const [manualTask, setManualTask] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualHours, setManualHours] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualBillable, setManualBillable] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  const formatTimerTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':');
  };

  const loadTimeTrackingData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsRes, tasksRes, timeRes] = await Promise.all([
        fetch('/api/clients?take=100', { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/time-entries', { credentials: 'include' }),
      ]);

      if (clientsRes.ok) {
        const cJson = await clientsRes.json();
        setClients(cJson.clients || []);
      }
      if (tasksRes.ok) {
        const tJson = await tasksRes.json();
        setTasks(tJson.tasks || []);
      }
      if (timeRes.ok) {
        const teJson = await timeRes.json();
        setTimeEntries(teJson.entries || []);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not load time tracking records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadTimeTrackingData();
    } else {
      setLoading(false);
    }
  }, [user, loadTimeTrackingData]);

  const handleStartStopTimer = async () => {
    if (!timerActive) {
      setTimerSeconds(0);
      setTimerActive(true);
      toast.success('Stopwatch timer started.');
      return;
    }

    setTimerActive(false);
    const durationMinutes = Math.max(1, Math.round(timerSeconds / 60));

    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - timerSeconds * 1000);
      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: timerClient || clients[0]?.id || null,
          taskId: timerTask || null,
          description: timerDesc.trim() || 'Stopwatch logged work',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMinutes,
          isBillable: true,
          hourlyRate: 1500,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save stopwatch entry');
      }

      toast.success('Stopwatch time entry saved to database.');
      setTimerDesc('');
      await loadTimeTrackingData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save stopwatch entry.');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(manualHours);
    if (!manualClient || !manualDate || Number.isNaN(hoursNum) || hoursNum <= 0) {
      toast.error('Please specify client, valid hours, and date.');
      return;
    }

    setSaving(true);
    try {
      const durationMinutes = Math.max(1, Math.round(hoursNum * 60));
      const startTime = new Date(`${manualDate}T09:00:00`);
      const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

      const res = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: manualClient,
          taskId: manualTask || null,
          description: manualDesc.trim() || 'Manual time entry',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMinutes,
          isBillable: manualBillable,
          hourlyRate: manualBillable ? 1500 : 0,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not save time entry');
      }

      toast.success('Manual time entry logged successfully.');
      setManualDesc('');
      setManualHours('');
      await loadTimeTrackingData();
    } catch (err: any) {
      toast.error(err.message || 'Could not save manual time log.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const res = await fetch(`/api/time-entries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Delete failed');
      }
      setTimeEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success('Time entry removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete time entry');
    }
  };

  const handleExportCSV = () => {
    if (timeEntries.length === 0) {
      toast.error('No time entries to export.');
      return;
    }
    const headers = 'Client,Task,Description,Minutes,Billable,Amount,Date\n';
    const rows = timeEntries
      .map((t) => {
        const clientName =
          t.clients?.full_name ||
          clients.find((c) => c.id === t.client_id)?.full_name ||
          'N/A';
        const taskTitle =
          t.tasks?.title || tasks.find((tk) => tk.id === t.task_id)?.title || 'N/A';
        return `"${clientName}","${taskTitle}","${String(t.description || '').replace(/"/g, '""')}",${
          t.duration_minutes
        },${t.is_billable},Rs.${t.amount},"${String(t.start_time || '').split('T')[0]}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaxMate_Time_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Timesheet CSV exported');
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start));
      start.setDate(start.getDate() + 1);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'prev' ? -7 : 7));
    setCurrentWeekStart(newStart);
  };

  const getLoggedHoursForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    let totalMins = 0;
    timeEntries.forEach((t) => {
      if (String(t.start_time || '').split('T')[0] === dateStr) {
        totalMins += Number(t.duration_minutes || 0);
      }
    });
    return (totalMins / 60).toFixed(1);
  };

  let billableMins = 0;
  let nonBillableMins = 0;
  let billableVal = 0;

  timeEntries.forEach((t) => {
    if (t.is_billable) {
      billableMins += Number(t.duration_minutes || 0);
      billableVal += Number(t.amount || 0);
    } else {
      nonBillableMins += Number(t.duration_minutes || 0);
    }
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">
            Resource Ledger
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
            Time Sheet Command
          </h1>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-transparent hover:bg-lime-600 hover:text-black border border-lime-600/30 hover:border-lime-600 text-lime-500 font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-none flex items-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export Timesheet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 rounded-none">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
              Stopwatch Console
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
              Record operations stopwatch logs in real time
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-2 py-4 bg-black border border-slate-800 relative">
              {timerActive && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-ping" />
                  <span className="text-[8px] font-black text-lime-500 uppercase tracking-widest">
                    Active
                  </span>
                </div>
              )}
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                Elapsed Operations Duration
              </p>
              <p className="text-4xl font-black text-white font-mono tracking-widest">
                {formatTimerTime(timerSeconds)}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                  Client Reference
                </Label>
                <select
                  value={timerClient}
                  onChange={(e) => setTimerClient(e.target.value)}
                  className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                >
                  <option value="">General Practice</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name || c.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                  Task Reference
                </Label>
                <select
                  value={timerTask}
                  onChange={(e) => setTimerTask(e.target.value)}
                  className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                >
                  <option value="">Select task...</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                  Log Memo
                </Label>
                <Input
                  value={timerDesc}
                  onChange={(e) => setTimerDesc(e.target.value)}
                  placeholder="Brief task activity notes..."
                  className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                />
              </div>

              <Button
                onClick={handleStartStopTimer}
                className={
                  timerActive
                    ? 'w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest italic rounded-none h-11 transition-all flex items-center justify-center gap-2'
                    : 'w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all flex items-center justify-center gap-2'
                }
              >
                {timerActive ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    TERMINATE & RECORD LOGS
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    INITIALIZE STOPWATCH
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-none">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
              Manual Entry Logger
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
              Record billable task sheets post-operation
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Client Entity *
                  </Label>
                  <select
                    value={manualClient}
                    onChange={(e) => setManualClient(e.target.value)}
                    required
                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                  >
                    <option value="">Select client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name || c.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Task Reference
                  </Label>
                  <select
                    value={manualTask}
                    onChange={(e) => setManualTask(e.target.value)}
                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                  >
                    <option value="">Select task...</option>
                    {tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Hours Spent *
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={manualHours}
                    onChange={(e) => setManualHours(e.target.value)}
                    placeholder="E.g. 2.5"
                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Log Date *
                  </Label>
                  <Input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                  Activity Description
                </Label>
                <Input
                  value={manualDesc}
                  onChange={(e) => setManualDesc(e.target.value)}
                  placeholder="Details of audit steps..."
                  className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="manualBillable"
                  checked={manualBillable}
                  onChange={(e) => setManualBillable(e.target.checked)}
                  className="rounded bg-black border-slate-800 text-lime-600 focus:ring-lime-500"
                />
                <Label
                  htmlFor="manualBillable"
                  className="text-[9px] font-black uppercase tracking-wider text-slate-400 cursor-pointer select-none"
                >
                  Billable consultancy (₹1,500 / hr)
                </Label>
              </div>

              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all"
              >
                {saving ? 'LOGGING HOURS...' : 'LOG MANUAL TIME ENTRY'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-none">
        <CardHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
              Timesheet Week Calendar
            </CardTitle>
            <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
              Summary hours tracked in active week
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('prev')}
              className="w-8 h-8 rounded-none border border-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateWeek('next')}
              className="w-8 h-8 rounded-none border border-slate-800 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-7 gap-3 text-center">
          {getWeekDays().map((day, idx) => (
            <div key={idx} className="p-3 bg-black border border-slate-800/80 rounded-none space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p className="text-xs font-black text-slate-400 font-mono">{day.getDate()}</p>
              <div className="h-px bg-slate-800/60" />
              <p className="text-sm font-black text-lime-500 font-mono">
                {getLoggedHoursForDay(day)}h
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800 rounded-none">
          <CardHeader className="pb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Total Tracked Billable
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-white font-mono">
              {(billableMins / 60).toFixed(1)} hrs
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Invoiced / billable consultancy
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-none">
          <CardHeader className="pb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Tracked Non-Billable
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-slate-400 font-mono">
              {(nonBillableMins / 60).toFixed(1)} hrs
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Administrative operations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 rounded-none">
          <CardHeader className="pb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Logged Billable Value
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black text-lime-500 font-mono">
              ₹{billableVal.toLocaleString('en-IN')}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
              Pending accrual for client invoicing
            </p>
          </CardContent>
        </Card>
      </div>

      {timeEntries.length > 0 && (
        <Card className="bg-slate-900 border-slate-800 rounded-none">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
              Recent Time Entries ({timeEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            {timeEntries.slice(0, 15).map((entry) => (
              <div
                key={entry.id}
                className="p-3 bg-black border border-slate-800 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <p className="font-bold text-white">{entry.description}</p>
                  <p className="text-[10px] text-slate-500">
                    {entry.clients?.full_name || 'Client'} • {entry.tasks?.title || 'Task'} •{' '}
                    {String(entry.start_time || '').split('T')[0]}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <p className="font-bold text-lime-500">
                      {(Number(entry.duration_minutes || 0) / 60).toFixed(2)}h
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {entry.is_billable ? `₹${Number(entry.amount || 0).toLocaleString('en-IN')}` : 'Non-billable'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="h-8 w-8 text-slate-500 hover:text-rose-500"
                    title="Delete time entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
