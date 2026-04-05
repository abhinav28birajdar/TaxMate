'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui/core-components';
import { useAuth } from '@/hooks/AuthContext';

export default function MainDashboardPage() {
  const { user } = useAuth();

  const caProfile = {
    name: user?.name || 'CA User',
    firm: 'Your Firm Name',
    clients: 42,
    revenue: '₹18.5L',
    rating: 4.8,
  };

  const features = [
    {
      title: 'Advanced Analytics',
      description: 'Revenue forecasting & predictive insights',
      icon: '📊',
      href: '/dashboard/advanced-analytics',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      title: 'Client Portal',
      description: 'Self-service portal for clients',
      icon: '🌐',
      href: '/dashboard/client-portal',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'AI Documents',
      description: 'Auto-categorize & extract data',
      icon: '🤖',
      href: '/dashboard/ai-documents',
      color: 'from-orange-500 to-red-600',
    },
    {
      title: 'Workflows',
      description: 'Automate business processes',
      icon: '⚙️',
      href: '/dashboard/workflows',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      title: 'Collaboration',
      description: 'Real-time team collaboration',
      icon: '🤝',
      href: '/dashboard/collaboration',
      color: 'from-pink-500 to-rose-600',
    },
    {
      title: 'Business Intelligence',
      description: 'Comprehensive analytics dashboard',
      icon: '📈',
      href: '/dashboard/business-intelligence',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      title: 'Client Matching',
      description: 'AI-powered CA-Client matching',
      icon: '🎯',
      href: '/dashboard/client-matching',
      color: 'from-emerald-600 to-cyan-600',
    },
    {
      title: 'Performance & KPI',
      description: 'Track team & service metrics',
      icon: '📈',
      href: '/dashboard/performance-kpi',
      color: 'from-red-500 to-orange-600',
    },
    {
      title: 'Integrations',
      description: 'Connect 100+ services',
      icon: '🔌',
      href: '/dashboard/integrations',
      color: 'from-indigo-600 to-blue-600',
    },
    {
      title: 'Audit Logs',
      description: 'Security & compliance tracking',
      icon: '🔒',
      href: '/dashboard/audit-logs',
      color: 'from-blue-600 to-cyan-600',
    },
  ];

  const quickStats = [
    { label: 'Active Clients', value: caProfile.clients, icon: '👥' },
    { label: 'Monthly Revenue', value: caProfile.revenue, icon: '💰' },
    { label: 'Team Members', value: '3', icon: '👨‍💼' },
    { label: 'Pending Tasks', value: '12', icon: '✓' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with Profile */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {caProfile.name}!</h1>
              <p className="text-indigo-100">{caProfile.firm}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90 mb-1">Overall Rating</p>
              <p className="text-3xl font-bold">⭐ {caProfile.rating}/5</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            {quickStats.map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <p className="text-indigo-100 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.icon} {stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Featured Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">🚀 Powerful Features</h2>
          <div className="grid grid-cols-5 gap-6">
            {features.slice(0, 5).map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <div className={`p-6 bg-gradient-to-br ${feature.color} text-white rounded-lg hover:shadow-lg transition cursor-pointer h-full block`}>
                  <p className="text-3xl mb-3">{feature.icon}</p>
                  <p className="font-semibold mb-2">{feature.title}</p>
                  <p className="text-xs opacity-90">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">✨ Advanced Tools & Analytics</h2>
          <div className="grid grid-cols-5 gap-6">
            {features.slice(5).map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <div className={`p-6 bg-gradient-to-br ${feature.color} text-white rounded-lg hover:shadow-lg transition cursor-pointer h-full block`}>
                  <p className="text-3xl mb-3">{feature.icon}</p>
                  <p className="font-semibold mb-2">{feature.title}</p>
                  <p className="text-xs opacity-90">{feature.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started Section */}
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">🎯 Getting Started</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-semibold text-slate-900 mb-2">View Analytics</p>
              <p className="text-sm text-slate-600 mb-4">Get complete insights into your business performance</p>
              <Link href="/dashboard/business-intelligence">
                <span className="text-indigo-600 font-medium hover:underline cursor-pointer">Explore →</span>
              </Link>
            </div>
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
              <p className="text-4xl mb-3">🤖</p>
              <p className="font-semibold text-slate-900 mb-2">AI Documents</p>
              <p className="text-sm text-slate-600 mb-4">Automatically process and categorize documents</p>
              <Link href="/dashboard/ai-documents">
                <span className="text-emerald-600 font-medium hover:underline cursor-pointer">Try Now →</span>
              </Link>
            </div>
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <p className="text-4xl mb-3">⚙️</p>
              <p className="font-semibold text-slate-900 mb-2">Workflow Automation</p>
              <p className="text-sm text-slate-600 mb-4">Streamline your business with smart automation</p>
              <Link href="/dashboard/workflows">
                <span className="text-orange-600 font-medium hover:underline cursor-pointer">Set Up →</span>
              </Link>
            </div>
          </div>
        </Card>

        {/* All Available Features */}
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">📋 All Available Features</h2>
          <div className="grid grid-cols-1 gap-3">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href}>
                <div className="p-4 bg-slate-50 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition flex items-center justify-between group-hover:shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <p className="font-semibold text-slate-900 hover:text-indigo-600">{feature.title}</p>
                      <p className="text-sm text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                  <span className="text-indigo-600 font-medium">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
