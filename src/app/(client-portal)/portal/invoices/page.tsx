'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { 
    FileText, 
    Download, 
    CreditCard, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    TrendingUp, 
    Check, 
    Info, 
    DollarSign 
} from 'lucide-react';
import { toast } from 'sonner';

function InvoicesContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const [clientData, setClientData] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');
    
    // Checkout states
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (!user) return;

        const loadInvoices = async () => {
            try {
                // Get client
                const { data: client } = await supabase
                    .from('clients')
                    .select('id, organization_id')
                    .eq('portal_user_id', user.id)
                    .maybeSingle();

                let clientId = 'mock-client-id';
                if (client) {
                    setClientData(client);
                    clientId = client.id;
                }

                const { data: invs, error } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('client_id', clientId)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (invs && invs.length > 0) {
                    setInvoices(invs);
                } else {
                    // Fallback / Mock Invoices
                    setInvoices([
                        {
                            id: 'inv-1',
                            invoice_number: 'INV-2026-0012',
                            invoice_date: '2026-06-05',
                            due_date: '2026-06-25',
                            status: 'sent',
                            subtotal: 21186.44,
                            tax_amount: 3813.56, // 18% GST
                            total_amount: 25000.00,
                            paid_amount: 0.00,
                            balance_due: 25000.00,
                            notes: 'Professional Tax Consultancy Services'
                        },
                        {
                            id: 'inv-2',
                            invoice_number: 'INV-2026-0004',
                            invoice_date: '2026-05-01',
                            due_date: '2026-05-15',
                            status: 'paid',
                            subtotal: 12711.86,
                            tax_amount: 2288.14,
                            total_amount: 15000.00,
                            paid_amount: 15000.00,
                            balance_due: 0.00,
                            notes: 'GST Filing Assistance - Q1'
                        }
                    ]);
                }
            } catch (err: any) {
                console.error('Error fetching invoices:', err);
                toast.error('Could not sync billing database. Showing cached records.');
            } finally {
                setLoading(false);
            }
        };

        loadInvoices();
    }, [user, supabase]);

    // Handle initial direct query trigger for payment
    useEffect(() => {
        const payId = searchParams.get('pay');
        if (payId && invoices.length > 0) {
            const match = invoices.find(i => i.id === payId);
            if (match && match.status !== 'paid') {
                setSelectedInvoice(match);
                setCheckoutOpen(true);
            }
        }
    }, [searchParams, invoices]);

    const handlePayClick = (invoice: any) => {
        setSelectedInvoice(invoice);
        setCheckoutOpen(true);
        setPaymentSuccess(false);
    };

    const runRazorpayCheckout = async () => {
        setPaymentProcessing(true);
        
        // Simulating network latency for Secure Payment Gateway
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // Update local DB status if connected
            if (clientData && selectedInvoice.id !== 'inv-1') {
                await supabase
                    .from('invoices')
                    .update({
                        status: 'paid',
                        paid_amount: selectedInvoice.total_amount,
                        balance_due: 0,
                        paid_at: new Date().toISOString()
                    })
                    .eq('id', selectedInvoice.id);
            }

            // Update state representation
            setInvoices(prev => prev.map(inv => {
                if (inv.id === selectedInvoice.id) {
                    return {
                        ...inv,
                        status: 'paid',
                        paid_amount: inv.total_amount,
                        balance_due: 0
                    };
                }
                return inv;
            }));

            setPaymentSuccess(true);
            toast.success('Razorpay transaction successful! Invoice paid.');
        } catch (err) {
            toast.error('Payment confirmation error.');
        } finally {
            setPaymentProcessing(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-lime-950 text-lime-500 border-lime-600/30';
            case 'overdue':
                return 'bg-red-950/50 text-red-500 border-red-900/30';
            case 'sent':
            case 'draft':
                return 'bg-slate-900 text-slate-400 border-slate-700/50';
            default:
                return 'bg-slate-900 text-slate-400 border-slate-700/50';
        }
    };

    const filteredInvoices = invoices.filter(inv => {
        if (activeTab === 'unpaid') return inv.status !== 'paid';
        if (activeTab === 'paid') return inv.status === 'paid';
        return true;
    });

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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Billing Console</span>
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
                    Invoices & Checkout
                </h1>
                <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
                    REVIEW ACCOUNT BILLING AND INITIATE SECURE RAZORPAY SETTLEMENTS
                </p>
            </div>

            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                        activeTab === 'all' ? 'border-lime-500 text-lime-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                >
                    All Accounts
                </button>
                <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                        activeTab === 'unpaid' ? 'border-lime-500 text-lime-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                >
                    Outstanding Due
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                        activeTab === 'paid' ? 'border-lime-500 text-lime-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                >
                    Settled Log
                </button>
            </div>

            <Card className="bg-slate-900 border-slate-800 rounded-none">
                <CardHeader className="border-b border-slate-800 pb-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Invoices Inventory</CardTitle>
                    <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">Authorized list of invoices from CA operations</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {filteredInvoices.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                            No billing records in this section.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredInvoices.map((inv) => (
                                <div 
                                    key={inv.id} 
                                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black border border-slate-800 hover:border-slate-700 transition-colors gap-4 rounded-none relative overflow-hidden"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2.5 bg-slate-900 border border-slate-800 text-lime-500 rounded-none">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-white font-mono">{inv.invoice_number}</span>
                                                <span className={`text-[8px] font-black uppercase tracking-widest border px-2 py-0.5 ${getStatusStyle(inv.status)}`}>
                                                    {inv.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                                <span>DATE: {inv.invoice_date}</span>
                                                <span>•</span>
                                                <span>DUE: {inv.due_date}</span>
                                            </div>
                                            {inv.notes && (
                                                <p className="text-[10px] text-slate-400 font-medium italic pt-1">{inv.notes}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-end md:self-center">
                                        <div className="text-right space-y-0.5">
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[9px]">Total Invoice</p>
                                            <p className="text-sm font-black text-white font-mono">₹{Number(inv.total_amount).toLocaleString('en-IN')}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="w-9 h-9 rounded-none border border-slate-800 text-slate-400 hover:text-white"
                                                onClick={() => toast.success('Pre-generating PDF statement...')}
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </Button>

                                            {inv.status !== 'paid' && (
                                                <Button 
                                                    size="sm" 
                                                    className="bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-[9px] px-4 h-9 rounded-none flex items-center gap-1.5"
                                                    onClick={() => handlePayClick(inv)}
                                                >
                                                    <CreditCard className="w-3.5 h-3.5" />
                                                    Checkout
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Checkout Dialog */}
            <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogContent className="bg-slate-900 border border-slate-800 text-white rounded-none max-w-md">
                    <DialogHeader className="border-b border-slate-800 pb-4">
                        <DialogTitle className="text-xs font-black uppercase tracking-[0.2em] italic text-lime-500">
                            Razorpay Payment Gateway
                        </DialogTitle>
                        <DialogDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                            Secure encrypted checkout interface
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="py-6 space-y-6">
                            {!paymentSuccess ? (
                                <>
                                    <div className="p-4 bg-black border border-slate-800 space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Invoice Reference</span>
                                            <span className="font-mono text-white">{selectedInvoice.invoice_number}</span>
                                        </div>
                                        <div className="h-px bg-slate-800" />
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Subtotal Consultancy</span>
                                                <span className="font-mono text-white">₹{Number(selectedInvoice.subtotal).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>GST (18%)</span>
                                                <span className="font-mono text-white">₹{Number(selectedInvoice.tax_amount || 0).toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-800" />
                                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white">
                                            <span>Total Due Payment</span>
                                            <span className="font-mono text-lime-500 text-sm">₹{Number(selectedInvoice.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800/80">
                                        <Info className="w-4 h-4 text-lime-500 flex-shrink-0" />
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-normal">
                                            By proceeding, you invoke Razorpay sandbox mode. Funds will be checked on mock credentials.
                                        </p>
                                    </div>

                                    <Button 
                                        onClick={runRazorpayCheckout}
                                        disabled={paymentProcessing}
                                        className="w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all flex items-center justify-center gap-2"
                                    >
                                        {paymentProcessing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-t-black border-black/20 rounded-full animate-spin" />
                                                PROCESSING ORDER TRANSACTION...
                                            </>
                                        ) : (
                                            <>
                                                PAY ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')} NOW
                                            </>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-12 h-12 bg-lime-600/10 border border-lime-600/30 rounded-full flex items-center justify-center mx-auto text-lime-500">
                                        <Check className="w-6 h-6 animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black uppercase tracking-widest text-white">Transaction Verified</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                            Order references cleared from Razorpay node
                                        </p>
                                    </div>
                                    <div className="p-4 bg-black border border-slate-800 space-y-2 max-w-xs mx-auto text-left font-mono text-[9px] uppercase tracking-wide">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">ID:</span>
                                            <span>pay_rzp_mock_{Date.now().toString().slice(-6)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Amount:</span>
                                            <span className="text-lime-500">₹{Number(selectedInvoice.total_amount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Status:</span>
                                            <span className="text-lime-500">SUCCESS</span>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => setCheckoutOpen(false)}
                                        className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest text-[9px] h-9 rounded-none px-6"
                                    >
                                        Close Portal
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ClientInvoices() {
    return (
        <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
            </div>
        }>
            <InvoicesContent />
        </Suspense>
    );
}
