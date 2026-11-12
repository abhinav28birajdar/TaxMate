'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  User,
  FileText,
  Receipt,
  CheckSquare,
  ShieldCheck,
  ArrowLeft,
  Plus,
  Download,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CAClientWorkspacePage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id || '';
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    'profile' | 'returns' | 'documents' | 'invoices' | 'tasks'
  >('profile');
  const [client, setClient] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [returns, setReturns] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReqModal, setShowReqModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqDate, setReqDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [submittingReq, setSubmittingReq] = useState(false);

  const loadWorkspace = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      setError(null);

      const [cRes, dRes, itrRes, gstRes, invRes, taskRes] = await Promise.all([
        fetch(`/api/clients/${encodeURIComponent(clientId)}`, { credentials: 'include' }),
        fetch(`/api/documents?clientId=${encodeURIComponent(clientId)}&take=50`, {
          credentials: 'include',
        }),
        fetch(`/api/itr?clientId=${encodeURIComponent(clientId)}`, { credentials: 'include' }),
        fetch(`/api/gst?clientId=${encodeURIComponent(clientId)}`, { credentials: 'include' }),
        fetch('/api/invoices?take=100', { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
      ]);

      const cJson = await cRes.json();
      if (!cRes.ok || !cJson || cJson.error) {
        throw new Error(cJson.error || 'Client not found');
      }
      setClient(cJson);

      if (dRes.ok) {
        const dJson = await dRes.json();
        setDocuments(dJson.documents || []);
      }

      const combinedReturns: any[] = [];
      if (itrRes.ok) {
        const itrJson = await itrRes.json();
        for (const r of itrJson.data || []) {
          combinedReturns.push({
            id: r.id,
            type: `${r.itr_type || 'ITR'} Return`,
            period: `AY ${r.assessment_year || 'N/A'}`,
            dueDate: r.due_date ? String(r.due_date).split('T')[0] : 'TBD',
            amount: Number(r.tax_payable || r.total_income || 0),
            status: String(r.status || 'DRAFT').toUpperCase(),
          });
        }
      }
      if (gstRes.ok) {
        const gstJson = await gstRes.json();
        for (const g of gstJson.data || []) {
          combinedReturns.push({
            id: g.id,
            type: g.gstrType || 'GST Return',
            period: `FY ${g.year || 'N/A'}`,
            dueDate: g.dueDate ? String(g.dueDate).split('T')[0] : 'TBD',
            amount: Number(g.totalTax || 0),
            status: String(g.status || 'pending').toUpperCase(),
          });
        }
      }
      setReturns(combinedReturns);

      if (invRes.ok) {
        const invJson = await invRes.json();
        const matchIds = new Set([cJson.id, cJson.portal_user_id].filter(Boolean));
        setInvoices(
          (invJson.invoices || []).filter((inv: any) => matchIds.has(inv.client_id))
        );
      }

      if (taskRes.ok) {
        const tJson = await taskRes.json();
        const matchIds = new Set([cJson.id, cJson.portal_user_id].filter(Boolean));
        setTasks((tJson.tasks || []).filter((t: any) => matchIds.has(t.client_id)));
      }
    } catch (err: any) {
      setError(err.message || 'Could not load client workspace');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleDownloadDoc = async (docId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(docId)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.signedUrl) throw new Error(json.error || 'Download link unavailable');
      const a = document.createElement('a');
      a.href = json.signedUrl;
      a.download = fileName;
      a.target = '_blank';
      a.click();
    } catch (err: any) {
      toast.error(err.message || 'Download failed');
    }
  };

  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !reqTitle.trim()) return;

    setSubmittingReq(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: client.id,
          title: reqTitle.trim(),
          description: `CA document upload request for ${client.display_name || client.full_name}`,
          taskType: 'DOCUMENT_REQUEST',
          priority: 'HIGH',
          dueDate: reqDate,
          metadata: { isDocumentRequest: true },
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to issue request');
      }

      if (client.portal_user_id) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            targetUserId: client.portal_user_id,
            title: 'Document Upload Requested',
            message: `Your CA requested "${reqTitle.trim()}" (Due: ${reqDate}).`,
            type: 'DOCUMENT_REQUESTED',
          }),
        }).catch(() => {});
      }

      toast.success('Document request sent & added to client tasks!');
      setReqTitle('');
      setShowReqModal(false);
      await loadWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Could not send document request');
    } finally {
      setSubmittingReq(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading client workspace...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/ca/clients')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> All Clients
        </Button>
        <div className="p-8 bg-slate-900 border border-rose-500/30 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-white font-semibold">{error || 'Client record not found'}</p>
        </div>
      </div>
    );
  }

  const displayName = client.display_name || client.full_name || 'Client';

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-lime-900/40 via-slate-900 to-slate-900 border border-lime-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-600 flex items-center justify-center font-bold text-white shadow-md shadow-lime-600/30">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">{displayName}</h2>
              <span className="px-2 py-0.5 bg-lime-600/20 text-lime-400 border border-lime-500/30 text-[10px] font-bold rounded uppercase">
                {client.status || 'Active'}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              PAN: {client.pan || 'Not Provided'} | GSTIN: {client.gstin || 'Not Registered'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/ca/clients')}
            className="border-slate-700 text-slate-300 text-xs"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> All Clients
          </Button>
          <Button
            size="sm"
            onClick={() => setShowReqModal(true)}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20"
          >
            <Plus className="w-4 h-4 mr-1" /> Request Document
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { key: 'profile', label: 'Client Profile & Tax Details', icon: User },
          { key: 'returns', label: `Tax Returns (${returns.length})`, icon: ShieldCheck },
          { key: 'documents', label: `Documents (${documents.length})`, icon: FileText },
          { key: 'invoices', label: `Invoices (${invoices.length})`, icon: Receipt },
          { key: 'tasks', label: `Assigned Tasks (${tasks.length})`, icon: CheckSquare },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === tab.key
                ? 'border-lime-600 text-lime-600 dark:text-lime-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              Entity & Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Legal Name</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {client.full_name}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Entity Type</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">
                  {client.client_type || 'Individual'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Email Address</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {client.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Phone Number</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {client.phone || 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              Tax Registration Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">PAN Number</span>
                <span className="font-mono font-bold text-lime-600 dark:text-lime-400">
                  {client.pan || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">GSTIN</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {client.gstin || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Aadhaar / TAN</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {client.tan || client.aadhaar || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Risk Tier</span>
                <span className="font-semibold text-slate-900 dark:text-white uppercase">
                  {client.risk_level || 'LOW'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {returns.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 italic">
              No ITR or GST filings linked to this client yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Filing Type</th>
                  <th className="py-3.5 px-4">Period / AY</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Tax Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {r.type}
                    </td>
                    <td className="py-3.5 px-4">{r.period}</td>
                    <td className="py-3.5 px-4">{r.dueDate}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ₹{Number(r.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/10 text-lime-600 border border-lime-600/20">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Client Document Files
            </h3>
            <Button
              size="sm"
              onClick={() => setShowReqModal(true)}
              className="bg-lime-600 hover:bg-lime-500 text-white font-semibold"
            >
              <Plus className="w-4 h-4 mr-1" /> Request New File
            </Button>
          </div>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No documents uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {documents.map((d) => (
                <div
                  key={d.id}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-lime-600" />
                    <div>
                      <Link
                        href={`/ca/documents/${d.id}`}
                        className="font-bold text-slate-900 dark:text-white hover:underline"
                      >
                        {d.file_name || d.name}
                      </Link>
                      <div className="text-slate-400 text-[10px]">
                        {new Date(d.created_at).toLocaleDateString('en-IN')} •{' '}
                        {d.category || d.document_type || 'General'}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadDoc(d.id, d.file_name || d.name || 'document')}
                    className="text-lime-600"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
          {invoices.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No invoices billed to this client yet.</p>
          ) : (
            invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs hover:border-lime-500/40"
              >
                <div>
                  <span className="font-mono font-bold text-lime-500">{inv.invoice_number}</span>
                  <p className="text-slate-400">{inv.description || 'Advisory Service'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">
                    ₹{Number(inv.total_amount ?? inv.amount ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] uppercase text-slate-400">{inv.status}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No tasks created for this client yet.</p>
          ) : (
            tasks.map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs hover:border-lime-500/40"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{t.title}</span>
                  <span className="text-[10px] text-slate-400 block">
                    Due: {t.due_date ? String(t.due_date).split('T')[0] : 'Flexible'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-lime-400">
                  {String(t.status || 'TODO').replace(/_/g, ' ')}
                </span>
              </Link>
            ))
          )}
        </div>
      )}

      {showReqModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Request Document from {displayName}</h3>
              <button onClick={() => setShowReqModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRequestDocument} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300">Document Needed *</label>
                <Input
                  required
                  placeholder="E.g. Form 26AS & AIS JSON"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Due Date</label>
                <Input
                  type="date"
                  required
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowReqModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReq}
                  className="bg-lime-600 hover:bg-lime-500 text-white"
                >
                  {submittingReq ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
