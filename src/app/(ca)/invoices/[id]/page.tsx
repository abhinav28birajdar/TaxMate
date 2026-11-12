'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Send, CheckCircle2, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InvoicePreview from '@/components/invoices/InvoicePreview';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = params?.id || '';
  const router = useRouter();

  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!invoiceId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.invoice) {
        throw new Error(json.error || 'Invoice not found');
      }
      setInvoice(json.invoice);
    } catch (err: any) {
      setError(err.message || 'Could not load invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleDownload = () => {
    if (!invoice) return;
    const total = Number(invoice.total_amount ?? invoice.amount ?? 0);
    const tax = Number(invoice.tax_amount ?? invoice.metadata?.taxAmount ?? 0);
    const sub = Number(invoice.subtotal ?? total - tax);
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${invoice.invoice_number}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:24px;color:#111}
table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:10px 8px;text-align:left}
.right{text-align:right}</style></head>
<body>
<h1>Tax Invoice ${invoice.invoice_number}</h1>
<p><strong>Client:</strong> ${invoice.client_name} (${invoice.client_email || ''})</p>
<p><strong>Status:</strong> ${String(invoice.status).toUpperCase()}</p>
<table><thead><tr><th>Description</th><th class="right">Amount (INR)</th></tr></thead><tbody>
<tr><td>${invoice.description || 'Chartered Accountancy Services'}</td><td class="right">Rs. ${sub.toFixed(2)}</td></tr>
<tr><td>GST</td><td class="right">Rs. ${tax.toFixed(2)}</td></tr>
<tr><td><strong>Total</strong></td><td class="right"><strong>Rs. ${total.toLocaleString('en-IN')}</strong></td></tr>
</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${invoice.invoice_number}`);
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    try {
      setBusy(true);
      const endpoint =
        String(invoice.status).toUpperCase() === 'DRAFT'
          ? '/api/payments/send-invoice'
          : '/api/payments/send-reminder';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoice_number,
          clientEmail: invoice.client_email || undefined,
          dueDate: invoice.due_date || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Dispatch failed');
      }
      toast.success('Invoice / reminder notification sent to client');
      await loadInvoice();
    } catch (err: any) {
      toast.error(err.message || 'Failed to notify client');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoice.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'PAID' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to mark paid');
      toast.success('Invoice marked as PAID');
      await loadInvoice();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice || !confirm(`Delete invoice ${invoice.invoice_number}?`)) return;
    try {
      setBusy(true);
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoice.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      toast.success('Invoice deleted');
      router.push('/ca/invoices');
    } catch (err: any) {
      toast.error(err.message || 'Could not delete invoice');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-semibold">{error || 'Invoice not found'}</p>
        </Card>
      </div>
    );
  }

  const normalizedStatus = String(invoice.status || 'draft').toLowerCase() as
    | 'draft'
    | 'sent'
    | 'paid'
    | 'overdue';

  const lineItems = (invoice.items || []).map((it: any) => ({
    description: it.description || invoice.description || 'Advisory Service',
    quantity: Number(it.quantity || 1),
    rate: Number(it.unitPrice ?? it.amount ?? 0),
    taxRate: Number(it.gstRate ?? 18),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{invoice.invoice_number}</h1>
            <Badge className="mt-1 bg-blue-500/20 text-blue-300 border-blue-500/30">
              {String(invoice.status).toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Download Statement
          </Button>
          {normalizedStatus !== 'paid' && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={handleSendEmail}
                className="gap-2"
              >
                <Send className="w-4 h-4" /> Send Reminder
              </Button>
              <Button
                size="sm"
                disabled={busy}
                onClick={handleMarkPaid}
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Paid
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={busy}
                onClick={handleDelete}
                className="text-rose-500 gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <InvoicePreview
        invoiceNumber={invoice.invoice_number}
        client={invoice.client_name}
        issueDate={invoice.created_at}
        dueDate={invoice.due_date || invoice.created_at}
        amount={Number(invoice.total_amount ?? invoice.amount ?? 0)}
        status={normalizedStatus === 'paid' ? 'paid' : normalizedStatus === 'overdue' ? 'overdue' : normalizedStatus === 'sent' ? 'sent' : 'draft'}
        lineItems={lineItems}
        description={invoice.description}
        notes={invoice.notes}
        companyName={invoice.firm_name || 'TaxMate CA Practice'}
        onDownload={handleDownload}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
}
