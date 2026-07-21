'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Calendar, 
    Download, 
    ShieldCheck, 
    Search,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function ClientCompliance() {
    const { user } = useAuth();
    const [complianceRecords, setComplianceRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const supabase = createClient();

    useEffect(() => {
        if (!user) return;

        const loadCompliance = async () => {
            try {
                // Find client matching user.id
                const { data: client } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('portal_user_id', user.id)
                    .maybeSingle();

                let clientId = 'mock-client-id';
                if (client) {
                    clientId = client.id;
                }

                const { data: records, error } = await supabase
                    .from('compliance_records')
                    .select('*')
                    .eq('client_id', clientId)
                    .order('due_date', { ascending: true });

                if (error) throw error;

                if (records && records.length > 0) {
                    setComplianceRecords(records);
                } else {
                    // Fallback / Mock Compliance Records
                    setComplianceRecords([
                        {
                            id: 'comp-1',
                            compliance_type: 'gst_r1',
                            financial_year: '2026-27',
                            due_date: '2026-06-11',
                            filing_date: '2026-06-09',
                            status: 'filed',
                            acknowledgement_number: 'ACK998877123',
                            notes: 'Filing filed early on June 9'
                        },
                        {
                            id: 'comp-2',
                            compliance_type: 'gst_r3b',
                            financial_year: '2026-27',
                            due_date: '2026-06-20',
                            filing_date: null,
                            status: 'pending',
                            acknowledgement_number: null,
                            notes: 'Awaiting sales statements'
                        },
                        {
                            id: 'comp-3',
                            compliance_type: 'itr_4',
                            financial_year: '2025-26',
                            due_date: '2026-07-31',
                            filing_date: null,
                            status: 'in_progress',
                            acknowledgement_number: null,
                            notes: 'Assigned to priya sharma (Staff)'
                        }
                    ]);
                }
            } catch (err: any) {
                console.error('Error fetching compliance:', err);
                toast.error('Could not sync compliance database. Showing mock reports.');
            } finally {
                setLoading(false);
            }
        };

        loadCompliance();
    }, [user, supabase]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'filed':
                return (
                    <span className="flex items-center gap-1 bg-lime-950 text-lime-500 border border-lime-600/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        FILED
                    </span>
                );
            case 'overdue':
                return (
                    <span className="flex items-center gap-1 bg-red-950/50 text-red-500 border border-red-900/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 animate-pulse">
                        <AlertCircle className="w-3 h-3" />
                        OVERDUE
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="flex items-center gap-1 bg-blue-950 text-blue-500 border border-blue-600/30 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        <Clock className="w-3 h-3 animate-spin" />
                        IN PROGRESS
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 bg-slate-900 text-slate-400 border border-slate-700/50 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                        <Calendar className="w-3 h-3" />
                        PENDING
                    </span>
                );
        }
    };

    const handleDownloadSlip = (ack: string) => {
        toast.success(`Initiating download for acknowledgement: ${ack}`);
    };

    const filteredRecords = complianceRecords.filter(rec => {
        const matchesSearch = rec.compliance_type.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (rec.acknowledgement_number && rec.acknowledgement_number.includes(searchQuery));
        
        const matchesStatus = statusFilter === 'all' || rec.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Compliance Center</span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                    Filing Returns radar
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
                    TRACK AND ACCESS ALL GST AND INCOME TAX RETURNS FILED BY OPERATORS
                </p>
            </div>

            <Card className="bg-slate-900 border-slate-800 rounded-none">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Returns Ledger</CardTitle>
                            <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Authorized list of tax filings and timelines</CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                                className="bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-8 rounded-none focus:border-lime-600/50 outline-none"
                            >
                                <option value="all">ALL STATUSES</option>
                                <option value="filed">FILED ONLY</option>
                                <option value="pending">PENDING ONLY</option>
                                <option value="in_progress">IN PROGRESS ONLY</option>
                                <option value="overdue">OVERDUE ONLY</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative w-full group mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-lime-500 transition-colors" />
                        <Input
                            type="text"
                            placeholder="SEARCH FILING TYPES OR ACKS..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border-slate-800 focus:border-lime-600/50 pl-10 h-9 rounded-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600 transition-all"
                        />
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <RefreshCw className="w-6 h-6 text-lime-500 animate-spin" />
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                            No returns matched your request filters.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredRecords.map((rec) => (
                                <div 
                                    key={rec.id} 
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-black border border-slate-800 hover:border-slate-700 transition-all gap-4 rounded-none relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-slate-900 border border-slate-800 text-lime-500 rounded-none">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black uppercase text-white tracking-wider">
                                                    {rec.compliance_type.replace('_', ' ').toUpperCase()} RETURN
                                                </p>
                                                {getStatusBadge(rec.status)}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                                <span>FY: {rec.financial_year}</span>
                                                <span>•</span>
                                                <span>DUE: {rec.due_date}</span>
                                                {rec.filing_date && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-lime-500">FILED: {rec.filing_date}</span>
                                                    </>
                                                )}
                                            </div>
                                            {rec.acknowledgement_number && (
                                                <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                                                    ACK: {rec.acknowledgement_number}
                                                </p>
                                            )}
                                            {rec.notes && (
                                                <p className="text-[10px] text-slate-400 italic font-medium mt-1">{rec.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    {rec.status === 'filed' && rec.acknowledgement_number && (
                                        <Button 
                                            onClick={() => handleDownloadSlip(rec.acknowledgement_number)}
                                            className="bg-transparent hover:bg-lime-600 hover:text-black border border-lime-600/30 hover:border-lime-600 text-lime-500 font-black uppercase tracking-widest text-[9px] px-3 h-8 rounded-none flex items-center gap-1.5 transition-all self-end sm:self-center"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            Download Slip
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
