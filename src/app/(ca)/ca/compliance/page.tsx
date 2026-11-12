'use client';

import { useEffect, useState } from 'react';
import { Calendar, Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useRealtimeSubscription } from '@/hooks/use-realtime';

type ComplianceItem = {
  id: string;
  title: string;
  compliance_type: string;
  client_id: string;
  due_date: string;
  priority: string;
  status: string;
};

export default function CAComplianceCalendarPage() {
  const { user } = useAuth();
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    const loadItems = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('compliance_items')
        .select('id, title, compliance_type, client_id, due_date, priority, status')
        .eq('ca_id', user.id)
        .order('due_date', { ascending: true });

      if (active) {
        if (error) console.error('Unable to load compliance items:', error);
        setComplianceItems((data as ComplianceItem[] | null) ?? []);
        setLoading(false);
      }
    };

    void loadItems();
    return () => { active = false; };
  }, [user?.id]);

  useRealtimeSubscription<ComplianceItem>(
    'compliance_items',
    user?.id ? `ca_id=eq.${user.id}` : undefined,
    (item) => setComplianceItems((current) => [...current, item].sort((a, b) => a.due_date.localeCompare(b.due_date))),
    (item) => setComplianceItems((current) => current.map((existing) => existing.id === item.id ? item : existing)),
    (item) => setComplianceItems((current) => current.filter((existing) => existing.id !== item.id))
  );

  const pendingCount = complianceItems.filter((item) => item.status !== 'completed').length;
  const completedCount = complianceItems.filter((item) => item.status === 'completed').length;
  const urgentCount = complianceItems.filter((item) => {
    const days = Math.ceil((new Date(item.due_date).getTime() - Date.now()) / 86400000);
    return item.status !== 'completed' && days <= 3;
  }).length;

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
          <div className="text-2xl font-extrabold text-red-500 mt-1">{urgentCount} Tasks</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Upcoming (This Month)</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">{pendingCount} Tasks</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Automated Reminders</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">Enabled</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <span className="text-xs font-semibold text-slate-500">Filing Rate</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{completedCount}/{complianceItems.length || 0}</div>
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
            {loading && <tr><td colSpan={6} className="py-8 px-4 text-center text-slate-500">Loading compliance items...</td></tr>}
            {!loading && complianceItems.length === 0 && <tr><td colSpan={6} className="py-8 px-4 text-center text-slate-500">No compliance items assigned yet.</td></tr>}
            {complianceItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                <td className="py-3.5 px-4 font-semibold text-lime-600 dark:text-lime-400">{item.compliance_type}</td>
                <td className="py-3.5 px-4">{item.client_id}</td>
                <td className="py-3.5 px-4 font-medium">{new Date(item.due_date).toLocaleDateString('en-IN')}</td>
                <td className="py-3.5 px-4">
                  <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5" /> {Math.max(0, Math.ceil((new Date(item.due_date).getTime() - Date.now()) / 86400000))} Days
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'completed'
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
