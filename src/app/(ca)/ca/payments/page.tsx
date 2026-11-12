'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  CreditCard,
  Download,
  Search,
  CheckCircle2,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PaymentRow {
  id: string;
  ref: string;
  invoiceId?: string | null;
  invoiceNo: string;
  client: string;
  method: string;
  amount: number;
  date: string;
  status: string;
}

interface UnpaidInvoiceOption {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
}

function downloadPaymentReceipt(p: PaymentRow) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Receipt ${p.ref}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:24px;color:#111}
.box{border:1px solid #ddd;border-radius:8px;padding:20px;margin-top:16px}</style></head>
<body>
<h2>TaxMate Payment Settlement Receipt</h2>
<div class="box">
<p><strong>Reference:</strong> ${p.ref}</p>
<p><strong>Invoice #:</strong> ${p.invoiceNo}</p>
<p><strong>Client:</strong> ${p.client}</p>
<p><strong>Channel:</strong> ${p.method}</p>
<p><strong>Amount:</strong> Rs. ${p.amount.toLocaleString('en-IN')}</p>
<p><strong>Status:</strong> ${p.status}</p>
<p><strong>Date:</strong> ${p.date}</p>
</div></body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt_${p.ref.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success(`Downloaded receipt ${p.ref}`);
}

export default function CAPaymentsPage() {
  const [search, setSearch] = useState('');
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [payRes, invRes] = await Promise.all([
        fetch('/api/payments?limit=100', { credentials: 'include' }),
        fetch('/api/invoices?take=100', { credentials: 'include' }),
      ]);

      const invJson = invRes.ok ? await invRes.json() : {};
      const rawInv: any[] = invJson.invoices || [];
      const invMap = new Map(rawInv.map((inv) => [inv.id, inv]));

      const unpaid = rawInv
        .filter((inv) => !['PAID', 'CANCELLED'].includes(String(inv.status || '').toUpperCase()))
        .map((inv) => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number || `INV-${String(inv.id).slice(0, 6)}`,
          clientName: inv.client_name || 'Client',
          amount: Number(inv.total_amount ?? inv.amount ?? 0),
        }));
      setUnpaidInvoices(unpaid);
      if (unpaid.length > 0 && !selectedInvoiceId) {
        setSelectedInvoiceId(unpaid[0].id);
      }

      if (payRes.ok) {
        const payJson = await payRes.json();
        const rawPay: any[] = payJson.data?.payments || [];
        const rows: PaymentRow[] = rawPay.map((p) => {
          const linkedInv = p.invoiceId ? invMap.get(p.invoiceId) : null;
          const upperStatus = String(p.status || 'PENDING').toUpperCase();
          return {
            id: p.id,
            ref: p.paymentId || p.orderId || `PAY-${String(p.id).slice(0, 8).toUpperCase()}`,
            invoiceId: p.invoiceId,
            invoiceNo: linkedInv?.invoice_number || p.metadata?.invoiceNumber || 'DIRECT',
            client: linkedInv?.client_name || p.notes || p.metadata?.serviceName || 'Client Payment',
            method: String(p.paymentMethod || p.gateway || 'RAZORPAY').toUpperCase(),
            amount: Number(p.amount || 0),
            date: new Date(p.paidAt || p.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
            status:
              upperStatus === 'SUCCESS' || upperStatus === 'COMPLETED' ? 'SETTLED' : upperStatus,
          };
        });
        setPayments(rows);
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load payment records');
    } finally {
      setLoading(false);
    }
  }, [selectedInvoiceId]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleMarkInvoicePaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      toast.error('No pending invoice selected');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(selectedInvoiceId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'PAID' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not settle invoice');
      }

      toast.success('Invoice marked as PAID / settled!');
      setShowLogModal(false);
      await loadPayments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to settle invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const settledTotal = payments
    .filter((p) => p.status === 'SETTLED')
    .reduce((acc, p) => acc + p.amount, 0);
  const pendingTotal = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((acc, p) => acc + p.amount, 0);
  const filteredPayments = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.ref.toLowerCase().includes(q) ||
      p.client.toLowerCase().includes(q) ||
      p.invoiceNo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" /> Practice Financials & Billing
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Payments Received & Gateway Settlements
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Track online Razorpay collections and offline NEFT/bank settlements across client invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPayments}
            className="border-white/10 text-gray-300 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowLogModal(true)}
            disabled={unpaidInvoices.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-[0_0_20px_rgba(5,150,105,0.3)]"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Record Offline Settlement
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#111111] border border-emerald-500/20 rounded-2xl">
          <span className="text-xs font-semibold text-emerald-400">Total Collections Recorded</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            ₹{(settledTotal + pendingTotal).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{payments.length} transaction(s)</p>
        </div>
        <div className="p-5 bg-[#111111] border border-white/10 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Settled / Verified</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            ₹{settledTotal.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Verified on TaxMate gateway</p>
        </div>
        <div className="p-5 bg-[#111111] border border-white/10 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-gray-400">Pending / Unpaid Invoices</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            ₹
            {unpaidInvoices
              .reduce((acc, inv) => acc + inv.amount, 0)
              .toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {unpaidInvoices.length} unpaid invoice(s)
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by payment reference, invoice #, or client..."
          className="pl-9 bg-[#111111] border-white/10 text-white text-xs"
        />
      </div>

      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1A1A1A] text-gray-300 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Payment Ref #</th>
              <th className="py-3.5 px-4">Client / Notes</th>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400">
                  Loading settlements...
                </td>
              </tr>
            ) : filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400 italic">
                  No payment transactions found.
                </td>
              </tr>
            ) : (
              filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{p.ref}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{p.client}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-400">{p.invoiceNo}</td>
                  <td className="py-3.5 px-4 text-gray-300">{p.method}</td>
                  <td className="py-3.5 px-4 text-gray-400">{p.date}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-white">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status === 'SETTLED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadPaymentReceipt(p)}
                      className="text-gray-400 hover:text-white hover:bg-white/5"
                      title="Download receipt"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4 text-white">
            <h3 className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Mark Invoice Settled (NEFT/UPI)
            </h3>
            <form onSubmit={handleMarkInvoicePaid} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 text-gray-300">Select Unpaid Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  required
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl p-2.5 text-white"
                >
                  {unpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.clientName} (₹{inv.amount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowLogModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {submitting ? 'Updating...' : 'Mark Paid'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
