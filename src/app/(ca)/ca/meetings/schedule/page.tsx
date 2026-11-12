'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ClientOption {
  id: string;
  name: string;
}

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    duration: '45',
    type: 'VIDEO_CALL' as 'VIDEO_CALL' | 'IN_PERSON' | 'PHONE_CALL',
    notes: '',
  });

  useEffect(() => {
    (async () => {
      try {
        setLoadingClients(true);
        const res = await fetch('/api/clients?take=100', { credentials: 'include' });
        const json = await res.json();
        if (res.ok && json.clients) {
          const list: ClientOption[] = json.clients.map((c: any) => ({
            id: c.id,
            name: c.display_name || c.full_name || c.email || 'Client',
          }));
          setClients(list);
          if (list.length > 0) {
            setFormData((prev) => ({ ...prev, clientId: list[0].id }));
          }
        }
      } catch {
        // Handled cleanly in empty state
      } finally {
        setLoadingClients(false);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientId || !formData.date || !formData.time) {
      toast.error('Please fill in topic, client, date, and time');
      return;
    }

    const startTime = new Date(`${formData.date}T${formData.time}:00`);
    if (Number.isNaN(startTime.getTime())) {
      toast.error('Invalid date or time selected');
      return;
    }
    const durationMins = parseInt(formData.duration, 10) || 45;
    const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

    setSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: formData.clientId,
          title: formData.title.trim(),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          type: formData.type,
          notes: formData.notes.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Could not schedule meeting');
      }

      toast.success('Consultation meeting scheduled and client notified!');
      router.push('/ca/appointments');
    } catch (err: any) {
      toast.error(err.message || 'Meeting scheduling failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="border-slate-800 bg-slate-900 text-slate-300"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Schedule Consultation Meeting</h1>
          <p className="text-sm text-slate-400">
            Set up a video, phone, or in-person consultation session with a client
          </p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Meeting Topic / Title *</Label>
            <Input
              required
              minLength={3}
              placeholder="e.g. Q2 GST Return Discussion & Tax Planning"
              className="bg-slate-950 border-slate-800 text-slate-100"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Select Client *</Label>
            {loadingClients ? (
              <div className="h-10 flex items-center text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" /> Loading clients...
              </div>
            ) : (
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm"
              >
                {clients.length === 0 ? (
                  <option value="">No clients available (add a client first)</option>
                ) : (
                  clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Date *</Label>
              <Input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Time *</Label>
              <Input
                type="time"
                required
                className="bg-slate-950 border-slate-800 text-slate-100"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Duration</Label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm"
              >
                <option value="30">30 Mins</option>
                <option value="45">45 Mins</option>
                <option value="60">60 Mins</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Meeting Platform</Label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-100 text-sm"
            >
              <option value="VIDEO_CALL">Live Video Conference</option>
              <option value="PHONE_CALL">Telephonic Review</option>
              <option value="IN_PERSON">In-Person at Office</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Meeting Agenda / Notes</Label>
            <Textarea
              placeholder="Add key agenda items or document requirements..."
              className="bg-slate-950 border-slate-800 text-slate-100 min-h-[90px]"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              className="border-slate-800 text-slate-300"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.clientId}
              className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Scheduling...' : 'Send Meeting Invite'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
