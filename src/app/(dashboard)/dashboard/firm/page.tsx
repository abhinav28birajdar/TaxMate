'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Building,
    Users,
    TrendingUp,
    Briefcase,
    BadgeCheck,
    ChevronRight,
    MoreVertical,
    Plus,
    Target,
    BarChart3,
    Award,
    Zap,
    LayoutGrid
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

const teamData = [
    { name: 'Rajesh K', cases: 45, revenue: 120000, efficiency: 95 },
    { name: 'Priya S', cases: 38, revenue: 98000, efficiency: 88 },
    { name: 'Amit P', cases: 32, revenue: 85000, efficiency: 92 },
    { name: 'Sanjay M', cases: 28, revenue: 72000, efficiency: 85 },
    { name: 'Anita V', cases: 25, revenue: 65000, efficiency: 94 },
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const PerformanceCard = ({ member }: any) => (
    <div className="flex items-center justify-between p-5 glass rounded-3xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-center gap-4">
            <div className="relative">
                <Avatar className="w-14 h-14 border-2 border-indigo-500/20 shadow-xl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-950 rounded-full" />
            </div>
            <div>
                <h4 className="font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{member.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-indigo-600/10 text-indigo-600 border-none text-[9px] font-black tracking-widest px-1.5 h-4">SENIOR CA</Badge>
                    <span className="text-[10px] font-black opacity-40">{member.cases} Cases</span>
                </div>
            </div>
        </div>

        <div className="text-right flex items-center gap-8">
            <div className="hidden sm:block">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Efficiency</p>
                <p className="text-xl font-black text-indigo-600 tracking-tighter">{member.efficiency}%</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">Revenue</p>
                <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">₹{(member.revenue / 1000).toFixed(0)}K</p>
            </div>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 group-hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-6 h-6" />
            </Button>
        </div>
    </div>
);

export default function FirmDashboardOverview() {
    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] px-3 py-1">ENTERPRISE HQ</Badge>
                        <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Firm: Elite Accounting Solutions</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Organization <span className="text-gradient">Intelligence</span> 📊
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Strategic overview of your multi-CA practice performance.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold glass">
                        <LayoutGrid className="w-5 h-5 mr-2" />
                        Manage Pool
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
                        <Users className="w-5 h-5 mr-2" />
                        Add Team Member
                    </Button>
                </motion.div>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 glass border-none shadow-2xl space-y-4 group">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <TrendingUp className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Monthly GMV</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹12.5L</h3>
                        <p className="text-xs font-bold text-green-500 mt-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> +24.5% vs last month
                        </p>
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl space-y-4 group hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-700 hover:text-white transition-all duration-500">
                    <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <Briefcase className="w-7 h-7 text-indigo-600 group-hover:text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1 group-hover:text-white/60">Active Cases</p>
                        <h3 className="text-4xl font-black tracking-tighter">425</h3>
                        <p className="text-xs font-bold text-indigo-500 mt-2 flex items-center group-hover:text-white/80">
                            <Zap className="w-3 h-3 mr-1" /> 18 new this week
                        </p>
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl space-y-4 group">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Award className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total CA Team</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">12</h3>
                        <p className="text-xs font-bold opacity-60 mt-2">Across 3 branches</p>
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl space-y-4 group">
                    <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Target className="w-7 h-7 text-green-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Avg Resolution</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">4.2d</h3>
                        <p className="text-xs font-bold text-green-500 mt-2">Top 5% in platform</p>
                    </div>
                </Card>
            </div>

            {/* Main Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Team Performance List */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Team Performance</h3>
                            <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-bold">LIVE METRICS</Badge>
                        </div>
                        <Button variant="ghost" className="text-xs font-bold text-indigo-600">Leaderboard</Button>
                    </div>

                    <div className="space-y-4">
                        {teamData.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <PerformanceCard member={member} />
                            </motion.div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <Button className="w-full h-14 glass rounded-[32px] font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-500 shadow-xl shadow-indigo-500/10">
                            View Full Team Analytics (12 Members)
                        </Button>
                    </div>
                </div>

                {/* Firm Analytics Charts */}
                <div className="space-y-8">
                    <Card className="p-8 glass border-none shadow-2xl relative overflow-hidden group">
                        <h3 className="text-xl font-black mb-8 tracking-tight">Revenue Mix</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={teamData}>
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="revenue" radius={[10, 10, 10, 10]}>
                                        {teamData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                            <div className="text-center">
                                <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">Direct Rev</p>
                                <p className="text-2xl font-black text-blue-600">₹8.4L</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black opacity-40 uppercase tracking-widest mb-1">Indirect Rev</p>
                                <p className="text-2xl font-black text-indigo-600">₹4.1L</p>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full" />
                    </Card>

                    {/* Quick Actions / Firm Stats */}
                    <Card className="p-8 glass border-none shadow-2xl space-y-6">
                        <h3 className="text-lg font-black tracking-tight">Firm Health Index</h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="opacity-60 uppercase tracking-widest">Client Satisfaction</span>
                                    <span className="text-blue-600">4.9/5.0</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '98%' }} className="h-full bg-blue-600" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="opacity-60 uppercase tracking-widest">Case Velocity</span>
                                    <span className="text-green-500">88%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} className="h-full bg-green-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="opacity-60 uppercase tracking-widest">Churn Rate</span>
                                    <span className="text-indigo-600">2.1%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '15%' }} className="h-full bg-indigo-500" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button className="w-full h-12 bg-white text-gray-900 border-none shadow-inner font-bold rounded-2xl hover:bg-gray-50 dark:bg-gray-800 dark:text-white transition-all">
                                Request Advanced Audit Report
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
