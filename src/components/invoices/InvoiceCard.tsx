'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, FileText, Mail, Download } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface InvoiceCardProps {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date | string;
  dueDate?: Date | string;
  currency?: string;
  onView?: () => void;
  onEdit?: () => void;
  onSend?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
  compact?: boolean;
}

export default function InvoiceCard({
  id,
  invoiceNumber,
  client,
  amount,
  status,
  issueDate,
  dueDate,
  currency = 'INR',
  onView,
  onEdit,
  onSend,
  onDownload,
  onDelete,
  className,
  compact = false,
}: InvoiceCardProps) {
  const issueDateObj = typeof issueDate === 'string' ? new Date(issueDate) : issueDate;
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const isOverdue = dueDateObj && new Date() > dueDateObj && status !== 'paid';

  if (compact) {
    return (
      <div
        className={cn(
          'rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md transition-shadow',
          isOverdue && 'border-red-200 bg-red-50',
          className
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-900 text-sm truncate">
                {invoiceNumber}
              </span>
            </div>
            <p className="text-xs text-slate-600 truncate mt-1">{client}</p>
            <div className="flex items-center justify-between mt-2">
              <p className="font-semibold text-lime-600">
                {currency === 'INR' ? '₹' : currency}
                {amount.toLocaleString('en-IN')}
              </p>
              <StatusBadge status={status} size="sm" />
            </div>
          </div>
          {onView && (
            <Button variant="ghost" size="sm" onClick={onView} className="flex-shrink-0">
              →
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow',
        isOverdue && 'border-red-200 bg-red-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">{invoiceNumber}</h3>
          </div>
          <p className="text-sm text-slate-600">{client}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onView && (
              <DropdownMenuItem onClick={onView}>
                View Details
              </DropdownMenuItem>
            )}
            {onEdit && status === 'draft' && (
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
            )}
            {onDownload && (
              <DropdownMenuItem onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
            )}
            {onSend && (status === 'draft' || status === 'sent') && (
              <DropdownMenuItem onClick={onSend}>
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status & Dates */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
        <div className="flex gap-2">
          <StatusBadge status={status} size="md" />
          {isOverdue && (
            <Badge className="bg-red-600 text-white">Overdue</Badge>
          )}
        </div>
        <div className="text-xs text-slate-500">
          {dueDateObj && (
            <>
              Due {formatDistanceToNow(dueDateObj, { addSuffix: true })}
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-xs text-slate-600 mb-1">Total Amount</p>
        <p className="text-3xl font-bold text-lime-600">
          {currency === 'INR' ? '₹' : currency}
          {amount.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Issue & Due Dates */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded-lg text-sm">
        <div>
          <p className="text-xs text-slate-600">Issue Date</p>
          <p className="font-medium text-slate-900">{format(issueDateObj, 'dd MMM, yyyy')}</p>
        </div>
        {dueDateObj && (
          <div>
            <p className="text-xs text-slate-600">Due Date</p>
            <p className={cn('font-medium', isOverdue ? 'text-red-600' : 'text-slate-900')}>
              {format(dueDateObj, 'dd MMM, yyyy')}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-slate-200">
        {onView && (
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            onClick={onView}
          >
            View Invoice
          </Button>
        )}
        {onDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        )}
        {onSend && (status === 'draft' || status === 'sent') && (
          <Button
            className="flex-1 bg-lime-600 hover:bg-lime-700 text-white"
            size="sm"
            onClick={onSend}
          >
            <Mail className="w-4 h-4 mr-2" />
            Send
          </Button>
        )}
      </div>
    </div>
  );
}
