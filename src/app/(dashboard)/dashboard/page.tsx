'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  Users,
  FileText,
  IndianRupee,
  Calendar,
  Timer,
  Zap,
  Plus,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { TaxRefundTracker, TaxRefund } from '@/components/dashboard/TaxRefundTracker';
import { AiConsultant } from '@/components/dashboard/AiConsultant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/AuthContext';
import { cn } from '@/lib/utils';
import { startOfMonth } from 'date-fns';

// Types
interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  activeCases: number;
  casesChange: number;
  totalClients: number;
  clientsChange: number;
  pendingTasks: number;
  completedTasks: number;
  avgRating: number;
  totalReviews: number;
}

interface RecentCase {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  client_name: string;
  client_avatar: string | null;
  created_at: string;
  due_date: string | null;
}

interface CaseQueryResult {
  id: string;
  case_number: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  due_date: string | null;
  client: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  } | null;
}

// Status colors
const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  pending_review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  on_hold: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const priorityColors: Record<string, string> = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-orange-500',
  urgent: 'border-l-red-500',
};

// Chart colors
const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];

// Stats Card Component
const CyberCorner = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const positions = {
    'top-left': 'top-0 left-0 border-t border-l',
    'top-right': 'top-0 right-0 border-t border-r',
    'bottom-left': 'bottom-0 left-0 border-b border-l',
    'bottom-right': 'bottom-0 right-0 border-b border-r',
  };

  return (
    <div className={`absolute w-2 h-2 ${positions[position]} border-primary animate-pulse`} />
  );
};

function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  loading = false,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}) {
  const isPositive = change && change > 0;

  return (
    <Card className="relative bg-zinc-950/50 border-primary/10 rounded-none overflow-hidden group hover:border-primary/30 transition-all duration-500">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-12 h-12 rotate-12" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors">{title}</CardTitle>
        <div className="p-1.5 bg-primary/5 border border-primary/10 group-hover:border-primary group-hover:bg-primary/20 transition-all">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24 bg-primary/5" />
            <Skeleton className="h-4 w-32 bg-primary/5" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-black italic tracking-tighter uppercase text-foreground group-hover:translate-x-1 transition-transform">{value}</div>
            {change !== undefined && (
              <p className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-2">
                <span className={cn(
                  "px-1.5 py-0.5 border flex items-center justify-center",
                  isPositive ? 'text-primary border-primary/20 bg-primary/5' : 'text-red-500 border-red-500/20 bg-red-500/5'
                )}>
                  {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-muted-foreground/60">{changeLabel}</span>
              </p>
            )}
          </>
        )}
      </CardContent>
      <CyberCorner position="top-left" />
      <CyberCorner position="bottom-right" />
    </Card>
  );
}

export default function DashboardPage() {
  const { user, profile, role } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    revenueChange: 0,
    activeCases: 0,
    casesChange: 0,
    totalClients: 0,
    clientsChange: 0,
    pendingTasks: 0,
    completedTasks: 0,
    avgRating: 0,
    totalReviews: 0,
  });
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [refunds, setRefunds] = useState<TaxRefund[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const now = new Date();
      const thisMonthStart = startOfMonth(now);

      if (role === 'ca') {
        const { data: caProfile } = await supabase
          .from('ca_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!caProfile) return;

        const { count: activeCasesCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('ca_id', caProfile.id)
          .in('status', ['new', 'in_progress', 'pending_review']);

        const { data: thisMonthRevenue } = await supabase
          .from('payments')
          .select('amount')
          .eq('ca_id', caProfile.id)
          .eq('status', 'completed')
          .gte('created_at', thisMonthStart.toISOString());

        const totalRevenue = thisMonthRevenue?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

        const { data: casesData } = await supabase
          .from('cases')
          .select(`
            id, case_number, title, status, priority, created_at, due_date,
            client:client_profiles!cases_client_id_fkey(first_name, last_name, avatar_url)
          `)
          .eq('ca_id', caProfile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (casesData) {
          setRecentCases(
            (casesData as unknown as CaseQueryResult[]).map((c) => ({
              id: c.id,
              case_number: c.case_number,
              title: c.title,
              status: c.status,
              priority: c.priority,
              client_name: c.client ? `${c.client.first_name} ${c.client.last_name}` : 'Unknown',
              client_avatar: c.client?.avatar_url,
              created_at: c.created_at,
              due_date: c.due_date,
            }))
          );
        }

        setStats(prev => ({
          ...prev,
          totalRevenue,
          activeCases: activeCasesCount || 0,
          totalClients: 24, // Mock
          pendingTasks: 8, // Mock
        }));

      } else {
        const { data: clientProfile } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!clientProfile) return;

        const { count: activeCasesCount } = await supabase
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', clientProfile.id)
          .in('status', ['new', 'in_progress', 'pending_review']);

        setStats(prev => ({
          ...prev,
          activeCases: activeCasesCount || 0,
          totalRevenue: 5400, // Mock for client
          pendingTasks: 3, // Mock
        }));
      }

      setRefunds([
        {
          id: '1',
          assessment_year: '2024-25',
          status: 'processed',
          refund_amount: 15420,
          filing_date: '2024-05-15',
          bank_account_last4: '4521'
        },
        {
          id: '2',
          assessment_year: '2023-24',
          status: 'refund_credited',
          refund_amount: 8750,
          filing_date: '2023-06-10',
          credited_date: '2023-08-22',
          bank_account_last4: '4521'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, role, supabase]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const displayName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'there'
    : 'there';

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-l-2 border-primary pl-6 py-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent -translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
        <div className="relative z-10">
          <Badge className="mb-3 rounded-none bg-primary/20 text-primary border-primary/50 font-black uppercase tracking-[0.2em] text-[10px]">Level: Operator</Badge>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
            Main <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.1em] mt-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-primary rounded-full animate-ping" />
            Active Session for: {displayName}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10">
          <Button variant="outline" size="lg" className="h-12 border-primary/20 text-foreground hover:bg-primary/10 rounded-none font-black uppercase tracking-widest text-[10px] hidden sm:flex" onClick={() => router.push('/billing')}>
            <FileText className="mr-2 h-4 w-4 text-primary" />
            Export Logs
          </Button>
          {role === 'ca' && (
            <Button size="lg" className="h-12 bg-primary text-black hover:bg-primary/90 rounded-none font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(34,197,94,0.3)]" onClick={() => router.push('/cases')}>
              <Plus className="mr-2 h-4 w-4" />
              Initialize Case
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={role === 'ca' ? 'Monthly Revenue' : 'Amount Due'}
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          icon={IndianRupee}
          loading={loading}
          change={12.5}
          changeLabel="relative to last cycle"
        />
        <StatsCard
          title="Active Cases"
          value={stats.activeCases}
          icon={Briefcase}
          loading={loading}
          change={-2.4}
          changeLabel="case velocity"
        />
        <StatsCard
          title={role === 'ca' ? 'Total Clients' : 'Appointments'}
          value={role === 'ca' ? stats.totalClients : 0}
          icon={role === 'ca' ? Users : Calendar}
          loading={loading}
          change={5.1}
          changeLabel="network growth"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={Timer}
          loading={loading}
          change={0}
          changeLabel="static queue"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-white/5 p-1 rounded-none border border-primary/10 backdrop-blur-xl">
          <TabsTrigger value="overview" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 italic">Overview</TabsTrigger>
          <TabsTrigger value="insights" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 flex items-center gap-2 italic">
            <Zap className="h-3 w-3" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] h-10 px-6 italic">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0 outline-none">
          <div className="grid gap-6 lg:grid-cols-7">
            <Card className={cn("bg-zinc-950/40 border-primary/10 rounded-none relative overflow-hidden", role === 'ca' ? 'col-span-4' : 'col-span-7')}>
              <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 pb-4">
                <div>
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic">Active Protocols</CardTitle>
                  <CardDescription className="text-[10px] uppercase font-bold tracking-widest opacity-50">Latest operational cases</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push('/cases')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 italic">
                  Link All Protocols
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full bg-primary/5 rounded-none" />
                    ))}
                  </div>
                ) : recentCases.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-4 opacity-30">
                    <Briefcase className="w-12 h-12" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] font-sans">No active protocols detected</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCases.map((caseItem) => (
                      <div
                        key={caseItem.id}
                        className="group/item flex items-center gap-5 p-4 bg-white/5 hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer transition-all duration-300 relative"
                        onClick={() => router.push(`/cases/${caseItem.id}`)}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12 rounded-none border border-primary/20 p-0.5">
                            <AvatarImage src={caseItem.client_avatar || ''} className="rounded-none object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-black italic rounded-none">{caseItem.client_name[0]}</AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -top-1 -left-1 w-2 h-2 rounded-none border-t border-l border-primary opacity-0 group-hover/item:opacity-100 transition-opacity"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">#{caseItem.case_number}</span>
                            <Badge variant="outline" className={cn(
                              "text-[8px] rounded-none py-0 uppercase font-black tracking-widest",
                              statusColors[caseItem.status]
                            )}>
                              {caseItem.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="font-black uppercase italic tracking-tighter text-sm group-hover/item:text-primary transition-colors">{caseItem.title}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">Client: {caseItem.client_name}</p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black uppercase tracking-widest mb-1">Priority</p>
                          <div className={cn("h-1 w-16 bg-muted/20 relative")}>
                            <div className={cn(
                              "absolute inset-y-0 left-0",
                              caseItem.priority === 'urgent' ? 'w-full bg-red-500' :
                                caseItem.priority === 'high' ? 'w-3/4 bg-orange-500' :
                                  caseItem.priority === 'medium' ? 'w-1/2 bg-yellow-500' : 'w-1/4 bg-green-500'
                            )} />
                          </div>
                        </div>
                        <div className="p-2 border border-primary/10 opacity-0 group-hover/item:opacity-100 group-hover/item:bg-primary group-hover/item:text-black transition-all">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CyberCorner position="top-left" />
              <CyberCorner position="bottom-right" />
            </Card>

            {role === 'ca' && (
              <Card className="col-span-3 bg-zinc-950/40 border-primary/10 rounded-none relative overflow-hidden flex flex-col">
                <CardHeader className="border-b border-primary/5">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] italic">Sync Schedule</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col items-center justify-center p-12 text-center group/empty">
                  <div className="relative w-20 h-20 mb-6 group-hover/empty:scale-110 transition-transform">
                    <Calendar className="h-full w-full opacity-10 text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-ping" />
                    </div>
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">No pending syncs</p>
                  <p className="text-[9px] text-muted-foreground opacity-50 uppercase font-bold tracking-widest">Protocol queue is currently empty</p>
                  <Button variant="outline" className="mt-8 border-primary/20 text-[10px] font-black uppercase tracking-widest rounded-none h-10 hover:bg-primary/5 group-hover/empty:border-primary transition-all">
                    Initiate Connection
                  </Button>
                </CardContent>
                <CyberCorner position="top-left" />
                <CyberCorner position="bottom-right" />
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6 mt-0">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <AiConsultant />
            </div>
            <div className="col-span-3 space-y-6">
              <TaxRefundTracker refunds={refunds} loading={loading} />
              <Card className="bg-primary/5 border border-primary/20 rounded-none relative group overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    Optimization Pulse
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">
                    <span className="text-primary font-black">[ALERT]</span> Consider diversifying into ELSS before cycle end to maximize 80C threshold efficiency.
                  </p>
                </CardContent>
                <div className="absolute bottom-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
                  <Zap className="w-20 h-20" />
                </div>
                <CyberCorner position="top-left" />
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-zinc-950/40 border-primary/10 rounded-none relative">
            <CardContent className="h-[400px] flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic">Decrypting audit trail logs...</p>
            </CardContent>
            <CyberCorner position="top-left" />
            <CyberCorner position="bottom-right" />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
