'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Plus, Search, Calendar, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ProjectItem {
  id: string;
  title: string;
  client: string;
  caseNumber?: string;
  deadline: string;
  progress: number;
  status: string;
  priority: string;
}

function defaultProgress(status: string): number {
  const s = String(status || '').toUpperCase();
  if (s === 'COMPLETED') return 100;
  if (s === 'FILED' || s === 'REVIEW') return 80;
  if (s === 'IN_PROGRESS' || s === 'OPEN') return 50;
  return 20;
}

export default function CAProjectsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newCaseType, setNewCaseType] = useState('Statutory Audit');
  const [newDeadline, setNewDeadline] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const [casesRes, tasksRes, clientsRes] = await Promise.all([
        fetch('/api/cases?limit=100', { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/clients?take=100', { credentials: 'include' }),
      ]);

      const clientList: any[] = clientsRes.ok ? (await clientsRes.json()).clients || [] : [];
      setClients(clientList);
      if (clientList.length > 0 && !newClientId) {
        setNewClientId(clientList[0].id);
      }
      const clientMap = new Map(clientList.map((c: any) => [c.id, c.display_name || c.full_name]));

      const rawTasks: any[] = tasksRes.ok ? (await tasksRes.json()).tasks || [] : [];
      const tasksByCase = new Map<string, any[]>();
      for (const t of rawTasks) {
        const cid = t.metadata?.case_id || t.case_id;
        if (cid) {
          const list = tasksByCase.get(cid) || [];
          list.push(t);
          tasksByCase.set(cid, list);
        }
      }

      if (casesRes.ok) {
        const casesJson = await casesRes.json();
        const rawCases: any[] = casesJson.data?.cases || [];
        setProjects(
          rawCases.map((c) => {
            const linkedTasks = tasksByCase.get(c.id) || [];
            const doneCount = linkedTasks.filter(
              (t) => String(t.status || '').toUpperCase() === 'COMPLETED'
            ).length;
            const progress =
              linkedTasks.length > 0
                ? Math.round((doneCount / linkedTasks.length) * 100)
                : defaultProgress(c.status);
            return {
              id: c.id,
              title: c.title,
              caseNumber: c.caseNumber,
              client:
                c.clientName ||
                (c.clientId ? clientMap.get(c.clientId) : null) ||
                'General Engagement',
              deadline: c.deadline ? new Date(c.deadline).toLocaleDateString('en-IN') : 'Flexible',
              progress,
              status: String(c.status || 'PENDING').toUpperCase(),
              priority: String(c.priority || 'MEDIUM').toUpperCase(),
            };
          })
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Unable to load engagements');
    } finally {
      setLoading(false);
    }
  }, [newClientId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Project title is required');
      return;
    }

    const selectedClient = clients.find((c) => c.id === newClientId);
    setCreating(true);
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          clientId: newClientId || null,
          clientName: selectedClient?.display_name || selectedClient?.full_name || undefined,
          caseType: newCaseType,
          priority: 'MEDIUM',
          deadline: newDeadline || null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Could not create project');
      }
      toast.success('New engagement project created!');
      setNewTitle('');
      setNewDescription('');
      setShowCreateModal(false);
      await loadProjects();
    } catch (err: any) {
      toast.error(err.message || 'Project creation failed');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) || p.client.toLowerCase().includes(q);
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && p.status === filter;
  });

  const activeCount = projects.filter((p) => p.status !== 'COMPLETED').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const inReviewCount = projects.filter((p) => p.status === 'FILED' || p.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-lime-600" /> CA Practice Projects & Engagements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-stage tax audits, corporate filings, and client advisory engagements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadProjects} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Start New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Engagements</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {activeCount} Projects
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Completed</span>
          <div className="text-2xl font-extrabold text-lime-600 dark:text-lime-400 mt-1">
            {completedCount} Projects
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">In Progress / Filed</span>
          <div className="text-2xl font-extrabold text-amber-500 mt-1">
            {inReviewCount} Active
          </div>
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
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'FILED', 'COMPLETED'].map((st) => (
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

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No matching engagement projects
          </p>
          <p className="text-xs text-slate-500">
            Click &ldquo;Start New Project&rdquo; to open an engagement workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((p) => (
            <Link
              key={p.id}
              href={`/ca/projects/${p.id}`}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-lime-500/40 transition-all block"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400 bg-lime-600/10 px-2 py-0.5 rounded">
                    {p.client}
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
                  {p.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-500">Milestone Completion</span>
                  <span className="text-slate-900 dark:text-white font-bold">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-lime-600 h-2 rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <span className="font-mono">{p.caseNumber || p.priority}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-lime-500" /> Due: {p.deadline}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Start New Engagement Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-slate-300">Project Title *</label>
                <Input
                  required
                  minLength={3}
                  placeholder="E.g. Annual Statutory Audit FY 2025-26"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white"
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Client</label>
                <select
                  value={newClientId}
                  onChange={(e) => setNewClientId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="">General Practice Engagement</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.display_name || c.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-300">Engagement Type</label>
                  <Input
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-slate-300">Deadline</label>
                  <Input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1 text-slate-300">Scope Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Deliverables, audit scope, and filing deadlines..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
