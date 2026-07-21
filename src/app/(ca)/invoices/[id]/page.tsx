'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, Download, Send, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { InvoicePreview } from '@/components/invoices';
import { PaymentButton } from '@/components/invoices';

const mockInvoice = {
  id: '1',
  invoiceNumber: 'INV-202607-0001',
  client: 'ABC Corporation',
  clientEmail: 'contact@abc.com',
  amount: 50000,
  status: 'sent',
  issueDate: '2026-07-04',
  dueDate: '2026-08-04',
  description: 'Professional tax audit and compliance services',
  lineItems: [
    { id: '1', description: 'Tax Audit', quantity: 1, rate: 30000, taxRate: 18 },
    { id: '2', description: 'GST Filing', quantity: 1, rate: 20000, taxRate: 18 },
  ],
  notes: 'Thank you for your business',
  terms: 'Payment due within 30 days',
};

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [invoice] = useState(mockInvoice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{invoice.invoiceNumber}</h1>
            <Badge className="mt-2 bg-blue-100 text-blue-700">{invoice.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Send className="w-4 h-4" /> Send Email
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" /> Edit
          </Button>
        </div>
      </div>

      {/* Invoice Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Invoice Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-600">Invoice Number</p>
              <p className="font-semibold">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Client</p>
              <p className="font-semibold">{invoice.client}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Issue Date</p>
              <p className="font-semibold">{invoice.issueDate}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Due Date</p>
              <p className="font-semibold">{invoice.dueDate}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Amount Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">₹{(invoice.amount * 100) / 118}</span>
            </div>
            <div className="flex justify-between pb-2 border-b">
              <span className="text-slate-600">Tax (18%)</span>
              <span className="font-semibold">₹{invoice.amount - (invoice.amount * 100) / 118}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-lime-600 text-lg">₹{invoice.amount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Line Items */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Line Items</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Tax%</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item: any) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">₹{item.rate}</td>
                <td className="text-right">{item.taxRate}%</td>
                <td className="text-right">₹{item.quantity * item.rate * (1 + item.taxRate / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Payment Section */}
      {invoice.status !== 'paid' && (
        <Card className="p-6 bg-lime-50 border-lime-200">
          <h3 className="font-semibold text-slate-900 mb-4">Payment</h3>
          <PaymentButton
            invoiceId={invoice.id}
            invoiceNumber={invoice.invoiceNumber}
            amount={invoice.amount}
            clientName={invoice.client}
            clientEmail={invoice.clientEmail}
            onPaymentSuccess={() => router.refresh()}
          />
        </Card>
      )}

      {/* Description and Notes */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Description</h3>
        <p className="text-slate-700">{invoice.description}</p>
        {invoice.notes && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-slate-900 mb-2">Notes</h4>
            <p className="text-slate-700">{invoice.notes}</p>
          </div>
        )}
        {invoice.terms && (
          <div className="mt-4">
            <h4 className="font-semibold text-slate-900 mb-2">Terms</h4>
            <p className="text-slate-700">{invoice.terms}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
