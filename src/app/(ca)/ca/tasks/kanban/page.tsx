'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, List, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KanbanBoardPage() {
  const [columns, setColumns] = useState({
    todo: [
      { id: 't1', title: 'TDS Return Filing Q2', client: 'Apex Logistics', priority: 'High', due: '31 Oct' },
      { id: 't2', title: 'Advance Tax Calculation', client: 'Dr. Rao', priority: 'Medium', due: '15 Dec' },
    ],
    in_progress: [
      { id: 't3', title: 'GSTR-1 Monthly Return', client: 'TechNova Solutions', priority: 'Urgent', due: '20 Oct' },
    ],
    review: [
      { id: 't4', title: 'ITR-3 Draft Verification', client: 'Ananya Deshmukh', priority: 'High', due: '25 Oct' },
    ],
    completed: [
      { id: 't5', title: 'ROC Form MGT-7 Filing', client: 'Global Software Inc', priority: 'Normal', due: '10 Oct' },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Kanban Task Board</h1>
          <p className="text-xs text-slate-500">Drag and drop tasks between workflow stages</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ca/tasks">
            <Button variant="outline" size="sm">
              <List className="w-4 h-4 mr-2" /> List View
            </Button>
          </Link>
          <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { key: 'todo', title: 'To Do', color: 'border-slate-300 dark:border-slate-700', badgeBg: 'bg-slate-100 text-slate-700' },
          { key: 'in_progress', title: 'In Progress', color: 'border-lime-500', badgeBg: 'bg-lime-600/10 text-lime-600' },
          { key: 'review', title: 'Under Review', color: 'border-amber-500', badgeBg: 'bg-amber-500/10 text-amber-600' },
          { key: 'completed', title: 'Completed', color: 'border-emerald-500', badgeBg: 'bg-emerald-500/10 text-emerald-600' },
        ].map((col) => (
          <div key={col.key} className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 min-h-[500px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{col.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeBg}`}>
                {(columns as any)[col.key].length}
              </span>
            </div>

            <div className="space-y-3">
              {(columns as any)[col.key].map((item: any) => (
                <div key={item.id} className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-2 hover:border-lime-600 transition-all cursor-grab active:cursor-grabbing">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-lime-600 dark:text-lime-400">
                    {item.client}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.due}
                    </span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300">{item.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
