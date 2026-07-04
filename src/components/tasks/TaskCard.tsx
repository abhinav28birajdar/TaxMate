'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, CheckCircle2, User, Briefcase, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date | string;
  assignedTo?: string;
  client?: string;
  taskType?: string;
  estimatedHours?: number;
  actualHours?: number;
  isOverdue?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: TaskCardProps['status']) => void;
  className?: string;
  compact?: boolean;
}

const priorityConfig = {
  low: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Low' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
  high: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'High' },
  urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
};

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  dueDate,
  assignedTo,
  client,
  taskType,
  estimatedHours,
  actualHours,
  isOverdue = false,
  onEdit,
  onDelete,
  onStatusChange,
  className,
  compact = false,
}: TaskCardProps) {
  const config = priorityConfig[priority];
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const isPastDue = dueDateObj && new Date() > dueDateObj && status !== 'completed';

  if (compact) {
    return (
      <div
        className={cn(
          'rounded-lg border border-slate-200 bg-white p-3 hover:shadow-md transition-shadow',
          isPastDue && 'border-red-200 bg-red-50',
          className
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 text-sm truncate">{title}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={status} size="sm" />
              <span className={cn('text-xs font-medium px-2 py-1 rounded', config.bg, config.text)}>
                {config.label}
              </span>
              {isPastDue && (
                <Badge className="bg-red-600 text-white">Overdue</Badge>
              )}
            </div>
          </div>
          {onEdit && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onEdit}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow',
        isPastDue && 'border-red-200 bg-red-50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 truncate">{title}</h3>
          {description && (
            <p className="text-xs text-slate-600 truncate mt-1">{description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                Edit Task
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

      {/* Status & Priority */}
      <div className="flex flex-wrap gap-2 mb-3">
        <StatusBadge status={status} size="sm" />
        <span className={cn('text-xs font-medium px-2 py-1 rounded', config.bg, config.text)}>
          {config.label}
        </span>
        {isPastDue && (
          <Badge className="bg-red-600 text-white flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </Badge>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t border-slate-200 text-xs">
        {client && (
          <div className="flex items-center gap-2 text-slate-600">
            <Briefcase className="w-4 h-4" />
            <span className="truncate">{client}</span>
          </div>
        )}
        {assignedTo && (
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4" />
            <span className="truncate">{assignedTo}</span>
          </div>
        )}
        {dueDateObj && (
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{formatDistanceToNow(dueDateObj, { addSuffix: true })}</span>
          </div>
        )}
        {estimatedHours && (
          <div className="text-slate-600">
            Est: {estimatedHours}h {actualHours && `/ Actual: ${actualHours}h`}
          </div>
        )}
      </div>

      {/* Type Badge */}
      {taskType && (
        <div className="mb-3">
          <Badge variant="outline" className="capitalize">
            {taskType}
          </Badge>
        </div>
      )}

      {/* Quick Actions */}
      {onStatusChange && (
        <div className="flex gap-2 pt-3 border-t border-slate-200">
          {status !== 'completed' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-lime-600 border-lime-600 hover:bg-lime-50"
              onClick={() => onStatusChange('completed')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Complete
            </Button>
          )}
          {status !== 'in_progress' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onStatusChange('in_progress')}
            >
              Start
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
