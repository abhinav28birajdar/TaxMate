'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Calendar,
    ShieldCheck,
    MessageSquare,
    Video,
    ArrowRight,
    Clock,
    Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface CaseProgressItemProps {
    title: string;
    caName: string;
    progress: number;
    status: string;
    dueDate: string;
}

const CaseProgressItem = ({ title, caName, progress, status, dueDate }: CaseProgressItemProps) => (
    <Card className="p-6 glass border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
        <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{title}</h4>
                    <p className="text-xs font-medium opacity-60">Assigned to: {caName}</p>
                </div>
            </div>
            <Badge className="bg-blue-600/10 text-blue-600 border-none font-bold text-[10px]">{status}</Badge>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="opacity-60">Progress</span>
                <span className="text-blue-600">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full bg-blue-100 dark:bg-gray-800" />

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-bold opacity-60">Due: {dueDate}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-8 group-hover:translate-x-1 transition-all text-xs font-bold text-blue-600">
                    View Details
                    <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </div>
        </div>
    </Card>
);

export default function ClientDashboardOverview() {
    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px]">VERIFIED CLIENT</Badge>
                        <span className="text-xs font-bold opacity-40 uppercase tracking-widest leading-none">Last sync: 2 mins ago</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                        Hi, <span className="text-gradient">Anita Desai</span> ✨
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                        Your financial health is looking great.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold glass">
                        Request Guidance
                    </Button>
                    <Button className="h-12 px-8 rounded-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl shadow-blue-500/20">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Chat with My CA
                    </Button>
                </motion.div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Active Cases */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Active Cases</h3>
                        <div className="flex gap-2">
                            <Badge className="bg-blue-600 text-white border-none font-bold">2 Running</Badge>
                            <Button variant="ghost" className="text-xs font-bold text-blue-600">See All</Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CaseProgressItem
                            title="ITR-2 Filing (FY 24-25)"
                            caName="Rajesh Kumar"
                            progress={75}
                            status="Reviewing Documents"
                            dueDate="July 31, 2026"
                        />
                        <CaseProgressItem
                            title="Tax Planning (Wealth)"
                            caName="Rajesh Kumar"
                            progress={40}
                            status="Awaiting Consultation"
                            dueDate="March 15, 2026"
                        />
                    </div>

                    {/* Quick Upload Area */}
                    <Card className="p-8 glass border-2 border-dashed border-blue-500/20 rounded-[32px] flex flex-col items-center justify-center gap-6 group hover:border-blue-500/50 transition-all cursor-pointer">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-center">
                            <h4 className="text-lg font-bold">Quick Document Upload</h4>
                            <p className="text-sm opacity-60 font-medium">Securely share bank statements or invoices with your CA</p>
                        </div>
                        <Button variant="outline" className="rounded-xl font-bold border-blue-500/30 text-blue-600">
                            Browse Files
                        </Button>
                    </Card>
                </div>

                {/* Right Column: Alerts & CA Info */}
                <div className="space-y-8">
                    {/* Your CA Card */}
                    <Card className="p-8 glass border-none shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black tracking-tight">Your Primary CA</h3>
                                <Badge className="bg-blue-600/10 text-blue-600 border-none font-bold">TOP RATED</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 ring-4 ring-blue-500/20 shadow-xl" />
                                <div>
                                    <h4 className="text-xl font-black">Rajesh Kumar</h4>
                                    <p className="text-xs font-bold opacity-60">Senior Partner • 12 yrs Exp.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-blue-600 text-white font-bold h-11 rounded-xl">
                                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                                </Button>
                                <Button variant="outline" className="flex-1 font-bold h-11 rounded-xl">
                                    <Video className="w-4 h-4 mr-2" /> Call
                                </Button>
                            </div>
                            <div className="pt-4 border-t border-white/10 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="opacity-60">Total Sessions</span>
                                    <span>14</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="opacity-60">Success Rate</span>
                                    <span className="text-green-500">100%</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                    </Card>

                    {/* Compliance Calendar */}
                    <Card className="p-8 glass border-none shadow-2xl space-y-6">
                        <div className="flex items-center justify-between font-black">
                            <h3>Upcoming Deadlines</h3>
                            <Calendar className="w-5 h-5 opacity-40" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 glass rounded-2xl border-l-4 border-amber-500">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center font-black text-amber-600">
                                    31
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">FY25 ITR Filing</p>
                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">July 2026</p>
                                </div>
                                <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[9px]">4 DAYS LEFT</Badge>
                            </div>

                            <div className="flex items-center gap-4 p-4 glass rounded-2xl border-l-4 border-blue-500">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600">
                                    15
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">Advance Tax Part 1</p>
                                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">March 2026</p>
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[9px]">UPCOMING</Badge>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full font-bold text-xs">View Full Compliance Calendar</Button>
                    </Card>

                    {/* Recent Documents */}
                    <Card className="p-8 glass border-none shadow-2xl space-y-6">
                        <h3 className="text-lg font-black tracking-tight">Shared Documents</h3>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-red-500" />
                                        <p className="text-sm font-bold opacity-80 group-hover:text-blue-600">Form_16_FY24-25.pdf</p>
                                    </div>
                                    <Download className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                        <Button className="w-full glass rounded-2xl font-bold h-11">Document Vault</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
