'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { TaskDetail } from '@/components/tasks';

const mockTask = {
  id: '1',
  title: 'Prepare GST Filing',
  description: 'Prepare complete GST return filing for ABC Corp including reconciliation of invoices and payments',
  taskType: 'compliance' as const,
  priority: 'high' as const,
  status: 'in_progress' as const,
  client: 'ABC Corporation',
  assignedTo: 'Rajesh Kumar',
  dueDate: '2026-07-10',
  createdAt: '2026-07-04',
  estimatedHours: 4,
  actualHours: 2.5,
  subtasks: [
    { id: '1', title: 'Collect all invoices', completed: true, priority: 'high' as const },
    { id: '2', title: 'Prepare summary', completed: false, priority: 'high' as const },
    { id: '3', title: 'File return', completed: false, priority: 'urgent' as const },
  ],
  activities: [
    { id: '1', user: 'Rajesh Kumar', action: 'marked task as in_progress', timestamp: '2026-07-04T10:00:00Z' },
    { id: '2', user: 'Priya Sharma', action: 'added subtask', timestamp: '2026-07-04T09:30:00Z' },
  ],
  comments: [
    { id: '1', user: 'Rajesh Kumar', text: 'Started working on the invoice reconciliation', timestamp: '2026-07-04T09:00:00Z' },
  ],
};

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/dashboard/tasks/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      router.push('/dashboard/tasks');
    }
  };

  const handleStatusChange = (status: string) => {
    console.log('Status changed to:', status);
  };

  const handleAddSubtask = () => {
    router.push(`/dashboard/tasks/${params.id}/subtask/new`);
  };

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    console.log('Subtask toggled:', subtaskId, completed);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      <TaskDetail
        {...mockTask}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onAddSubtask={handleAddSubtask}
        onSubtaskToggle={handleSubtaskToggle}
      />
    </div>
  );
}
