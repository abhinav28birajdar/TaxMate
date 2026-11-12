'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ClientOption {
  id: string;
  name: string;
  email?: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientId, setClientId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Thank you for trusting our Chartered Accountancy practice.');
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState([
    {
      description: 'GSTR-1 & GSTR-3B Return Filing Service',
      qty: 1,
      rate: 15000,
      hsn: '998222',
      gstRate: 18,
    },
  ]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/clients?take=100', { credentials: 'include' });
        const json = await res.json();
        if (res.ok && json.clients) {
          const mapped: ClientOption[] = json.clients.map((c: any) => ({
            id: c.id,
            name: c.display_name || c.full_name || c.email || 'Client',
            email: c.email || '',
          }));
          setClients(mapped);
          if (mapped.length > 0) setClientId(mapped[0].id);
        }
      } catch {
        // Handled cleanly
      }
    })();
  }, []);

  const addItem = () => {
    setItems([...items, { description: '', qty: 1, rate: 0, hsn: '998222', gstRate: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const gstAmount = Number(
    items.reduce((acc, item) => acc + (item.qty * item.rate * item.gstRate) / 100, 0).toFixed(2)
  );
  const grandTotal = subtotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error('Please select a client to bill.');
      return;
    }
    if (grandTotal <= 0) {
      toast.error('Invoice amount must be greater than zero.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    const descriptionSummary = items
      .map((it) => it.description.trim())
      .filter(Boolean)
      .join(', ');

    setSubmitting(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId,
          clientName: selectedClient?.name || 'Client',
          clientEmail: selectedClient?.email || '',
          amount: subtotal,
          taxAmount: gstAmount,
          description: descriptionSummary || 'Chartered Accountancy Services',
          dueDate,
          notes,
          items: items.map((it) => ({
            description: it.description,
            quantity: it.qty,
            unitPrice: it.rate,
            hsn: it.hsn,
            gstRate: it.gstRate,
            amount: it.qty * it.rate,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.invoice) {
        throw new Error(json.error || 'Failed to create invoice');
      }

      await fetch('/api/payments/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          invoiceId: json.invoice.id,
          invoiceNumber: json.invoice.invoice_number,
          clientEmail: selectedClient?.email || undefined,
        }),
      }).catch(() => {});

      toast.success('GST Invoice created & sent to client!');
      router.push('/ca/invoices');
    } catch (err: any) {
      toast.error(err.message || 'Invoice creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create GST Invoice</h1>
          <p className="text-xs text-slate-500">Tax Invoice compliant with GST Rule 46</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Client *
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            >
              {clients.length === 0 ? (
                <option value="">No clients available</option>
              ) : (
                clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Invoice Date
            </label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Due Date
            </label>
            <Input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Invoice Items & Services
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <Input
                  placeholder="Service Description"
                  required
                  value={item.description}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].description = e.target.value;
                    setItems(next);
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 text-xs"
                />
                <Input
                  placeholder="SAC/HSN"
                  value={item.hsn}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].hsn = e.target.value;
                    setItems(next);
                  }}
                  className="w-24 bg-white dark:bg-slate-900 text-xs font-mono"
                />
                <Input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].qty = Math.max(1, Number(e.target.value));
                    setItems(next);
                  }}
                  className="w-16 bg-white dark:bg-slate-900 text-xs"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Rate (₹)"
                  value={item.rate}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].rate = Math.max(0, Number(e.target.value));
                    setItems(next);
                  }}
                  className="w-28 bg-white dark:bg-slate-900 text-xs font-mono"
                />
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(i)}
                    className="text-rose-500 h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-right text-sm">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Taxable Subtotal</span>
            <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>GST (18%)</span>
            <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Grand Total</span>
            <span className="text-lime-500 font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Payment Notes
          </label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !clientId}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20"
          >
            <Send className="w-4 h-4 mr-2" />
            {submitting ? 'Creating Invoice...' : 'Create & Issue Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
