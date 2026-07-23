'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, FileSpreadsheet, AlertCircle, ArrowUpRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GSTCompliancePage() {
  const [activeTab, setActiveTab] = useState<'returns' | 'notices'>('returns');

  const returns = [
    { id: 'g1', type: 'GSTR-1', period: 'September 2026', client: 'TechNova Solutions', gstin: '27AAACT1234F1Z5', dueDate: '11 Oct 2026', status: 'Filed', liability: '₹45,200' },
    { id: 'g2', type: 'GSTR-3B', period: 'September 2026', client: 'TechNova Solutions', gstin: '27AAACT1234F1Z5', dueDate: '20 Oct 2026', status: 'Pending', liability: '₹82,400' },
    { id: 'g3', type: 'GSTR-3B', period: 'September 2026', client: 'Apex Logistics', gstin: '27BBBCA5678G2Z1', dueDate: '20 Oct 2026', status: 'Pending', liability: '₹1,24,000' },
  ];

  const notices = [
    { id: 'n1', noticeNo: 'DIN/2026/GSTR3B/8821', type: 'ASMT-10 Mismatch', client: 'TechNova Solutions', noticeDate: '01 Oct 2026', responseDue: '15 Oct 2026', amountDemanded: '₹34,500', status: 'Open' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-lime-600" /> GST Management Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">GSTR-1, GSTR-3B, GSTR-9 returns tracking and GST Notice analysis.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/ca/gst/returns">
            <Button variant="outline" size="sm">Filing Tracker</Button>
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
          GST Returns (GSTR-1 / 3B / 9)
        </button>
        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'notices'
              ? 'border-lime-600 text-lime-600 dark:text-lime-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          GST Notices & Show Cause
        </button>
      </div>

      {activeTab === 'returns' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
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
                <tr key={ret.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{ret.type}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{ret.client}</div>
                    <div className="font-mono text-[10px] text-slate-400">{ret.gstin}</div>
                  </td>
                  <td className="py-3.5 px-4">{ret.period}</td>
                  <td className="py-3.5 px-4 font-medium">{ret.dueDate}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{ret.liability}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ret.status === 'Filed'
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
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
          {notices.map((n) => (
            <div key={n.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">{n.type}</span>
                <h4 className="font-bold text-slate-900 dark:text-white">{n.noticeNo}</h4>
                <p className="text-xs text-slate-500 mt-1">Client: {n.client} | Demanded Amount: {n.amountDemanded}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-red-500 block mb-2">Response Due: {n.responseDue}</span>
                <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold">
                  AI Notice Draft
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
