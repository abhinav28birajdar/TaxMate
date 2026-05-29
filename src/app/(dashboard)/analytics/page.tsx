'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Calendar, Download, Filter, LineChart, Plus, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
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
      if (!response.ok) throw new Error('Failed to fetch');
      const { data } = await response.json();
      setMetrics(data || {
        totalRevenue: 450000,
        monthlyRevenue: 52000,
        totalClients: 24,
        averageInvoiceValue: 8500,
        pendingTasks: 12,
        activeProjects: 18
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setMetrics({
        totalRevenue: 450000,
        monthlyRevenue: 52000,
        totalClients: 24,
        averageInvoiceValue: 8500,
        pendingTasks: 12,
        activeProjects: 18
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-zinc-900/50 rounded animate-pulse w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Analytics</h1>
          <p className="text-zinc-400 mt-1">Track revenue, expenses, and financial insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-white/5">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-green-600 text-white hover:bg-green-500">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 border-green-500/20 hover:border-green-500/40 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{(metrics.totalRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">Lifetime earnings</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-green-500/20 hover:border-green-500/40 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{(metrics.monthlyRevenue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">This month</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-green-500/20 hover:border-green-500/40 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Active Clients</p>
                  <p className="text-2xl font-bold text-white">{metrics.totalClients || 0}</p>
                  <p className="text-xs text-zinc-500 mt-2">Ongoing relationships</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/50 border-green-500/20 hover:border-green-500/40 transition">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Avg. Invoice Value</p>
                  <p className="text-2xl font-bold text-white">
                    ₹{(metrics.averageInvoiceValue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">Per transaction</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <FileText className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart Tabs */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue performance and projections</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="bg-zinc-800 border-b border-zinc-700">
              <TabsTrigger value="revenue" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <BarChart className="w-4 h-4 mr-2" />
                Revenue
              </TabsTrigger>
              <TabsTrigger value="growth" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <LineChart className="w-4 h-4 mr-2" />
                Growth
              </TabsTrigger>
              <TabsTrigger value="forecast" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Forecast
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="mt-6 h-64 flex items-center justify-center bg-zinc-950 rounded-lg">
              <div className="text-center">
                <p className="text-zinc-400 mb-2">📊 Revenue Chart</p>
                <p className="text-sm text-zinc-500">Chart visualization would appear here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="growth" className="mt-6 h-64 flex items-center justify-center bg-zinc-950 rounded-lg">
              <div className="text-center">
                <p className="text-zinc-400 mb-2">📈 Growth Chart</p>
                <p className="text-sm text-zinc-500">Growth metrics visualization would appear here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="forecast" className="mt-6 h-64 flex items-center justify-center bg-zinc-950 rounded-lg">
              <div className="text-center">
                <p className="text-zinc-400 mb-2">🔮 Forecast Chart</p>
                <p className="text-sm text-zinc-500">Revenue projections would appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Invoice Collection Rate', value: '94%', trend: '+2.5%' },
              { label: 'Client Retention Rate', value: '98%', trend: '+1.2%' },
              { label: 'Average Project Duration', value: '24 days', trend: '-3 days' },
              { label: 'Customer Satisfaction', value: '4.8/5', trend: '+0.2' },
            ].map((metric, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 rounded border border-zinc-800">
                <div>
                  <p className="text-sm text-zinc-400">{metric.label}</p>
                  <p className="text-lg font-semibold text-white mt-1">{metric.value}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {metric.trend}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-green-600 hover:bg-green-500 text-white justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Create New Invoice
            </Button>
            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
              <Download className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
