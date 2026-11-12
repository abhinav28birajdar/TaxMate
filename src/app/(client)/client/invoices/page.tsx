'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Download,
  ExternalLink,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentButton } from '@/components/invoices/PaymentButton';
import { useRealtimeInvoices } from '@/hooks/use-realtime';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_number: string;
  ca_id?: string;
  client_id?: string;
  description?: string;
  service?: string;
  amount: number;
  total_amount?: number;
  status: string;
  due_date?: string;
  created_at: string;
  paid_at?: string;
  metadata?: any;
}

function downloadInvoiceHtmlReceipt(inv: Invoice, userName: string, userEmail: string) {
  const total = Number(inv.total_amount ?? inv.amount ?? 0);
  const taxable = (total / 1.18).toFixed(2);
  const tax = (total - total / 1.18).toFixed(2);
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${inv.invoice_number}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:24px;color:#111}
.top{display:flex;justify-content:space-between;border-bottom:2px solid #10b981;padding-bottom:14px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:10px 8px;text-align:left}
.right{text-align:right}.total{font-weight:700;font-size:16px}</style></head>
<body>
<div class="top"><div><strong>TaxMate CA Billing</strong><h1>Invoice Receipt</h1></div>
<div class="right"><div><strong>${inv.invoice_number}</strong></div><div>Status: ${String(inv.status).toUpperCase()}</div><div>Date: ${new Date(inv.created_at).toLocaleDateString('en-IN')}</div></div></div>
<p><strong>Client:</strong> ${userName} (${userEmail})</p>
<table><thead><tr><th>Description</th><th class="right">Amount (INR)</th></tr></thead>
<tbody>
<tr><td>${inv.description || inv.service || 'Tax Consultation & Filing'}</td><td class="right">Rs. ${taxable}</td></tr>
<tr><td>GST (18%)</td><td class="right">Rs. ${tax}</td></tr>
<tr class="total"><td>Total</td><td class="right">Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
</tbody></table></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${inv.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded receipt ${inv.invoice_number}`);
}

export default function ClientInvoicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const userId = user?.id || '';
  const userEmail = user?.email || '';
  const userName = user?.name || user?.email || 'Valued Client';

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/payments?limit=50', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Failed to load invoices');
      }

      const rawInvoices: any[] = json.data?.invoices || [];
      const mapped: Invoice[] = rawInvoices.map((inv) => ({
        id: inv.id,
        invoice_number: inv.invoiceNumber || `INV-${String(inv.id).slice(0, 8).toUpperCase()}`,
        ca_id: inv.caId,
        client_id: inv.clientId,
        description: inv.description,
        amount: Number(inv.amount || 0),
        total_amount: Number(inv.totalAmount ?? inv.amount ?? 0),
        status: inv.status || 'PENDING',
        due_date: inv.dueDate,
        created_at: inv.createdAt || new Date().toISOString(),
        paid_at: inv.paidAt,
        metadata: inv.metadata,
      }));

      setInvoices(mapped);
      setSelectedInvoice((prev) =>
        prev ? mapped.find((m) => m.id === prev.id) || mapped[0] || null : mapped[0] || null
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
  }, [user, fetchInvoices]);

  useRealtimeInvoices(
    userId,
    (newInv) => {
      setInvoices((prev) => [newInv, ...prev.filter((i) => i.id !== newInv.id)]);
      toast.info('New invoice received!');
    },
    (updatedInv) => {
      setInvoices((prev) => prev.map((i) => (i.id === updatedInv.id ? updatedInv : i)));
      if (selectedInvoice?.id === updatedInv.id) {
        setSelectedInvoice(updatedInv);
      }
      if (updatedInv.status?.toLowerCase() === 'paid') {
        toast.success(`Invoice #${updatedInv.invoice_number} marked as Paid!`);
      }
    }
  );

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success(`Payment verified! ID: ${paymentId}`);
    fetchInvoices();
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt || 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            Invoices & Payments
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review billings from your CA firm and make secure online payments via Razorpay / UPI.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchInvoices}
          disabled={loading}
          className="border-slate-800 text-slate-300 hover:bg-slate-800 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Billing History</CardTitle>
            <CardDescription className="text-slate-400">All issued tax service invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm">Loading billing records...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Receipt className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-base font-semibold text-slate-300">No invoices issued yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When your Chartered Accountant issues an invoice for compliance, audit, or tax filing, it will appear here for online payment.
                </p>
              </div>
            ) : (
              invoices.map((inv) => {
                const isPaid = inv.status?.toLowerCase() === 'paid';
                const isSelected = selectedInvoice?.id === inv.id;
                const invAmount = inv.total_amount || inv.amount || 0;

                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/5'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-lg ${
                          isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-100">{inv.invoice_number}</h4>
                        <p className="text-xs text-slate-400">
                          {inv.description || inv.service || 'Chartered Accountancy Services'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'Upon receipt'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold text-slate-100 block">
                        {formatCurrency(invAmount)}
                      </span>
                      {isPaid ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                          Payment Due
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {selectedInvoice ? (
          <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-100">{selectedInvoice.invoice_number}</CardTitle>
                {selectedInvoice.status?.toLowerCase() === 'paid' ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Paid</Badge>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Payment Due</Badge>
                )}
              </div>
              <CardDescription className="text-slate-400">
                Created on {new Date(selectedInvoice.created_at).toLocaleDateString('en-IN')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Client:</span>
                  <span className="text-slate-200 font-medium">{userName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Service:</span>
                  <span className="text-slate-200 font-medium">
                    {selectedInvoice.description || selectedInvoice.service || 'Tax Consultation & Filing'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Status:</span>
                  <span className="text-slate-200 uppercase font-mono">{selectedInvoice.status}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-slate-200">Total Payable:</span>
                  <span className="text-emerald-400">
                    {formatCurrency(selectedInvoice.total_amount || selectedInvoice.amount || 0)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {selectedInvoice.status?.toLowerCase() !== 'paid' ? (
                  <PaymentButton
                    invoiceId={selectedInvoice.id}
                    invoiceNumber={selectedInvoice.invoice_number}
                    amount={selectedInvoice.total_amount || selectedInvoice.amount || 0}
                    clientName={userName}
                    clientEmail={userEmail}
                    onPaymentSuccess={handlePaymentSuccess}
                    className="w-full"
                  />
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => downloadInvoiceHtmlReceipt(selectedInvoice, userName, userEmail)}
                    className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    <Download className="w-4 h-4 mr-2 text-emerald-400" /> Download Tax Receipt
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/client/invoices/${selectedInvoice.id}`)}
                  className="w-full text-slate-400 hover:text-white"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Full Invoice Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900/50 border-slate-800 flex items-center justify-center p-8 text-center text-slate-500">
            <div>
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Select an invoice to view payment details</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
