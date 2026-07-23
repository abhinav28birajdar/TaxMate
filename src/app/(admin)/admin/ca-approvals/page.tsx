'use client';

import { useState } from 'react';
import { ShieldCheck, Check, X, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CAApprovalsPage() {
  const [approvals, setApprovals] = useState([
    { id: 'app_1', name: 'CA Ramesh Shah', firm: 'Ramesh Shah & Co', membership: 'ICAI-148920', exp: '8 Years', pan: 'ABCPS1234F', status: 'Pending' },
    { id: 'app_2', name: 'CA Sneha Verma', firm: 'Verma Taxation Services', membership: 'ICAI-204192', exp: '5 Years', pan: 'BKPV9876K', status: 'Pending' },
  ]);

  const handleApprove = (id: string, name: string) => {
    setApprovals(approvals.filter((a) => a.id !== id));
    toast.success(`${name} verified & approved!`);
  };

  const handleReject = (id: string, name: string) => {
    setApprovals(approvals.filter((a) => a.id !== id));
    toast.error(`${name} application rejected`);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-400" /> CA Verification & Approvals
        </h1>
        <p className="text-xs text-slate-400 mt-1">Review ICAI membership certificates, PAN verification, and grant CA access.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-200 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Applicant Name</th>
              <th className="py-3.5 px-4">Firm Name</th>
              <th className="py-3.5 px-4">ICAI Reg #</th>
              <th className="py-3.5 px-4">PAN</th>
              <th className="py-3.5 px-4">Experience</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {approvals.map((app) => (
              <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">{app.name}</td>
                <td className="py-3.5 px-4">{app.firm}</td>
                <td className="py-3.5 px-4 font-mono font-bold text-lime-400">{app.membership}</td>
                <td className="py-3.5 px-4 font-mono">{app.pan}</td>
                <td className="py-3.5 px-4">{app.exp}</td>
                <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                  <Button size="sm" variant="outline" className="text-xs border-slate-700 text-slate-300">
                    <Eye className="w-3.5 h-3.5 mr-1" /> View ICAI Cert
                  </Button>
                  <Button size="sm" onClick={() => handleApprove(app.id, app.name)} className="bg-lime-600 hover:bg-lime-500 text-white text-xs">
                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" onClick={() => handleReject(app.id, app.name)} variant="destructive" className="text-xs">
                    <X className="w-3.5 h-3.5" />
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
