'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Calendar, Download, Filter, LineChart, Plus, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/analytics?caId=current');
      const { data } = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-1">Track revenue, expenses, and financial insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    ₹{(metrics.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Active Clients</p>
                  <p className="text-2xl font-bold text-blue-900">{metrics.totalClients || 0}</p>
                </div>
                <LineChart className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Avg. Invoice Value</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ₹{(metrics.averageInvoiceValue || 0).toLocaleString()}
                  </p>
                </div>
                <BarChart className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-orange-900">{metrics.pendingTasks || 0}</p>
                </div>
                <Calendar className="w-10 h-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-lg flex gap-1">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Client Analytics
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Services
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Revenue Chart</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['GST Filing', 'ITR Filing', 'Audit', 'Registration', 'Other'].map((service) => (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{service}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: Math.random() * 100 + '%' }}
                          />
                        </div>
                        <span className="text-sm font-medium">₹{Math.random() * 50000 | 0}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Client Analytics Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Top Clients</p>
                    <p className="text-sm text-gray-600">Highest revenue contributors</p>
                  </div>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Client Retention</p>
                    <p className="text-sm text-gray-600">Active vs. inactive clients</p>
                  </div>
                  <Badge>92%</Badge>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Client Lifetime Value</p>
                    <p className="text-sm text-gray-600">Average value per client</p>
                  </div>
                  <span className="font-bold text-indigo-600">₹45,000</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service-wise Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Service Revenue Chart</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Trends Chart</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
