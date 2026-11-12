'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Plus, Send, Download, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ProposalRow {
  id: string;
  client_name: string;
  title: string;
  scope?: string;
  retainer_amount: number;
  billing_frequency: string;
  status: string;
  signed_at?: string | null;
  created_at: string;
}

function downloadProposalDocument(p: ProposalRow) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Proposal - ${p.title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:24px;color:#111}
.header{border-bottom:2px solid #65a30d;padding-bottom:14px;margin-bottom:20px}</style></head>
<body>
<div class="header">
<strong>TaxMate Chartered Accountancy Engagement Letter</strong>
<h1>${p.title}</h1>
<p><strong>Client:</strong> ${p.client_name} | <strong>Status:</strong> ${p.status.toUpperCase()}</p>
</div>
<h3>Scope of Engagement</h3>
<p>${p.scope || 'Comprehensive tax advisory, return filing, and statutory compliance.'}</p>
<h3>Professional Retainer Fee</h3>
<p><strong>Rs. ${Number(p.retainer_amount || 0).toLocaleString('en-IN')} / ${p.billing_frequency}</strong></p>
<p>Generated on ${new Date(p.created_at).toLocaleDateString('en-IN')}</p>
</body></html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Proposal_${p.id.slice(0, 8)}.html`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Downloaded proposal document for ${p.client_name}`);
}

export default function CAProposalsPage() {
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [title, setTitle] = useState('');
  const [retainerAmount, setRetainerAmount] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('annual');
  const [scope, setScope] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [propRes, clientRes] = await Promise.all([
        fetch('/api/proposals', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);

      if (propRes.ok) {
        const pJson = await propRes.json();
        setProposals(pJson.proposals || []);
      }

      if (clientRes.ok) {
        const cJson = await clientRes.json();
        const cList = cJson.clients || [];
        setClients(cList);
        if (cList.length > 0 && !selectedClientId) {
          setSelectedClientId(cList[0].id);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load proposals');
    } finally {
      setLoading(false);
    }
  }, [selectedClientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedClient = clients.find((c) => c.id === selectedClientId);
    const resolvedName =
      matchedClient?.display_name || matchedClient?.full_name || customClientName.trim();

    if (!title.trim() || !resolvedName) {
      toast.error('Proposal title and client name are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          clientId: matchedClient?.id || null,
          clientName: resolvedName,
          clientEmail: matchedClient?.email || null,
          title: title.trim(),
          scope: scope.trim(),
          retainerAmount: Number(retainerAmount || 0),
          billingFrequency,
          status: 'sent',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not create proposal');
      }

      toast.success('Proposal created & sent to client!');
      setTitle('');
      setRetainerAmount('');
      setScope('');
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Proposal creation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/proposals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, status }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed');
      toast.success(`Proposal marked as ${status.toUpperCase()}`);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Could not update proposal');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-600" /> Proposals & E-Signature Engagement Letters
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate CA fee proposals and client engagement letters backed by PostgreSQL.
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
            <Plus className="w-4 h-4 mr-1.5" /> Create Proposal
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Engagement Title</th>
              <th className="py-3.5 px-4">Retainer Value</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Signed / Updated</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400">
                  Loading proposals...
                </td>
              </tr>
            ) : proposals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 italic">
                  No proposals created yet. Click &ldquo;Create Proposal&rdquo; to issue an engagement letter.
                </td>
              </tr>
            ) : (
              proposals.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {p.client_name}
                  </td>
                  <td className="py-3.5 px-4">{p.title}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-lime-600 dark:text-lime-400">
                    ₹{Number(p.retainer_amount || 0).toLocaleString('en-IN')} / {p.billing_frequency}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                        p.status === 'accepted' || p.status === 'signed'
                          ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {p.signed_at
                      ? new Date(p.signed_at).toLocaleDateString('en-IN')
                      : new Date(p.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right flex justify-end gap-1">
                    {p.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(p.id, 'sent')}
                        className="text-xs text-lime-500"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" /> Send
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadProposalDocument(p)}
                      className="text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-lime-600" /> Letter
                    </Button>
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
              <h3 className="font-bold text-base">Create Engagement Proposal</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300">Client</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name || c.full_name}
                    </option>
                  ))}
                  <option value="">Other / Prospective Client</option>
                </select>
              </div>
              {!selectedClientId && (
                <div>
                  <label className="block mb-1 text-slate-300">Prospective Client Name *</label>
                  <Input
                    required
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    placeholder="Client / Firm Name"
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              )}
              <div>
                <label className="block mb-1 text-slate-300">Proposal Title *</label>
                <Input
                  required
                  placeholder="E.g. Annual Tax Audit & GST Filing Retainer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300">Retainer Amount (₹) *</label>
                  <Input
                    type="number"
                    min="0"
                    required
                    placeholder="e.g. 50000"
                    value={retainerAmount}
                    onChange={(e) => setRetainerAmount(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Billing Cycle</label>
                  <select
                    value={billingFrequency}
                    onChange={(e) => setBillingFrequency(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="annual">Annual</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="monthly">Monthly</option>
                    <option value="one-time">One-Time</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Scope & Deliverables</label>
                <textarea
                  rows={3}
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Specify returns covered, turnaround SLA, and deliverables..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-lime-600 hover:bg-lime-500 text-white font-semibold"
                >
                  {submitting ? 'Sending...' : 'Create & Send Proposal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
