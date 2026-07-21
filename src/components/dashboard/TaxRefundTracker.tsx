'use client';

import React from 'react';
import { Calendar, FileSearch, CheckCircle2, Landmark, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CyberCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
    const positions = {
        'top-left': 'top-0 left-0 border-t border-l',
        'top-right': 'top-0 right-0 border-t border-r',
        'bottom-left': 'bottom-0 left-0 border-b border-l',
        'bottom-right': 'bottom-0 right-0 border-b border-r',
    };

    return (
        <div className={`absolute w-1.5 h-1.5 ${positions[position]} border-primary opacity-50`} />
    );
};

export interface TaxRefund {
    id: string;
    assessment_year: string;
    status: 'filed' | 'processed' | 'rectification' | 'refund_issued' | 'refund_credited' | 'adjusted' | 'delayed';
    refund_amount: number;
    filing_date?: string;
    credited_date?: string;
    bank_account_last4?: string;
    remarks?: string;
}

interface TaxRefundTrackerProps {
    refunds: TaxRefund[];
    loading?: boolean;
}

const statusSteps = [
    { id: 'filed', label: 'FILED', icon: Calendar },
    { id: 'processed', label: 'PROCESSED', icon: FileSearch },
    { id: 'refund_issued', label: 'ISSUED', icon: CheckCircle2 },
    { id: 'refund_credited', label: 'CREDITED', icon: Landmark },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    filed: { label: 'RETURN FILED', color: 'bg-blue-500/10 text-blue-400 border-blue-400/20', icon: Clock },
    processed: { label: 'PROCESSED', color: 'bg-purple-500/10 text-purple-400 border-purple-400/20', icon: FileSearch },
    rectification: { label: 'RECTIFICATION REQ', color: 'bg-red-500/10 text-red-400 border-red-400/20', icon: AlertCircle },
    refund_issued: { label: 'REFUND ISSUED', color: 'bg-amber-500/10 text-amber-400 border-amber-400/20', icon: CheckCircle2 },
    refund_credited: { label: 'REFUND CREDITED', color: 'bg-primary/20 text-primary border-primary/20', icon: CheckCircle },
    adjusted: { label: 'ADJUSTED', color: 'bg-orange-500/10 text-orange-400 border-orange-400/20', icon: TrendingUp },
    delayed: { label: 'DELAYED', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-400/20', icon: Clock },
};

export function TaxRefundTracker({ refunds, loading }: TaxRefundTrackerProps) {
    if (loading) {
        return (
            <Card className="bg-zinc-950/50 border-primary/10 rounded-none relative">
                <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic">Refund Tracker</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">Syncing with IRS database...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="h-20 bg-primary/5 animate-pulse border border-primary/10" />
                </CardContent>
                <CyberCorner position="top-left" />
            </Card>
        );
    }

    if (refunds.length === 0) {
        return (
            <Card className="bg-zinc-950/50 border-primary/10 rounded-none relative">
                <CardHeader>
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic">Refund Tracker</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-50">No active traces detected.</CardDescription>
                </CardHeader>
                <CyberCorner position="top-left" />
            </Card>
        );
    }

    return (
        <Card className="bg-zinc-950/50 border-primary/10 rounded-none relative overflow-hidden group">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic text-primary">Refund Tracker</CardTitle>
                        <CardDescription className="text-[9px] uppercase font-bold tracking-[0.15em] opacity-60">Real-time IRS Protocol Sync</CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-none text-[8px] font-black tracking-widest">
                        {refunds.length} ACTIVE TRACES
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-primary/5">
                    {refunds.map((refund) => {
                        const currentStatus = statusConfig[refund.status];
                        const StatusIcon = currentStatus.icon;

                        const stepIndex = statusSteps.findIndex(s => s.id === refund.status);
                        const progress = stepIndex === -1 ? 10 : ((stepIndex + 1) / statusSteps.length) * 100;

                        return (
                            <div key={refund.id} className="p-6 transition-all hover:bg-primary/5 relative group/trace">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-2 border border-primary/10 group-hover/trace:border-primary/40 transition-colors", currentStatus.color)}>
                                            <StatusIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg uppercase italic tracking-tighter">AY {refund.assessment_year}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status:</span>
                                                <span className={cn("text-[9px] font-black uppercase tracking-widest", currentStatus.color.replace('bg-', 'text-').split(' ')[1])}>
                                                    {currentStatus.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="md:text-right">
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">ESTIMATED PAYOUT</p>
                                        <p className="text-2xl font-black text-primary italic tracking-tighter uppercase">₹{refund.refund_amount.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>

                                <div className="relative mb-10 pt-4 px-2">
                                    <div className="absolute top-[22px] left-0 w-full h-[2px] bg-white/5" />
                                    <div
                                        className="absolute top-[22px] left-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                                        style={{ width: `${progress}%` }}
                                    />
                                    <div className="relative flex justify-between">
                                        {statusSteps.map((step, idx) => {
                                            const StepIcon = step.icon;
                                            const isCompleted = statusSteps.findIndex(s => s.id === refund.status) >= idx;
                                            return (
                                                <div key={step.id} className="flex flex-col items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 flex items-center justify-center transition-all duration-500 border relative group/step",
                                                        isCompleted
                                                            ? "bg-primary border-primary text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                                            : "bg-black border-primary/10 text-muted-foreground"
                                                    )}>
                                                        <StepIcon className="h-3.5 w-3.5" />
                                                        {isCompleted && (
                                                            <div className="absolute -inset-1 border border-primary/20 animate-pulse" />
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest hidden sm:block italic",
                                                        isCompleted ? "text-primary" : "text-muted-foreground opacity-40"
                                                    )}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-primary/5">
                                    {refund.filing_date && (
                                        <div className="flex items-center gap-3 group/info">
                                            <Calendar className="h-3.5 w-3.5 text-primary opacity-40 group-hover/info:opacity-100 transition-opacity" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">FILED: {format(new Date(refund.filing_date), 'MMM dd, yyyy')}</span>
                                        </div>
                                    )}
                                    {refund.bank_account_last4 && (
                                        <div className="flex items-center gap-3 group/info">
                                            <Landmark className="h-3.5 w-3.5 text-primary opacity-40 group-hover/info:opacity-100 transition-opacity" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">BANK: XXXX{refund.bank_account_last4}</span>
                                        </div>
                                    )}
                                    {refund.credited_date && (
                                        <div className="flex items-center gap-3 group/info">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">CREDITED: {format(new Date(refund.credited_date), 'MMM dd, yyyy')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <CyberCorner position="top-left" />
            <CyberCorner position="bottom-right" />
        </Card>
    );
}
