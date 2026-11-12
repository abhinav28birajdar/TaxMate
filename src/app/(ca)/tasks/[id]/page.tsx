'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TaskDetail } from '@/components/tasks';
import { toast } from 'sonner';

function mapStatusToUi(raw: string): 'not_started' | 'in_progress' | 'review' | 'completed' | 'cancelled' {
  const upper = String(raw || '').toUpperCase();
  if (upper === 'COMPLETED' || upper === 'DONE') return 'completed';
  if (upper === 'IN_PROGRESS' || upper === 'PROGRESS') return 'in_progress';
  if (upper === 'IN_REVIEW' || upper === 'REVIEW') return 'review';
  if (upper === 'CANCELLED') return 'cancelled';
  return 'not_started';
}

function mapStatusToApi(ui: string): string {
  const map: Record<string, string> = {
    not_started: 'TODO',
    in_progress: 'IN_PROGRESS',
    review: 'IN_REVIEW',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
  };
  return map[ui] || 'TODO';
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const taskId = params?.id || '';
  const router = useRouter();

  const [task, setTask] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.task) {
        throw new Error(json.error || 'Task not found');
      }
      setTask(json.task);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch task details');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to delete task');
      }
      toast.success('Task deleted');
      router.push('/ca/tasks');
    } catch (err: any) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const apiStatus = mapStatusToApi(status);
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: apiStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.task) throw new Error(json.error || 'Status update failed');
      setTask(json.task);
      toast.success(`Status updated to ${apiStatus.replace(/_/g, ' ')}`);
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const handleAddComment = async (text: string) => {
    if (!task || !text.trim()) return;
    try {
      const existingComments = Array.isArray(task.metadata?.comments) ? task.metadata.comments : [];
      const nextComment = {
        id: `cmt_${Date.now()}`,
        user: 'You',
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          metadata: { comments: [...existingComments, nextComment] },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.task) throw new Error(json.error || 'Failed to post comment');
      setTask(json.task);
      toast.success('Comment added');
    } catch (err: any) {
      toast.error(err.message || 'Comment failed');
    }
  };

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    if (!task) return;
    try {
      const existingSubs = Array.isArray(task.metadata?.subtasks) ? task.metadata.subtasks : [];
      const nextSubs = existingSubs.map((s: any) =>
        s.id === subtaskId ? { ...s, completed } : s
      );
      const res = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          metadata: { subtasks: nextSubs },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.task) throw new Error(json.error || 'Failed to update subtask');
      setTask(json.task);
    } catch (err: any) {
      toast.error(err.message || 'Subtask update failed');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading task details...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Card className="p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-semibold">{error || 'Task not found'}</p>
        </Card>
      </div>
    );
  }

  const rawType = String(task.task_type || 'compliance').toLowerCase();
  const taskType = (['general', 'audit', 'compliance', 'accounting', 'consultation', 'other'].includes(rawType)
    ? rawType
    : 'compliance') as 'general' | 'audit' | 'compliance' | 'accounting' | 'consultation' | 'other';
  const rawPriority = String(task.priority || 'medium').toLowerCase();
  const priority = (['low', 'medium', 'high', 'urgent'].includes(rawPriority)
    ? rawPriority
    : 'medium') as 'low' | 'medium' | 'high' | 'urgent';

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
      </div>
      <TaskDetail
        id={task.id}
        title={task.title}
        description={task.description || ''}
        client={task.metadata?.client_name || undefined}
        taskType={taskType}
        priority={priority}
        status={mapStatusToUi(task.status)}
        dueDate={task.due_date || task.created_at}
        createdAt={task.created_at}
        subtasks={Array.isArray(task.metadata?.subtasks) ? task.metadata.subtasks : []}
        activities={Array.isArray(task.metadata?.activities) ? task.metadata.activities : []}
        comments={Array.isArray(task.metadata?.comments) ? task.metadata.comments : []}
        onEdit={() => router.push('/ca/tasks')}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onSubtaskToggle={handleSubtaskToggle}
        onAddComment={handleAddComment}
      />
    </div>
  );
}
