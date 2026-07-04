'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { 
    Search, 
    Plus, 
    Mail, 
    Phone, 
    ShieldAlert, 
    Building, 
    User,
    CheckCircle,
    UserCheck,
    Download,
    X,
    Filter
} from 'lucide-react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export default function OperatorClientsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [riskFilter, setRiskFilter] = useState('all');
    
    // Add Client Dialog
    const [openAdd, setOpenAdd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        displayName: '',
        email: '',
        phone: '',
        clientType: 'individual',
        pan: '',
        gstin: '',
        riskLevel: 'low',
        notes: '',
        portalAccess: true
    });

    const supabase = createClient();

    const loadClients = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            
            // Find operator's organization
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user.id)
                .maybeSingle();

            const orgId = profile?.organization_id;
            if (!orgId) {
                setClients(getMockClients());
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('organization_id', orgId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setClients(data);
            } else {
                setClients(getMockClients());
            }
        } catch (err: any) {
            console.error('Error fetching clients:', err);
            setClients(getMockClients());
        } finally {
            setLoading(false);
        }
    }, [user, supabase]);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const getMockClients = () => [
        {
            id: 'mock-1',
            full_name: 'ABC Business Solutions',
            display_name: 'ABC Solutions',
            email: 'info@abcsolutions.com',
            phone: '+91 99887 76655',
            client_type: 'company',
            pan: 'ABCDE1234F',
            gstin: '27AAAAA1111A1Z1',
            status: 'active',
            risk_level: 'low',
            portal_access: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'mock-2',
            full_name: 'Aditya Birla Services',
            display_name: 'Aditya Birla',
            email: 'billing@birla.com',
            phone: '+91 91234 56789',
            client_type: 'company',
            pan: 'BIRLA8899Z',
            gstin: '27BBBBB2222B2Z2',
            status: 'active',
            risk_level: 'medium',
            portal_access: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'mock-3',
            full_name: 'Rahul K. Sharma',
            display_name: 'Rahul Sharma',
            email: 'rahul@sharma.in',
            phone: '+91 98123 45670',
            client_type: 'individual',
            pan: 'SHARM1122C',
            gstin: '',
            status: 'active',
            risk_level: 'high',
            portal_access: false,
            created_at: new Date().toISOString()
        }
    ];

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email) {
            toast.error('Name and Email are required.');
            return;
        }

        setSubmitting(true);
        try {
            // Get CA profile organization
            const { data: profile } = await supabase
                .from('profiles')
                .select('organization_id')
                .eq('id', user?.id)
                .maybeSingle();

            const orgId = profile?.organization_id || '00000000-0000-0000-0000-000000000000';

            // 1. Create client record
            const { data: client, error } = await supabase
                .from('clients')
                .insert({
                    organization_id: orgId,
                    assigned_ca_id: user?.id,
                    client_type: formData.clientType as any,
                    full_name: formData.fullName,
                    display_name: formData.displayName || formData.fullName,
                    email: formData.email,
                    phone: formData.phone || null,
                    pan: formData.pan.toUpperCase() || null,
                    gstin: formData.gstin.toUpperCase() || null,
                    status: 'active',
                    risk_level: formData.riskLevel as any,
                    notes: formData.notes || null,
                    portal_access: formData.portalAccess
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(`Client ${formData.fullName} added successfully.`);
            setOpenAdd(false);
            setFormData({
                fullName: '',
                displayName: '',
                email: '',
                phone: '',
                clientType: 'individual',
                pan: '',
                gstin: '',
                riskLevel: 'low',
                notes: '',
                portalAccess: true
            });
            loadClients();
        } catch (err: any) {
            console.error('Error adding client:', err);
            
            // Offline fallback simulation
            const tempClient = {
                id: `client-mock-${Date.now()}`,
                full_name: formData.fullName,
                display_name: formData.displayName || formData.fullName,
                email: formData.email,
                phone: formData.phone,
                client_type: formData.clientType,
                pan: formData.pan.toUpperCase(),
                gstin: formData.gstin.toUpperCase(),
                status: 'active',
                risk_level: formData.riskLevel,
                portal_access: formData.portalAccess,
                created_at: new Date().toISOString()
            };
            setClients(prev => [tempClient, ...prev]);
            toast.success(`Sandbox mode: simulated insertion of client ${formData.fullName}`);
            setOpenAdd(false);
        } finally {
            setSubmitting(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'high':
                return 'bg-red-950 text-red-500 border-red-900/30';
            case 'medium':
                return 'bg-orange-950 text-orange-500 border-orange-900/30';
            default:
                return 'bg-lime-950 text-lime-500 border-lime-600/30';
        }
    };

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.full_name.toLowerCase().includes(search.toLowerCase()) || 
            c.email.toLowerCase().includes(search.toLowerCase()) ||
            (c.pan && c.pan.toLowerCase().includes(search.toLowerCase())) ||
            (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()));

        const matchesType = typeFilter === 'all' || c.client_type === typeFilter;
        const matchesRisk = riskFilter === 'all' || c.risk_level === riskFilter;

        return matchesSearch && matchesType && matchesRisk;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Authorized Accounts</span>
                    <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                        Clients directory
                    </h1>
                </div>
                <Button 
                    onClick={() => setOpenAdd(true)}
                    className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-none flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Register Client
                </Button>
            </div>

            <Card className="bg-slate-900 border-slate-800 rounded-none">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:max-w-md group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-lime-500 transition-colors" />
                            <Input
                                type="text"
                                placeholder="SEARCH NAME, EMAIL, PAN OR GSTIN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-black border-slate-800 focus:border-lime-600/50 pl-10 h-10 rounded-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600 transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                            >
                                <option value="all">ALL ENTITIES</option>
                                <option value="individual">INDIVIDUAL</option>
                                <option value="company">COMPANY</option>
                                <option value="partnership">PARTNERSHIP</option>
                                <option value="llp">LLP</option>
                                <option value="trust">TRUST</option>
                            </select>

                            <select
                                value={riskFilter}
                                onChange={(e) => setRiskFilter(e.target.value)}
                                className="bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                            >
                                <option value="all">ALL RISK LEVELS</option>
                                <option value="low">LOW RISK</option>
                                <option value="medium">MEDIUM RISK</option>
                                <option value="high">HIGH RISK</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
                        </div>
                    ) : filteredClients.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                            No clients match the specified search logs.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-black/40 border-b border-slate-800">
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10">Client Identity</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10">Tax Identifiers</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10">Communication</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10">Risk Class</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10">Portal Access</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow key={client.id} className="border-slate-800 hover:bg-white/5 cursor-pointer">
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 rounded-none border border-slate-800">
                                                    <AvatarFallback className="bg-lime-600/10 text-lime-500 font-black italic rounded-none">
                                                        {client.full_name[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-xs font-black uppercase text-white tracking-wider">{client.full_name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{client.client_type.toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 font-mono text-[10px]">
                                            <div className="space-y-0.5">
                                                <p className="text-slate-400">PAN: <span className="text-white">{client.pan || 'N/A'}</span></p>
                                                <p className="text-slate-500">GST: <span className="text-slate-300">{client.gstin || 'N/A'}</span></p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Mail className="w-3.5 h-3.5 text-lime-500" />
                                                    <span>{client.email}</span>
                                                </div>
                                                {client.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3.5 h-3.5 text-lime-500" />
                                                        <span>{client.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge className={`rounded-none font-black text-[8px] uppercase tracking-widest border ${getRiskColor(client.risk_level)}`}>
                                                {client.risk_level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {client.portal_access ? (
                                                <Badge className="bg-lime-950 text-lime-500 border border-lime-600/20 rounded-none font-black text-[8px] uppercase tracking-widest">
                                                    ENABLED
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-slate-950 text-slate-500 border border-slate-800 rounded-none font-black text-[8px] uppercase tracking-widest">
                                                    DISABLED
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Client Dialog */}
            <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                <DialogContent className="bg-slate-900 border border-slate-800 text-white rounded-none max-w-lg">
                    <DialogHeader className="border-b border-slate-800 pb-4">
                        <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] italic text-lime-500">
                            Register New Client
                        </DialogTitle>
                        <DialogDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                            Add client entity files to organization system
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddClient} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Entity Full Name *</Label>
                                <Input
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs"
                                    placeholder="Aditya Birla Solutions"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Display / Nick Name</Label>
                                <Input
                                    value={formData.displayName}
                                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs"
                                    placeholder="Birla Corp"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Email Address *</Label>
                                <Input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs"
                                    placeholder="billing@birla.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Phone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs"
                                    placeholder="+91 99999 88888"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Client Type</Label>
                                <select
                                    value={formData.clientType}
                                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                                >
                                    <option value="individual">INDIVIDUAL</option>
                                    <option value="company">COMPANY</option>
                                    <option value="partnership">PARTNERSHIP</option>
                                    <option value="llp">LLP</option>
                                    <option value="trust">TRUST</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Risk Class</Label>
                                <select
                                    value={formData.riskLevel}
                                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                                >
                                    <option value="low">LOW RISK</option>
                                    <option value="medium">MEDIUM RISK</option>
                                    <option value="high">HIGH RISK</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">PAN CARD</Label>
                                <Input
                                    value={formData.pan}
                                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs font-mono uppercase"
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">GSTIN</Label>
                                <Input
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs font-mono uppercase"
                                    placeholder="27AAAAA1111A1Z1"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">Notes / Comments</Label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full bg-black border border-slate-800 text-xs text-white px-3 py-2 rounded-none focus:border-lime-600/50 outline-none"
                                placeholder="Details about specific consultancy rules..."
                            />
                        </div>

                        <div className="flex items-center gap-2 py-2">
                            <input 
                                type="checkbox"
                                id="portalAccess"
                                checked={formData.portalAccess}
                                onChange={(e) => setFormData({ ...formData, portalAccess: e.target.checked })}
                                className="rounded bg-black border-slate-800 text-lime-600 focus:ring-lime-500"
                            />
                            <Label htmlFor="portalAccess" className="text-[9px] font-black uppercase tracking-wider text-slate-400 cursor-pointer select-none">
                                AUTO-INVITE TO SECURE CLIENT PORTAL
                            </Label>
                        </div>

                        <DialogFooter className="border-t border-slate-800 pt-4">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => setOpenAdd(false)}
                                className="text-[9px] font-black uppercase tracking-widest text-white rounded-none hover:bg-slate-800"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] rounded-none px-6 h-10"
                            >
                                {submitting ? 'CREATING CLIENT...' : 'ADD CLIENT RECORD'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
