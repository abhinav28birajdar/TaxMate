'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks';
import { toast } from 'sonner';

export default function NewTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          taskType: data.taskType,
          priority: data.priority,
          status: data.status,
          dueDate: data.dueDate,
          estimatedHours: data.estimatedHours,
          metadata: {
            clientName: data.client || undefined,
            tags: data.tags ? String(data.tags).split(',').map((t) => t.trim()).filter(Boolean) : [],
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to create task');
      }
      toast.success('Task created successfully!');
      router.push('/tasks');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <TaskForm
        onSubmit={handleSubmit}
        isLoading={submitting}
        title="Create New Task"
        subtitle="Create a tracked workflow item for your practice"
      />
    </div>
  );
}
