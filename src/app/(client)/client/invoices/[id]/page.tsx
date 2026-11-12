'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentButton } from '@/components/invoices/PaymentButton';
import { toast } from 'sonner';

interface LineItem {
  description: string;
  quantity?: number;
  unitPrice?: number;
  amount: number;
}

interface DetailedInvoice {
  id: string;
  invoice_number: string;
  ca_name: string;
  firm_name: string;
  client_name: string;
  client_email: string;
  description?: string;
  subtotal?: number;
  tax_amount?: number;
  amount: number;
  total_amount?: number;
  status: string;
  due_date?: string;
  created_at: string;
  notes?: string;
  items: LineItem[];
}

export default function ClientInvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const router = useRouter();
  const [invoice, setInvoice] = useState<DetailedInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.invoice) {
        throw new Error(json.error || 'Invoice not found');
      }
      setInvoice(json.invoice);
    } catch (err: any) {
      setError(err.message || 'Unable to load invoice details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleDownloadStatement = () => {
    if (!invoice) return;
    const total = Number(invoice.total_amount ?? invoice.amount ?? 0);
    const tax = Number(invoice.tax_amount ?? invoice.subtotal ? total - Number(invoice.subtotal || 0) : total - total / 1.18);
    const subtotal = Number(invoice.subtotal ?? total - tax);
    const rowsHtml = invoice.items
      .map(
        (it) =>
          `<tr><td>${it.description}</td><td>${it.quantity || 1}</td><td style="text-align:right">Rs. ${Number(
            it.amount ?? it.unitPrice ?? 0
          ).toLocaleString('en-IN')}</td></tr>`
      )
      .join('');

    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${invoice.invoice_number}</title>
<style>body{font-family:system-ui,sans-serif;max-width:740px;margin:40px auto;padding:24px;color:#111}
.top{display:flex;justify-content:space-between;border-bottom:2px solid #65a30d;padding-bottom:14px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border-bottom:1px solid #ddd;padding:10px 8px;text-align:left}
.right{text-align:right}.total{font-weight:700;font-size:16px}</style></head>
<body>
<div class="top"><div><strong>${invoice.firm_name}</strong><h1>Tax Invoice ${invoice.invoice_number}</h1><p>Issued by: ${invoice.ca_name}</p></div>
<div class="right"><div>Status: ${String(invoice.status).toUpperCase()}</div><div>Date: ${new Date(invoice.created_at).toLocaleDateString('en-IN')}</div><div>Due: ${invoice.due_date || 'Upon receipt'}</div></div></div>
<p><strong>Billed To:</strong> ${invoice.client_name} (${invoice.client_email})</p>
<table><thead><tr><th>Description</th><th>Qty</th><th class="right">Amount (INR)</th></tr></thead>
<tbody>${rowsHtml}
<tr><td colspan="2">Subtotal</td><td class="right">Rs. ${subtotal.toFixed(2)}</td></tr>
<tr><td colspan="2">CGST + SGST / IGST</td><td class="right">Rs. ${tax.toFixed(2)}</td></tr>
<tr class="total"><td colspan="2">Grand Total</td><td class="right">Rs. ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
</tbody></table></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoice_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${invoice.invoice_number}`);
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-slate-800 text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card className="bg-slate-900 border-rose-500/30 p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-lg font-semibold text-white">{error || 'Invoice not found'}</h2>
        </Card>
      </div>
    );
  }

  const total = Number(invoice.total_amount ?? invoice.amount ?? 0);
  const tax = Number(
    invoice.tax_amount !== undefined && invoice.tax_amount !== null
      ? invoice.tax_amount
      : invoice.subtotal
        ? total - Number(invoice.subtotal)
        : 0
  );
  const subtotal = Number(invoice.subtotal ?? total - tax);
  const isPaid = String(invoice.status).toUpperCase() === 'PAID';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-800 bg-slate-900 text-slate-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{invoice.invoice_number}</h1>
            <p className="text-sm text-slate-400">
              Issued by: {invoice.firm_name} ({invoice.ca_name})
            </p>
          </div>
        </div>
        <Badge
          className={
            isPaid
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase px-3 py-1'
              : 'bg-orange-500/20 text-orange-400 border-orange-500/30 uppercase px-3 py-1'
          }
        >
          {invoice.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-8 space-y-6">
        <div className="flex justify-between text-sm border-b border-slate-800 pb-6">
          <div>
            <span className="text-slate-400 block text-xs">Invoice Date</span>
            <span className="font-medium text-slate-100">
              {new Date(invoice.created_at).toLocaleDateString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-xs">Due Date</span>
            <span className="font-semibold text-lime-400">
              {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'Upon receipt'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {invoice.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-sm border-b border-slate-800/60 pb-3"
            >
              <div>
                <span className="font-semibold text-slate-100 block">{item.description}</span>
                <span className="text-xs text-slate-400">
                  Qty: {item.quantity || 1} x ₹{Number(item.unitPrice ?? item.amount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="font-mono text-slate-200">
                ₹{Number(item.amount ?? item.unitPrice ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-right">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>GST</span>
            <span className="font-mono">₹{tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-100 pt-2 border-t border-slate-800">
            <span>{isPaid ? 'Total Paid' : 'Grand Total Due'}</span>
            <span className="text-lime-400 font-mono">₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={handleDownloadStatement}
            className="border-slate-800 text-slate-300 gap-2"
          >
            <Download className="w-4 h-4 text-lime-500" /> Download Invoice
          </Button>
          {!isPaid && (
            <PaymentButton
              invoiceId={invoice.id}
              invoiceNumber={invoice.invoice_number}
              amount={total}
              clientName={invoice.client_name}
              clientEmail={invoice.client_email}
              onPaymentSuccess={() => {
                toast.success('Payment verified! Invoice marked as paid.');
                loadInvoice();
              }}
              onPaymentError={(msg) => toast.error(msg)}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
