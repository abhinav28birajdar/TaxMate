'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    LayoutDashboard, 
    FileText, 
    MessageSquare, 
    Calendar, 
    Upload, 
    DollarSign, 
    Clock, 
    ShieldCheck,
    ChevronRight,
    User,
    Mail,
    Phone
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientDashboard() {
    const { user } = useAuth();
    const [clientData, setClientData] = useState<any>(null);
    const [caProfile, setCaProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalInvoiced: 0,
        totalPaid: 0,
        outstanding: 0,
        pendingTasks: 0,
        dueCompliance: 0
    });
    const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
    const [recentCompliance, setRecentCompliance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        if (!user) return;

        const loadDashboardData = async () => {
            try {
                // 1. Get client details matching portal_user_id
                const { data: client, error: clientError } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('portal_user_id', user.id)
                    .maybeSingle();

                if (clientError) throw clientError;

                // A missing profile is a real onboarding state, not a reason to display fabricated financial data.
                if (!client) {
                    setClientData(null);
                    setCaProfile(null);
                    setStats({ totalInvoiced: 0, totalPaid: 0, outstanding: 0, pendingTasks: 0, dueCompliance: 0 });
                    setRecentInvoices([]);
                    setRecentCompliance([]);
                    setLoading(false);
                    return;
                }

                setClientData(client);

                // 2. Fetch assigned CA profile
                if (client.assigned_ca_id) {
                    const { data: ca } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', client.assigned_ca_id)
                        .maybeSingle();
                    if (ca) setCaProfile(ca);
                }

                // 3. Fetch invoices and calculate stats
                const { data: invoices } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('client_id', client.id);

                let totalInv = 0;
                let totalPd = 0;
                let out = 0;
                const activeInvoices: any[] = [];

                if (invoices) {
                    invoices.forEach(inv => {
                        totalInv += Number(inv.total_amount || 0);
                        totalPd += Number(inv.paid_amount || 0);
                        out += Number(inv.balance_due || 0);
                        if (inv.status === 'sent' || inv.status === 'partial' || inv.status === 'overdue') {
                            activeInvoices.push(inv);
                        }
                    });
                    setRecentInvoices(activeInvoices.slice(0, 3));
                }

                // 4. Fetch compliance items
                const { data: compliance } = await supabase
                    .from('compliance_records')
                    .select('*')
                    .eq('client_id', client.id);

                let dueCompCount = 0;
                if (compliance) {
                    const pendingList = compliance.filter(c => {
                        if (c.status === 'pending' || c.status === 'in_progress' || c.status === 'overdue') {
                            dueCompCount++;
                            return true;
                        }
                        return false;
                    });
                    setRecentCompliance(pendingList.slice(0, 3));
                }

                // 5. Fetch tasks
                const { count: taskCount } = await supabase
                    .from('tasks')
                    .select('*', { count: 'exact', head: true })
                    .eq('client_id', client.id)
                    .neq('status', 'completed');

                setStats({
                    totalInvoiced: totalInv,
                    totalPaid: totalPd,
                    outstanding: out,
                    pendingTasks: taskCount || 0,
                    dueCompliance: dueCompCount
                });

            } catch (err: any) {
                console.error('Error loading client dashboard data:', err);
                toast.error('Failed to sync live portal data. Showing backup info.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [user, supabase]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Retrieving Secure Feed...</span>
                </div>
            </div>
        );
    }

    if (!clientData) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="max-w-xl border-primary/20 bg-card">
                    <CardHeader>
                        <CardTitle>Complete your TaxMate profile</CardTitle>
                        <CardDescription>
                            Your secure client workspace is ready. Finish onboarding to connect your CA and load your tax records.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4 sm:flex-row">
                        <Link href="/onboarding/client">
                            <Button className="w-full sm:w-auto">Start onboarding</Button>
                        </Link>
                        <Link href="/portal/support">
                            <Button variant="outline" className="w-full sm:w-auto">Contact support</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Banner */}
            <div className="relative p-6 md:p-8 bg-slate-900 border border-slate-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Authorized Portal Access</span>
                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                            Welcome, {user?.name || 'Client'}
                        </h1>
                        <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
                            PAN: {clientData?.pan || 'N/A'} | GSTIN: {clientData?.gstin || 'N/A'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/portal/documents">
                            <Button className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[10px] rounded-none h-10 flex items-center gap-2">
                                <Upload className="w-3.5 h-3.5" />
                                Send Document
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Cyber tech lines */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-lime-600" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-lime-600" />
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800 rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Outstanding Due</span>
                        <DollarSign className="w-4 h-4 text-lime-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight text-white font-mono">
                            ₹{stats.outstanding.toLocaleString('en-IN')}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Pending across active invoices
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Compliance Returns</span>
                        <ShieldCheck className="w-4 h-4 text-lime-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight text-white font-mono">
                            {stats.dueCompliance}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Needs document / filing actions
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 rounded-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Work Requests</span>
                        <Clock className="w-4 h-4 text-lime-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black tracking-tight text-white font-mono">
                            {stats.pendingTasks}
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            In-progress operator tasks
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Columns (Main Panel) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Invoices */}
                    <Card className="bg-slate-900 border-slate-800 rounded-none">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Outstanding Invoices</CardTitle>
                                <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Unpaid billing invoices requiring settlement</CardDescription>
                            </div>
                            <Link href="/portal/invoices">
                                <Button variant="link" className="text-lime-500 hover:text-lime-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    View All <ChevronRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentInvoices.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                                    No outstanding invoices. All clear!
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentInvoices.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 bg-black border border-slate-800 hover:border-slate-700 transition-colors">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-white font-mono">{inv.invoice_number}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                    DUE: {inv.due_date}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-black text-white font-mono">
                                                    ₹{Number(inv.total_amount).toLocaleString('en-IN')}
                                                </span>
                                                <Link href={`/portal/invoices?pay=${inv.id}`}>
                                                    <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] px-3 h-7 rounded-none">
                                                        Pay Now
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pending Compliance Deadlines */}
                    <Card className="bg-slate-900 border-slate-800 rounded-none">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Compliance Timeline Radar</CardTitle>
                                <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Upcoming tax filing deadlines</CardDescription>
                            </div>
                            <Link href="/portal/compliance">
                                <Button variant="link" className="text-lime-500 hover:text-lime-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                    View Calendar <ChevronRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentCompliance.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                                    No pending filings due immediately.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentCompliance.map((comp) => (
                                        <div key={comp.id} className="flex items-center justify-between p-3 bg-black border border-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                                                <div>
                                                    <p className="text-[11px] font-black uppercase tracking-wider text-white">
                                                        {comp.compliance_type.toUpperCase()} Return
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        DEADLINE: {comp.due_date}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-lime-950 text-lime-500 border border-lime-600/30 px-2 py-0.5">
                                                {comp.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column (Sidebar Panel) */}
                <div className="space-y-6">
                    {/* Primary Advisor profile */}
                    <Card className="bg-slate-900 border-slate-800 rounded-none relative overflow-hidden">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Assigned Tax Advisor</CardTitle>
                            <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Your direct point of contact</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-lime-600/10 border border-lime-600/20 flex items-center justify-center font-black italic text-lime-500 text-lg">
                                    {caProfile?.full_name ? caProfile.full_name[0]?.toUpperCase() : 'CA'}
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-white">
                                        {caProfile?.full_name || 'Rajesh Kumar'}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        {caProfile?.organization_name || 'Kumar & Associates'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5 text-lime-500" />
                                    <span>{caProfile?.email || 'ca@taxmate.com'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-3.5 h-3.5 text-lime-500" />
                                    <span>{caProfile?.phone || '+91 99999 88888'}</span>
                                </div>
                            </div>

                            <Link href="/portal/messages" className="block w-full pt-2">
                                <Button className="w-full bg-transparent hover:bg-lime-600 hover:text-black border border-lime-600/50 hover:border-lime-600 text-lime-500 font-black uppercase tracking-widest text-[9px] rounded-none h-10 flex items-center justify-center gap-2 transition-all">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Start Message Stream
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Quick Access Card */}
                    <Card className="bg-slate-900 border-slate-800 rounded-none">
                        <CardHeader className="border-b border-slate-800 pb-4">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Rapid Operations</CardTitle>
                            <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Quick links to core portal modules</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-2 gap-3">
                            <Link href="/portal/appointments" className="block">
                                <div className="p-3 bg-black border border-slate-800 hover:border-lime-600/30 transition-all text-center group cursor-pointer">
                                    <Calendar className="w-5 h-5 mx-auto text-slate-500 group-hover:text-lime-500 transition-colors" />
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors mt-2">Book Call</p>
                                </div>
                            </Link>
                            <Link href="/portal/documents" className="block">
                                <div className="p-3 bg-black border border-slate-800 hover:border-lime-600/30 transition-all text-center group cursor-pointer">
                                    <FileText className="w-5 h-5 mx-auto text-slate-500 group-hover:text-lime-500 transition-colors" />
                                    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors mt-2">File Vault</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
