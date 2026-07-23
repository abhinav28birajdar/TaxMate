'use client';

import { useState } from 'react';
import { FileText, Plus, Bell, CheckCircle2, Clock, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CADocumentRequestsPage() {
  const [requests, setRequests] = useState([
    { id: 'req_1', client: 'TechNova Solutions Pvt Ltd', docType: 'Bank Statement Q3 (HDFC)', deadline: '25 Oct 2026', status: 'Pending Upload', priority: 'High' },
    { id: 'req_2', client: 'Ananya Deshmukh', docType: 'Form 16 & Salary Slip', deadline: '22 Oct 2026', status: 'Uploaded (Review)', priority: 'Urgent' },
    { id: 'req_3', client: 'Apex Logistics India', docType: 'GSTR-2B ITC Reconciliation', deadline: '30 Oct 2026', status: 'Verified', priority: 'Medium' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-600" /> CA Client Document Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">Issue automated document collection requests with deadline reminders and push notifications.</p>
        </div>
        <Button onClick={() => toast.success('Document request notification sent to client!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Request Document
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Requested Document</th>
              <th className="py-3.5 px-4">Deadline</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {requests.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{r.client}</td>
                <td className="py-3.5 px-4">{r.docType}</td>
                <td className="py-3.5 px-4">{r.deadline}</td>
                <td className="py-3.5 px-4 font-bold text-lime-600 dark:text-lime-400">{r.priority}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    r.status.includes('Verified')
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Reminder ping sent to ${r.client}`)} className="text-xs">
                    <Send className="w-3.5 h-3.5 mr-1 text-lime-600" /> Remind
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
