'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Clock, 
    Play, 
    Square, 
    Plus, 
    Calendar, 
    FileSpreadsheet, 
    Timer, 
    ChevronLeft, 
    ChevronRight,
    CheckCircle,
    Building
} from 'lucide-react';
import { toast } from 'sonner';

export default function OperatorTimePage() {
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [tasks, setTasks] = useState<any[]>([]);
    const [timeEntries, setTimeEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Active Timer states
    const [timerActive, setTimerActive] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerClient, setTimerClient] = useState('');
    const [timerTask, setTimerTask] = useState('');
    const [timerDesc, setTimerDesc] = useState('');
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Manual Entry Form states
    const [manualClient, setManualClient] = useState('');
    const [manualTask, setManualTask] = useState('');
    const [manualDesc, setManualDesc] = useState('');
    const [manualHours, setManualHours] = useState('');
    const [manualDate, setManualDate] = useState('');
    const [manualBillable, setManualBillable] = useState(true);
    const [saving, setSaving] = useState(false);

    // Week grid selection
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        return new Date(d.setDate(diff));
    });

    const supabase = createClient();

    useEffect(() => {
        if (timerActive) {
            timerIntervalRef.current = setInterval(() => {
                setTimerSeconds(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
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
            secs.toString().padStart(2, '0')
        ].join(':');
    };

    useEffect(() => {
        if (!user) return;

        const loadTimeTrackingData = async () => {
            try {
                // Find organization ID
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user.id)
                    .maybeSingle();

                const orgId = profile?.organization_id;
                if (!orgId) {
                    loadMockData();
                    return;
                }

                // Parallel fetches
                const [clientsRes, tasksRes, timeRes] = await Promise.all([
                    supabase.from('clients').select('id, full_name').eq('organization_id', orgId),
                    supabase.from('tasks').select('id, title, client_id').eq('organization_id', orgId),
                    supabase.from('time_entries').select('*, clients(full_name), tasks(title)').eq('organization_id', orgId).order('start_time', { ascending: false })
                ]);

                setClients(clientsRes.data || []);
                setTasks(tasksRes.data || []);
                setTimeEntries(timeRes.data || []);
            } catch (err: any) {
                console.warn('SWR Time Track database query fallback.', err.message);
                loadMockData();
            } finally {
                setLoading(false);
            }
        };

        const loadMockData = () => {
            setClients([
                { id: 'c-1', full_name: 'ABC Business Solutions' },
                { id: 'c-2', full_name: 'Aditya Birla Services' }
            ]);
            setTasks([
                { id: 't-1', title: 'File GSTR-1 for ABC Corp', client_id: 'c-1' },
                { id: 't-2', title: 'Audit ITR statements - Dr. Shah', client_id: 'c-2' }
            ]);
            setTimeEntries([
                {
                    id: 'te-1',
                    client_id: 'c-1',
                    task_id: 't-1',
                    description: 'Reconciling sales invoices spreadsheet logs',
                    duration_minutes: 120,
                    start_time: new Date(Date.now() - 86400000).toISOString(),
                    is_billable: true,
                    hourly_rate: 1500,
                    amount: 3000
                },
                {
                    id: 'te-2',
                    client_id: 'c-2',
                    task_id: 't-2',
                    description: 'Initial review of asset filings',
                    duration_minutes: 45,
                    start_time: new Date().toISOString(),
                    is_billable: false,
                    hourly_rate: 0,
                    amount: 0
                }
            ]);
        };

        loadTimeTrackingData();
    }, [user, supabase]);

    const handleStartStopTimer = async () => {
        if (!timerActive) {
            // Start Timer
            setTimerSeconds(0);
            setTimerActive(true);
            toast.success('Stopwatch timer started.');
        } else {
            // Stop Timer and Save
            setTimerActive(false);
            const durationMins = Math.max(1, Math.round(timerSeconds / 60));

            try {
                // Find organization ID
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('organization_id')
                    .eq('id', user?.id)
                    .maybeSingle();

                const orgId = profile?.organization_id || '00000000-0000-0000-0000-000000000000';

                const newEntry = {
                    organization_id: orgId,
                    user_id: user?.id,
                    client_id: timerClient || clients[0]?.id,
                    task_id: timerTask || null,
                    description: timerDesc || 'Stopwatch logged description',
                    start_time: new Date(Date.now() - timerSeconds * 1000).toISOString(),
                    end_time: new Date().toISOString(),
                    duration_minutes: durationMins,
                    is_billable: true,
                    hourly_rate: 1000,
                    amount: Math.round((durationMins / 60) * 1000)
                };

                const { data, error } = await supabase
                    .from('time_entries')
                    .insert(newEntry)
                    .select()
                    .single();

                if (error) {
                    // Simulated insert
                    setTimeEntries(prev => [{
                        id: `te-mock-${Date.now()}`,
                        ...newEntry,
                        clients: { full_name: clients.find(c => c.id === timerClient)?.full_name || 'Generic Client' },
                        tasks: { title: tasks.find(t => t.id === timerTask)?.title || 'Generic Task' }
                    }, ...prev]);
                    toast.success('Sandbox: simulated stopwatch time log.');
                } else if (data) {
                    setTimeEntries(prev => [data, ...prev]);
                    toast.success('Stopwatch time entry saved to database.');
                }

                setTimerDesc('');
            } catch (err) {
                toast.error('Failed to save stopwatch entry.');
            }
        }
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualClient || !manualHours || !manualDate) {
            toast.error('Please specify client, date and hours.');
            return;
        }

        setSaving(true);
        try {
            const mins = Math.round(parseFloat(manualHours) * 60);
            const startTime = new Date(`${manualDate}T09:00:00`);
            const endTime = new Date(startTime.getTime() + mins * 60 * 1000);

            // Find organization ID
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user?.id)
                .maybeSingle();

            const orgId = profile?.organization_id || '00000000-0000-0000-0000-000000000000';

            const newEntry = {
                organization_id: orgId,
                user_id: user?.id,
                client_id: manualClient,
                task_id: manualTask || null,
                description: manualDesc || 'Manually logged hours',
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                duration_minutes: mins,
                is_billable: manualBillable,
                hourly_rate: manualBillable ? 1500 : 0,
                amount: manualBillable ? Math.round((mins / 60) * 1500) : 0
            };

            const { data, error } = await supabase
                .from('time_entries')
                .insert(newEntry)
                .select()
                .single();

            if (error) {
                setTimeEntries(prev => [{
                    id: `te-mock-${Date.now()}`,
                    ...newEntry,
                    clients: { full_name: clients.find(c => c.id === manualClient)?.full_name || 'Generic Client' },
                    tasks: { title: tasks.find(t => t.id === manualTask)?.title || 'Generic Task' }
                }, ...prev]);
                toast.success('Sandbox: simulated manual time log.');
            } else if (data) {
                setTimeEntries(prev => [data, ...prev]);
                toast.success('Manual time entry logged successfully.');
            }

            setManualDesc('');
            setManualHours('');
            setManualDate('');
        } catch (err) {
            toast.error('Could not save manual time log.');
        } finally {
            setSaving(false);
        }
    };

    const handleExportCSV = () => {
        toast.info('Exporting time tracking spreadsheet...');
        const headers = 'Client,Task,Description,Minutes,Billable,Amount,Date\n';
        const rows = timeEntries.map(t => {
            const clientName = t.clients?.full_name || clients.find(c => c.id === t.client_id)?.full_name || 'N/A';
            const taskTitle = t.tasks?.title || tasks.find(tk => tk.id === t.task_id)?.title || 'N/A';
            return `"${clientName}","${taskTitle}","${t.description}",${t.duration_minutes},${t.is_billable},₹${t.amount},"${t.start_time.split('T')[0]}"`;
        }).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TaxMate_Time_Report_${Date.now()}.csv`;
        a.click();
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
        timeEntries.forEach(t => {
            if (t.start_time.split('T')[0] === dateStr) {
                totalMins += Number(t.duration_minutes || 0);
            }
        });
        return (totalMins / 60).toFixed(1);
    };

    // Summary calculations
    let billableMins = 0;
    let nonBillableMins = 0;
    let billableVal = 0;

    timeEntries.forEach(t => {
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
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Resource Ledger</span>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                        Time sheet command
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

            {/* stopwatch widget & manual entry */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active stopwatch console */}
                <Card className="bg-slate-900 border-slate-800 rounded-none relative overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                    <CardHeader className="border-b border-slate-800 pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Stopwatch Console</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Record operations stopwatch logs in real time</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="text-center space-y-2 py-4 bg-black border border-slate-800 relative">
                            {timerActive && (
                                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-ping" />
                                    <span className="text-[8px] font-black text-lime-500 uppercase tracking-widest">Active</span>
                                </div>
                            )}
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Elapsed Operations Duration</p>
                            <p className="text-4xl font-black text-white font-mono tracking-widest">
                                {formatTimerTime(timerSeconds)}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Client Reference</Label>
                                <select
                                    value={timerClient}
                                    onChange={(e) => setTimerClient(e.target.value)}
                                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                                >
                                    <option value="">Select client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Task Reference</Label>
                                <select
                                    value={timerTask}
                                    onChange={(e) => setTimerTask(e.target.value)}
                                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                                >
                                    <option value="">Select task...</option>
                                    {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Log memo</Label>
                                <Input
                                    value={timerDesc}
                                    onChange={(e) => setTimerDesc(e.target.value)}
                                    placeholder="Brief task activity notes..."
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                                />
                            </div>

                            <Button 
                                onClick={handleStartStopTimer}
                                className={timerActive 
                                    ? "w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest italic rounded-none h-11 transition-all flex items-center justify-center gap-2"
                                    : "w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all flex items-center justify-center gap-2"
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

                {/* Manual entry card */}
                <Card className="lg:col-span-2 bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="border-b border-slate-800 pb-3">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Manual entry Logger</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Record billable task sheets post-operation</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Client Entity *</Label>
                                    <select
                                        value={manualClient}
                                        onChange={(e) => setManualClient(e.target.value)}
                                        required
                                        className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                                    >
                                        <option value="">Select client...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Task Reference</Label>
                                    <select
                                        value={manualTask}
                                        onChange={(e) => setManualTask(e.target.value)}
                                        className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                                    >
                                        <option value="">Select task...</option>
                                        {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Hours spent *</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={manualHours}
                                        onChange={(e) => setManualHours(e.target.value)}
                                        placeholder="E.g. 2.5"
                                        className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Log Date *</Label>
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
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Activity description</Label>
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
                                <Label htmlFor="manualBillable" className="text-[9px] font-black uppercase tracking-wider text-slate-400 cursor-pointer select-none">
                                    Billable consultancy (₹1500 / hr)
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

            {/* Week Timesheet Calendar Grid */}
            <Card className="bg-slate-900 border-slate-800 rounded-none">
                <CardHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Timesheet Week Calendar</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Summary hours tracked in active week</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigateWeek('prev')} className="w-8 h-8 rounded-none border border-slate-800 text-slate-400 hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigateWeek('next')} className="w-8 h-8 rounded-none border border-slate-800 text-slate-400 hover:text-white">
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
                            <p className="text-xs font-black text-slate-400 font-mono">
                                {day.getDate()}
                            </p>
                            <div className="h-px bg-slate-800/60" />
                            <p className="text-sm font-black text-lime-500 font-mono">
                                {getLoggedHoursForDay(day)}h
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Summary statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Tracked Billable</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-white font-mono">{(billableMins / 60).toFixed(1)} hrs</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Invoiced / billable consultancy
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Tracked Non-Billable</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-slate-400 font-mono">{(nonBillableMins / 60).toFixed(1)} hrs</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Administrative operations
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="pb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Logged Billable Value</span>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-lime-500 font-mono">₹{billableVal.toLocaleString('en-IN')}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Pending accrual for client invoicing
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
