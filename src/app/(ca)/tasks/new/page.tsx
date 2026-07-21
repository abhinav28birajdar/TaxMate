'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskForm } from '@/components/tasks';

export default function NewTaskPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    console.log('Creating task:', data);
    router.push('/dashboard/tasks');
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>
      <TaskForm
        onSubmit={handleSubmit}
        title="Create New Task"
        subtitle="Create a new task for your team"
      />
    </div>
  );
}
