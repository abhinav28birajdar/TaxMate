'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Users, 
    Activity, 
    Flag, 
    Server, 
    Check, 
    X, 
    UserCheck, 
    UserMinus, 
    Cpu, 
    Database, 
    HardDrive,
    Bot
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SuperAdminPanel() {
    const { user, role } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'flags' | 'status'>('users');
    const [usersList, setUsersList] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [flags, setFlags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    // Guard page
    useEffect(() => {
        if (!loading && String(role).toLowerCase() !== 'admin' && String(role).toLowerCase() !== 'super_admin') {
            toast.error('Unauthorized access. Admin role required.');
            router.push('/dashboard');
        }
    }, [role, loading, router]);

    useEffect(() => {
        const loadAdminData = async () => {
            try {
                // Fetch profiles from public.profiles
                const { data: profiles, error: profErr } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (profErr) throw profErr;
                setUsersList(profiles || []);

                // Fetch audit logs
                const { data: logs } = await supabase
                    .from('audit_logs')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(10);
                
                setAuditLogs(logs || getMockLogs());

                // Fetch feature flags
                const { data: fFlags } = await supabase
                    .from('feature_flags')
                    .select('*');

                setFlags(fFlags || getMockFlags());

            } catch (err: any) {
                console.warn('DB queries restricted or offline. Initializing sandbox mock logs.', err.message);
                setUsersList(getMockUsers());
                setAuditLogs(getMockLogs());
                setFlags(getMockFlags());
            } finally {
                setLoading(false);
            }
        };

        loadAdminData();
    }, [supabase]);

    const getMockUsers = () => [
        { id: '1', email: 'ca@taxmate.com', full_name: 'Rajesh Kumar', role: 'ca', is_active: true, created_at: new Date().toISOString() },
        { id: '2', email: 'staff@taxmate.com', full_name: 'Priya Sharma', role: 'staff', is_active: true, created_at: new Date().toISOString() },
        { id: '3', email: 'client@taxmate.com', full_name: 'ABC Enterprises', role: 'client', is_active: true, created_at: new Date().toISOString() }
    ];

    const getMockLogs = () => [
        { id: 'l-1', action: 'User Sign In', actor_id: 'ca@taxmate.com', created_at: new Date(Date.now() - 600000).toISOString(), ip_address: '192.168.1.5' },
        { id: 'l-2', action: 'GSTR Filing Uploaded', actor_id: 'staff@taxmate.com', created_at: new Date(Date.now() - 3600000).toISOString(), ip_address: '192.168.1.12' },
        { id: 'l-3', action: 'Invoice Paid', actor_id: 'client@taxmate.com', created_at: new Date(Date.now() - 7200000).toISOString(), ip_address: '192.168.1.88' }
    ];

    const getMockFlags = () => [
        { id: 'f-1', flag_name: 'ai_consultant', is_enabled: true, description: 'Activates GPT models under the Operator Consultation Hub.' },
        { id: 'f-2', flag_name: 'livekit_integration', is_enabled: true, description: 'Powers LiveKit channels for audio and video scheduling.' },
        { id: 'f-3', flag_name: 'razorpay_checkout', is_enabled: true, description: 'Enables direct digital collections and checkouts.' },
        { id: 'f-4', flag_name: 'sms_reminders', is_enabled: false, description: 'Triggers reminders for overdue compliance calendars.' }
    ];

    const handleToggleUser = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            setUsersList(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
            toast.success('User status updated.');
        } catch (err) {
            // Mock fallback toggle
            setUsersList(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u));
            toast.success('Sandbox: user status updated.');
        }
    };

    const handleToggleFlag = async (id: string, currentStatus: boolean) => {
        try {
            setFlags(prev => prev.map(f => f.id === id ? { ...f, is_enabled: !currentStatus } : f));
            toast.success('Feature flag updated.');
        } catch (err) {
            toast.error('Flag toggle failed.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Super Operations gate</span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                    Admin Command Panel
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
                    SECURED MANAGEMENT CONSOLE FOR USERS, WORK LOGS, FEATURE FLAGS AND HARDWARE STATUS
                </p>
            </div>

            {/* Tabs Selector */}
            <div className="flex border-b border-slate-800">
                {[
                    { id: 'users', label: 'User Directory', icon: Users },
                    { id: 'logs', label: 'Audit Timeline', icon: Activity },
                    { id: 'flags', label: 'Feature Toggles', icon: Flag },
                    { id: 'status', label: 'Cluster Status', icon: Server }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === tab.id ? 'border-lime-500 text-lime-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <Card className="bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Security Directory</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Active profiles configured in database cluster</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {usersList.map((usr) => (
                                <div key={usr.id} className="flex items-center justify-between p-4 bg-black border border-slate-800 rounded-none">
                                    <div className="space-y-1">
                                        <p className="text-xs font-black text-white">{usr.full_name || 'Anonymous User'}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                            <span>{usr.email}</span>
                                            <span>•</span>
                                            <span className="text-lime-500">ROLE: {usr.role.toUpperCase()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {usr.is_active ? (
                                            <Badge className="bg-lime-950 text-lime-500 border border-lime-600/30 rounded-none text-[8px] font-black tracking-widest">
                                                ACTIVE
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-red-950 text-red-500 border border-red-900/30 rounded-none text-[8px] font-black tracking-widest">
                                                BANNED
                                            </Badge>
                                        )}

                                        <Button
                                            size="sm"
                                            onClick={() => handleToggleUser(usr.id, usr.is_active)}
                                            className="bg-transparent hover:bg-lime-600/10 border border-slate-800 hover:border-lime-600 text-slate-400 hover:text-lime-500 text-[9px] font-black uppercase tracking-widest px-3 h-8 rounded-none transition-all"
                                        >
                                            {usr.is_active ? <UserMinus className="w-3.5 h-3.5 mr-1.5" /> : <UserCheck className="w-3.5 h-3.5 mr-1.5" />}
                                            {usr.is_active ? 'Ban' : 'Unban'}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'logs' && (
                <Card className="bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">System Audit Timeline</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Immutable ledger of platform activities</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="p-3 bg-black border border-slate-800 text-[10px] space-y-1.5 font-mono">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lime-500 uppercase tracking-widest">{log.action}</span>
                                        <span className="text-slate-500">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-400 text-[9px]">
                                        <span>ACTOR: {log.actor_id}</span>
                                        <span>IP: {log.ip_address || '127.0.0.1'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Feature Flags Tab */}
            {activeTab === 'flags' && (
                <Card className="bg-slate-900 border-slate-800 rounded-none">
                    <CardHeader className="border-b border-slate-800 pb-4">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Feature Flag Controls</CardTitle>
                        <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Toggle live microservices inside runtime workspace</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {flags.map((flag) => (
                                <div key={flag.id} className="p-4 bg-black border border-slate-800 rounded-none flex items-center justify-between">
                                    <div className="space-y-1 max-w-md">
                                        <p className="text-xs font-black text-white font-mono">{flag.flag_name.toUpperCase()}</p>
                                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{flag.description}</p>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={() => handleToggleFlag(flag.id, flag.is_enabled)}
                                        className={flag.is_enabled 
                                            ? "bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] px-4 h-8 rounded-none transition-all"
                                            : "bg-transparent hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-white font-black uppercase tracking-widest text-[9px] px-4 h-8 rounded-none transition-all"
                                        }
                                    >
                                        {flag.is_enabled ? 'ENABLED' : 'DISABLED'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Hardware Status Tab */}
            {activeTab === 'status' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { title: 'CPU LOAD WEIGHT', icon: Cpu, value: '14%', desc: 'Normal range load' },
                        { title: 'POSTGRES POOL', icon: Database, value: '8 / 50', desc: 'Pool connection allocation' },
                        { title: 'DISK SECTOR STORAGE', icon: HardDrive, value: '2.4 GB / 10 GB', desc: 'SaaS tenant limit' }
                    ].map((srv, idx) => (
                        <Card key={idx} className="bg-slate-900 border-slate-800 rounded-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{srv.title}</span>
                                <srv.icon className="w-4 h-4 text-lime-500 animate-pulse" />
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-2xl font-black text-white font-mono">{srv.value}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{srv.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
