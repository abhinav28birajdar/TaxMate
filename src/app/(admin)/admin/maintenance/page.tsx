'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Wrench, Power, Mail, Loader2, RefreshCw, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminMaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  const [title, setTitle] = useState('Scheduled Platform Upgrade');
  const [message, setMessage] = useState('');
  const [estimatedResumeAt, setEstimatedResumeAt] = useState('');
  const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string; subscribed_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=maintenance', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load maintenance state');
      setEnabled(Boolean(json.config?.enabled));
      setTitle(json.config?.title || 'Scheduled Platform Upgrade');
      setMessage(json.config?.message || '');
      setEstimatedResumeAt(json.config?.estimatedResumeAt || '');
      setSubscribers(Array.isArray(json.subscribers) ? json.subscribers : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load maintenance configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async (nextEnabled = enabled) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          section: 'maintenance',
          enabled: nextEnabled,
          title,
          message,
          estimatedResumeAt,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to save maintenance settings');
      setEnabled(Boolean(json.config?.enabled));
      toast.success(nextEnabled ? 'Maintenance mode enabled' : 'Maintenance settings saved');
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-lime-500" /> Platform Maintenance Control
          </h1>
          <p className="text-sm text-slate-400">Persist global maintenance mode banner and notify waitlisted subscribers</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={enabled ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-lime-600/20 text-lime-400 border-lime-500/30'}>
            {enabled ? 'MAINTENANCE ACTIVE' : 'SYSTEM LIVE'}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadConfig} className="border-slate-800 bg-slate-900 text-slate-300">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading system_settings...
        </div>
      ) : (
        <>
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <h2 className="font-semibold text-slate-100 text-sm">Global Maintenance Window</h2>
                <p className="text-xs text-slate-400">Redirects public traffic when `/api/maintenance-check` reports active maintenance</p>
              </div>
              <Button
                disabled={saving}
                onClick={() => handleSave(!enabled)}
                className={enabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}
              >
                <Power className="w-4 h-4 mr-1.5" /> {enabled ? 'Disable Maintenance' : 'Enable Maintenance'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Notice Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-100" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Estimated Resume Time</label>
                <Input value={estimatedResumeAt} onChange={(e) => setEstimatedResumeAt(e.target.value)} placeholder="e.g. 02:00 AM IST" className="bg-slate-950 border-slate-800 text-slate-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Public Status Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleSave(enabled)} disabled={saving} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
                <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <h2 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-lime-500" /> Downtime Notification Subscribers ({subscribers.length})
            </h2>
            {subscribers.length === 0 ? (
              <p className="text-xs text-slate-400">No notification subscribers waiting right now.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-200 font-mono">{sub.email}</span>
                    <span className="text-slate-500">{new Date(sub.subscribed_at).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
