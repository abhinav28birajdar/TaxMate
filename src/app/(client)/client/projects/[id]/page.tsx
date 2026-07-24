"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ArrowLeft, CheckCircle2, Clock, User, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ClientProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const project = {
    id: params.id,
    title: 'Q2 GST Audit & Filing Engagement',
    caName: 'CA Rajesh Sharma',
    status: 'in_progress',
    progress: 65,
    budget: '₹25,000',
    paid: '₹15,000',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    tasks: [
      { name: 'Sales & Purchase Register Verification', status: 'completed' },
      { name: 'GSTR-2B ITC Matching', status: 'completed' },
      { name: 'GSTR-3B Computation Summary Approval', status: 'in_progress' },
      { name: 'Final Portal Submission', status: 'pending' }
    ]
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{project.title}</h1>
            <p className="text-sm text-slate-400">Assigned CA: {project.caName}</p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {project.status.replace('_', ' ')}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall Engagement Completion</span>
            <span className="font-bold text-lime-400">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2 bg-slate-950 [&>div]:bg-lime-600" />
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-4">
          <h3 className="text-base font-semibold text-slate-100">Milestone Checkpoints</h3>
          <div className="space-y-2">
            {project.tasks.map((t, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-sm">
                <span className="text-slate-200">{t.name}</span>
                <Badge className={`text-xs ${
                  t.status === 'completed' ? 'bg-lime-600/20 text-lime-400 border-lime-500/30' :
                  t.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {t.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
