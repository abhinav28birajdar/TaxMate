'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MilestoneTask {
  id: string;
  title: string;
  status: string;
  dueDate?: string | null;
}

interface ProjectDetail {
  id: string;
  title: string;
  caseNumber?: string;
  caseType?: string;
  description?: string;
  status: string;
  progress: number;
  deadline?: string | null;
  caName: string;
  tasks: MilestoneTask[];
}

export default function ClientProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id || '';
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);

      const [caseRes, tasksRes, caRes] = await Promise.all([
        fetch(`/api/cases/${encodeURIComponent(projectId)}`, { credentials: 'include' }),
        fetch('/api/tasks?limit=100', { credentials: 'include' }),
        fetch('/api/ca-requests', { credentials: 'include' }).catch(() => null),
      ]);

      const caseJson = await caseRes.json();
      if (!caseRes.ok || !caseJson.success || !caseJson.data) {
        throw new Error(caseJson.error?.message || caseJson.error || 'Engagement not found');
      }

      const rawCase = caseJson.data;
      const tasksJson = tasksRes.ok ? await tasksRes.json() : {};
      const caJson = caRes && caRes.ok ? await caRes.json() : {};

      const linkedTasks: MilestoneTask[] = (tasksJson.tasks || [])
        .filter((t: any) => (t.metadata?.case_id || t.case_id) === projectId)
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          status: String(t.status || 'TODO').toLowerCase(),
          dueDate: t.due_date || null,
        }));

      const rel = (caJson.relationships || []).find((r: any) => r.ca_id === rawCase.caId);
      const upperStatus = String(rawCase.status || 'PENDING').toUpperCase();
      const completedTasks = linkedTasks.filter((t) => t.status === 'completed').length;
      const progress =
        linkedTasks.length > 0
          ? Math.round((completedTasks / linkedTasks.length) * 100)
          : upperStatus === 'COMPLETED'
            ? 100
            : upperStatus === 'FILED'
              ? 85
              : upperStatus === 'IN_PROGRESS'
                ? 50
                : 20;

      setProject({
        id: rawCase.id,
        title: rawCase.title,
        caseNumber: rawCase.caseNumber,
        caseType: rawCase.caseType,
        description: rawCase.description,
        status: upperStatus,
        progress,
        deadline: rawCase.deadline || null,
        caName: rel?.ca?.name || 'Assigned CA Advisor',
        tasks: linkedTasks,
      });
    } catch (err: any) {
      setError(err.message || 'Unable to load engagement details');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-lime-500" /> Loading engagement...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="border-slate-800 text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card className="bg-slate-900 border-rose-500/30 p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-slate-200 font-semibold">{error || 'Engagement not found'}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-800 bg-slate-900 text-slate-300"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
            <p className="text-sm text-slate-400">
              Assigned CA: {project.caName}
              {project.caseNumber ? ` • ${project.caseNumber}` : ''}
            </p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {project.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        {project.description && (
          <p className="text-sm text-slate-300 leading-relaxed">{project.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Engagement Completion</span>
            <span className="font-bold text-lime-400">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2 bg-slate-950 [&>div]:bg-lime-600" />
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-4">
          <h3 className="text-base font-semibold text-slate-100">Milestone Checkpoints</h3>
          {project.tasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">
              No individual milestone tasks have been logged under this engagement yet. Current case status:{' '}
              <span className="text-slate-200 font-semibold">{project.status.replace(/_/g, ' ')}</span>.
            </p>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="text-slate-200 block">{t.title}</span>
                    {t.dueDate && (
                      <span className="text-[11px] text-slate-500">
                        Due: {new Date(t.dueDate).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                  <Badge
                    className={`text-xs ${
                      t.status === 'completed'
                        ? 'bg-lime-600/20 text-lime-400 border-lime-500/30'
                        : t.status === 'in_progress'
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t.status.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
