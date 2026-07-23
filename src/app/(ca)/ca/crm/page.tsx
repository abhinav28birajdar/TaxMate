'use client';

import { useState } from 'react';
import { Users, Search, Tag, Filter, Phone, Mail, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CACRMPage() {
  const [clients, setClients] = useState([
    { id: 'c1', name: 'TechNova Solutions Pvt Ltd', type: 'Corporate VIP', email: 'accounts@technova.com', phone: '+91 98765 43210', returnsFiled: 14, tag: 'High Net Worth' },
    { id: 'c2', name: 'Dr. Vikramaditya Rao', type: 'Individual Doctor', email: 'dr.rao@clinic.in', phone: '+91 98123 45678', returnsFiled: 6, tag: 'Professional 44ADA' },
    { id: 'c3', name: 'Apex Logistics India', type: 'LLP Business', email: 'finance@apexlogistics.in', phone: '+91 99887 76655', returnsFiled: 22, tag: 'GST Monthly' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-lime-600" /> CA Client Relationship CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">360° Client profile view, family relationships, tax history, and communication logs.</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Add Client Contact
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3">
        <Input placeholder="Search client name, PAN, phone or tags..." className="text-xs" />
        <Button variant="outline" size="sm" className="text-xs">
          <Filter className="w-4 h-4 mr-1" /> Filter Tags
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {clients.map((c) => (
          <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-lime-500 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h3>
                <span className="text-[11px] text-slate-400">{c.type}</span>
              </div>
              <span className="px-2 py-0.5 bg-lime-600/20 text-lime-600 dark:text-lime-400 text-[10px] font-bold rounded-full">
                {c.tag}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">{c.returnsFiled} Filings Completed</span>
              <Button size="sm" variant="ghost" className="text-lime-600 font-bold text-xs">
                View 360° CRM Profile
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
