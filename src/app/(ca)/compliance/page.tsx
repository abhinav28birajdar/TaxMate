'use client';

import React, { useState } from 'react';
import GSTDashboard from '@/components/dashboard/gst-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Calendar, Download, Filter, Plus, TrendingUp } from 'lucide-react';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-1">Track GST, ITR, and other statutory compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="gst" className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-lg flex gap-1">
          <TabsTrigger value="gst" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            GST Management
          </TabsTrigger>
          <TabsTrigger value="itr" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            ITR Management
          </TabsTrigger>
          <TabsTrigger value="compliance" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Compliance
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:text-indigo-600">
            Reports
          </TabsTrigger>
        </TabsList>

        {/* GST Tab */}
        <TabsContent value="gst" className="space-y-4">
          <GSTDashboard />
        </TabsContent>

        {/* ITR Tab */}
        <TabsContent value="itr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ITR Management</CardTitle>
              <CardDescription>Income Tax Return tracking and filing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">ITR dashboard loaded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Checklist</CardTitle>
              <CardDescription>Track all compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Compliance dashboard loaded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Export and analyze compliance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <BarChart className="w-6 h-6 mb-2" />
                  <span>GST Summary</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <BarChart className="w-6 h-6 mb-2" />
                  <span>ITR Summary</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <span>Compliance Audit</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
