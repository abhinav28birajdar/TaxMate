'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { TaskCard } from '@/components/tasks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tasks] = useState([
    { id: '1', title: 'Prepare GST Filing', taskType: 'compliance', priority: 'high', status: 'in_progress', dueDate: '2026-07-10', estimatedHours: 4 },
    { id: '2', title: 'Audit ABC Corp', taskType: 'audit', priority: 'urgent', status: 'not_started', dueDate: '2026-07-08', estimatedHours: 6 },
    { id: '3', title: 'Prepare tax report', taskType: 'accounting', priority: 'medium', status: 'not_started', dueDate: '2026-07-15', estimatedHours: 3 },
  ]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-600 mt-1">Manage your team's tasks and assignments</p>
        </div>
        <Link href="/ca/tasks/kanban">
          <Button className="gap-2 bg-lime-600 hover:bg-lime-700">
            <Plus className="w-4 h-4" /> Kanban Board
          </Button>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: any) => (
            <Link key={task.id} href={`/ca/tasks/kanban`}>
              <TaskCard {...task} className="cursor-pointer hover:shadow-lg transition-shadow" />
            </Link>
          ))
        ) : (
          <Card className="col-span-full p-12 text-center">
            <p className="text-slate-500 text-lg">No tasks found. Create your first task to get started.</p>
            <Link href="/ca/tasks/kanban">
              <Button className="mt-4 bg-lime-600 hover:bg-lime-700 gap-2">
                <Plus className="w-4 h-4" /> Create Task
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
