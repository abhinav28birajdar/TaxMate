'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Loader2,
  Briefcase,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  IndianRupee,
  FileText,
  MessageSquare,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download,
  User,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { format, formatDistanceToNow, isPast, addDays } from 'date-fns';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Types
interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string | null;
  service_type: string;
  status: string;
  priority: string;
  client_id: string;
  ca_id: string;
  amount: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
    email: string;
    company_name: string | null;
  };
  ca?: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
  tasks_count: number;
  completed_tasks: number;
}

interface CaseFilters {
  search: string;
  status: string;
  priority: string;
  service_type: string;
}

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: typeof Briefcase }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Plus },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
  pending_review: { label: 'Pending Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Eye },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  on_hold: { label: 'On Hold', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Trash2 },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'border-l-green-500' },
  medium: { label: 'Medium', color: 'border-l-yellow-500' },
  high: { label: 'High', color: 'border-l-orange-500' },
  urgent: { label: 'Urgent', color: 'border-l-red-500' },
};

const serviceTypes = [
  { value: 'itr_filing', label: 'ITR Filing' },
  { value: 'gst_filing', label: 'GST Filing' },
  { value: 'audit', label: 'Audit' },
  { value: 'tax_planning', label: 'Tax Planning' },
  { value: 'company_registration', label: 'Company Registration' },
  { value: 'trademark', label: 'Trademark' },
  { value: 'legal_compliance', label: 'Legal Compliance' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'other', label: 'Other' },
];

// Stats Card
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn('p-3 rounded-full', color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Case Card for Grid View
function CaseCard({
  caseItem,
  onClick,
  isCA,
}: {
  caseItem: Case;
  onClick: () => void;
  isCA: boolean;
}) {
  const status = statusConfig[caseItem.status] || statusConfig.new;
  const priority = priorityConfig[caseItem.priority] || priorityConfig.medium;
  const person = isCA ? caseItem.client : caseItem.ca;
  const personName = person ? `${person.first_name} ${person.last_name}` : 'Unknown';
  const progress = caseItem.tasks_count > 0
    ? Math.round((caseItem.completed_tasks / caseItem.tasks_count) * 100)
    : 0;
  const isOverdue = caseItem.due_date && isPast(new Date(caseItem.due_date)) && caseItem.status !== 'completed';

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md transition-all border-l-4',
        priority.color
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="outline" className={status.color}>
            {status.label}
          </Badge>
          <span className="text-xs text-muted-foreground">{caseItem.case_number}</span>
        </div>

        <h3 className="font-semibold mb-2 line-clamp-2">{caseItem.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-6 w-6">
            <AvatarImage src={person?.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {personName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground truncate">{personName}</span>
        </div>

        {caseItem.tasks_count > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {caseItem.due_date ? (
            <span className={cn('flex items-center gap-1', isOverdue && 'text-red-500')}>
              <Calendar className="h-3 w-3" />
              {format(new Date(caseItem.due_date), 'MMM d')}
              {isOverdue && ' (Overdue)'}
            </span>
          ) : (
            <span>No due date</span>
          )}
          {caseItem.amount && (
            <span className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              {caseItem.amount.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// New Case Dialog
function NewCaseDialog({
  open,
  onOpenChange,
  onSuccess,
  clients,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  clients: { id: string; first_name: string; last_name: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    service_type: 'itr_filing',
    priority: 'medium',
    client_id: '',
    amount: '',
    due_date: '',
  });
  const supabase = createClient();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.client_id) return;

    setLoading(true);
    try {
      // Get CA profile
      const { data: caProfile } = await supabase
        .from('ca_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!caProfile) throw new Error('CA profile not found');

      const { error } = await supabase.from('cases').insert({
        title: formData.title,
        description: formData.description || null,
        service_type: formData.service_type,
        priority: formData.priority,
        client_id: formData.client_id,
        ca_id: caProfile.id,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        due_date: formData.due_date || null,
        status: 'new',
      });

      if (error) throw error;

      onSuccess();
      onOpenChange(false);
      setFormData({
        title: '',
        description: '',
        service_type: 'itr_filing',
        priority: 'medium',
        client_id: '',
        amount: '',
        due_date: '',
      });
    } catch (error) {
      console.error('Error creating case:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Create a new case for your client. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Case Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., ITR Filing FY 2023-24"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type *</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Fee Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the case details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.client_id || !formData.title}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Case
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CasesPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [newCaseOpen, setNewCaseOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<CaseFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    service_type: 'all',
  });

  // Stats
  const stats = {
    total: cases.length,
    active: cases.filter(c => ['new', 'in_progress', 'pending_review'].includes(c.status)).length,
    completed: cases.filter(c => c.status === 'completed').length,
    overdue: cases.filter(c => c.due_date && isPast(new Date(c.due_date)) && c.status !== 'completed').length,
  };

  const isCA = String(role).toLowerCase() === 'ca';

  const fetchCases = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      let profileId: string | null = null;

      if (isCA) {
        const { data: caProfile } = await supabase
          .from('ca_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        profileId = caProfile?.id || null;
      } else {
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        profileId = clientProfile?.id || null;
      }

      if (!profileId) return;

      // Build query
      let query = supabase
        .from('cases')
        .select(`
          *,
          client:client_profiles!cases_client_id_fkey(first_name, last_name, avatar_url, email, company_name),
          ca:ca_profiles!cases_ca_id_fkey(first_name, last_name, avatar_url),
          tasks:case_tasks(id, status)
        `)
        .eq(isCA ? 'ca_id' : 'client_id', profileId);

      // Apply tab filter
      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      // Apply search
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,case_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Apply status filter
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Apply priority filter
      if (filters.priority !== 'all') {
        query = query.eq('priority', filters.priority);
      }

      // Apply service type filter
      if (filters.service_type !== 'all') {
        query = query.eq('service_type', filters.service_type);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Process cases with task counts
      const processedCases: Case[] = (data || []).map((c: any) => ({
        ...c,
        tasks_count: c.tasks?.length || 0,
        completed_tasks: c.tasks?.filter((t: any) => t.status === 'completed').length || 0,
      }));

      setCases(processedCases);

      // Fetch clients for CA (for new case dialog)
      if (isCA) {
        const { data: clientsData } = await supabase
          .from('client_profiles')
          .select('id, first_name, last_name')
          .order('first_name');
        setClients(clientsData || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  }, [user, role, isCA, supabase, activeTab, filters]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('cases-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchCases]);

  const handleViewCase = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  // Filter cases by tab
  const filteredCases = cases;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">Manage your {isCA ? 'client cases' : 'cases with your CA'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          {isCA && (
            <Button onClick={() => setNewCaseOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> New Case
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Cases"
          value={stats.total}
          icon={Briefcase}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatsCard
          title="Active"
          value={stats.active}
          icon={Clock}
          color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatsCard
          title="Overdue"
          value={stats.overdue}
          icon={AlertCircle}
          color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      {/* Tabs and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="pending_review">Review</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.service_type}
                onValueChange={(value) => setFilters({ ...filters, service_type: value })}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases List/Grid */}
      {loading ? (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3'
            : ''
        )}>
          {viewMode === 'grid' ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-24 mb-3" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-3" />
                  <Skeleton className="h-2 w-full mb-3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[150px]" />
                    </div>
                    <Skeleton className="h-8 w-[100px]" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : filteredCases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.search || filters.priority !== 'all' || filters.service_type !== 'all'
                ? 'Try adjusting your filters'
                : isCA
                ? 'Create your first case to get started'
                : 'You have no active cases'}
            </p>
            {isCA && !filters.search && filters.priority === 'all' && filters.service_type === 'all' && (
              <Button onClick={() => setNewCaseOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Case
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              onClick={() => handleViewCase(caseItem.id)}
              isCA={isCA}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>{isCA ? 'Client' : 'CA'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => {
                  const status = statusConfig[caseItem.status] || statusConfig.new;
                  const priority = priorityConfig[caseItem.priority] || priorityConfig.medium;
                  const person = isCA ? caseItem.client : caseItem.ca;
                  const isOverdue = caseItem.due_date && isPast(new Date(caseItem.due_date)) && caseItem.status !== 'completed';

                  return (
                    <TableRow
                      key={caseItem.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewCase(caseItem.id)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{caseItem.title}</p>
                          <p className="text-xs text-muted-foreground">{caseItem.case_number}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={person?.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {person ? `${person.first_name[0]}${person.last_name[0]}` : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {person ? `${person.first_name} ${person.last_name}` : 'Unknown'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {priority.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {caseItem.due_date ? (
                          <span className={cn(isOverdue && 'text-red-500')}>
                            {format(new Date(caseItem.due_date), 'MMM d, yyyy')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {caseItem.amount ? (
                          <span>₹{caseItem.amount.toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewCase(caseItem.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Documents
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* New Case Dialog */}
      {isCA && (
        <NewCaseDialog
          open={newCaseOpen}
          onOpenChange={setNewCaseOpen}
          onSuccess={fetchCases}
          clients={clients}
        />
      )}
    </div>
  );
}
