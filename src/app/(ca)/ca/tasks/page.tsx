'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, LayoutGrid, List, CheckCircle2, Clock, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TasksListPage() {
  const [filter, setFilter] = useState('all');

  const tasks = [
    { id: 'tsk_1', title: 'Prepare GSTR-1 Monthly Return', client: 'TechNova Solutions', due: '20 Oct 2026', priority: 'Urgent', status: 'In Progress', assigned: 'Anish Sharma' },
    { id: 'tsk_2', title: 'File ITR-3 Belated Filing', client: 'Ananya Deshmukh', due: '25 Oct 2026', priority: 'High', status: 'Review', assigned: 'Priya Mehta' },
    { id: 'tsk_3', title: 'TDS Q2 Challan Reconciliation', client: 'Apex Logistics', due: '31 Oct 2026', priority: 'Medium', status: 'Not Started', assigned: 'Anish Sharma' },
    { id: 'tsk_4', title: 'Advance Tax Calculation Q3', client: 'Dr. Vikramaditya Rao', due: '15 Dec 2026', priority: 'Low', status: 'Not Started', assigned: 'CA Rajesh Sharma' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track compliance deadlines, client deliverables, and team assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/ca/tasks/kanban">
            <Button variant="outline" size="sm">
              <LayoutGrid className="w-4 h-4 mr-2" /> Kanban Board
            </Button>
          </Link>
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-2" /> Create Task
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input placeholder="Search task title, client..." className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
        </div>

        <div className="flex gap-2">
          {['all', 'in_progress', 'review', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === st
                  ? 'bg-lime-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Task Title</th>
              <th className="py-3.5 px-4">Client</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{task.title}</td>
                <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">{task.client}</td>
                <td className="py-3.5 px-4 text-slate-500">{task.due}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      task.priority === 'Urgent'
                        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                        : task.priority === 'High'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/10 text-lime-600 border border-lime-600/20">
                    {task.status}
                  </span>
                </td>
                <td className="py-3.5 px-4">{task.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
