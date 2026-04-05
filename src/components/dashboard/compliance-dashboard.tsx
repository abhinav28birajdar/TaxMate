'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, CheckCircle, Clock, TrendingUp, Plus, AlertTriangle } from 'lucide-react';

interface ComplianceItem {
  id: string;
  clientId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  dueDate: string;
  frequency: string;
}

export function ComplianceDashboard() {
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueSoon: 0,
    complianceScore: 0,
  });

  useEffect(() => {
    fetchComplianceItems();
  }, []);

  const fetchComplianceItems = async () => {
    try {
      const response = await fetch('/api/compliance');
      const { data } = await response.json();
      setItems(data || []);

      const total = data?.length || 0;
      const completed = data?.filter((i: ComplianceItem) => i.status === 'completed').length || 0;
      const pending = data?.filter((i: ComplianceItem) => i.status === 'not-started').length || 0;
      
      const now = new Date();
      const overdue = data?.filter((i: ComplianceItem) => 
        i.status !== 'completed' && new Date(i.dueDate) < now
      ).length || 0;

      const dueSoon = data?.filter((i: ComplianceItem) =>
        i.status !== 'completed' &&
        new Date(i.dueDate) > now &&
        new Date(i.dueDate).getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
      ).length || 0;

      setStats({
        total,
        completed,
        pending,
        overdue,
        dueSoon,
        complianceScore: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    } catch (error) {
      console.error('Failed to fetch compliance items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Compliance Score</p>
                <p className="text-3xl font-bold text-blue-900">{stats.complianceScore}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Active Items</p>
                <p className="text-3xl font-bold text-purple-900">{stats.total - stats.completed}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Critical Issues</p>
                <p className="text-3xl font-bold text-red-900">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Compliance Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Compliance Checklist</CardTitle>
            <CardDescription>Monitor all compliance requirements and due dates</CardDescription>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading compliance items...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">No compliance items found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex gap-3 flex-1">
                    {getStatusIcon(item.status)}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                      <div className="flex gap-2 mt-2">
                        {getPriorityBadge(item.priority)}
                        <Badge variant="outline">{item.type.toUpperCase()}</Badge>
                        {item.frequency !== 'once' && (
                          <Badge variant="outline" className="text-xs">
                            {item.frequency}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Due: {new Date(item.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {Math.ceil((new Date(item.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2 text-indigo-600">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['gst', 'itr', 'tds', 'esi', 'epf', 'audit'].map((type) => {
                const count = items.filter(i => i.type === type).length;
                const completed = items.filter(i => i.type === type && i.status === 'completed').length;
                const percentage = count > 0 ? Math.round((completed / count) * 100) : 0;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{type.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <span className="text-lg font-bold text-green-600">{stats.completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {items.filter(i => i.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-gray-600">Overdue</span>
                </div>
                <span className="text-lg font-bold text-red-600">{stats.overdue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ComplianceDashboard;
