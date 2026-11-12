'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Plus, Send, CheckCircle2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DocRequestRow {
  id: string;
  clientId?: string | null;
  portalUserId?: string | null;
  client: string;
  docType: string;
  deadline: string;
  status: string;
  priority: string;
}

export default function CADocumentRequestsPage() {
  const [requests, setRequests] = useState<DocRequestRow[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [docType, setDocType] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, clientsRes] = await Promise.all([
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);

      const clientList: any[] = clientsRes.ok ? (await clientsRes.json()).clients || [] : [];
      setClients(clientList);
      if (clientList.length > 0 && !selectedClientId) {
        setSelectedClientId(clientList[0].id);
      }

      const clientMap = new Map(clientList.map((c: any) => [c.id, c]));
      if (tasksRes.ok) {
        const tJson = await tasksRes.json();
        const docTasks: DocRequestRow[] = (tJson.tasks || [])
          .filter(
            (t: any) =>
              t.task_type === 'DOCUMENT_REQUEST' ||
              t.metadata?.isDocumentRequest === true ||
              String(t.title || '').toLowerCase().includes('document') ||
              String(t.title || '').toLowerCase().includes('statement') ||
              String(t.title || '').toLowerCase().includes('form 16')
          )
          .map((t: any) => {
            const c = t.client_id ? clientMap.get(t.client_id) : null;
            return {
              id: t.id,
              clientId: t.client_id,
              portalUserId: c?.portal_user_id || t.client_id || null,
              client: t.client_name || c?.display_name || c?.full_name || 'Client',
              docType: t.title,
              deadline: t.due_date ? String(t.due_date).split('T')[0] : 'Flexible',
              status:
                t.status === 'COMPLETED'
                  ? 'Verified'
                  : t.status === 'IN_REVIEW'
                    ? 'Uploaded (Review)'
                    : 'Pending Upload',
              priority: String(t.priority || 'MEDIUM').toUpperCase(),
            };
          });
        setRequests(docTasks);
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load document requests');
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !docType.trim()) {
      toast.error('Please pick a client and enter the requested document name.');
      return;
    }

    setSubmitting(true);
    try {
      const targetClient = clients.find((c) => c.id === selectedClientId);
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: selectedClientId,
          title: docType.trim(),
          description: `CA requested client upload: ${docType.trim()}`,
          taskType: 'DOCUMENT_REQUEST',
          priority,
          dueDate: deadline,
          metadata: { isDocumentRequest: true },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Could not create document request');
      }

      if (targetClient?.portal_user_id) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            targetUserId: targetClient.portal_user_id,
            title: 'Document Upload Requested',
            message: `Your CA requested "${docType.trim()}" by ${deadline}. Please upload via Vault.`,
            type: 'DOCUMENT_REQUESTED',
          }),
        }).catch(() => {});
      }

      toast.success('Document request issued & client notified!');
      setDocType('');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create document request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemind = async (reqRow: DocRequestRow) => {
    try {
      if (!reqRow.portalUserId) {
        toast.info('This client has not linked a portal user account yet.');
        return;
      }
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetUserId: reqRow.portalUserId,
          title: 'Document Upload Reminder',
          message: `Reminder: Please upload "${reqRow.docType}" (Due: ${reqRow.deadline}).`,
          type: 'DOCUMENT_REQUESTED',
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to send reminder');
      }
      toast.success(`Reminder notification sent to ${reqRow.client}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not send reminder');
    }
  };

  const handleMarkVerified = async (reqId: string) => {
    try {
      const res = await fetch(`/api/tasks/${encodeURIComponent(reqId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Document request marked as Verified');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Could not update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-600" /> CA Client Document Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue document collection requests with deadline reminders and instant client notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Request Document
          </Button>
        </div>
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
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Loading document requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                  No active document requests yet. Click &ldquo;Request Document&rdquo; to prompt a client.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {r.client}
                  </td>
                  <td className="py-3.5 px-4">{r.docType}</td>
                  <td className="py-3.5 px-4">{r.deadline}</td>
                  <td className="py-3.5 px-4 font-bold text-lime-600 dark:text-lime-400">
                    {r.priority}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        r.status.includes('Verified')
                          ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right flex justify-end gap-1">
                    {r.status !== 'Verified' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemind(r)}
                          className="text-xs"
                        >
                          <Send className="w-3.5 h-3.5 mr-1 text-lime-600" /> Remind
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkVerified(r.id)}
                          className="text-xs text-emerald-500"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Request Client Document</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300">Client *</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  {clients.length === 0 ? (
                    <option value="">No clients available</option>
                  ) : (
                    clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.display_name || c.full_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Requested Document *</label>
                <Input
                  required
                  placeholder="E.g. Form 16 Part A & B (FY 2025-26)"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300">Due Date</label>
                  <Input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !selectedClientId}
                  className="bg-lime-600 hover:bg-lime-500 text-white font-semibold"
                >
                  {submitting ? 'Sending...' : 'Issue Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
