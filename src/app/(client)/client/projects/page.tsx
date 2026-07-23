'use client';

import { useState } from 'react';
import { Briefcase, Calendar, ShieldCheck, CheckCircle2, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientProjectsPage() {
  const projects = [
    { id: 'cp1', title: 'FY25-26 Annual Statutory Audit', caName: 'CA Rajesh Sharma', firm: 'Apex Tax & Audit Firm', deadline: '31 Oct 2026', progress: 65, status: 'IN_PROGRESS', cost: '₹2,50,000' },
    { id: 'cp2', title: 'GSTR-9 Annual Return Reconciliation', caName: 'CA Ananya Deshmukh', firm: 'Mehta Consultancy', deadline: '31 Dec 2026', progress: 40, status: 'IN_PROGRESS', cost: '₹85,000' },
    { id: 'cp3', title: 'ITR-2 Annual Tax Return Filing', caName: 'CA Rajesh Sharma', firm: 'Apex Tax & Audit Firm', deadline: '31 Jul 2026', progress: 100, status: 'COMPLETED', cost: '₹15,000' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-lime-600" /> Active Tax & Audit Engagements
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track ongoing CA projects, audit timelines, and service deliverables.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-lime-500/40 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 bg-lime-600/10 px-2 py-0.5 rounded">
                  {p.firm}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">{p.title}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                p.status === 'COMPLETED'
                  ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
              }`}>
                {p.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Completion Milestone</span>
                <span className="text-slate-900 dark:text-white font-bold">{p.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-lime-600 h-2 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Assigned CA</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">{p.caName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Deadline</span>
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-lime-600" /> {p.deadline}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
