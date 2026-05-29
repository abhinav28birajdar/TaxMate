'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Mail, Phone, Shield, Trash2, Edit, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeamPage() {
  const [teamMembers] = useState([
    {
      id: '1',
      name: 'Rajesh Kumar',
      email: 'rajesh@taxmate.com',
      designation: 'Senior Associate',
      department: 'Compliance',
      performance: 92,
      status: 'active',
      joinDate: '2024-01-15',
      assignedClients: 12,
      completedTasks: 45,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@taxmate.com',
      designation: 'Associate',
      department: 'Audit',
      performance: 85,
      status: 'active',
      joinDate: '2024-02-01',
      assignedClients: 8,
      completedTasks: 32,
    },
    {
      id: '3',
      name: 'Amit Patel',
      email: 'amit@taxmate.com',
      designation: 'Junior Associate',
      department: 'GST',
      performance: 78,
      status: 'active',
      joinDate: '2024-03-10',
      assignedClients: 5,
      completedTasks: 18,
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage team members, assign tasks, and track performance</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
              <Users className="w-10 h-10 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {teamMembers.filter(m => m.status === 'active').length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Performance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length)}%
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-purple-600">
                  {teamMembers.reduce((sum, m) => sum + m.assignedClients, 0)}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="members" className="data-[state=active]:bg-white">
            Team Members
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-white">
            Performance
          </TabsTrigger>
          <TabsTrigger value="workload" className="data-[state=active]:bg-white">
            Workload
          </TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage and monitor your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.designation}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {member.department}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Performance</p>
                        <p className="text-lg font-bold text-indigo-600">{member.performance}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Tasks</p>
                        <p className="text-lg font-bold text-gray-900">{member.completedTasks}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      <span className="text-sm font-bold text-indigo-600">{member.performance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition"
                        style={{ width: `${member.performance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workload Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Clients</p>
                        <p className="font-bold text-gray-900">{member.assignedClients}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Tasks</p>
                        <p className="font-bold text-gray-900">{member.completedTasks}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Load</p>
                        <Badge>{Math.round((member.assignedClients * 100) / 20)}%</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
