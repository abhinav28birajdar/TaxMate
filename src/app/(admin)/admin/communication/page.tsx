'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface InquiryItem {
  id: string;
  inquiry_type: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
}

export default function AdminCommunicationPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=communication', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load inquiries');
      setInquiries(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load communications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Provide notification title and message.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          section: 'broadcast',
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          targetRole,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Broadcast failed');
      setBroadcastTitle('');
      setBroadcastMessage('');
      toast.success(`Notification broadcast delivered to ${json.deliveredCount || 0} accounts.`);
    } catch (err: any) {
      toast.error(err?.message || 'Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  const handleResolveInquiry = async (id: string) => {
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section: 'communication', id, status: 'resolved' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to update inquiry');
      toast.success('Inquiry marked as resolved');
      await loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-lime-500" /> Communications &amp; Inbound Enquiries
          </h1>
          <p className="text-sm text-slate-400">Broadcast system notifications and manage sales/contact submissions</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-100 text-sm">Send Platform Notification Broadcast</h2>
        <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <Input
            placeholder="Alert title (e.g. GSTR-3B Reminder)"
            value={broadcastTitle}
            onChange={(e) => setBroadcastTitle(e.target.value)}
            className="bg-slate-950 border-slate-800 text-slate-100"
          />
          <Input
            placeholder="Message body..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="md:col-span-2 bg-slate-950 border-slate-800 text-slate-100"
          />
          <div className="flex gap-2">
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs">
              <option value="ALL">All Users</option>
              <option value="CA">CAs Only</option>
              <option value="CLIENT">Clients Only</option>
            </select>
            <Button type="submit" disabled={sending} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold shrink-0">
              <Send className="w-4 h-4 mr-1" /> {sending ? 'Sending...' : 'Broadcast'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <h2 className="font-semibold text-slate-100 text-sm">Inbound Contact &amp; Sales Enquiries ({inquiries.length})</h2>
        {loading ? (
          <div className="py-12 flex justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading enquiries...
          </div>
        ) : inquiries.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No inbound contact or sales enquiries yet.</p>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div key={inq.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100 text-sm">{inq.subject || `${inq.inquiry_type.toUpperCase()} Enquiry`}</span>
                    <Badge className="bg-slate-800 text-lime-400 border-slate-700 text-[10px]">{inq.inquiry_type}</Badge>
                    <Badge className={inq.status === 'resolved' ? 'bg-lime-600/20 text-lime-400 text-[10px]' : 'bg-amber-500/20 text-amber-400 text-[10px]'}>
                      {inq.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">{inq.message}</p>
                  <p className="text-[11px] text-slate-500">
                    From: {inq.name} ({inq.email}) • {new Date(inq.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
                {inq.status !== 'resolved' && (
                  <Button size="sm" variant="outline" onClick={() => handleResolveInquiry(inq.id)} className="border-lime-500/30 text-lime-400 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Resolved
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
