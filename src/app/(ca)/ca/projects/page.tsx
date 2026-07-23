'use client';

import { useState } from 'react';
import { Briefcase, Plus, Search, Filter, Calendar, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CAProjectsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const projects = [
    {
      id: 'prj-1',
      title: 'FY25-26 Annual Statutory Audit',
      client: 'TechNova Solutions Pvt Ltd',
      leadCA: 'CA Rajesh Sharma',
      teamSize: 4,
      deadline: '31 Oct 2026',
      progress: 65,
      status: 'IN_PROGRESS',
      budget: '₹2,50,000',
    },
    {
      id: 'prj-2',
      title: 'GSTR-9 Annual Return & Reconciliation',
      client: 'Apex Logistics India LLP',
      leadCA: 'CA Ananya Deshmukh',
      teamSize: 2,
      deadline: '31 Dec 2026',
      progress: 40,
      status: 'IN_PROGRESS',
      budget: '₹85,000',
    },
    {
      id: 'prj-3',
      title: 'Transfer Pricing Documentation & 3CEB',
      client: 'Global Software Tech Inc.',
      leadCA: 'CA Rajesh Sharma',
      teamSize: 3,
      deadline: '30 Nov 2026',
      progress: 90,
      status: 'REVIEW',
      budget: '₹3,20,000',
    },
    {
      id: 'prj-4',
      title: 'Corporate Income Tax Filing (ITR-6)',
      client: 'Mehta Consultancy Services',
      leadCA: 'CA Vikram Rao',
      teamSize: 2,
      deadline: '31 Oct 2026',
      progress: 100,
      status: 'COMPLETED',
      budget: '₹60,000',
    },
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && p.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-lime-600" /> CA Practice Projects & Engagements
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage multi-stage tax audits, corporate filings, and client advisory engagements.</p>
        </div>
        <Button onClick={() => toast.success('New engagement project created!')} className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
          <Plus className="w-4 h-4 mr-1.5" /> Start New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Engagements</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">12 Projects</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Completed This FY</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">28 Projects</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Upcoming Deadlines</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">4 Due Soon</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Contracted Value</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹18.45 Lakhs</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <Input
            placeholder="Search project title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
        <div className="flex gap-2">
          {['ALL', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].map((st) => (
            <Button
              key={st}
              variant={filter === st ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(st)}
              className={`text-xs ${filter === st ? 'bg-lime-600 hover:bg-lime-500 text-white' : ''}`}
            >
              {st.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-lime-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 bg-lime-600/10 px-2 py-0.5 rounded">
                  {p.client}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">{p.title}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                p.status === 'COMPLETED'
                  ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                  : p.status === 'REVIEW'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
              }`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Audit Completion Progress</span>
                <span className="text-slate-900 dark:text-white font-bold">{p.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-lime-600 h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Lead CA</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{p.leadCA}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Deadline</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-lime-600" /> {p.deadline}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Contract Value</span>
                <span className="font-mono font-bold text-lime-600 dark:text-lime-400">{p.budget}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
