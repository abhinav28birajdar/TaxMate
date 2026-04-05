'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  UserPlus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Building,
  MapPin,
  Briefcase,
  Star,
  Eye,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

// Types
interface Client {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  gstin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  client_type: string;
  is_verified: boolean;
  created_at: string;
  total_cases: number;
  active_cases: number;
  total_spent: number;
  last_activity: string | null;
}

interface ClientFilters {
  search: string;
  client_type: string;
  status: string;
  sort_by: string;
}

// Stats Card
function StatsCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Client Row Component
function ClientRow({
  client,
  onView,
  onMessage,
  onSchedule,
}: {
  client: Client;
  onView: () => void;
  onMessage: () => void;
  onSchedule: () => void;
}) {
  const initials = `${client.first_name?.[0] || ''}${client.last_name?.[0] || ''}`.toUpperCase();

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={onView}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={client.avatar_url || ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {client.first_name} {client.last_name}
            </p>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          {client.company_name && (
            <div className="flex items-center gap-1 text-sm">
              <Building className="h-3 w-3 text-muted-foreground" />
              <span>{client.company_name}</span>
            </div>
          )}
          <Badge variant="outline" className="mt-1 capitalize">
            {client.client_type.replace('_', ' ')}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {client.phone ? (
          <div className="flex items-center gap-1 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{client.phone}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Not provided</span>
        )}
      </TableCell>
      <TableCell>
        <div className="text-center">
          <p className="font-medium">{client.total_cases}</p>
          <p className="text-xs text-muted-foreground">
            {client.active_cases} active
          </p>
        </div>
      </TableCell>
      <TableCell>
        <p className="font-medium">₹{client.total_spent.toLocaleString('en-IN')}</p>
      </TableCell>
      <TableCell>
        {client.last_activity ? (
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(client.last_activity), { addSuffix: true })}
          </p>
        ) : (
          <span className="text-muted-foreground text-sm">No activity</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={onMessage}>
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onSchedule}>
            <Calendar className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMessage}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSchedule}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                View Documents
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Briefcase className="h-4 w-4 mr-2" />
                View Cases
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Add Client Dialog
function AddClientDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    client_type: 'individual',
    notes: '',
  });
  const supabase = createClient();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Get CA profile
      const { data: caProfile } = await supabase
        .from('ca_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!caProfile) throw new Error('CA profile not found');

      // For now, we'll create an invitation or note
      // In a real app, you'd send an email invitation
      // Here we'll create a placeholder entry

      // This would typically trigger an email invitation flow
      alert(`Invitation would be sent to ${formData.email}`);
      
      onSuccess();
      onOpenChange(false);
      setFormData({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        company_name: '',
        client_type: 'individual',
        notes: '',
      });
    } catch (error) {
      console.error('Error adding client:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Invite a new client to connect with you on the platform.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_type">Client Type</Label>
              <Select
                value={formData.client_type}
                onValueChange={(value) => setFormData({ ...formData, client_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.client_type !== 'individual' && (
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending Invite...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientsPage() {
  const { user, role } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [page, setPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    client_type: 'all',
    status: 'all',
    sort_by: 'recent',
  });

  const PAGE_SIZE = 10;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new_this_month: 0,
    total_revenue: 0,
  });

  const fetchClients = useCallback(async () => {
    if (!user || role !== 'ca') return;

    try {
      setLoading(true);

      // Get CA profile
      const { data: caProfile } = await supabase
        .from('ca_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!caProfile) return;

      // Build query for clients who have cases with this CA
      let query = supabase
        .from('client_profiles')
        .select(`
          *,
          cases:cases!cases_client_id_fkey(id, status, created_at),
          payments:payments!payments_client_id_fkey(amount, status)
        `, { count: 'exact' })
        .not('cases', 'is', null);

      // Filter by CA's cases
      // Note: This is a simplified approach. In production, you'd use a proper junction table or RPC

      // Apply search filter
      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`
        );
      }

      // Apply client type filter
      if (filters.client_type !== 'all') {
        query = query.eq('client_type', filters.client_type);
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'name':
          query = query.order('first_name', { ascending: true });
          break;
        case 'activity':
          // Would need to order by last case activity
          query = query.order('updated_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Process clients with aggregated data
      const processedClients: Client[] = (data || []).map((c: any) => {
        const cases = c.cases || [];
        const payments = c.payments || [];
        const activeCases = cases.filter((cs: any) => 
          ['new', 'in_progress', 'pending_review'].includes(cs.status)
        ).length;
        const totalSpent = payments
          .filter((p: any) => p.status === 'completed')
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        const lastActivity = cases.length > 0 
          ? cases.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0].created_at
          : null;

        return {
          id: c.id,
          user_id: c.user_id,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          phone: c.phone,
          avatar_url: c.avatar_url,
          company_name: c.company_name,
          gstin: c.gstin,
          address: c.address,
          city: c.city,
          state: c.state,
          pincode: c.pincode,
          client_type: c.client_type || 'individual',
          is_verified: c.is_verified,
          created_at: c.created_at,
          total_cases: cases.length,
          active_cases: activeCases,
          total_spent: totalSpent,
          last_activity: lastActivity,
        };
      });

      setClients(processedClients);
      setTotalClients(count || 0);

      // Calculate stats
      const totalRevenue = processedClients.reduce((sum, c) => sum + c.total_spent, 0);
      const activeClients = processedClients.filter(c => c.active_cases > 0).length;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = processedClients.filter(
        c => new Date(c.created_at) >= thisMonth
      ).length;

      setStats({
        total: count || 0,
        active: activeClients,
        new_this_month: newThisMonth,
        total_revenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, [user, role, supabase, page, filters]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.client_type, filters.status, filters.sort_by]);

  const handleViewClient = (clientId: string) => {
    router.push(`/clients/${clientId}`);
  };

  const handleMessageClient = (clientId: string) => {
    // Create or navigate to conversation
    router.push(`/chat?client=${clientId}`);
  };

  const handleScheduleMeeting = (clientId: string) => {
    router.push(`/appointments?client=${clientId}`);
  };

  const totalPages = Math.ceil(totalClients / PAGE_SIZE);

  // Redirect if not CA
  if (role && role !== 'ca') {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p>This page is only available for CAs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Clients"
          value={stats.total}
          icon={Users}
          description="All registered clients"
        />
        <StatsCard
          title="Active Clients"
          value={stats.active}
          icon={Briefcase}
          description="With active cases"
        />
        <StatsCard
          title="New This Month"
          value={stats.new_this_month}
          icon={UserPlus}
          description="Recently joined"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.total_revenue.toLocaleString('en-IN')}`}
          icon={Star}
          description="From all clients"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                className="pl-9"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <Select
              value={filters.client_type}
              onValueChange={(value) => setFilters({ ...filters, client_type: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Client Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="startup">Startup</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sort_by}
              onValueChange={(value) => setFilters({ ...filters, sort_by: value })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="activity">Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {filters.search
                  ? 'Try adjusting your search or filters'
                  : 'Add your first client to get started'}
              </p>
              {!filters.search && (
                <Button onClick={() => setAddDialogOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Company / Type</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Cases</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <ClientRow
                      key={client.id}
                      client={client}
                      onView={() => handleViewClient(client.id)}
                      onMessage={() => handleMessageClient(client.user_id)}
                      onSchedule={() => handleScheduleMeeting(client.id)}
                    />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * PAGE_SIZE + 1} to{' '}
                    {Math.min(page * PAGE_SIZE, totalClients)} of {totalClients} clients
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchClients}
      />
    </div>
  );
}
