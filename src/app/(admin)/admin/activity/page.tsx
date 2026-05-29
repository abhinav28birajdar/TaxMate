'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ActivityLog {
  id: string;
  userId?: string;
  email?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 50;

  const fetchActivities = async (page: number = 1, user?: string, action?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      if (user) params.append('user', user);
      if (action) params.append('action', action);

      const response = await fetch(`/api/v1/activity?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');

      const data: ApiResponse<{ logs: ActivityLog[]; total: number }> = await response.json();
      if (data.data) {
        setActivities(data.data.logs);
        setTotalPages(Math.ceil(data.data.total / pageSize));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, userFilter, actionFilter);
  }, []);

  const handleUserFilter = (value: string) => {
    setUserFilter(value);
    fetchActivities(1, value, actionFilter);
  };

  const handleActionFilter = (value: string) => {
    setActionFilter(value);
    fetchActivities(1, userFilter, value);
  };

  const commonActions = [
    'user_signup',
    'user_login',
    'user_logout',
    'password_reset',
    'password_changed',
    'profile_updated',
    'file_uploaded',
    'file_deleted',
    'ticket_created',
    'ticket_updated',
  ];

  const getActionBadgeVariant = (action: string) => {
    if (action.includes('delete') || action.includes('logout')) return 'destructive';
    if (action.includes('create') || action.includes('upload') || action.includes('login')) return 'default';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Activity Log</h2>
        <p className="text-sm text-gray-600 mt-1">System-wide activity and audit trail</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Filter by User Email</label>
              <Input
                placeholder="user@example.com"
                value={userFilter}
                onChange={(e) => handleUserFilter(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Filter by Action</label>
              <Select value={actionFilter} onValueChange={handleActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {commonActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No activities found
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start justify-between gap-4 p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm text-gray-600">{activity.email || 'System'}</span>
                      <Badge variant={getActionBadgeVariant(activity.action)}>
                        {activity.action.replace(/_/g, ' ')}
                      </Badge>
                      {activity.resourceType && (
                        <span className="text-xs text-gray-500">
                          {activity.resourceType}
                          {activity.resourceId && ` (${activity.resourceId.slice(0, 8)}...)`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span>{format(new Date(activity.createdAt), 'MMM d, yyyy HH:mm:ss')}</span>
                      {activity.ipAddress && (
                        <span className="font-mono">IP: {activity.ipAddress}</span>
                      )}
                    </div>
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                        <pre className="overflow-auto max-h-20">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => fetchActivities(currentPage - 1, userFilter, actionFilter)}
              >
                Previous
              </Button>
              <span className="flex items-center text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => fetchActivities(currentPage + 1, userFilter, actionFilter)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
