'use client';

import { useState } from 'react';
import { HelpCircle, Plus, MessageSquare, LifeBuoy, CheckCircle2, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CASupportDeskPage() {
  const [tickets, setTickets] = useState([
    { id: 'TKT-1089', subject: 'GSTR-2B API Sync Failure for Multi-GSTIN Client', priority: 'High', status: 'In Progress', createdAt: '22 Oct 2026' },
    { id: 'TKT-1075', subject: 'Adding additional partner seat to Enterprise Plan', priority: 'Medium', status: 'Resolved', createdAt: '18 Oct 2026' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-lime-600" /> Platform Support Desk & SLA Help Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">Submit technical support tickets, view system status, and request tax API integrations.</p>
        </div>
        <Button onClick={() => toast.success('New support ticket submitted to TaxMate Tech Desk!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Submit Support Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Dedicated Account Manager</span>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">Sandeep Joshi (Priority CA Line)</div>
          <span className="text-[11px] text-lime-600 font-semibold block mt-1">+91 1800-TAX-MATE</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Guaranteed Response SLA</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">&lt; 15 Minutes</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">System Operational Status</span>
          <div className="text-sm font-bold text-lime-600 dark:text-lime-400 flex items-center gap-1.5 mt-2">
            <CheckCircle2 className="w-4 h-4" /> All Systems Operational
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Ticket ID</th>
              <th className="py-3.5 px-4">Subject / Issue</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-mono font-bold text-lime-600 dark:text-lime-400">{t.id}</td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.subject}</td>
                <td className="py-3.5 px-4">{t.createdAt}</td>
                <td className="py-3.5 px-4 font-bold text-amber-500">{t.priority}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    t.status === 'Resolved'
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {t.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing conversation thread for ${t.id}`)} className="text-lime-600">
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
