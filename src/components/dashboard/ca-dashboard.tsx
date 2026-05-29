'use client';

import React, { useEffect, useState } from 'react';
import { clientService, invoiceService, taskService, activityService } from '@/lib/services';
import {
  Card,
  StatCard,
  DataTable,
  Badge,
  LoadingSpinner,
  Button,
} from '@/components/ui/core-components';
import { colors } from '@/theme/design-system';

// ============================================================================
// CA DASHBOARD COMPONENT
// Main dashboard for Chartered Accountants
// ============================================================================

export const CADashboard: React.FC<{ caId: string }> = ({ caId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, [caId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data in parallel
      const [clientStats, revenue, pendingTasksList, invoicesList, activities] = await Promise.all([
        clientService.getClientStats(caId),
        invoiceService.getRevenueAnalytics(caId),
        taskService.getTasks(caId, { status: 'pending', limit: 5 }),
        invoiceService.getInvoices(caId, { status: 'pending', limit: 5 }),
        activityService.getActivityFeed(caId, 10),
      ]);

      setStats(clientStats);
      setRevenueData(revenue);
      setPendingTasks(pendingTasksList.data || []);
      setRecentInvoices(invoicesList.data || []);
      setActivityFeed(activities || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: colors.background.default }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p style={{ color: colors.neutral[600] }}>Welcome back! Here's your business overview.</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Clients"
          value={stats?.total_clients || 0}
          icon="👥"
          subtitle="Active clients"
          trend="up"
          trendValue="+12% this month"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(revenueData?.total_revenue || 0).toLocaleString('en-IN')}`}
          icon="💰"
          subtitle="All time"
          trend="up"
          trendValue="+8% from last month"
        />
        <StatCard
          title="Pending Invoices"
          value={recentInvoices.length}
          icon="📄"
          subtitle="Awaiting payment"
          trend="down"
          trendValue="-3 from yesterday"
        />
        <StatCard
          title="Pending Tasks"
          value={pendingTasks.length}
          icon="✓"
          subtitle="To be completed"
          trend="up"
          trendValue="+2 new tasks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Invoices */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pending Invoices</h2>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </div>
            {recentInvoices.length > 0 ? (
              <DataTable
                columns={[
                  { key: 'invoice_number', label: 'Invoice #' },
                  {
                    key: 'total_amount',
                    label: 'Amount',
                    render: (value) => `₹${Number(value).toLocaleString('en-IN')}`,
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (value) => <Badge variant={value === 'paid' ? 'success' : 'warning'}>{value}</Badge>,
                  },
                  {
                    key: 'due_date',
                    label: 'Due Date',
                    render: (value) => new Date(value).toLocaleDateString(),
                  },
                ]}
                data={recentInvoices}
              />
            ) : (
              <p style={{ color: colors.neutral[500] }}>No pending invoices</p>
            )}
          </Card>

          {/* Pending Tasks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Pending Tasks</h2>
              <Button size="sm" variant="outline">
                View All
              </Button>
            </div>
            {pendingTasks.length > 0 ? (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-4 p-3 rounded-lg border" style={{ borderColor: colors.neutral[200] }}>
                    <input type="checkbox" className="mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{task.title}</h3>
                      <p style={{ color: colors.neutral[600] }} className="text-sm">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge size="sm" variant={task.priority === 'high' ? 'danger' : 'info'}>
                          {task.priority}
                        </Badge>
                        <span style={{ color: colors.neutral[500] }} className="text-xs">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: colors.neutral[500] }}>No pending tasks</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="primary" fullWidth>
                + Add Client
              </Button>
              <Button variant="secondary" fullWidth>
                + Create Invoice
              </Button>
              <Button variant="secondary" fullWidth>
                + Assign Task
              </Button>
              <Button variant="secondary" fullWidth>
                📞 Schedule Call
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activityFeed.slice(0, 5).map((activity) => (
                <div key={activity.id} className="pb-3 border-b" style={{ borderColor: colors.neutral[200] }}>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p style={{ color: colors.neutral[600] }} className="text-xs mt-1">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card>
            <h2 className="text-xl font-bold mb-4">📌 Alerts</h2>
            <div className="space-y-2">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: colors.warning[50], borderLeft: `4px solid ${colors.warning[500]}` }}
              >
                <p className="text-sm font-medium" style={{ color: colors.warning[700] }}>
                  3 documents expiring soon
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: colors.danger[50], borderLeft: `4px solid ${colors.danger[500]}` }}
              >
                <p className="text-sm font-medium" style={{ color: colors.danger[700] }}>
                  5 invoices overdue
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: colors.info[50], borderLeft: `4px solid ${colors.info[500]}` }}
              >
                <p className="text-sm font-medium" style={{ color: colors.info[700] }}>
                  GST filing due in 8 days
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CADashboard;
