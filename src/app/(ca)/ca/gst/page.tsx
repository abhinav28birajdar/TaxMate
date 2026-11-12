'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GstReturnRow {
  id: string;
  type: string;
  client: string;
  gstin: string;
  period: string;
  dueDate: string;
  liability: string;
  status: string;
}

interface GstNoticeItem {
  id: string;
  title: string;
  client: string;
  dueDate: string;
  notes: string;
  status: string;
}

export default function GSTCompliancePage() {
  const [activeTab, setActiveTab] = useState<'returns' | 'notices'>('returns');
  const [returns, setReturns] = useState<GstReturnRow[]>([]);
  const [notices, setNotices] = useState<GstNoticeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGstData = useCallback(async () => {
    try {
      setLoading(true);
      const [gstRes, clientRes, compRes] = await Promise.all([
        fetch('/api/gst', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
        fetch('/api/compliance', { credentials: 'include' }),
      ]);

      const clientList: any[] = clientRes.ok ? (await clientRes.json()).clients || [] : [];
      const clientMap = new Map(clientList.map((c: any) => [c.id, c]));

      if (gstRes.ok) {
        const gJson = await gstRes.json();
        setReturns(
          (gJson.data || []).map((item: any) => {
            const c = item.clientId ? clientMap.get(item.clientId) : null;
            return {
              id: item.id,
              type: String(item.gstrType || 'GSTR_1').replace('_', '-'),
              client: c?.display_name || c?.full_name || 'Client',
              gstin: c?.gstin || 'Unregistered / Individual',
              period: `FY ${item.year || 'Current'} (M${item.month || 1})`,
              dueDate: item.dueDate ? String(item.dueDate).split('T')[0] : 'TBD',
              liability: `₹${Number(item.totalTax || 0).toLocaleString('en-IN')}`,
              status: String(item.status || 'not-started').replace(/-/g, ' ').toUpperCase(),
            };
          })
        );
      }

      if (compRes.ok) {
        const compJson = await compRes.json();
        const noticeRows: GstNoticeItem[] = (compJson.data || [])
          .filter(
            (ci: any) =>
              String(ci.category || '').toLowerCase().includes('notice') ||
              String(ci.compliance_type || '').toLowerCase().includes('gst') ||
              String(ci.title || '').toLowerCase().includes('notice') ||
              String(ci.title || '').toLowerCase().includes('asmt')
          )
          .map((ci: any) => {
            const c = ci.client_id ? clientMap.get(ci.client_id) : null;
            return {
              id: ci.id,
              title: ci.title || ci.compliance_type,
              client: c?.display_name || c?.full_name || 'Client',
              dueDate: ci.due_date ? String(ci.due_date).split('T')[0] : 'TBD',
              notes: ci.description || ci.notes || 'GST compliance item',
              status: String(ci.status || 'pending').toUpperCase(),
            };
          });
        setNotices(noticeRows);
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load GST records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGstData();
  }, [loadGstData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lime-600" /> GST Management Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            GSTR-1, GSTR-3B, GSTR-9 returns tracking and GST compliance / notice items.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadGstData} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Link href="/ca/gst/returns">
            <Button variant="outline" size="sm">
              Filing Tracker
            </Button>
          </Link>
          <Link href="/ca/gst/notices">
            <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
              Analyze GST Notice
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'returns'
              ? 'border-lime-600 text-lime-600 dark:text-lime-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          GST Returns ({returns.length})
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notices'
              ? 'border-lime-600 text-lime-600 dark:text-lime-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          GST Notices & Compliance ({notices.length})
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading GST compliance ledger...
        </div>
      ) : activeTab === 'returns' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {returns.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400 italic space-y-2">
              <p>No GSTR filings logged yet.</p>
              <Link href="/ca/gst/returns" className="text-lime-500 hover:underline inline-block">
                Create a GST Filing in the Tracker →
              </Link>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Return Type</th>
                  <th className="py-3.5 px-4">Client / GSTIN</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Liability Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {ret.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {ret.client}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{ret.gstin}</div>
                    </td>
                    <td className="py-3.5 px-4">{ret.period}</td>
                    <td className="py-3.5 px-4 font-medium">{ret.dueDate}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {ret.liability}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          ret.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}
                      >
                        {ret.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          {notices.length === 0 ? (
            <p className="text-center text-xs text-slate-400 italic py-6">
              No active GST notices or reconciliations flagged.
            </p>
          ) : (
            notices.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">
                    {n.status}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Client: {n.client} | {n.notes}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-red-500 block mb-2">
                    Due: {n.dueDate}
                  </span>
                  <Link href="/ca/ai-assistant">
                    <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold">
                      AI Notice Draft
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
