'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Receipt, 
  ArrowLeft, 
  Download, 
  Send, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Building, 
  Mail, 
  Phone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CAInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params?.id as string || 'INV-2026-0042';

  const [status, setStatus] = useState<'sent' | 'paid' | 'overdue'>('sent');

  const invoice = {
    id: invoiceId,
    invoiceNumber: 'TM-INV-2026-0842',
    date: '01 Aug 2026',
    dueDate: '15 Aug 2026',
    status: status,
    currency: 'INR',
    caFirm: {
      name: 'Sharma & Associates Chartered Accountants',
      address: 'Suite 402, Statesman House, Barakhamba Road, Connaught Place, New Delhi 110001',
      gstin: '07AAACS1234F1Z2',
      pan: 'AAACS1234F',
      email: 'billing@sharmatax.in',
      phone: '+91 11 4321 9870'
    },
    client: {
      name: 'Acme Technologies Pvt Ltd',
      contactPerson: 'Rohan Deshmukh (Director)',
      address: 'Plot 42, Electronic City Phase 1, Bengaluru, Karnataka 560100',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      email: 'accounts@acmetech.in'
    },
    items: [
      { id: 1, description: 'Statutory Audit & Tax Audit (Form 3CA/3CD) for FY 2025-26 - Phase 1', sac: '998222', qty: 1, rate: 45000, amount: 45000, taxRate: 18 },
      { id: 2, description: 'Annual GST Return Filing (GSTR-9) & Reconciliation (GSTR-9C)', sac: '998231', qty: 1, rate: 25000, amount: 25000, taxRate: 18 },
      { id: 3, description: 'Quarterly TDS Return Filing (Form 24Q & 26Q - Q1)', sac: '998232', qty: 1, rate: 10000, amount: 10000, taxRate: 18 },
    ],
    subtotal: 80000,
    cgst: 7200,
    sgst: 7200,
    igst: 0,
    totalTax: 14400,
    grandTotal: 94400,
    paidAmount: status === 'paid' ? 94400 : 0,
    balanceDue: status === 'paid' ? 0 : 94400,
    notes: 'Please quote invoice number TM-INV-2026-0842 in bank wire transfer details or scan UPI QR code on the payment gateway.',
    bankDetails: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50200049281742',
      ifscCode: 'HDFC0000128',
      branch: 'Connaught Place, New Delhi',
      upiId: 'sharmaassociates@hdfcbank'
    }
  };

  const handleMarkAsPaid = () => {
    setStatus('paid');
    toast.success('Invoice marked as fully paid! Payment receipt generated.');
  };

  const handleSendReminder = () => {
    toast.success(`Payment reminder dispatched to ${invoice.client.email} via Email and WhatsApp!`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/ca/invoices" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Invoices
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Invoice {invoice.invoiceNumber}
            </h1>
            <Badge className={`text-xs font-bold ${
              status === 'paid' 
                ? 'bg-lime-600 text-white' 
                : status === 'overdue' 
                ? 'bg-red-500 text-white' 
                : 'bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/30'
            }`}>
              {status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Downloading Invoice PDF...')} className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
          </Button>
          {status !== 'paid' && (
            <>
              <Button variant="outline" size="sm" onClick={handleSendReminder} className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
                <Send className="w-3.5 h-3.5 mr-1.5 text-lime-600" /> Send Reminder
              </Button>
              <Button size="sm" onClick={handleMarkAsPaid} className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Mark as Paid
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Invoice Document Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
        
        {/* Top Section: Firm & Client Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg bg-lime-600 flex items-center justify-center text-white text-sm font-extrabold">T</span>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">Tax<span className="text-lime-600">Mate</span></span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{invoice.caFirm.name}</h2>
            <p className="text-xs text-slate-500 max-w-xs mt-1">{invoice.caFirm.address}</p>
            <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
              <div><strong>GSTIN:</strong> {invoice.caFirm.gstin} | <strong>PAN:</strong> {invoice.caFirm.pan}</div>
              <div><strong>Email:</strong> {invoice.caFirm.email} | <strong>Phone:</strong> {invoice.caFirm.phone}</div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white">TAX INVOICE</h2>
            <div className="text-xs text-slate-500">Invoice No: <strong className="text-slate-800 dark:text-slate-200">{invoice.invoiceNumber}</strong></div>
            <div className="text-xs text-slate-500">Invoice Date: <strong className="text-slate-800 dark:text-slate-200">{invoice.date}</strong></div>
            <div className="text-xs text-slate-500">Due Date: <strong className="text-slate-800 dark:text-slate-200">{invoice.dueDate}</strong></div>
          </div>
        </div>

        {/* Billed To Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To (Client):</span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">{invoice.client.name}</div>
            <div className="text-xs text-slate-500">{invoice.client.contactPerson}</div>
            <div className="text-xs text-slate-500 max-w-sm">{invoice.client.address}</div>
          </div>
          <div className="text-left sm:text-right text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div><strong>Client GSTIN:</strong> <span className="font-mono">{invoice.client.gstin}</span></div>
            <div><strong>Client PAN:</strong> <span className="font-mono">{invoice.client.pan}</span></div>
            <div><strong>Email:</strong> {invoice.client.email}</div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2 font-bold">#</th>
                <th className="py-3 px-2 font-bold">Service Description</th>
                <th className="py-3 px-2 font-bold">SAC Code</th>
                <th className="py-3 px-2 font-bold text-right">Rate (₹)</th>
                <th className="py-3 px-2 font-bold text-right">Taxable Amt (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-3.5 px-2 text-slate-400">{idx + 1}</td>
                  <td className="py-3.5 px-2 font-medium text-slate-800 dark:text-slate-200">{item.description}</td>
                  <td className="py-3.5 px-2 font-mono text-slate-500">{item.sac}</td>
                  <td className="py-3.5 px-2 text-right text-slate-800 dark:text-slate-200">₹{item.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-2 text-right font-bold text-slate-900 dark:text-white">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary & Bank Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Bank & Settlement Details:</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
              <div><strong>Bank:</strong> {invoice.bankDetails.bankName}</div>
              <div><strong>Account No:</strong> <span className="font-mono">{invoice.bankDetails.accountNumber}</span></div>
              <div><strong>IFSC Code:</strong> <span className="font-mono">{invoice.bankDetails.ifscCode}</span></div>
              <div><strong>UPI VPA:</strong> <span className="font-mono text-lime-600">{invoice.bankDetails.upiId}</span></div>
            </div>
            <p className="text-[11px] text-slate-400">{invoice.notes}</p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Taxable Subtotal:</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{invoice.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">CGST (9%):</span>
              <span className="text-slate-800 dark:text-slate-200">₹{invoice.cgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">SGST (9%):</span>
              <span className="text-slate-800 dark:text-slate-200">₹{invoice.sgst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 text-base font-extrabold border-b-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <span>Grand Total (INR):</span>
              <span className="text-lime-600 dark:text-lime-400">₹{invoice.grandTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-semibold text-lime-600">₹{invoice.paidAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">Balance Due:</span>
              <span className="text-slate-900 dark:text-white">₹{invoice.balanceDue.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
