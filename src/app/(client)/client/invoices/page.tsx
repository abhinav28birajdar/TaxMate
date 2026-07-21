'use client';

import React, { useState } from 'react';
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Download, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_INVOICES = [
  {
    id: 'inv-101',
    number: 'INV-2026-001',
    caName: 'CA Rajesh Sharma',
    service: 'GSTR-3B Monthly Filing (Sept 2026)',
    amount: '₹3,500',
    date: '01 Oct 2026',
    dueDate: '15 Oct 2026',
    status: 'paid',
  },
  {
    id: 'inv-102',
    number: 'INV-2026-042',
    caName: 'CA Rajesh Sharma',
    service: 'Income Tax Return (ITR-3) Filing',
    amount: '₹14,500',
    date: '10 Oct 2026',
    dueDate: '25 Oct 2026',
    status: 'unpaid',
  },
];

export default function ClientInvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<typeof MOCK_INVOICES[0] | null>(MOCK_INVOICES[1]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
          Invoices & Payments
        </h1>
        <p className="text-slate-400 text-sm mt-1">Review billings from your CA firm and make secure online payments via Razorpay / UPI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice List */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Billing History</CardTitle>
            <CardDescription className="text-slate-400">All issued tax service invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_INVOICES.map((inv) => (
              <div
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedInvoice?.id === inv.id
                    ? 'border-lime-500 bg-lime-500/5'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${inv.status === 'paid' ? 'bg-lime-500/10 text-lime-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100">{inv.number}</h4>
                    <p className="text-xs text-slate-400">{inv.service} • {inv.caName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Due: {inv.dueDate}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-slate-100 block">{inv.amount}</span>
                  {inv.status === 'paid' ? (
                    <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30 text-[10px]">Paid</Badge>
                  ) : (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Pending</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invoice Detail / Payment Panel */}
        {selectedInvoice && (
          <Card className="bg-slate-900/50 border-slate-800 flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-100">{selectedInvoice.number}</CardTitle>
                {selectedInvoice.status === 'paid' ? (
                  <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Paid</Badge>
                ) : (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Payment Due</Badge>
                )}
              </div>
              <CardDescription className="text-slate-400">Issued on {selectedInvoice.date}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Issued By:</span>
                  <span className="text-slate-200 font-medium">{selectedInvoice.caName}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Service:</span>
                  <span className="text-slate-200 font-medium">{selectedInvoice.service}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>GSTIN:</span>
                  <span className="text-slate-200 font-mono">27AAAAA0000A1Z5</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-slate-200">Total Payable:</span>
                  <span className="text-lime-400">{selectedInvoice.amount}</span>
                </div>
              </div>

              {selectedInvoice.status !== 'paid' ? (
                <Button className="w-full bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold py-6 shadow-lg shadow-lime-600/20">
                  <CreditCard className="w-5 h-5 mr-2" /> Pay via Razorpay / UPI
                </Button>
              ) : (
                <Button variant="outline" className="w-full border-slate-700 text-slate-200">
                  <Download className="w-4 h-4 mr-2 text-lime-400" /> Download PDF Receipt
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
