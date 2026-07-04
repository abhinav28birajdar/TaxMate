import React from 'react';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'not_started' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  | 'draft' | 'sent' | 'paid' | 'overdue'
  | 'pending' | 'filed'
  | 'active' | 'inactive' | 'prospect'
  | 'scheduled' | 'confirmed' | 'no_show';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<StatusType, { label: string; bg: string; text: string }> = {
  // Task statuses
  not_started: { label: 'Not Started', bg: 'bg-slate-100', text: 'text-slate-700' },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100', text: 'text-blue-700' },
  review: { label: 'Review', bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { label: 'Completed', bg: 'bg-lime-100', text: 'text-lime-700' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },

  // Invoice statuses
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700' },
  sent: { label: 'Sent', bg: 'bg-blue-100', text: 'text-blue-700' },
  paid: { label: 'Paid', bg: 'bg-lime-100', text: 'text-lime-700' },
  overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-700' },

  // Compliance statuses
  pending: { label: 'Pending', bg: 'bg-slate-100', text: 'text-slate-700' },
  filed: { label: 'Filed', bg: 'bg-lime-100', text: 'text-lime-700' },

  // Client statuses
  active: { label: 'Active', bg: 'bg-lime-100', text: 'text-lime-700' },
  inactive: { label: 'Inactive', bg: 'bg-slate-100', text: 'text-slate-700' },
  prospect: { label: 'Prospect', bg: 'bg-blue-100', text: 'text-blue-700' },

  // Appointment statuses
  scheduled: { label: 'Scheduled', bg: 'bg-blue-100', text: 'text-blue-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-lime-100', text: 'text-lime-700' },
  no_show: { label: 'No Show', bg: 'bg-red-100', text: 'text-red-700' },
};

export default function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bg,
        config.text,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
}
