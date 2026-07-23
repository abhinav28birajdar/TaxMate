'use client';

import { useState } from 'react';
import { CheckSquare, Upload, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ClientTasksPage() {
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Upload Bank Statement Q2 (HDFC)', requestedBy: 'CA Rajesh Sharma', dueDate: '25 Oct 2026', priority: 'High', status: 'PENDING', category: 'Document Request' },
    { id: 't2', title: 'Approve Draft GSTR-3B Tax Return', requestedBy: 'CA Rajesh Sharma', dueDate: '20 Oct 2026', priority: 'Urgent', status: 'PENDING', category: 'Return Review' },
    { id: 't3', title: 'Upload 80D Health Insurance Premium Receipt', requestedBy: 'CA Ananya Deshmukh', dueDate: '30 Oct 2026', priority: 'Medium', status: 'COMPLETED', category: 'Deduction Proof' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t)));
    toast.success('Task status updated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-lime-600" /> Pending Action Tasks & Document Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">Review missing documents, approve prepared returns, and clear pending CA requests.</p>
      </div>

      <div className="space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
              t.status === 'COMPLETED'
                ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <button onClick={() => toggleTask(t.id)} className="text-slate-400 hover:text-lime-600">
                {t.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-5 h-5 text-lime-600 fill-lime-600/20" />
                ) : (
                  <div className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-700" />
                )}
              </button>
              <div>
                <h4 className={`font-bold text-sm text-slate-900 dark:text-white ${t.status === 'COMPLETED' ? 'line-through' : ''}`}>
                  {t.title}
                </h4>
                <p className="text-xs text-slate-500">Requested by {t.requestedBy} • Category: {t.category}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">Due: {t.dueDate}</span>
              <Link href="/client/documents/upload">
                <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload & Resolve
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
