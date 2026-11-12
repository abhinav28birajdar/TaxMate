'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Calendar, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProjectSummary {
  id: string;
  title: string;
  caseNumber?: string;
  caseType: string;
  status: string;
  deadline: string;
  caName: string;
  firm: string;
  progress: number;
  cost: string;
}

function progressFromStatus(status: string): number {
  const upper = String(status || '').toUpperCase();
  if (upper === 'COMPLETED') return 100;
  if (upper === 'FILED') return 85;
  if (upper === 'IN_PROGRESS' || upper === 'OPEN') return 50;
  return 20;
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [casesRes, tasksRes, caRes] = await Promise.all([
        fetch('/api/cases?limit=50', { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/ca-requests', { credentials: 'include' }).catch(() => null),
      ]);

      const casesJson = casesRes.ok ? await casesRes.json() : {};
      const tasksJson = tasksRes.ok ? await tasksRes.json() : {};
      const caJson = caRes && caRes.ok ? await caRes.json() : {};

      const rawCases: any[] = casesJson.data?.cases || [];
      const rawTasks: any[] = tasksJson.tasks || [];
      const relationships: any[] = caJson.relationships || [];

      const relMap = new Map<string, { caName: string; firm: string }>();
      for (const rel of relationships) {
        if (rel.ca_id && rel.ca) {
          relMap.set(rel.ca_id, {
            caName: rel.ca.name || 'Assigned CA',
            firm: rel.ca.firm_name || 'Chartered Accountancy Firm',
          });
        }
      }

      const tasksByCase = new Map<string, any[]>();
      for (const t of rawTasks) {
        const cid = t.metadata?.case_id || t.case_id;
        if (cid) {
          const arr = tasksByCase.get(cid) || [];
          arr.push(t);
          tasksByCase.set(cid, arr);
        }
      }

      const mapped: ProjectSummary[] = rawCases.map((c) => {
        const linkedTasks = tasksByCase.get(c.id) || [];
        const completedCount = linkedTasks.filter(
          (t) => String(t.status || '').toUpperCase() === 'COMPLETED'
        ).length;
        const progress =
          linkedTasks.length > 0
            ? Math.round((completedCount / linkedTasks.length) * 100)
            : progressFromStatus(c.status);

        const caInfo = relMap.get(c.caId) || {
          caName: 'Assigned CA Advisor',
          firm: c.caseType || 'TaxMate Advisory',
        };

        return {
          id: c.id,
          title: c.title,
          caseNumber: c.caseNumber,
          caseType: c.caseType || 'Tax & Audit',
          status: String(c.status || 'PENDING').toUpperCase(),
          deadline: c.deadline ? new Date(c.deadline).toLocaleDateString('en-IN') : 'Flexible',
          caName: caInfo.caName,
          firm: caInfo.firm,
          progress,
          cost:
            Number(c.monetaryValue || c.finalAmount || 0) > 0
              ? `₹${Number(c.monetaryValue || c.finalAmount).toLocaleString('en-IN')}`
              : 'Retainer',
        };
      });

      setProjects(mapped);
    } catch (err: any) {
      toast.error(err.message || 'Unable to load engagements');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-lime-600" /> Active Tax & Audit Engagements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track ongoing CA projects, audit timelines, and service deliverables.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadProjects} disabled={loading} className="text-xs">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-slate-400 text-sm">
          <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading engagements...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Briefcase className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No active engagements yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Once your Chartered Accountant opens an ITR, GST, audit, or advisory engagement for you, progress and deliverables will appear here.
          </p>
          <Link href="/client/find-ca/search" className="inline-block pt-2">
            <Button className="bg-lime-600 hover:bg-lime-500 text-white text-xs font-semibold">
              Find & Hire a CA
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/client/projects/${p.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-lime-500/40 transition-all block"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 bg-lime-600/10 px-2 py-0.5 rounded">
                    {p.firm}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">
                    {p.title}
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                    p.status === 'COMPLETED'
                      ? 'bg-lime-600/20 text-lime-600 dark:text-lime-400 border-lime-500/30'
                      : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                  }`}
                >
                  {p.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Completion Milestone</span>
                  <span className="text-slate-900 dark:text-white font-bold">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-lime-600 h-2 rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Assigned CA</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {p.caName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Deadline</span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-lime-600" /> {p.deadline}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end text-xs font-semibold text-lime-500">
                View Deliverables <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
