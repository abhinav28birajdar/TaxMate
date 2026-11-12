'use client';

import React, { useCallback, useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  CreditCard,
  Check,
  Info,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface PortalInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
}

function loadRazorpaySdk(): Promise<boolean> {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadGstStatement(inv: PortalInvoice, customerName: string, customerEmail: string) {
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Invoice ${escapeHtml(inv.invoice_number)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #111; max-width: 720px; margin: 40px auto; padding: 24px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #65a30d; padding-bottom: 16px; margin-bottom: 24px; }
  .badge { color: #65a30d; font-weight: 700; text-transform: uppercase; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  th, td { border-bottom: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 14px; }
  .right { text-align: right; }
  .total { font-weight: 800; font-size: 16px; }
</style></head>
<body>
  <div class="header">
    <div>
      <div class="badge">TaxMate Financial &amp; CA Services</div>
      <h1>Tax Invoice</h1>
      <p>SAC: 998231 (Accounting &amp; Tax Consulting)</p>
    </div>
    <div class="right">
      <p><strong>Invoice No:</strong> ${escapeHtml(inv.invoice_number)}</p>
      <p><strong>Issued Date:</strong> ${escapeHtml(inv.invoice_date)}</p>
      <p><strong>Due Date:</strong> ${escapeHtml(inv.due_date)}</p>
      <p><strong>Status:</strong> ${escapeHtml(inv.status.toUpperCase())}</p>
    </div>
  </div>
  <p><strong>Billed To:</strong> ${escapeHtml(customerName)} (${escapeHtml(customerEmail)})</p>
  <table>
    <thead><tr><th>Description</th><th class="right">Amount (INR)</th></tr></thead>
    <tbody>
      <tr><td>${escapeHtml(inv.notes || 'Professional Tax Consultancy Services')}</td><td class="right">Rs. ${inv.subtotal.toFixed(2)}</td></tr>
      <tr><td>GST (18%)</td><td class="right">Rs. ${inv.tax_amount.toFixed(2)}</td></tr>
      <tr class="total"><td>Total Amount</td><td class="right">Rs. ${inv.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
    </tbody>
  </table>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${inv.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded GST invoice statement for ${inv.invoice_number}`);
}

function InvoicesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<PortalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid'>('all');

  const [selectedInvoice, setSelectedInvoice] = useState<PortalInvoice | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments?limit=50', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Failed to fetch invoices');
      }

      const rawInvoices: any[] = json.data?.invoices || [];
      const mapped: PortalInvoice[] = rawInvoices.map((inv) => {
        const total = Number(inv.totalAmount ?? inv.amount ?? 0);
        const explicitTax = Number(inv.taxAmount ?? inv.metadata?.taxAmount ?? 0);
        const subtotal = explicitTax > 0 ? total - explicitTax : Number((total / 1.18).toFixed(2));
        const taxAmount = explicitTax > 0 ? explicitTax : Number((total - subtotal).toFixed(2));

        return {
          id: inv.id,
          invoice_number: inv.invoiceNumber || `INV-${String(inv.id).slice(0, 8).toUpperCase()}`,
          invoice_date: (inv.issuedAt || inv.createdAt || '').split('T')[0] || 'N/A',
          due_date: inv.dueDate ? String(inv.dueDate).split('T')[0] : 'Upon receipt',
          status: String(inv.status || 'PENDING').toLowerCase(),
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          notes: inv.description || 'Professional Tax Consultancy Services',
        };
      });

      setInvoices(mapped);
    } catch (err: any) {
      toast.error(err.message || 'Unable to load invoices from server');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadInvoices();
    } else {
      setLoading(false);
    }
  }, [user, loadInvoices]);

  useEffect(() => {
    const payId = searchParams.get('pay');
    if (payId && invoices.length > 0) {
      const match = invoices.find((i) => i.id === payId);
      if (match && match.status !== 'paid') {
        setSelectedInvoice(match);
        setPaymentSuccess(false);
        setVerifiedPaymentId(null);
        setCheckoutOpen(true);
      }
    }
  }, [searchParams, invoices]);

  const handlePayClick = (invoice: PortalInvoice) => {
    setSelectedInvoice(invoice);
    setCheckoutOpen(true);
    setPaymentSuccess(false);
    setVerifiedPaymentId(null);
  };

  const runRazorpayCheckout = async () => {
    if (!selectedInvoice) return;
    setPaymentProcessing(true);

    try {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
      if (!keyId || keyId.includes('placeholder')) {
        throw new Error(
          'Razorpay is not configured in this environment (NEXT_PUBLIC_RAZORPAY_KEY_ID missing).'
        );
      }

      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded || typeof (window as any).Razorpay !== 'function') {
        throw new Error('Could not load Razorpay checkout SDK. Check network connection.');
      }

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: Math.round(selectedInvoice.total_amount * 100),
          currency: 'INR',
          serviceName: selectedInvoice.notes || selectedInvoice.invoice_number,
          clientName: user?.name || user?.email || 'TaxMate Client',
          clientEmail: user?.email || '',
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderJson.error || 'Failed to create payment order');
      }

      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount: orderJson.amount,
        currency: orderJson.currency || 'INR',
        name: 'TaxMate',
        description: `Invoice ${selectedInvoice.invoice_number}`,
        order_id: orderJson.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#65a30d' },
        modal: {
          ondismiss: () => setPaymentProcessing(false),
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch('/api/payments/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id || orderJson.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                invoiceId: selectedInvoice.id,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok || !verifyJson.success) {
              throw new Error(verifyJson.error || 'Payment verification failed');
            }

            setVerifiedPaymentId(response.razorpay_payment_id || orderJson.orderId);
            setPaymentSuccess(true);
            toast.success('Razorpay payment verified and invoice settled.');
            await loadInvoices();
          } catch (verifyErr: any) {
            toast.error(verifyErr.message || 'Payment verification failed');
          } finally {
            setPaymentProcessing(false);
          }
        },
      });

      rzp.on('payment.failed', (resp: any) => {
        toast.error(resp?.error?.description || 'Payment failed at gateway.');
        setPaymentProcessing(false);
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment initialization failed.');
      setPaymentProcessing(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-lime-950 text-lime-500 border-lime-600/30';
      case 'overdue':
        return 'bg-red-950/50 text-red-500 border-red-900/30';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700/50';
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (activeTab === 'unpaid') return inv.status !== 'paid' && inv.status !== 'cancelled';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">
            Billing Console
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
            Invoices & Checkout
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
            REVIEW ACCOUNT BILLING AND INITIATE SECURE RAZORPAY SETTLEMENTS
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadInvoices}
          className="border-slate-800 text-slate-300 hover:bg-slate-800 rounded-none self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Sync Ledger
        </Button>
      </div>

      <div className="flex border-b border-slate-800">
        {(['all', 'unpaid', 'paid'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-6 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab
                ? 'border-lime-500 text-lime-500'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab === 'all' ? 'All Accounts' : tab === 'unpaid' ? 'Outstanding Due' : 'Settled Log'}
          </button>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800 rounded-none">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
            Invoices Inventory
          </CardTitle>
          <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
            Authorized list of invoices from CA operations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
              No billing records found in this view.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black border border-slate-800 hover:border-slate-700 transition-colors gap-4 rounded-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 text-lime-500 rounded-none">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white font-mono">
                          {inv.invoice_number}
                        </span>
                        <span
                          className={`text-[8px] font-black uppercase tracking-widest border px-2 py-0.5 ${getStatusStyle(
                            inv.status
                          )}`}
                        >
                          {inv.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        <span>DATE: {inv.invoice_date}</span>
                        <span>•</span>
                        <span>DUE: {inv.due_date}</span>
                      </div>
                      {inv.notes && (
                        <p className="text-[10px] text-slate-400 font-medium italic pt-1">
                          {inv.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right space-y-0.5">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-[9px]">
                        Total Invoice
                      </p>
                      <p className="text-sm font-black text-white font-mono">
                        ₹{Number(inv.total_amount).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-none border border-slate-800 text-slate-400 hover:text-white"
                        onClick={() =>
                          downloadGstStatement(
                            inv,
                            user?.name || user?.email || 'TaxMate Client',
                            user?.email || ''
                          )
                        }
                        title="Download GST Invoice Statement"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>

                      {inv.status !== 'paid' && inv.status !== 'cancelled' && (
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
                        <span className="font-mono text-white">
                          ₹{Number(selectedInvoice.subtotal).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>GST (18%)</span>
                        <span className="font-mono text-white">
                          ₹{Number(selectedInvoice.tax_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-slate-800" />
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white">
                      <span>Total Due Payment</span>
                      <span className="font-mono text-lime-500 text-sm">
                        ₹{Number(selectedInvoice.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800/80">
                    <Info className="w-4 h-4 text-lime-500 flex-shrink-0" />
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-normal">
                      Payments are initialized securely and cryptographically verified on TaxMate servers before marking your invoice as paid.
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
                        INITIALIZING CHECKOUT...
                      </>
                    ) : (
                      <>PAY ₹{Number(selectedInvoice.total_amount).toLocaleString('en-IN')} NOW</>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 bg-lime-600/10 border border-lime-600/30 rounded-full flex items-center justify-center mx-auto text-lime-500">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-white">
                      Transaction Verified
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Payment signature verified & ledger updated
                    </p>
                  </div>
                  <div className="p-4 bg-black border border-slate-800 space-y-2 max-w-xs mx-auto text-left font-mono text-[9px] uppercase tracking-wide">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment ID:</span>
                      <span className="truncate max-w-[160px]">{verifiedPaymentId || 'VERIFIED'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount:</span>
                      <span className="text-lime-500">
                        ₹{Number(selectedInvoice.total_amount).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-lime-500">PAID</span>
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
    <Suspense
      fallback={
        <div className="flex h-[60vh] items-center justify-center">
          <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
        </div>
      }
    >
      <InvoicesContent />
    </Suspense>
  );
}
