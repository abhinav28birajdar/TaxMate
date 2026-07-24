"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, Download, CreditCard, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ClientInvoiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const invoice = {
    id: params.id,
    number: 'INV-2026-0928',
    caName: 'Sharma & Associates Chartered Accountants',
    date: '2026-07-20',
    dueDate: '2026-07-30',
    items: [
      { desc: 'Professional Consultation & GST Audit Service', qty: 1, rate: '₹15,000', amount: '₹15,000' },
      { desc: 'GSTR-3B Portal Filing Fee', qty: 1, rate: '₹2,500', amount: '₹2,500' }
    ],
    subtotal: '₹17,500',
    cgst: '₹1,575',
    sgst: '₹1,575',
    total: '₹20,650',
    status: 'unpaid'
  };

  const handlePay = () => {
    toast.success('Razorpay Checkout launched. Payment processing...');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{invoice.number}</h1>
            <p className="text-sm text-slate-400">Issued by: {invoice.caName}</p>
          </div>
        </div>
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 uppercase px-3 py-1">
          {invoice.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-8 space-y-6">
        <div className="flex justify-between text-sm border-b border-slate-800 pb-6">
          <div>
            <span className="text-slate-400 block text-xs">Invoice Date</span>
            <span className="font-medium text-slate-100">{invoice.date}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-xs">Due Date</span>
            <span className="font-semibold text-lime-400">{invoice.dueDate}</span>
          </div>
        </div>

        <div className="space-y-3">
          {invoice.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-800/60 pb-3">
              <div>
                <span className="font-semibold text-slate-100 block">{item.desc}</span>
                <span className="text-xs text-slate-400">Qty: {item.qty} x {item.rate}</span>
              </div>
              <span className="font-mono text-slate-200">{item.amount}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-4 text-sm text-right">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono">{invoice.subtotal}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>CGST (9%)</span>
            <span className="font-mono">{invoice.cgst}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>SGST (9%)</span>
            <span className="font-mono">{invoice.sgst}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-slate-100 pt-2 border-t border-slate-800">
            <span>Grand Total Due</span>
            <span className="text-lime-400 font-mono">{invoice.total}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button variant="outline" className="border-slate-800 text-slate-300 gap-2">
            <Download className="w-4 h-4 text-lime-500" /> Download PDF
          </Button>
          <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2 py-5 px-6" onClick={handlePay}>
            <CreditCard className="w-4 h-4" /> Pay Now via Razorpay / UPI
          </Button>
        </div>
      </Card>
    </div>
  );
}
