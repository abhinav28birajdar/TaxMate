'use client';

import { useState } from 'react';
import { Calendar, Bell, ShieldAlert, CheckCircle2, Clock, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CAComplianceCalendarPage() {
  const [filter, setFilter] = useState('all');

  const complianceItems = [
    { id: 'c1', title: 'GSTR-3B Filing (Monthly)', type: 'GST', client: 'TechNova Solutions', due: '20 Oct 2026', priority: 'Urgent', status: 'Pending', reminderDays: '2 Days Left' },
    { id: 'c2', title: 'TDS Payment Deposit (Form 26Q)', type: 'TDS', client: 'Apex Logistics', due: '31 Oct 2026', priority: 'High', status: 'Pending', reminderDays: '13 Days Left' },
    { id: 'c3', title: 'Advance Tax 3rd Installment', type: 'Income Tax', client: 'Dr. Vikramaditya Rao', due: '15 Dec 2026', priority: 'Medium', status: 'Not Started', reminderDays: '58 Days Left' },
    { id: 'c4', title: 'ROC Form AOC-4 Filing', type: 'ROC', client: 'Global Software Inc', due: '30 Oct 2026', priority: 'High', status: 'Completed', reminderDays: 'Done' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-lime-600" /> Statutory Compliance Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">Automated 30/7/3/1 day deadline reminders for GST, TDS, ROC, and Advance Tax.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-2" /> Add Custom Deadline
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Urgent (Due in 3 Days)</span>
          <div className="text-2xl font-extrabold text-red-500 mt-1">1 Task</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Upcoming (This Month)</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">3 Tasks</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Automated Reminders</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">Enabled</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Filing Rate</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">94.8%</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Compliance Event</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Client Entity</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Reminder Status</th>
              <th className="py-3.5 px-4">Filing Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {complianceItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                <td className="py-3.5 px-4 font-semibold text-lime-600 dark:text-lime-400">{item.type}</td>
                <td className="py-3.5 px-4">{item.client}</td>
                <td className="py-3.5 px-4 font-medium">{item.due}</td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5" /> {item.reminderDays}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
