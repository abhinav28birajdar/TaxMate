'use client';

import { useState } from 'react';
import { Bell, Check, Trash2, FileText, AlertTriangle, MessageSquare, CreditCard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CANotificationsPage() {
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Document Uploaded by Client', desc: 'TechNova Solutions uploaded HDFC Bank Statement Q2.pdf for GSTR-3B audit.', time: '10 mins ago', type: 'DOC', read: false },
    { id: 'n2', title: 'Payment Settlement Received', desc: 'Razorpay settled ₹1,50,000 to HDFC Bank Vault for Invoice #INV-1004.', time: '1 hour ago', type: 'PAYMENT', read: false },
    { id: 'n3', title: 'Statutory Compliance Reminder', desc: 'GSTR-3B filing deadline for September 2026 is due in 3 days (20 Oct 2026).', time: '3 hours ago', type: 'ALERT', read: true },
    { id: 'n4', title: 'Client Message Received', desc: 'Dr. Vikramaditya Rao sent a message in Chat regarding Sec 80D deductions.', time: '1 day ago', type: 'MSG', read: true },
  ]);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-lime-600" /> Notifications & Activity Stream
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for client document uploads, payments, deadline reminders, and messages.</p>
        </div>
        <Button onClick={markAllRead} variant="outline" className="text-xs">
          <Check className="w-4 h-4 mr-1.5" /> Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
              !n.read
                ? 'bg-lime-600/10 border-lime-500/30 text-slate-900 dark:text-white'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-lime-600 flex items-center justify-center shrink-0 mt-0.5">
                {n.type === 'DOC' && <FileText className="w-5 h-5" />}
                {n.type === 'PAYMENT' && <CreditCard className="w-5 h-5" />}
                {n.type === 'ALERT' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {n.type === 'MSG' && <MessageSquare className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.desc}</p>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">{n.time}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotifications(notifications.filter((item) => item.id !== n.id))}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
