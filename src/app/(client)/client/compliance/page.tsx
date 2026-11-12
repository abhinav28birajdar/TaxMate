'use client';

import { useEffect, useState } from 'react';
import { Calendar, Bell } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useRealtimeSubscription } from '@/hooks/use-realtime';

type ComplianceItem = {
  id: string;
  title: string;
  compliance_type: string;
  due_date: string;
  priority: string;
  status: string;
};

export default function ClientCompliancePage() {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    const loadDeadlines = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('compliance_items')
        .select('id, title, compliance_type, due_date, priority, status')
        .eq('client_id', user.id)
        .order('due_date', { ascending: true });

      if (active) {
        if (error) console.error('Unable to load compliance items:', error);
        setDeadlines((data as ComplianceItem[] | null) ?? []);
        setLoading(false);
      }
    };

    void loadDeadlines();
    return () => { active = false; };
  }, [user?.id]);

  useRealtimeSubscription<ComplianceItem>(
    'compliance_items',
    user?.id ? `client_id=eq.${user.id}` : undefined,
    (item) => setDeadlines((current) => [...current, item].sort((a, b) => a.due_date.localeCompare(b.due_date))),
    (item) => setDeadlines((current) => current.map((existing) => existing.id === item.id ? item : existing)),
    (item) => setDeadlines((current) => current.filter((existing) => existing.id !== item.id))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-lime-600" /> Compliance Calendar & Due Dates
        </h1>
        <p className="text-xs text-slate-500 mt-1">Automatic statutory compliance schedule for GST, Income Tax, Advance Tax, and TDS.</p>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-sm text-slate-500">Loading compliance items...</p>}
        {!loading && deadlines.length === 0 && <p className="text-sm text-slate-500">No compliance deadlines are assigned yet.</p>}
        {deadlines.map((deadline) => {
          const daysLeft = Math.ceil((new Date(deadline.due_date).getTime() - Date.now()) / 86400000);
          const urgency = deadline.priority.toUpperCase();
          return (
          <div key={deadline.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-600/10 text-lime-600 flex items-center justify-center font-bold text-xs shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{deadline.title}</h4>
                <p className="text-xs text-slate-400">{deadline.compliance_type} • Due: {new Date(deadline.due_date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              urgency === 'HIGH' || daysLeft <= 3
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
            }`}>
              {daysLeft < 0 ? 'Overdue' : `${daysLeft} Days`}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
}
