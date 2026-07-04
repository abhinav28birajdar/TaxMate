'use client';

import React, { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Edit, Trash2, Plus, AlertCircle, Clock, User, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import SubtaskItem from './details/SubtaskItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type TaskType = 'general' | 'audit' | 'compliance' | 'accounting' | 'consultation' | 'other';
type TaskStatus = 'not_started' | 'in_progress' | 'review' | 'completed' | 'cancelled';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
  avatar?: string;
}

interface TaskDetailProps {
  id: string;
  title: string;
  description?: string;
  client?: string;
  taskType: TaskType;
  priority: Priority;
  status: TaskStatus;
  assignedTo?: string;
  dueDate: string;
  createdAt: string;
  estimatedHours?: number;
  actualHours?: number;
  subtasks?: Subtask[];
  activities?: Activity[];
  comments?: Comment[];
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: TaskStatus) => void;
  onAddSubtask?: () => void;
  onSubtaskToggle?: (subtaskId: string, completed: boolean) => void;
  onAddComment?: (text: string) => void;
  className?: string;
}

const taskTypeColors: Record<TaskType, string> = {
  general: 'bg-slate-100 text-slate-700',
  audit: 'bg-purple-100 text-purple-700',
  compliance: 'bg-blue-100 text-blue-700',
  accounting: 'bg-green-100 text-green-700',
  consultation: 'bg-amber-100 text-amber-700',
  other: 'bg-slate-100 text-slate-700',
};

const priorityColors: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function TaskDetail({
  id,
  title,
  description,
  client,
  taskType,
  priority,
  status,
  assignedTo,
  dueDate,
  createdAt,
  estimatedHours,
  actualHours,
  subtasks = [],
  activities = [],
  comments = [],
  onEdit,
  onDelete,
  onStatusChange,
  onAddSubtask,
  onSubtaskToggle,
  onAddComment,
  className,
}: TaskDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const dueDateObj = new Date(dueDate);
  const isOverdue = new Date() > dueDateObj && status !== 'completed';
  const completedSubtasks = subtasks.filter((st) => st.completed).length;
  const completionPercentage = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Card */}
      <Card className={cn('p-6', isOverdue && 'border-red-300 bg-red-50')}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} />
              <Badge className={taskTypeColors[taskType]}>{taskType}</Badge>
              <Badge className={priorityColors[priority]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
              {isOverdue && (
                <div className="flex items-center gap-1 text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4" /> OVERDUE
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                ⋯
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>}
              {onStatusChange && (
                <>
                  {status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onStatusChange('completed')}>
                      Mark Complete
                    </DropdownMenuItem>
                  )}
                  {status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => onStatusChange('cancelled')}>
                      Cancel
                    </DropdownMenuItem>
                  )}
                </>
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

        {/* Meta Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded">
          <div>
            <p className="text-xs text-slate-600 mb-1">Client</p>
            <p className="font-semibold text-slate-900">{client || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Assigned To</p>
            <p className="font-semibold text-slate-900">{assignedTo || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Due Date</p>
            <p className={cn('font-semibold', isOverdue && 'text-red-600')}>
              {format(dueDateObj, 'd MMM, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Created</p>
            <p className="font-semibold text-slate-900">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </Card>

      {/* Description Card */}
      {description && (
        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Description
          </h2>
          <p className="text-slate-700 whitespace-pre-wrap">{description}</p>
        </Card>
      )}

      {/* Time Tracking Card */}
      {(estimatedHours || actualHours) && (
        <Card className="p-6">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Time Tracking
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {estimatedHours && (
              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">Estimated Hours</p>
                <p className="text-2xl font-bold text-slate-900">{estimatedHours}h</p>
              </div>
            )}
            {actualHours && (
              <div className="p-3 bg-lime-50 rounded border border-lime-200">
                <p className="text-xs text-slate-600 mb-1">Actual Hours</p>
                <p className="text-2xl font-bold text-lime-700">{actualHours}h</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Subtasks Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-slate-900">Subtasks</h2>
            {subtasks.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lime-600 transition-all"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {completedSubtasks}/{subtasks.length}
                </span>
              </div>
            )}
          </div>
          {onAddSubtask && (
            <Button
              size="sm"
              variant="outline"
              onClick={onAddSubtask}
              className="gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {subtasks.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No subtasks yet</p>
          ) : (
            subtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                {...subtask}
                onToggle={(completed) => onSubtaskToggle?.(subtask.id, completed)}
              />
            ))
          )}
        </div>
      </Card>

      {/* Tabs: Activities and Comments */}
      <Card>
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="border-b w-full rounded-none">
            <TabsTrigger value="activity">Activity ({activities.length})</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="p-6">
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No activities yet</p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded bg-slate-50 border border-slate-200"
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-600 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {activity.user} {activity.action}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="p-6">
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded border border-slate-200">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-slate-400"
                      style={comment.avatar ? { backgroundImage: `url(${comment.avatar})` } : {}}
                    >
                      {!comment.avatar && comment.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 text-sm">{comment.user}</p>
                        <p className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-slate-700">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Task?"
        description={`This will permanently delete "${title}". This action cannot be undone.`}
        onConfirm={handleDelete}
        isDangerous
      />
    </div>
  );
}
