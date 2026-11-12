'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

type CaseStatus =
  | 'open'
  | 'draft'
  | 'pending_documents'
  | 'in_progress'
  | 'under_review'
  | 'filed'
  | 'completed';

type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  type: string;
  clientId?: string | null;
  client: {
    name: string;
    avatar?: string;
  };
  status: CaseStatus;
  priority: CasePriority;
  dueDate: Date;
  createdDate: Date;
  progress: number;
  assignedTo?: string;
  tags: string[];
  documentsCount: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface ClientOption {
  id: string;
  name: string;
}

const CASE_TYPES = [
  'Income Tax Return',
  'GST Filing',
  'Tax Audit',
  'Company Audit',
  'ROC Filing',
  'TDS Return',
  'Financial Planning',
  'Business Valuation',
  'Compliance',
  'Advisory',
];

const STATUS_CONFIG: Record<CaseStatus, { label: string; color: string; icon: any; progress: number }> = {
  open: { label: 'Open', color: 'bg-blue-600', icon: Briefcase, progress: 15 },
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText, progress: 10 },
  pending_documents: { label: 'Pending Documents', color: 'bg-amber-500', icon: Clock, progress: 30 },
  in_progress: { label: 'In Progress', color: 'bg-emerald-500', icon: Briefcase, progress: 60 },
  under_review: { label: 'Under Review', color: 'bg-purple-600', icon: AlertCircle, progress: 80 },
  filed: { label: 'Filed', color: 'bg-green-600', icon: CheckCircle, progress: 95 },
  completed: { label: 'Completed', color: 'bg-emerald-600', icon: CheckCircle, progress: 100 },
};

const PRIORITY_CONFIG: Record<CasePriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

function mapCaseRecord(item: any): CaseItem {
  const rawStatus = String(item.status || 'in_progress').toLowerCase() as CaseStatus;
  const normalizedStatus: CaseStatus = STATUS_CONFIG[rawStatus] ? rawStatus : 'in_progress';
  const rawPriority = String(item.priority || 'medium').toLowerCase() as CasePriority;
  const normalizedPriority: CasePriority = PRIORITY_CONFIG[rawPriority] ? rawPriority : 'medium';

  return {
    id: item.id,
    caseNumber: item.case_number || `CASE-${String(item.id).slice(0, 8).toUpperCase()}`,
    title: item.title,
    description: item.description || '',
    type: item.case_type || 'Income Tax Return',
    clientId: item.client_id || null,
    client: {
      name: item.clientName || item.metadata?.clientName || 'Client Entity',
    },
    status: normalizedStatus,
    priority: normalizedPriority,
    dueDate: item.deadline ? new Date(item.deadline) : new Date(Date.now() + 14 * 86400000),
    createdDate: new Date(item.created_at || Date.now()),
    progress: STATUS_CONFIG[normalizedStatus].progress,
    tags: Array.isArray(item.metadata?.tags) && item.metadata.tags.length > 0 ? item.metadata.tags : [item.case_type || 'Tax'],
    documentsCount: Number(item.metadata?.docsCount || 0),
    tasksCompleted: Number(item.metadata?.tasksDone || 0),
    totalTasks: Number(item.metadata?.totalTasks || 0),
  };
}

export default function CaseManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create Case Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCaseType, setNewCaseType] = useState(CASE_TYPES[0]);
  const [newClientId, setNewClientId] = useState('');
  const [newPriority, setNewPriority] = useState<CasePriority>('medium');
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );

  // Case Inspection Modal
  const [activeCase, setActiveCase] = useState<CaseItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadCasesAndClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [casesRes, clientsRes] = await Promise.all([
        fetch('/api/cases?limit=100'),
        fetch('/api/clients?take=100'),
      ]);

      if (!casesRes.ok) {
        const errJson = await casesRes.json().catch(() => ({}));
        throw new Error(errJson.message || errJson.error || 'Failed to load cases');
      }

      const casesJson = await casesRes.json();
      const rawCases = casesJson.data?.cases || casesJson.cases || [];
      setCases(rawCases.map(mapCaseRecord));

      if (clientsRes.ok) {
        const clientsJson = await clientsRes.json();
        const opts: ClientOption[] = (clientsJson.clients || []).map((c: any) => ({
          id: c.id,
          name: c.display_name || c.full_name || c.email || 'Client',
        }));
        setClients(opts);
        if (opts.length > 0 && !newClientId) {
          setNewClientId(opts[0].id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load cases');
    } finally {
      setLoading(false);
    }
  }, [newClientId]);

  useEffect(() => {
    loadCasesAndClients();
  }, [loadCasesAndClients]);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim().length < 3) {
      toast.error('Please enter a case title (at least 3 characters).');
      return;
    }

    const chosenClient = clients.find((c) => c.id === newClientId);

    try {
      setSubmitting(true);
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          caseType: newCaseType,
          clientId: newClientId || null,
          clientName: chosenClient?.name || 'Internal Engagement',
          priority: newPriority.toUpperCase(),
          deadline: newDeadline || null,
          tags: [newCaseType],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to create case');
      }

      toast.success('Case created and saved!');
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      await loadCasesAndClients();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create case');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (caseItem: CaseItem, status: CaseStatus) => {
    try {
      setUpdatingId(caseItem.id);
      const res = await fetch(`/api/cases/${caseItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || json.error || 'Failed to update status');
      }

      const updatedProgress = STATUS_CONFIG[status]?.progress ?? caseItem.progress;
      setCases((prev) =>
        prev.map((c) => (c.id === caseItem.id ? { ...c, status, progress: updatedProgress } : c))
      );
      if (activeCase?.id === caseItem.id) {
        setActiveCase({ ...caseItem, status, progress: updatedProgress });
      }
      toast.success(`Case marked as ${STATUS_CONFIG[status].label}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not update case status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteCase = async (caseId: string) => {
    try {
      setUpdatingId(caseId);
      const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || json.error || 'Failed to delete case');
      }
      setCases((prev) => prev.filter((c) => c.id !== caseId));
      setActiveCase(null);
      toast.success('Case deleted permanently');
    } catch (err: any) {
      toast.error(err.message || 'Could not delete case');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.client.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || c.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Case Management</h1>
          <p className="text-gray-400 mt-1 text-sm">Manage all live client engagements, audits, and filings in one place</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-5 h-5 mr-2" />
          New Case
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#111111] border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Cases</p>
              <p className="text-3xl font-bold text-white mt-1">{cases.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[#111111] border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-white mt-1">
                {cases.filter((c) => c.status === 'in_progress' || c.status === 'open').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[#111111] border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Completed</p>
              <p className="text-3xl font-bold text-white mt-1">
                {cases.filter((c) => c.status === 'completed' || c.status === 'filed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[#111111] border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 font-medium">Urgent</p>
              <p className="text-3xl font-bold text-white mt-1">
                {cases.filter((c) => c.priority === 'urgent').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-[#111111] border border-white/10">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases by title, number, or client..."
              className="pl-10 bg-[#18181b] border-white/10 text-white"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-white/10 rounded-lg bg-[#18181b] text-white text-sm"
          >
            <option value="all">All Types</option>
            {CASE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-white/10 rounded-lg bg-[#18181b] text-white text-sm"
          >
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Error / Loading */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={loadCasesAndClients} className="border-red-500/30 text-xs">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400 flex items-center justify-center gap-2 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          Loading client cases...
        </div>
      ) : filteredCases.length === 0 ? (
        <Card className="p-12 text-center bg-[#111111] border border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No cases found</h3>
          <p className="text-sm text-gray-400 mb-4">
            {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first client engagement case to get started'}
          </p>
          <Button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-5 h-5 mr-2" />
            Create New Case
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => {
            const StatusIcon = STATUS_CONFIG[caseItem.status].icon;
            const daysUntilDue = getDaysUntilDue(caseItem.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

            return (
              <Card
                key={caseItem.id}
                onClick={() => setActiveCase(caseItem)}
                className="p-6 bg-[#111111] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-white/15 text-gray-300">
                        {caseItem.caseNumber}
                      </Badge>
                      <Badge className={PRIORITY_CONFIG[caseItem.priority].color}>
                        {PRIORITY_CONFIG[caseItem.priority].label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-white mb-1">{caseItem.title}</h3>
                    <p className="text-sm text-gray-400">{caseItem.type}</p>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 bg-emerald-600/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 text-sm font-semibold">
                    {caseItem.client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{caseItem.client.name}</p>
                    <p className="text-xs text-gray-400">Client</p>
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-gray-200">
                        {STATUS_CONFIG[caseItem.status].label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">{caseItem.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${STATUS_CONFIG[caseItem.status].color}`}
                      style={{ width: `${caseItem.progress}%` }}
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    isOverdue
                      ? 'bg-red-500/10 border border-red-500/20'
                      : isDueSoon
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : 'bg-[#18181b] border border-white/5'
                  }`}
                >
                  <Calendar
                    className={`w-4 h-4 ${
                      isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">Due Date</p>
                    <p
                      className={`text-sm font-semibold ${
                        isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {formatDate(caseItem.dueDate)}
                      {isOverdue && ' (Overdue)'}
                      {isDueSoon && !isOverdue && ` (${daysUntilDue} days left)`}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {caseItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {caseItem.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs bg-white/5 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Case Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" /> Create New Client Case
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITR-3 Audit & Balance Sheet Review FY 2025-26"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Client</label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Internal / General Case</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Case Category</label>
                  <select
                    value={newCaseType}
                    onChange={(e) => setNewCaseType(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CASE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as CasePriority)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 mb-1">Scope & Working Notes</label>
                <textarea
                  rows={3}
                  placeholder="Key statutory requirements, notice DIN, or document checklist..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)} className="border-white/10 text-xs">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Create Case
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Inspection & Status Update Modal */}
      {activeCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-mono text-emerald-400">{activeCase.caseNumber}</span>
                <h3 className="font-bold text-lg text-white">{activeCase.title}</h3>
                <p className="text-xs text-gray-400">{activeCase.client.name} • {activeCase.type}</p>
              </div>
              <button onClick={() => setActiveCase(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeCase.description && (
              <p className="text-xs text-gray-300 bg-[#18181b] p-3 rounded-xl border border-white/5">
                {activeCase.description}
              </p>
            )}

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-gray-300">Update Workflow Status</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_CONFIG) as CaseStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={updatingId === activeCase.id}
                    onClick={() => handleUpdateStatus(activeCase, st)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                      activeCase.status === st
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-[#18181b] text-gray-300 border-white/10 hover:border-emerald-500/40'
                    }`}
                  >
                    {STATUS_CONFIG[st].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <Button
                size="sm"
                variant="ghost"
                disabled={updatingId === activeCase.id}
                onClick={() => handleDeleteCase(activeCase.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Case
              </Button>
              <Button size="sm" variant="outline" onClick={() => setActiveCase(null)} className="border-white/10 text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
