'use client';

import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface SubtaskItemProps {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  onToggle?: (completed: boolean) => void;
  onDelete?: () => void;
  onEdit?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Med',
  high: 'High',
  urgent: 'Urgent',
};

export default function SubtaskItem({
  id,
  title,
  completed,
  assignee,
  dueDate,
  priority = 'medium',
  onToggle,
  onDelete,
  onEdit,
  draggable = true,
  onDragStart,
  onDragEnd,
  disabled = false,
  compact = false,
  className,
}: SubtaskItemProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded border border-slate-200 bg-white hover:bg-slate-50 transition-colors',
        completed && 'opacity-60 bg-slate-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      draggable={draggable && !disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Drag Handle */}
      {draggable && (
        <button
          className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing"
          disabled={disabled}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Checkbox */}
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) => onToggle?.(checked as boolean)}
        disabled={disabled}
        className="mt-1 flex-shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          onClick={onEdit}
          className={cn(
            'text-sm font-medium cursor-pointer',
            completed && 'line-through text-slate-500',
            !completed && 'text-slate-900'
          )}
        >
          {title}
        </div>

        {!compact && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {priority && (
              <span className={cn('text-xs px-2 py-0.5 rounded font-medium', priorityColors[priority])}>
                {priorityLabels[priority]}
              </span>
            )}
            {assignee && <span className="text-xs text-slate-600">👤 {assignee}</span>}
            {dueDate && <span className="text-xs text-slate-600">📅 {dueDate}</span>}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0 opacity-0 hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={disabled}
            className="h-6 w-6 p-0 hover:bg-slate-200"
            title="Edit subtask"
          >
            ✏️
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={disabled}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete subtask"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
