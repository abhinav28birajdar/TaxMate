'use client';

import { useState } from 'react';
import { FileText, Plus, Send, CheckCircle2, Clock, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CAProposalsPage() {
  const [proposals, setProposals] = useState([
    { id: 'prop_1', client: 'TechNova Solutions Pvt Ltd', title: 'Annual Tax Audit & GST Filing Retainer', value: '₹1,50,000 / yr', status: 'Accepted & Signed', signedDate: '12 Oct 2026' },
    { id: 'prop_2', client: 'Dr. Vikramaditya Rao', title: 'Presumptive Tax 44ADA Return Filing', value: '₹15,000 / yr', status: 'Sent to Client', signedDate: 'Pending' },
    { id: 'prop_3', client: 'Apex Logistics India', title: 'GSTR Reconciliation & Audit Services', value: '₹85,000 / yr', status: 'Draft Proposal', signedDate: 'Draft' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-600" /> Proposals & E-Signature Engagement Letters
          </h1>
          <p className="text-xs text-slate-500 mt-1">Generate professional CA fee proposals and legal service engagement letters with digital signatures.</p>
        </div>
        <Button onClick={() => toast.success('New proposal quotation created!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Create Proposal
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Client Name</th>
              <th className="py-3.5 px-4">Engagement Title</th>
              <th className="py-3.5 px-4">Retainer Value</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Signed Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {proposals.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.client}</td>
                <td className="py-3.5 px-4">{p.title}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-lime-600 dark:text-lime-400">{p.value}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    p.status.includes('Signed')
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{p.signedDate}</td>
                <td className="py-3.5 px-4 text-right">
                  <Button size="sm" variant="ghost" onClick={() => toast.info(`Downloading proposal PDF for ${p.client}`)} className="text-xs">
                    <Download className="w-3.5 h-3.5 mr-1 text-lime-600" /> PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
