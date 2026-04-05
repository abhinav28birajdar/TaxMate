'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    DollarSign,
    TrendingUp,
    FileText,
    Download,
    Plus,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Zap,
    ShieldCheck,
    CreditCard as CardIcon,
    Receipt,
    PieChart,
    Target
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

const data = [
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 150000 },
    { month: 'Mar', revenue: 180000 },
    { month: 'Apr', revenue: 140000 },
    { month: 'May', revenue: 160000 },
    { month: 'Jun', revenue: 210000 },
];

const InvoiceItem = ({ invoice, delay }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ x: 4 }}
    >
        <Card className="p-5 glass border-none hover:bg-white/50 dark:hover:bg-white/5 transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-tight">{invoice.id}</h4>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{invoice.client} • {invoice.date}</p>
                </div>
            </div>
            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">₹{invoice.amount}</p>
                    <Badge className={`border-none font-black text-[8px] h-4 px-1.5 uppercase tracking-tighter ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        {invoice.status}
                    </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 group-hover:text-blue-600 transition-colors">
                    <Download className="w-5 h-5" />
                </Button>
            </div>
        </Card>
    </motion.div>
);

export default function BillingPage() {
    const mockInvoices = [
        { id: "INV-2026-001", client: "Nexus Digital", amount: "45,000", date: "Jan 15, 2026", status: "Paid" },
        { id: "INV-2026-002", client: "Vikram Singh", amount: "12,500", date: "Jan 20, 2026", status: "Paid" },
        { id: "INV-2026-003", client: "Global Logistics", amount: "32,000", date: "Jan 24, 2026", status: "Pending" },
        { id: "INV-2026-004", client: "Priya Sharma", amount: "8,400", date: "Yesterday", status: "Paid" },
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
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-xs font-black opacity-40 uppercase tracking-widest">Enterprise Ledger Infrastructure</span>
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                        Revenue <span className="text-gradient">Hub</span> 💳
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium max-w-lg">
                        Manage your firm&apos;s financial lifecycle, from automated invoicing to multi-channel
                        payment tracking and reconciliation.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3"
                >
                    <Button variant="outline" className="h-14 px-8 rounded-2xl font-black glass uppercase tracking-widest text-xs">
                        Export Ledger
                    </Button>
                    <Button className="h-14 px-10 rounded-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/20 uppercase tracking-widest text-xs">
                        <Plus className="w-5 h-5 mr-3" />
                        Create Invoice
                    </Button>
                </motion.div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 glass border-none shadow-2xl space-y-4 group">
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <TrendingUp className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹24.8L</h3>
                        <p className="text-xs font-bold text-green-500 mt-2 flex items-center">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> +12.4% this quarter
                        </p>
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl space-y-4 group">
                    <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <AlertCircle className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Outstanding</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹3.2L</h3>
                        <p className="text-xs font-bold text-amber-500 mt-2">8 Pending Invoices</p>
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl space-y-4 group">
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <PieChart className="w-7 h-7 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mb-1">Avg Ticket Size</p>
                        <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹8.4K</h3>
                        <p className="text-xs font-bold opacity-60 mt-2">Professional services</p>
                    </div>
                </Card>

                <Card className="p-8 glass border-none shadow-2xl space-y-4 group bg-gradient-to-br from-blue-600 to-purple-700 text-white border-none">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <Target className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Collection Rate</p>
                        <h3 className="text-4xl font-black tracking-tighter">94%</h3>
                        <p className="text-xs font-bold opacity-80 mt-2 flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Top Tier Collections
                        </p>
                    </div>
                </Card>
            </div>

            {/* Charts & Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Revenue Insight Chart */}
                <Card className="lg:col-span-2 p-8 glass border-none shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black tracking-tight uppercase">Revenue Analytics</h3>
                            <Badge className="bg-blue-600 text-white border-none font-bold text-[10px]">REAL-TIME</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" className="text-[10px] font-black uppercase opacity-40 bg-blue-50">6 Months</Button>
                            <Button variant="ghost" className="text-[10px] font-black uppercase opacity-40">1 Year</Button>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(200,200,200,0.1)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#888' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 800, fill: '#888' }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="revenue" radius={[10, 10, 10, 10]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 blur-[60px] rounded-full" />
                </Card>

                {/* Recent Invoices */}
                <Card className="p-8 glass border-none shadow-2xl space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black tracking-tight uppercase">Recent Invoices</h3>
                        </div>
                        <Button variant="ghost" className="text-blue-600 font-bold text-xs">View Ledger</Button>
                    </div>

                    <div className="space-y-4">
                        {mockInvoices.map((inv, i) => (
                            <InvoiceItem key={inv.id} invoice={inv} delay={i * 0.1} />
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                        <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-500/10 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Pending Reconciliation</p>
                                <p className="text-sm font-black">2 Invoices Auto-matched</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 text-blue-600 shrink-0"><CheckCircle2 className="w-5 h-5" /></Button>
                        </div>

                        <Button className="w-full h-14 rounded-[28px] glass border-none font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/10">
                            Payment Method Settings
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Subscription/Plan View */}
            <Card className="p-10 glass border-none shadow-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/10 dark:to-transparent relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] px-3 py-1">ENTERPRISE HQ PLAN</Badge>
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Renewal: Dec 20, 2026</p>
                        </div>
                        <h3 className="text-4xl font-black tracking-tight">Everything you need to <span className="text-indigo-600 italic underline underline-offset-8">scale.</span></h3>
                        <p className="text-gray-600 dark:text-gray-400 font-medium max-w-xl">
                            You are currently on the Enterprise Unlimited plan. Enjoy unlimited client slots,
                            team members, and HD video consultations.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 shrink-0">
                        <Button className="h-14 px-10 rounded-2xl font-black bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">Upgrade Team Capacity</Button>
                        <Button variant="ghost" className="font-black text-xs uppercase tracking-widest opacity-40">View Billing History</Button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 blur-[80px] rounded-full -ml-32 -mb-32" />
            </Card>
        </div>
    );
}
