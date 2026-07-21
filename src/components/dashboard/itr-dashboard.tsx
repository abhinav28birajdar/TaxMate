'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, Plus, TrendingDown } from 'lucide-react';

interface ITRRecord {
  id: string;
  clientId: string;
  financialYear: string;
  itrType: string;
  status: string;
  dueDate: string;
  filingDate?: string;
  taxAmount: number;
  refundAmount?: number;
}

export function ITRDashboard() {
  const [records, setRecords] = useState<ITRRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    filed: 0,
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    fetchITRRecords();
  }, []);

  const fetchITRRecords = async () => {
    try {
      const response = await fetch('/api/itr');
      const { data } = await response.json();
      setRecords(data || []);

      const total = data?.length || 0;
      const filed = data?.filter((r: ITRRecord) => r.status === 'filed').length || 0;
      const pending = data?.filter((r: ITRRecord) => r.status === 'not-started').length || 0;
      const overdue = data?.filter((r: ITRRecord) => 
        r.status !== 'filed' && new Date(r.dueDate) < new Date()
      ).length || 0;

      setStats({ total, filed, pending, overdue });
    } catch (error) {
      console.error('Failed to fetch ITR records:', error);
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
                <p className="text-sm text-muted-foreground">Total ITRs</p>
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
              <Clock className="w-10 h-10 text-orange-600" />
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

      {/* Main ITR Records Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Income Tax Returns</CardTitle>
            <CardDescription>Track all ITR filings and due dates</CardDescription>
          </div>
          <Button className="bg-primary hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            New ITR Record
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading ITR records...</div>
            </div>
          ) : records.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">No ITR records found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ITR Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Financial Year</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tax Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Refund</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{record.itrType.toUpperCase()}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{record.financialYear}</td>
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
                        ₹{record.taxAmount?.toLocaleString() || '0'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {record.refundAmount ? (
                          <span className="text-green-600 font-medium">
                            ₹{record.refundAmount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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

      {/* ITR Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Tax Paid:</span>
                <span className="text-lg font-bold text-red-600">
                  ₹{records.reduce((sum, r) => sum + (r.taxAmount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Refunds:</span>
                <span className="text-lg font-bold text-green-600">
                  ₹{records.reduce((sum, r) => sum + (r.refundAmount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Net Position:</span>
                <span className="text-lg font-bold">
                  {records.reduce((sum, r) => sum + (r.refundAmount || 0) - (r.taxAmount || 0), 0) > 0 ? (
                    <span className="text-green-600">
                      ₹{Math.abs(records.reduce((sum, r) => sum + (r.refundAmount || 0) - (r.taxAmount || 0), 0)).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ₹{Math.abs(records.reduce((sum, r) => sum + (r.refundAmount || 0) - (r.taxAmount || 0), 0)).toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filing Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <TrendingDown className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Average Tax Relief</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">8.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ITRDashboard;
