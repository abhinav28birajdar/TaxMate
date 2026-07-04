'use client';

import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Calendar, FileCheck, Download, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type ComplianceType =
  | 'gst_r1'
  | 'gst_r3b'
  | 'gst_r2'
  | 'itr'
  | 'tds_24q'
  | 'tds_26q'
  | 'annual_return'
  | 'audit_report'
  | 'board_meeting'
  | 'proxy_filing'
  | 'llp_filing'
  | 'fema_compliance'
  | 'other';

type ComplianceStatus = 'pending' | 'in_progress' | 'filed' | 'rejected' | 'overdue';

interface ComplianceTrackerProps {
  id: string;
  complianceType: ComplianceType;
  client: string;
  status: ComplianceStatus;
  filingDate?: string;
  dueDate: string;
  acknowledgementNumber?: string;
  notes?: string;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onDownload?: () => void;
  className?: string;
}

const complianceTypeConfig: Record<
  ComplianceType,
  { label: string; description: string; color: string }
> = {
  gst_r1: { label: 'GST R-1', description: 'Monthly GST Return', color: 'bg-blue-100 text-blue-700' },
  gst_r3b: { label: 'GST R-3B', description: 'Monthly GST Return (Simplified)', color: 'bg-blue-100 text-blue-700' },
  gst_r2: { label: 'GST R-2', description: 'Inward Supply Return', color: 'bg-blue-100 text-blue-700' },
  itr: { label: 'ITR', description: 'Income Tax Return', color: 'bg-indigo-100 text-indigo-700' },
  tds_24q: { label: 'TDS 24Q', description: 'Quarterly TDS Return', color: 'bg-purple-100 text-purple-700' },
  tds_26q: { label: 'TDS 26Q', description: 'Quarterly TDS Return FDI', color: 'bg-purple-100 text-purple-700' },
  annual_return: { label: 'Annual Return', description: 'Company Annual Return', color: 'bg-green-100 text-green-700' },
  audit_report: { label: 'Audit Report', description: 'Statutory Audit Report', color: 'bg-amber-100 text-amber-700' },
  board_meeting: { label: 'Board Meeting', description: 'Board Meeting Minutes', color: 'bg-cyan-100 text-cyan-700' },
  proxy_filing: { label: 'Proxy Filing', description: 'GST Proxy Filing', color: 'bg-rose-100 text-rose-700' },
  llp_filing: { label: 'LLP Filing', description: 'LLP Compliance Filing', color: 'bg-orange-100 text-orange-700' },
  fema_compliance: { label: 'FEMA Compliance', description: 'FEMA Filing', color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Other', description: 'Other Compliance', color: 'bg-slate-100 text-slate-700' },
};

export default function ComplianceTracker({
  id,
  complianceType,
  client,
  status,
  filingDate,
  dueDate,
  acknowledgementNumber,
  notes,
  compact = false,
  onEdit,
  onDelete,
  onViewDetails,
  onDownload,
  className,
}: ComplianceTrackerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const config = complianceTypeConfig[complianceType];

  const dueDate_obj = new Date(dueDate);
  const isOverdue = new Date() > dueDate_obj;
  const daysUntilDue = Math.ceil((dueDate_obj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDue <= 7 && daysUntilDue > 0;

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      setDeleteDialogOpen(false);
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:shadow-sm',
          isOverdue && 'border-red-300 bg-red-50',
          className
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-slate-900 truncate">{config.label}</p>
            <Badge className={config.color}>{client}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} size="sm" />
            <span className="text-xs text-slate-500">
              {isOverdue ? '🔴 OVERDUE' : `Due ${format(dueDate_obj, 'd MMM')}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {onViewDetails && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onViewDetails}
              className="hover:bg-lime-50 hover:text-lime-600"
            >
              View
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
              {onDownload && <DropdownMenuItem onClick={onDownload}>Download</DropdownMenuItem>}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Compliance Item?"
          description={`This will permanently delete the ${config.label} entry for ${client}.`}
          onConfirm={handleDelete}
          isDangerous
        />
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        isOverdue && 'border-red-300 bg-red-50',
        isUrgent && !isOverdue && 'border-amber-300 bg-amber-50',
        className
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn('p-2 rounded', config.color)}>
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{config.label}</p>
                <p className="text-sm text-slate-600">{config.description}</p>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="hover:bg-slate-100">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
              {onDownload && (
                <DropdownMenuItem onClick={onDownload} className="flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status and Client */}
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={status} />
          <Badge variant="outline">{client}</Badge>
          {isOverdue && (
            <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> OVERDUE
            </div>
          )}
          {isUrgent && !isOverdue && (
            <div className="flex items-center gap-1 text-amber-600 text-sm font-medium">
              <AlertCircle className="w-4 h-4" /> URGENT
            </div>
          )}
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-slate-50 rounded">
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1">Due Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-900">{format(dueDate_obj, 'd MMM, yyyy')}</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days remaining`}
            </p>
          </div>
          {filingDate && (
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1">Filed Date</p>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-lime-600" />
                <p className="text-sm font-semibold text-slate-900">{format(new Date(filingDate), 'd MMM, yyyy')}</p>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formatDistanceToNow(new Date(filingDate), { addSuffix: true })}
              </p>
            </div>
          )}
        </div>

        {/* Acknowledgement Number */}
        {acknowledgementNumber && (
          <div className="mb-4 p-3 bg-lime-50 rounded border border-lime-200">
            <p className="text-xs font-medium text-slate-600 mb-1">Acknowledgement Number</p>
            <p className="text-sm font-mono text-lime-700">{acknowledgementNumber}</p>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
            <p className="text-xs font-medium text-slate-600 mb-1">Notes</p>
            <p className="text-sm text-slate-700 line-clamp-2">{notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onViewDetails && (
            <Button
              variant="outline"
              className="flex-1 hover:bg-slate-100"
              onClick={onViewDetails}
            >
              View Details
            </Button>
          )}
          {onDownload && (
            <Button
              variant="outline"
              className="flex-1 hover:bg-slate-100"
              onClick={onDownload}
            >
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          )}
          {onEdit && (
            <Button
              className="flex-1 bg-lime-600 hover:bg-lime-700 text-white"
              onClick={onEdit}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Compliance Item?"
        description={`This will permanently delete the ${config.label} entry for ${client}. This action cannot be undone.`}
        onConfirm={handleDelete}
        isDangerous
      />
    </Card>
  );
}
