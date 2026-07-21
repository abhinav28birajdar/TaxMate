'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, Plus, TrendingUp } from 'lucide-react';

interface GSTRecord {
  id: string;
  clientId: string;
  month: number;
  year: number;
  gstrType: string;
  status: string;
  dueDate: string;
  filingDate?: string;
  totalTax: number;
}

export function GSTDashboard() {
  const [records, setRecords] = useState<GSTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    filed: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchGSTRecords();
  }, []);

  const fetchGSTRecords = async () => {
    try {
      const response = await fetch('/api/gst');
      const { data } = await response.json();
      setRecords(data || []);
      
      // Calculate stats
      const total = data?.length || 0;
      const filed = data?.filter((r: GSTRecord) => r.status === 'filed').length || 0;
      const pending = data?.filter((r: GSTRecord) => r.status === 'not-started').length || 0;
      const overdue = data?.filter((r: GSTRecord) => 
        r.status !== 'filed' && new Date(r.dueDate) < new Date()
      ).length || 0;

      setStats({ total, filed, pending, overdue });
    } catch (error) {
      console.error('Failed to fetch GST records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);

    if (status === 'filed') {
      return <Badge className="bg-primary">Filed</Badge>;
    }
    if (due < now) {
      return <Badge className="bg-red-500">Overdue</Badge>;
    }
    if (due.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return <Badge className="bg-amber-500">Due Soon</Badge>;
    }
    return <Badge className="bg-gray-500">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total GST Returns</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Filed</p>
                <p className="text-2xl font-bold text-foreground">{stats.filed}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-foreground">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main GST Records Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>GST Filing Timeline</CardTitle>
            <CardDescription>Track all GST filed returns and deadlines</CardDescription>
          </div>
          <Button className="bg-primary hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New GST Record
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading GST records...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">No GST records found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">GSTR Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month/Year</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total Tax</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{record.gstrType.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {record.month}/{record.year}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(record.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(record.status, record.dueDate)}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ₹{record.totalTax?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GST Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filing Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Compliance Rate:</span>
                <span className="text-lg font-bold text-indigo-600">
                  {stats.total > 0 ? Math.round((stats.filed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">On-Time Filings:</span>
                <span className="text-lg font-bold text-green-600">{stats.filed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Late Filings:</span>
                <span className="text-lg font-bold text-red-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Revenue by GST returns</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">↑ 12%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GSTDashboard;
