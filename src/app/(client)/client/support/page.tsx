'use client';

import { useState } from 'react';
import { HelpCircle, Plus, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ClientSupportDeskPage() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-2041', subject: 'Document OCR parsing discrepancy in Form 16', status: 'In Progress', date: '22 Oct 2026' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-lime-600" /> Client Support Desk & Help Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">Get technical help with platform features, billing, or document uploads.</p>
        </div>
        <Button onClick={() => toast.success('Support ticket created!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Submit Ticket
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Ticket ID</th>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Date Submitted</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{t.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.subject}</td>
                <td className="py-3.5 px-4">{t.date}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {t.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" className="text-lime-600">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
