'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, FileText, CreditCard, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Document Request from CA Rajesh Sharma', desc: 'Please upload HDFC Bank Statement Q2 for GSTR-3B audit.', time: '10 mins ago', type: 'DOC' },
    { id: 'n2', title: 'Payment Receipt Issued', desc: 'Receipt issued for ₹1,50,000 CA retainer payment.', time: '2 hours ago', type: 'PAYMENT' },
    { id: 'n3', title: 'GSTR-3B Due Date Reminder', desc: 'September 2026 GST filing is due in 3 days.', time: '1 day ago', type: 'ALERT' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-lime-600" /> Notifications & Activity Stream
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for document requests, payment receipts, and compliance due dates.</p>
        </div>
        <Button onClick={() => toast.success('Marked all as read')} variant="outline" className="text-xs">
          <Check className="w-4 h-4 mr-1.5" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-start justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center shrink-0 mt-0.5">
                {n.type === 'DOC' && <FileText className="w-5 h-5" />}
                {n.type === 'PAYMENT' && <CreditCard className="w-5 h-5" />}
                {n.type === 'ALERT' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{n.desc}</p>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">{n.time}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setNotifications(notifications.filter(item => item.id !== n.id))}>
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
