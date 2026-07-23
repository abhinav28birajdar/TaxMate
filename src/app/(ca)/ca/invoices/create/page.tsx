'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [client, setClient] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2026-10-22');
  const [dueDate, setDueDate] = useState('2026-11-05');
  const [items, setItems] = useState([
    { description: 'GSTR-1 & GSTR-3B Return Filing Service', qty: 1, rate: 15000, hsn: '998222', gstRate: 18 },
    { description: 'Tax Audit & Financial Verification', qty: 1, rate: 15000, hsn: '998231', gstRate: 18 },
  ]);

  const addItem = () => {
    setItems([...items, { description: '', qty: 1, rate: 0, hsn: '998222', gstRate: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((acc, item) => acc + item.qty * item.rate, 0);
  const gstAmount = subtotal * 0.18;
  const grandTotal = subtotal + gstAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Invoice created & sent to client!');
    router.push('/ca/invoices');
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

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Client *</label>
            <Input
              type="text"
              placeholder="TechNova Solutions Pvt Ltd"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Date</label>
            <Input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invoice Items & Services</h3>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 items-center bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <Input
                  placeholder="Service Description"
                  value={item.description}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].description = e.target.value;
                    setItems(next);
                  }}
                  className="flex-1 bg-white dark:bg-slate-900 text-xs"
                />
                <Input
                  placeholder="HSN/SAC"
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
                  placeholder="Qty"
                  value={item.qty}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].qty = Number(e.target.value);
                    setItems(next);
                  }}
                  className="w-16 bg-white dark:bg-slate-900 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Rate (₹)"
                  value={item.rate}
                  onChange={(e) => {
                    const next = [...items];
                    next[i].rate = Number(e.target.value);
                    setItems(next);
                  }}
                  className="w-28 bg-white dark:bg-slate-900 text-xs"
                />
                <div className="w-24 text-right font-mono font-bold text-xs">
                  ₹{(item.qty * item.rate).toLocaleString('en-IN')}
                </div>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addItem} className="text-xs">
            <Plus className="w-4 h-4 mr-1" /> Add Line Item
          </Button>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col items-end space-y-2 text-xs">
          <div className="flex justify-between w-64 text-slate-600 dark:text-slate-400">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-slate-600 dark:text-slate-400">
            <span>GST (18% IGST/CGST+SGST):</span>
            <span className="font-mono font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between w-64 text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Grand Total:</span>
            <span className="font-mono text-lime-600 dark:text-lime-400">₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Send className="w-4 h-4 mr-2" /> Save & Dispatch Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
