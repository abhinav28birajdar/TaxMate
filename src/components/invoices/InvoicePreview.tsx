'use client';

import React from 'react';
import { format } from 'date-fns';
import { FileText, Download, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
}

interface InvoicePreviewProps {
  invoiceNumber: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems?: LineItem[];
  description?: string;
  notes?: string;
  terms?: string;
  companyName?: string;
  companyLogo?: string;
  companyAddress?: string;
  onDownload?: () => void;
  onSendEmail?: () => void;
  onEdit?: () => void;
  className?: string;
}

function calculateLineItemTotals(items: LineItem[] = []) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const taxes = items.reduce(
    (sum, item) => sum + (item.quantity * item.rate * item.taxRate) / 100,
    0
  );
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxes: parseFloat(taxes.toFixed(2)),
    total: parseFloat((subtotal + taxes).toFixed(2)),
  };
}

export default function InvoicePreview({
  invoiceNumber,
  client,
  issueDate,
  dueDate,
  amount,
  status,
  lineItems = [],
  description,
  notes,
  terms,
  companyName = 'TaxMate',
  companyLogo,
  companyAddress,
  onDownload,
  onSendEmail,
  onEdit,
  className,
}: InvoicePreviewProps) {
  const issueDateObj = new Date(issueDate);
  const dueDateObj = new Date(dueDate);
  const totals = calculateLineItemTotals(lineItems);
  const isOverdue = new Date() > dueDateObj && status === 'sent';

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-600" />
          <div>
            <p className="font-semibold text-slate-900">{invoiceNumber}</p>
            <p className="text-xs text-slate-600">{client}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          {isOverdue && (
            <Badge className="bg-red-100 text-red-700">OVERDUE</Badge>
          )}
        </div>
        <div className="flex gap-2">
          {onDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" /> Download
            </Button>
          )}
          {onSendEmail && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendEmail}
              className="gap-2"
            >
              <Mail className="w-4 h-4" /> Send
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              className="bg-lime-600 hover:bg-lime-700 text-white gap-2"
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Content (Printable) */}
      <div className="p-8 bg-white" id="invoice-content">
        {/* Header */}
        <div className="mb-8 pb-8 border-b-2 border-slate-200">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-2xl font-bold text-slate-900">{companyName}</p>
              {companyAddress && (
                <p className="text-sm text-slate-600 mt-1">{companyAddress}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-lime-600">{invoiceNumber}</p>
              <p className="text-sm text-slate-600 mt-2">Invoice</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                Bill To
              </p>
              <p className="font-semibold text-slate-900">{client}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-slate-600">Invoice Date:</span>
                <span className="font-semibold">{format(issueDateObj, 'd MMM, yyyy')}</span>
              </div>
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-slate-600">Due Date:</span>
                <span className={cn(
                  'font-semibold',
                  isOverdue && 'text-red-600'
                )}>
                  {format(dueDateObj, 'd MMM, yyyy')}
                </span>
              </div>
              <div className="flex justify-end gap-4 text-sm">
                <span className="text-slate-600">Status:</span>
                <span className="font-semibold text-lime-600">
                  {status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mb-8 p-4 bg-slate-50 rounded">
            <p className="text-sm text-slate-700">{description}</p>
          </div>
        )}

        {/* Line Items Table */}
        {lineItems.length > 0 && (
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 text-xs font-bold text-slate-600">
                    Description
                  </th>
                  <th className="text-right py-3 text-xs font-bold text-slate-600 w-20">
                    Quantity
                  </th>
                  <th className="text-right py-3 text-xs font-bold text-slate-600 w-24">
                    Rate
                  </th>
                  <th className="text-right py-3 text-xs font-bold text-slate-600 w-20">
                    Tax
                  </th>
                  <th className="text-right py-3 text-xs font-bold text-slate-600 w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => {
                  const itemSubtotal = item.quantity * item.rate;
                  const itemTax = (itemSubtotal * item.taxRate) / 100;
                  const itemTotal = itemSubtotal + itemTax;

                  return (
                    <tr key={index} className="border-b border-slate-100">
                      <td className="py-3 text-sm text-slate-900">
                        {item.description}
                      </td>
                      <td className="text-right py-3 text-sm text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="text-right py-3 text-sm text-slate-700">
                        ₹{item.rate.toFixed(2)}
                      </td>
                      <td className="text-right py-3 text-sm text-slate-700">
                        {item.taxRate}%
                      </td>
                      <td className="text-right py-3 text-sm font-semibold text-slate-900">
                        ₹{itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold">₹{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.taxes > 0 && (
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Tax</span>
                <span className="font-semibold">₹{totals.taxes.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 bg-lime-50 px-4 rounded font-bold text-lg mt-2">
              <span className="text-slate-900">Total Amount</span>
              <span className="text-lime-600">₹{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="space-y-6 border-t-2 border-slate-200 pt-6">
          {notes && (
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-2">
                Notes
              </p>
              <p className="text-sm text-slate-700">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase mb-2">
                Payment Terms
              </p>
              <p className="text-sm text-slate-700">{terms}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>Thank you for your business!</p>
          <p className="mt-2">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
        </div>
      </div>
    </Card>
  );
}
