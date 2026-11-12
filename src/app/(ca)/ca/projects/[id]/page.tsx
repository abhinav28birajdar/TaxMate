'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Receipt,
  MessageSquare,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function CAProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id || '';

  const [project, setProject] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const [caseRes, tasksRes, docsRes] = await Promise.all([
        fetch(`/api/cases/${encodeURIComponent(projectId)}`, { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/documents?take=100', { credentials: 'include' }),
      ]);

      const caseJson = await caseRes.json();
      if (!caseRes.ok || !caseJson.success || !caseJson.data) {
        throw new Error(caseJson.error?.message || caseJson.error || 'Project not found');
      }
      const c = caseJson.data;
      setProject(c);

      if (tasksRes.ok) {
        const tJson = await tasksRes.json();
        setTasks(
          (tJson.tasks || []).filter(
            (t: any) =>
              (t.metadata?.case_id || t.case_id) === projectId ||
              (c.clientId && t.client_id === c.clientId)
          )
        );
      }

      if (docsRes.ok) {
        const dJson = await docsRes.json();
        setDocuments(
          (dJson.documents || []).filter(
            (d: any) => d.case_id === projectId || (c.clientId && d.client_id === c.clientId)
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load engagement details');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleStatusChange = async (nextStatus: string) => {
    if (!project) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/cases/${encodeURIComponent(project.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.error || 'Status update failed');
      }
      toast.success(`Project status updated to ${nextStatus.replace(/_/g, ' ')}`);
      await loadProject();
    } catch (err: any) {
      toast.error(err.message || 'Could not update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadDoc = async (docId: string, fileName: string) => {
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(docId)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.signedUrl) throw new Error(json.error || 'Download failed');
      const a = document.createElement('a');
      a.href = json.signedUrl;
      a.download = fileName;
      a.target = '_blank';
      a.click();
    } catch (err: any) {
      toast.error(err.message || 'Could not download file');
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading project workspace...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <Link href="/ca/projects" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
        </Link>
        <div className="p-8 bg-slate-900 border border-rose-500/30 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-white font-semibold">{error || 'Engagement not found'}</p>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => String(t.status).toUpperCase() === 'COMPLETED').length;
  const upperStatus = String(project.status || 'PENDING').toUpperCase();
  const progress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : upperStatus === 'COMPLETED'
        ? 100
        : upperStatus === 'FILED'
          ? 85
          : upperStatus === 'IN_PROGRESS'
            ? 50
            : 20;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/ca/projects"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {project.title}
            </h1>
            <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/30 text-xs font-bold">
              {upperStatus.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Case Ref: <span className="font-mono">{project.caseNumber || project.id}</span> •
            Type: <strong className="text-slate-300">{project.caseType || 'Tax Advisory'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            disabled={updatingStatus}
            value={upperStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
          >
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="FILED">FILED</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
          <Link href="/ca/chat">
            <Button variant="outline" size="sm" className="text-xs rounded-xl border-slate-800">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-lime-600" /> Client Chat
            </Button>
          </Link>
          <Link href="/ca/invoices/create">
            <Button
              size="sm"
              className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/20"
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" /> Generate Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Progress</span>
            <span className="font-bold text-lime-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800 mt-2" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Priority</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {String(project.priority || 'MEDIUM').toUpperCase()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Target Deadline</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {project.deadline ? new Date(project.deadline).toLocaleDateString('en-IN') : 'Flexible'}
          </div>
        </div>
      </div>

      {project.description && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-300">
          {project.description}
        </div>
      )}

      <Tabs defaultValue="tasks" className="w-full space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="tasks" className="rounded-xl text-xs font-semibold">
            Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl text-xs font-semibold">
            Files & Documents ({documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-3">
          {tasks.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              No tasks linked to this engagement yet.
            </div>
          ) : (
            tasks.map((t) => (
              <Link
                key={t.id}
                href={`/tasks/${t.id}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-lime-500/40 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      t.status === 'COMPLETED' ? 'text-lime-500' : 'text-slate-500'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-white block">{t.title}</span>
                    <span className="text-slate-400 text-[11px]">
                      Due: {t.due_date ? String(t.due_date).split('T')[0] : 'Flexible'}
                    </span>
                  </div>
                </div>
                <Badge className="bg-slate-800 text-slate-300">{t.status}</Badge>
              </Link>
            ))
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          {documents.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-xs text-slate-400">
              No documents attached to this engagement yet.
            </div>
          ) : (
            documents.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-lime-500" />
                  <div>
                    <Link
                      href={`/ca/documents/${d.id}`}
                      className="font-semibold text-white hover:underline block"
                    >
                      {d.file_name || d.name}
                    </Link>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(d.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownloadDoc(d.id, d.file_name || d.name || 'document')}
                >
                  <Download className="w-4 h-4 text-lime-500" />
                </Button>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
