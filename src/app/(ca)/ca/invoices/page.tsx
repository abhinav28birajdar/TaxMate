'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt, Download, Send, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CAInvoiceRow {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  created_at: string;
  due_date?: string;
  total_amount: number;
  tax_amount: number;
  status: string;
  description?: string;
}

function downloadGstInvoiceHtml(inv: CAInvoiceRow) {
  const total = Number(inv.total_amount || 0);
  const tax = Number(inv.tax_amount || (total - total / 1.18));
  const sub = Number((total - tax).toFixed(2));
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${inv.invoice_number}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:24px;color:#111}
.top{display:flex;justify-content:space-between;border-bottom:2px solid #65a30d;padding-bottom:14px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:10px 8px;text-align:left}
.right{text-align:right}.total{font-weight:700;font-size:16px}</style></head>
<body>
<div class="top"><div><strong>TaxMate GST Tax Invoice</strong><h1>${inv.invoice_number}</h1></div>
<div class="right"><div>Status: ${inv.status.toUpperCase()}</div><div>Issued: ${new Date(inv.created_at).toLocaleDateString('en-IN')}</div><div>Due: ${inv.due_date || 'Upon receipt'}</div></div></div>
<p><strong>Client:</strong> ${inv.client_name}</p>
<table><thead><tr><th>Description</th><th class="right">Amount (INR)</th></tr></thead>
<tbody>
<tr><td>${inv.description || 'Chartered Accountancy & Compliance Services'}</td><td class="right">Rs. ${sub.toFixed(2)}</td></tr>
<tr><td>GST</td><td class="right">Rs. ${tax.toFixed(2)}</td></tr>
<tr class="total"><td>Grand Total</td><td class="right">Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
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
  toast.success(`Downloaded ${inv.invoice_number}`);
}

export default function CAInvoicesPage() {
  const [invoices, setInvoices] = useState<CAInvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/invoices?take=100', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch invoices');
      setInvoices(
        (json.invoices || []).map((inv: any) => ({
          id: inv.id,
          invoice_number: inv.invoice_number || `INV-${String(inv.id).slice(0, 6)}`,
          client_name: inv.client_name || 'Client',
          client_email: inv.client_email || '',
          created_at: inv.created_at,
          due_date: inv.due_date,
          total_amount: Number(inv.total_amount ?? inv.amount ?? 0),
          tax_amount: Number(inv.tax_amount ?? inv.metadata?.taxAmount ?? 0),
          status: String(inv.status || 'DRAFT').toUpperCase(),
          description: inv.description,
        }))
      );
    } catch (err: any) {
      toast.error(err.message || 'Unable to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleSendInvoice = async (inv: CAInvoiceRow) => {
    try {
      setSendingId(inv.id);
      const endpoint =
        inv.status === 'DRAFT' ? '/api/payments/send-invoice' : '/api/payments/send-reminder';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: inv.id,
          invoiceNumber: inv.invoice_number,
          clientEmail: inv.client_email || undefined,
          dueDate: inv.due_date || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not dispatch invoice notification');
      }
      toast.success(
        inv.status === 'DRAFT'
          ? `Invoice ${inv.invoice_number} issued to client!`
          : `Payment reminder sent for ${inv.invoice_number}`
      );
      await loadInvoices();
    } catch (err: any) {
      toast.error(err.message || 'Dispatch failed');
    } finally {
      setSendingId(null);
    }
  };

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);
  const paidTotal = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((acc, inv) => acc + inv.total_amount, 0);
  const pendingTotal = totalBilled - paidTotal;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-lime-600" /> Invoices & GST Billing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate compliant GST invoices, collect online via Razorpay, and track outstanding balances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadInvoices} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/ca/invoices/create">
            <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
              <Plus className="w-4 h-4 mr-2" /> Create GST Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Billed</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalBilled.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-slate-500">Paid Invoices</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">
            ₹{paidTotal.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-medium text-slate-500">Balance Pending</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">
            ₹{pendingTotal.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Invoice #</th>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Invoice Date</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Grand Total</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  Loading invoices...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                  No invoices created yet. Click &ldquo;Create GST Invoice&rdquo; to issue one.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline flex items-center gap-1">
                      {inv.invoice_number} <ExternalLink className="w-3 h-3 opacity-60" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {inv.client_name}
                  </td>
                  <td className="py-3.5 px-4">
                    {new Date(inv.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : 'Upon receipt'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 dark:text-white">
                    ₹{inv.total_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : inv.status === 'OVERDUE'
                            ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadGstInvoiceHtml(inv)}
                      title="Download GST Invoice"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                    </Button>
                    {inv.status !== 'PAID' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={sendingId === inv.id}
                        onClick={() => handleSendInvoice(inv)}
                        title={inv.status === 'DRAFT' ? 'Send Invoice' : 'Send Payment Reminder'}
                      >
                        <Send className="w-4 h-4 text-lime-600" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
