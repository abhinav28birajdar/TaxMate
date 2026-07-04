'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  client: z.string().optional(),
  taskType: z.enum(['general', 'audit', 'compliance', 'accounting', 'consultation', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['not_started', 'in_progress', 'review', 'completed', 'cancelled']),
  assignedTo: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  estimatedHours: z.number().min(0, 'Must be non-negative').optional(),
  actualHours: z.number().min(0, 'Must be non-negative').optional(),
  tags: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: Partial<TaskFormData>;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export default function TaskForm({
  onSubmit,
  initialData,
  isLoading = false,
  title = 'Create Task',
  subtitle = 'Create a new task or to-do',
  className,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      client: initialData?.client || '',
      taskType: initialData?.taskType || 'general',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'not_started',
      assignedTo: initialData?.assignedTo || '',
      dueDate: initialData?.dueDate || '',
      estimatedHours: initialData?.estimatedHours,
      actualHours: initialData?.actualHours,
      tags: initialData?.tags || '',
    },
  });

  const taskType = watch('taskType');
  const priority = watch('priority');

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title and Client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Task Title *
            </Label>
            <Input
              {...register('title')}
              placeholder="e.g., Prepare GST Filing"
              disabled={isLoading}
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && (
              <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Client (Optional)
            </Label>
            <Input
              {...register('client')}
              placeholder="Client name"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Description (Optional)
          </Label>
          <Textarea
            {...register('description')}
            placeholder="Detailed task description and requirements..."
            rows={3}
            disabled={isLoading}
            className="resize-none"
          />
        </div>

        {/* Task Type, Priority, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Task Type
            </Label>
            <Select
              value={taskType}
              onValueChange={(value) => setValue('taskType', value as any)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="accounting">Accounting</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Priority
            </Label>
            <Select
              value={priority}
              onValueChange={(value) => setValue('priority', value as any)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Status
            </Label>
            <Select
              defaultValue="not_started"
              onValueChange={(value) => setValue('status', value as any)}
            >
              <SelectTrigger disabled={isLoading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Due Date and Assignment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Due Date *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                {...register('dueDate')}
                type="date"
                disabled={isLoading}
                className={cn('pl-10', errors.dueDate && 'border-red-500')}
              />
            </div>
            {errors.dueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Assign To (Optional)
            </Label>
            <Input
              {...register('assignedTo')}
              placeholder="Team member name"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Time Estimation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded border border-slate-200">
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Estimated Hours (Optional)
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                {...register('estimatedHours', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                min="0"
                step="0.5"
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              Actual Hours (Optional)
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                {...register('actualHours', { valueAsNumber: true })}
                type="number"
                placeholder="0"
                min="0"
                step="0.5"
                disabled={isLoading}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-sm font-semibold text-slate-900 mb-2 block">
            Tags (Optional)
          </Label>
          <Input
            {...register('tags')}
            placeholder="e.g., urgent, client-xyz, quarterly (comma-separated)"
            disabled={isLoading}
          />
          <p className="text-xs text-slate-500 mt-1">Separate multiple tags with commas</p>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            className="flex-1"
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-lime-600 hover:bg-lime-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Task Types Guide</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li><strong>Audit:</strong> Audit-related tasks</li>
          <li><strong>Compliance:</strong> Compliance filing tasks</li>
          <li><strong>Accounting:</strong> General accounting and bookkeeping</li>
          <li><strong>Consultation:</strong> Client consultation tasks</li>
        </ul>
      </div>
    </Card>
  );
}
