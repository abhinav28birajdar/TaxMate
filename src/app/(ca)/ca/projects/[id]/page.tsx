'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  Briefcase, 
  ArrowLeft, 
  User, 
  Calendar, 
  IndianRupee, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Receipt, 
  Plus, 
  Sparkles,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function CAProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string || 'PRJ-2026-081';

  const [progress, setProgress] = useState(65);

  const project = {
    id: projectId,
    title: 'Statutory Audit & Annual GST Filing (FY 2025-26)',
    clientName: 'Acme Technologies Pvt Ltd',
    clientEmail: 'finance@acmetech.in',
    clientPan: 'ABCDE1234F',
    gstin: '27ABCDE1234F1Z5',
    status: 'In Progress',
    priority: 'High',
    startDate: '01 Jul 2026',
    dueDate: '30 Sep 2026',
    budget: 85000,
    paidAmount: 42500,
    description: 'Comprehensive statutory audit under Section 139 of Companies Act 2013, preparation of Form 3CA/3CD Tax Audit Report, and filing of GSTR-9/9C reconciliation statement.',
    milestones: [
      { id: 1, title: 'Engagement Letter & Initial Document Gathering', status: 'completed', date: '08 Jul 2026' },
      { id: 2, title: 'Ledger Audit, Bank Reconciliation & Physical Asset Verification', status: 'completed', date: '25 Jul 2026' },
      { id: 3, title: 'Draft Audit Report & Management Representation Letter (MRL)', status: 'in_progress', date: '15 Aug 2026' },
      { id: 4, title: 'Final Statutory Sign-off & MCA/IT Portal Upload', status: 'pending', date: '20 Sep 2026' },
    ],
    tasks: [
      { id: 'T-101', title: 'Verify Fixed Asset Additions & Depreciation Schedule', assignedTo: 'Priya Sharma (Staff CA)', status: 'Done', priority: 'High' },
      { id: 'T-102', title: 'Reconcile 26AS/AIS with Books of Accounts', assignedTo: 'Rahul Sen (Accountant)', status: 'In Review', priority: 'Urgent' },
      { id: 'T-103', title: 'Form 3CD Tax Audit Annexure Preparation', assignedTo: 'Rajesh Sharma (Lead CA)', status: 'In Progress', priority: 'Medium' },
    ],
    documents: [
      { id: 'D-1', name: 'Acme_Trial_Balance_FY2526.xlsx', size: '2.4 MB', date: '05 Jul 2026' },
      { id: 'D-2', name: 'Bank_Statements_HDFC_All_Quarters.pdf', size: '8.1 MB', date: '07 Jul 2026' },
      { id: 'D-3', name: 'Signed_Audit_Engagement_Letter.pdf', size: '1.2 MB', date: '08 Jul 2026' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/ca/projects" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600 mb-2">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Projects
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {project.title}
            </h1>
            <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/30 text-xs font-bold">
              {project.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">Project ID: <span className="font-mono">{project.id}</span> • Client: <strong className="text-slate-700 dark:text-slate-300">{project.clientName}</strong></p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/ca/chat?client=${encodeURIComponent(project.clientName)}`}>
            <Button variant="outline" size="sm" className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-lime-600" /> Client Chat
            </Button>
          </Link>
          <Link href="/ca/invoices/create">
            <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/20">
              <Receipt className="w-3.5 h-3.5 mr-1.5" /> Generate Milestone Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>Overall Progress</span>
            <span className="font-bold text-lime-600">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-100 dark:bg-slate-800 mt-2" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Contract Value</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">₹{project.budget.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-lime-600 font-semibold">₹{project.paidAmount.toLocaleString('en-IN')} Received (50%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Statutory Due Date</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{project.dueDate}</div>
          <span className="text-[10px] text-slate-500">Started on {project.startDate}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="text-xs text-slate-500">Client GSTIN & PAN</div>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">{project.gstin}</div>
          <span className="text-[10px] text-slate-500">PAN: {project.clientPan}</span>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="milestones" className="w-full space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <TabsTrigger value="milestones" className="rounded-xl text-xs font-semibold">
            Milestones & Roadmap
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-xl text-xs font-semibold">
            Tasks ({project.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="documents" className="rounded-xl text-xs font-semibold">
            Files & Documents ({project.documents.length})
          </TabsTrigger>
        </TabsList>

        {/* Milestones Content */}
        <TabsContent value="milestones" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Execution Roadmap</h3>
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
                  <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    milestone.status === 'completed' 
                      ? 'bg-lime-600 text-white' 
                      : milestone.status === 'in_progress' 
                      ? 'bg-lime-600/20 text-lime-600 border border-lime-600/40' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {milestone.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : milestone.id}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{milestone.title}</h4>
                      <span className="text-[11px] text-slate-500">{milestone.date}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {milestone.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tasks Content */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Assigned Audit Tasks</h3>
              <Button size="sm" variant="outline" className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
              </Button>
            </div>

            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{task.title}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">Assigned to: {task.assignedTo}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 text-[10px] font-bold">
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Documents Content */}
        <TabsContent value="documents" className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Project Working Papers & Uploads</h3>
              <Button size="sm" className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl">
                <Upload className="w-3.5 h-3.5 mr-1" /> Upload New File
              </Button>
            </div>

            <div className="space-y-3">
              {project.documents.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-lime-600/10 text-lime-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</div>
                      <div className="text-[10px] text-slate-500">{doc.size} • Uploaded {doc.date}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => toast.success(`Downloading ${doc.name}`)}>
                    <Download className="w-4 h-4 text-slate-400 hover:text-lime-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
