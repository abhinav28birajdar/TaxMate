'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Bell,
    AlertCircle,
    CheckCircle2,
    Clock,
    Filter,
    ArrowRight,
    TrendingUp,
    ShieldAlert,
    Zap,
    Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DeadlineCard = ({ deadline, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        whileHover={{ x: 4 }}
    >
        <Card className={`p-5 glass border-none shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden border-l-4 ${deadline.urgency === 'High' ? 'border-l-red-500' : 'border-l-blue-500'
            }`}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700" />

            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black transition-all group-hover:scale-110 ${deadline.urgency === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                    <span className="text-[10px] uppercase opacity-60 leading-none mb-1">{deadline.month}</span>
                    <span className="text-xl leading-none">{deadline.day}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className={`bg-white/10 border-none font-black text-[8px] h-4 px-1 uppercase tracking-tight ${deadline.urgency === 'High' ? 'text-red-500' : 'text-blue-500'
                            }`}>
                            {deadline.type}
                        </Badge>
                        {deadline.isRecurring && (
                            <Badge className="bg-purple-100 text-purple-600 border-none font-black text-[8px] h-4 px-1">RECURRING</Badge>
                        )}
                    </div>
                    <h4 className="font-bold text-sm truncate uppercase tracking-tight group-hover:text-blue-600 transition-colors">{deadline.title}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-0.5">{deadline.affectedCount} Cases Affected</p>
                </div>

                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 group-hover:text-blue-600 transition-colors">
                    <ArrowRight className="w-5 h-5" />
                </Button>
            </div>
        </Card>
    </motion.div>
);

export default function ComplianceCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const mockDeadlines = [
        { title: "GSTR-1 Monthly Filing", day: 11, month: "FEB", type: "GST", affectedCount: 42, urgency: "High", isRecurring: true },
        { title: "Quarterly TDS Return (26Q)", day: 15, month: "FEB", type: "Income Tax", affectedCount: 28, urgency: "Medium", isRecurring: true },
        { title: "Advance Tax Installment 4", day: 15, month: "MAR", type: "Corp Tax", affectedCount: 15, urgency: "High", isRecurring: false },
        { title: "ROC Annual Return MSME-1", day: 30, month: "APR", type: "ROC", affectedCount: 12, urgency: "Medium", isRecurring: false },
    ];

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest">Smart Deadline Engine</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Compliance <span className="text-gradient">Pulse</span> 🗓️
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium max-w-lg">
                        Intelligent calendar syncing with real-time government deadline updates
                        and automated recurring case generation.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-black glass uppercase tracking-widest text-xs">
                        Sync Google Cal
                    </Button>
                    <Button className="h-14 px-10 rounded-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-xs">
                        <Plus className="w-5 h-5 mr-3" />
                        Custom Deadline
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Calendar View */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8 glass border-none shadow-2xl overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black tracking-tight uppercase">January 2026</h3>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl glass"><ChevronLeft className="w-5 h-5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl glass"><ChevronRight className="w-5 h-5" /></Button>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge className="bg-blue-600/10 text-blue-600 border-none font-black px-3 py-1">MONTHLY</Badge>
                                <Badge variant="outline" className="opacity-40 font-black px-3 py-1 border-gray-200">WEEKLY</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 rounded-[28px] overflow-hidden border border-gray-100 dark:border-gray-800">
                            {DAYS.map(day => (
                                <div key={day} className="h-14 flex items-center justify-center glass text-[10px] font-black uppercase tracking-widest opacity-40">
                                    {day}
                                </div>
                            ))}
                            {[...Array(35)].map((_, i) => {
                                const dayNum = i - 2;
                                const isToday = dayNum === 26;
                                const hasDeadline = [11, 15, 30].includes(dayNum);

                                return (
                                    <div key={i} className={`h-24 md:h-32 p-4 glass relative group/day cursor-pointer hover:bg-white/50 transition-all ${dayNum <= 0 || dayNum > 31 ? 'opacity-20' : ''
                                        }`}>
                                        <span className={`text-sm font-black ${isToday ? 'w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center -m-2' : 'opacity-60'}`}>
                                            {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                                        </span>

                                        {hasDeadline && (
                                            <div className="mt-2 space-y-1">
                                                <div className={`h-1.5 w-full rounded-full ${dayNum === 15 ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
                                                <p className="text-[8px] font-black uppercase tracking-tighter hidden md:block opacity-60">Filing Due</p>
                                            </div>
                                        )}

                                        {isToday && (
                                            <div className="absolute inset-0 ring-2 ring-blue-500/20 ring-inset rounded-inherit pointer-events-none" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full" />
                    </Card>
                </div>

                {/* Right Column: Alerts & List */}
                <div className="space-y-8">
                    {/* Critical Alerts */}
                    <Card className="p-8 glass border-none shadow-2xl space-y-6 relative overflow-hidden bg-gradient-to-br from-red-50 to-white dark:from-red-900/10 dark:to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight uppercase">Critical Alerts</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border-l-4 border-l-red-500 shadow-sm">
                                <p className="text-xs font-black text-red-600 mb-1 flex items-center gap-1">
                                    <Zap className="w-3 h-3 fill-current" /> URGENT ACTION REQUIRED
                                </p>
                                <p className="text-xs font-bold opacity-80 leading-relaxed">
                                    GSTR-1 data reconciliation failed for 12 clients. Manual review needed before deadline.
                                </p>
                                <div className="mt-3 flex gap-2">
                                    <Button size="sm" className="h-7 text-[9px] font-black bg-red-600 text-white rounded-lg px-3">RESOLVE NOW</Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black rounded-lg">DISMISS</Button>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
                    </Card>

                    {/* Upcoming List */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-black tracking-tight uppercase">Upcoming (14 Days)</h3>
                            <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px]">6 TOTAL</Badge>
                        </div>
                        <div className="space-y-4">
                            {mockDeadlines.map((deadline, i) => (
                                <DeadlineCard key={i} deadline={deadline} delay={i * 0.1} />
                            ))}
                        </div>
                    </div>

                    <Button className="w-full h-14 glass border-none rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/10">
                        Download Quarterly PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}
