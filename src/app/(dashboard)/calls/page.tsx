'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Video,
    Mic,
    Monitor,
    MessageSquare,
    Users,
    Settings,
    PhoneOff,
    Disc,
    MoreVertical,
    Plus,
    Play,
    Download,
    Calendar,
    Search,
    CheckCircle2,
    Clock,
    ExternalLink,
    ChevronRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

const RecordingItem = ({ title, client, date, duration, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
        whileHover={{ x: 4 }}
    >
        <Card className="p-4 glass border-none hover:bg-white/50 dark:hover:bg-white/5 transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center relative group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-blue-600 fill-current" />
                    <div className="absolute inset-0 bg-blue-600/10 rounded-xl animate-pulse" />
                </div>
                <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase tracking-tight">{title}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{client} • {date}</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-[10px] font-black opacity-40">{duration}</span>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Download className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                </div>
            </div>
        </Card>
    </motion.div>
);

export default function VideoCallsPage() {
    const [activeCall, setActiveCall] = useState<any>(null);

    return (
        <div className="space-y-10 pb-20 h-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest">Connect HD Infrastructure</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Consultation <span className="text-gradient">HQ</span> 🎥
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium max-w-lg">
                        High-definition, end-to-end encrypted video bridge optimized for professional financial consultations.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-black glass uppercase tracking-widest text-xs gap-2">
                        <Settings className="w-4 h-4" /> AV Settings
                    </Button>
                    <Button className="h-14 px-10 rounded-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-xs">
                        <Plus className="w-5 h-5 mr-3" />
                        Instant Meeting
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                {/* Active/Upcoming Call Area */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="aspect-video glass border-none shadow-3xl overflow-hidden relative group">
                        {/* Virtual Meeting Room Preview */}
                        <div className="absolute inset-0 bg-gray-900 overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=2340&auto=format&fit=crop"
                                alt="Waiting Room"
                                className="w-full h-full object-cover opacity-40 blur-sm grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-8 space-y-6">
                                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-3xl animate-pulse">
                                    <Video className="w-12 h-12" />
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black tracking-tight">Ready for Consultation?</h4>
                                    <p className="text-sm font-medium opacity-60 mt-2">No active meeting in progress. Your next session is at 02:00 PM.</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button className="bg-blue-600 rounded-xl h-12 px-8 font-black shadow-xl shadow-blue-600/30">Enter Daily Briefing</Button>
                                    <Button variant="outline" className="bg-white/5 border-white/20 rounded-xl h-12 px-8 font-black hover:bg-white/10">Test Camera</Button>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Call Toolbar (Overlay) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 p-3 glass rounded-3xl border-white/20 shadow-2xl backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/10 text-white"><Mic className="w-6 h-6" /></Button>
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/10 text-white"><Video className="w-6 h-6" /></Button>
                            <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-white/10 text-white"><Monitor className="w-6 h-6" /></Button>
                            <div className="w-px h-8 bg-white/10 mx-2" />
                            <Button size="icon" className="h-12 w-12 rounded-2xl bg-red-600 text-white shadow-lg"><PhoneOff className="w-6 h-6" /></Button>
                        </div>
                    </Card>

                    {/* Call Analytics/Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-6 glass border-none shadow-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Time This Week</p>
                                <p className="text-lg font-black tracking-tight">12.5 hrs</p>
                            </div>
                        </Card>
                        <Card className="p-6 glass border-none shadow-xl flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Client Reviews</p>
                                <p className="text-lg font-black tracking-tight">4.9/5</p>
                            </div>
                        </Card>
                        <Card className="p-6 glass border-none shadow-xl flex items-center gap-4 lg:col-span-1 md:col-span-2">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Resolution Rate</p>
                                <p className="text-lg font-black tracking-tight">92%</p>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Call Logs & Recordings */}
                <div className="space-y-8">
                    <Card className="p-8 glass border-none shadow-2xl space-y-8 h-full">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black tracking-tight uppercase">Session Recordings</h3>
                            <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px]">ALL RECAPS</Badge>
                        </div>

                        <div className="space-y-4">
                            <RecordingItem title="Annual Tax Strategy" client="Vikram Singh" date="Today, 10:00 AM" duration="45:20" delay={0.1} />
                            <RecordingItem title="GSTR Reconciliation" client="Nexus Pvt Ltd" date="Yesterday" duration="32:15" delay={0.2} />
                            <RecordingItem title="Trust Fund Setup" client="Priya Sharma" date="Jan 24, 2026" duration="58:40" delay={0.3} />
                        </div>

                        <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-tight mb-4">Upcoming consultations</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 rounded-lg" />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-tight">Audit Briefing</p>
                                                <p className="text-[10px] opacity-40 font-bold uppercase">02:00 PM</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-800 text-white rounded-[28px] font-black shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-[10px]">
                                Go to Video Settings
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function MoreHorizontal(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
        </svg>
    );
}
