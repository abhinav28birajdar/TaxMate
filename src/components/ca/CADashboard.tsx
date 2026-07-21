'use client';

import React, { useState } from 'react';
import {
  Users,
  Briefcase,
  DollarSign,
  TrendingUp,
  Calendar,
  MessageSquare,
  Phone,
  FileText,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  MoreVertical
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function CADashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - Replace with Supabase data
  const stats = {
    totalClients: 156,
    clientsChange: 12,
    activeCases: 45,
    casesChange: 8,
    monthlyRevenue: 285000,
    revenueChange: 15.3,
    avgRating: 4.8,
    ratingChange: 0.2
  };

  const recentCases = [
    {
      id: '1',
      title: 'ITR Filing FY 2023-24',
      client: 'Rajesh Kumar',
      status: 'in_progress',
      dueDate: '2024-07-31',
      priority: 'high'
    },
    {
      id: '2',
      title: 'GST Return Q1 2024',
      client: 'Priya Sharma',
      status: 'pending_documents',
      dueDate: '2024-02-20',
      priority: 'urgent'
    },
    {
      id: '3',
      title: 'Company Audit 2024',
      client: 'Tech Solutions Pvt Ltd',
      status: 'under_review',
      dueDate: '2024-09-30',
      priority: 'medium'
    }
  ];

  const upcomingAppointments = [
    {
      id: '1',
      client: 'Amit Patel',
      type: 'Video Call',
      time: '2024-01-27 10:00 AM',
      duration: '30 min'
    },
    {
      id: '2',
      client: 'Sneha Reddy',
      type: 'In-Person',
      time: '2024-01-27 2:00 PM',
      duration: '1 hour'
    },
    {
      id: '3',
      client: 'Vikram Singh',
      type: 'Phone Call',
      time: '2024-01-28 11:00 AM',
      duration: '45 min'
    }
  ];

  const recentMessages = [
    {
      id: '1',
      client: 'Rajesh Kumar',
      message: 'Thank you for the quick response!',
      time: '5 min ago',
      unread: true
    },
    {
      id: '2',
      client: 'Priya Sharma',
      message: 'Could you please review the GST returns?',
      time: '1 hour ago',
      unread: true
    },
    {
      id: '3',
      client: 'Amit Patel',
      message: 'I have uploaded all the required documents.',
      time: '2 hours ago',
      unread: false
    }
  ];

  const revenueData = [
    { month: 'Jan', amount: 245000 },
    { month: 'Feb', amount: 268000 },
    { month: 'Mar', amount: 285000 },
    { month: 'Apr', amount: 295000 },
    { month: 'May', amount: 310000 },
    { month: 'Jun', amount: 285000 }
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.amount));

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your practice overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <ArrowUp className="w-3 h-3 mr-1" />
              +{stats.clientsChange}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Total Clients</h3>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalClients}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">Active relationships</p>
        </Card>

        {/* Active Cases */}
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <ArrowUp className="w-3 h-3 mr-1" />
              +{stats.casesChange}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Active Cases</h3>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{stats.activeCases}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">In progress</p>
        </Card>

        {/* Monthly Revenue */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <ArrowUp className="w-3 h-3 mr-1" />
              +{stats.revenueChange}%
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">
            ₹{(stats.monthlyRevenue / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">This month</p>
        </Card>

        {/* Average Rating */}
        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white fill-current" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              <ArrowUp className="w-3 h-3 mr-1" />
              +{stats.ratingChange}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">Average Rating</h3>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.avgRating}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">From 89 reviews</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
            <Button variant="ghost" size="sm">
              View Details
            </Button>
          </div>
          <div className="space-y-4">
            {revenueData.map((data, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{data.month}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{(data.amount / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                    style={{ width: `${(data.amount / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
              <Briefcase className="w-5 h-5 mr-3" />
              Create New Case
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-5 h-5 mr-3" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-5 h-5 mr-3" />
              Message Client
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-5 h-5 mr-3" />
              Upload Document
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Cases</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentCases.map((caseItem) => (
              <div key={caseItem.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{caseItem.title}</h4>
                    <Badge className={
                      caseItem.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        caseItem.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }>
                      {caseItem.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{caseItem.client}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Due: {caseItem.dueDate}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {appointment.client.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{appointment.client}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{appointment.type}</Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{appointment.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{appointment.time}</p>
                </div>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Join
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Messages</h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="space-y-3">
          {recentMessages.map((message) => (
            <div key={message.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {message.client.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{message.client}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{message.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{message.message}</p>
              </div>
              {message.unread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
