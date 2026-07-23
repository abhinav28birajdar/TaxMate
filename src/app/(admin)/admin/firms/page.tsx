'use client';

import { Building2, Search, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminFirmsPage() {
  const firms = [
    { id: 'f1', name: 'Apex Tax & Audit Firm', slug: 'apex-tax', plan: 'Pro Tier (Yearly)', caCount: 8, clientsCount: 142, status: 'Verified & Active' },
    { id: 'f2', name: 'Mehta Consultancy Services', slug: 'mehta-consultancy', plan: 'Starter Plan', caCount: 3, clientsCount: 45, status: 'Verified & Active' },
    { id: 'f3', name: 'Kumar & Associates CAs', slug: 'kumar-associates', plan: 'Enterprise Firm', caCount: 15, clientsCount: 320, status: 'Verified & Active' },
  ];

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building2 className="w-6 h-6 text-lime-400" /> CA Firms Directory & Tenants
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage multi-tenant CA firms, custom domain branding, employee seats, and subscription quotas.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-200 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Firm Name</th>
              <th className="py-3.5 px-4">Tenant Slug</th>
              <th className="py-3.5 px-4">Subscription Plan</th>
              <th className="py-3.5 px-4">CAs / Staff</th>
              <th className="py-3.5 px-4">Active Clients</th>
              <th className="py-3.5 px-4">Verification Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {firms.map((f) => (
              <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-lime-400" />
                  {f.name}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">/{f.slug}</td>
                <td className="py-3.5 px-4 font-semibold text-lime-400">{f.plan}</td>
                <td className="py-3.5 px-4">{f.caCount} CAs</td>
                <td className="py-3.5 px-4 font-semibold text-white">{f.clientsCount} Clients</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-400 border border-lime-500/30">
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
