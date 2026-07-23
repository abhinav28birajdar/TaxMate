'use client';

import { useState } from 'react';
import { Briefcase, Plus, Edit2, Trash2, CheckCircle2, ShieldCheck, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function CAServicesPage() {
  const [services, setServices] = useState([
    { id: 'srv-1', title: 'GSTR-1 & 3B Filing Retainer', category: 'GST Services', price: '₹3,500 / month', turnaround: '3 Days', active: true },
    { id: 'srv-2', title: 'Individual ITR-1 / ITR-2 Return Filing', category: 'Income Tax', price: '₹2,500 per return', turnaround: '24 Hours', active: true },
    { id: 'srv-3', title: 'Corporate Tax Audit (Sec 44AB)', category: 'Audit & Assurance', price: '₹45,000 / year', turnaround: '7 Days', active: true },
    { id: 'srv-4', title: 'Pvt Ltd Company Incorporation & PAN/TAN', category: 'Company Law', price: '₹12,000 one-time', turnaround: '5 Days', active: true },
    { id: 'srv-5', title: 'Transfer Pricing & 3CEB Certification', category: 'International Tax', price: '₹85,000 / year', turnaround: '10 Days', active: true },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-lime-600" /> Services Catalogue & Fee Structure
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure service offerings, retainers, hourly consultation rates, and public marketplace listings.</p>
        </div>
        <Button onClick={() => toast.success('New service package created!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Add Service Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((s) => (
          <div key={s.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-lime-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 bg-lime-600/10 px-2 py-0.5 rounded">
                  {s.category}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">{s.title}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30">
                Active Listing
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Standard Fee Rate</span>
                <span className="font-mono font-extrabold text-slate-900 dark:text-white text-sm">{s.price}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Guaranteed SLA</span>
                <span className="font-semibold text-slate-900 dark:text-white">{s.turnaround}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => toast.info(`Editing ${s.title}`)}>
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
