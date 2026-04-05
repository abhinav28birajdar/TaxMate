'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users,
    TrendingUp,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    MoreVertical,
    Plus,
    Briefcase,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    LucideIcon,
    Hourglass,
    Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
];

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: LucideIcon;
    delay: number;
}

const StatCard = ({ title, value, change, trend, icon: Icon, delay }: StatCardProps) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Card className="p-6 glass border-none relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
                    <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <Badge className={`${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-none font-bold`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {change}
                </Badge>
            </div>
            <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{title}</p>
            <h3 className="text-3xl font-black mt-1 text-gray-900 dark:text-white tracking-tight">{value}</h3>
            <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-blue-500/5 rounded-full transition-transform group-hover:scale-150 duration-700" />
        </Card>
    </motion.div>
);

interface RecentCaseItemProps {
    title: string;
    client: string;
    status: string;
    date: string;
    priority: 'High' | 'Low' | 'Medium';
}

const RecentCaseItem = ({ title, client, status, date, priority }: RecentCaseItemProps) => (
    <div className="flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-all group cursor-pointer border border-transparent hover:border-blue-500/20">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}>
                {client.charAt(0)}
            </div>
            <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{title}</h4>
                <p className="text-xs font-medium opacity-60">{client} • {date}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <Badge variant="outline" className={`font-black tracking-tighter text-[10px] ${status === 'In Progress' ? 'border-blue-500 text-blue-600' : 'border-green-500 text-green-600'
                }`}>
                {status}
            </Badge>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-all" />
        </div>
    </div>
);

function DashboardContent() {
    const searchParams = useSearchParams();
    const isPending = searchParams.get('status') === 'pending';

    if (isPending) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center"
                >
                    <Hourglass className="w-12 h-12 text-yellow-600 animate-pulse" />
                </motion.div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-3xl font-bold tracking-tight">Application Under Review</h1>
                    <p className="text-muted-foreground">
                        Your profile has been submitted and is currently being verified by our admin team. This usually takes 24-48 hours.
                    </p>
                </div>
                <Card className="p-6 max-w-lg w-full bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-4 mb-4">
                        <Lock className="w-6 h-6 text-slate-400" />
                        <div className="text-left">
                            <h3 className="font-semibold">Dashboard Locked</h3>
                            <p className="text-xs text-muted-foreground">Access is restricted until verification is complete.</p>
                        </div>
                    </div>
                    <div className="space-y-4 text-sm text-left border-t pt-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Pending Verification</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Estimated Completion</span>
                            <span>{new Date(Date.now() + 86400000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Reference ID</span>
                            <span className="font-mono text-xs">REF-{Math.floor(Math.random() * 100000)}</span>
                        </div>
                    </div>
                </Card>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Return to Home
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Welcome back, <span className="text-gradient">Rajesh Kumar</span> 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                        Professional Practice Overview • January 26, 2026
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold glass">
                        Download Report
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        New Service Case
                    </Button>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Clients" value="245" change="12%" trend="up" icon={Users} delay={0.1} />
                <StatCard title="Active Cases" value="89" change="5%" trend="up" icon={Briefcase} delay={0.2} />
                <StatCard title="Monthly Revenue" value="₹1.25L" change="18%" trend="up" icon={DollarSign} delay={0.3} />
                <StatCard title="Satisfaction" value="4.8/5" change="2%" trend="down" icon={TrendingUp} delay={0.4} />
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 p-8 glass border-none shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Revenue Insights</h3>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600/10 text-blue-600 border-none font-bold">Weekly</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,200,200,0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#888' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#888' }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontWeight: 800, color: '#3b82f6' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Cases */}
                <Card className="p-8 glass border-none shadow-2xl space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Recent Cases</h3>
                        <Button variant="ghost" className="text-blue-600 font-bold text-xs p-0 h-auto">View All</Button>
                    </div>
                    <div className="space-y-4">
                        <RecentCaseItem title="Income Tax Filing" client="Anita Desai" status="In Progress" date="Today, 11:30 AM" priority="High" />
                        <RecentCaseItem title="GST Reconciliation" client="Nexus Pvt Ltd" status="Filed" date="Yesterday" priority="Low" />
                        <RecentCaseItem title="Statutory Audit" client="Priya Sharma" status="In Progress" date="2 days ago" priority="High" />
                        <RecentCaseItem title="TDS Return" client="Amit Patel" status="In Progress" date="Jan 20, 2026" priority="Low" />
                    </div>

                    <div className="pt-6">
                        <Button className="w-full h-12 rounded-2xl glass font-bold text-gray-600 dark:text-gray-400 hover:bg-white/50 transition-all">
                            See Activity Log
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Bottom Grid: Appointments & Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <Card className="p-8 glass border-none shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Upcoming Consultation</h3>
                        </div>
                        <Badge className="bg-purple-600 text-white border-none font-bold">3 Today</Badge>
                    </div>
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="flex items-center gap-4 p-4 glass rounded-3xl border border-white/20">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex flex-col items-center justify-center font-bold">
                                    <span className="text-[10px] uppercase opacity-60">Jan</span>
                                    <span className="text-lg">26</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">Follow-up: Tax Audit Review</h4>
                                    <p className="text-xs opacity-60 font-medium">with Vikram Singh • 02:00 PM - 03:00 PM</p>
                                </div>
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-blue-600"><ArrowRight className="w-5 h-5" /></Button>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Compliance Alerts</h3>
                        </div>
                        <Button variant="ghost" className="text-amber-600 font-bold text-xs p-0 h-auto">Mute All</Button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-900/10 border border-amber-500/10 flex gap-4">
                            <Clock className="w-6 h-6 text-amber-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Quarterly TDS Deadline</p>
                                <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">Approaching in 4 days. 12 cases pending action.</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-500/10 flex gap-4">
                            <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-blue-900 dark:text-blue-400">GST Registration Success</p>
                                <p className="text-xs text-blue-700 dark:text-blue-500 font-medium">Final approval received for &apos;Zetex Logistics&apos;.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default function CADashboardOverview() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
