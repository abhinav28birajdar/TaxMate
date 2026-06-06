'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/core-components';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { dashboardService } from '@/lib/services';
import { DashboardSkeleton } from '@/lib/loading-states';
import { toast } from 'sonner';
import { TrendingUp, ArrowRight, CreditCard, Send, Eye, Lock, Zap, BarChart3 } from 'lucide-react';

interface DashboardSummary {
  pendingTasks: number;
  unpaidInvoices: number;
  unpaidAmount: number;
  upcomingAppointments: number;
  activeClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  teamMembers: number;
  overallRating: number;
}

export default function MainDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userProfile = {
    name: user?.name || user?.email?.split('@')[0] || 'User',
    email: user?.email || 'user@taxmate.com',
    accountBalance: 24582.50,
    monthlySpend: 8392.00,
  };

  // Fetch dashboard summary data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const data = await dashboardService.getSummary(user.id);
        // Map service data to DashboardSummary interface
        const summaryData: DashboardSummary = {
          pendingTasks: data?.pendingTasks || 0,
          unpaidInvoices: 0,
          unpaidAmount: data?.unpaidAmount || 0,
          upcomingAppointments: data?.pendingAppointments || 0,
          activeClients: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
          teamMembers: 0,
          overallRating: 4.8,
        };
        setSummary(summaryData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard summary:', err);
        // Use demo data as fallback
        setSummary({
          pendingTasks: 3,
          unpaidInvoices: 2,
          unpaidAmount: 1500,
          upcomingAppointments: 5,
          activeClients: 12,
          totalRevenue: 45230.50,
          monthlyRevenue: 8392.00,
          teamMembers: 4,
          overallRating: 4.8,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.id]);

  const bankingServices = [
    {
      title: 'Instant Transfers',
      description: 'Send money instantly to anyone, anytime',
      icon: Send,
      href: '/dashboard/transfers',
      color: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Investment Hub',
      description: 'Grow your wealth with curated investments',
      icon: TrendingUp,
      href: '/dashboard/investments',
      color: 'from-green-400 to-green-500',
    },
    {
      title: 'Security Center',
      description: 'Bank-grade encryption & biometric login',
      icon: Lock,
      href: '/dashboard/security',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Smart Analytics',
      description: 'Real-time spending insights & forecasts',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'from-teal-500 to-cyan-600',
    },
    {
      title: 'Card Management',
      description: 'Virtual & physical card control',
      icon: CreditCard,
      href: '/dashboard/cards',
      color: 'from-cyan-500 to-blue-600',
    },
    {
      title: 'Quick Actions',
      description: 'One-click access to common tasks',
      icon: Zap,
      href: '/dashboard/quick-actions',
      color: 'from-blue-500 to-indigo-600',
    },
  ];

  const quickStats = [
    { 
      label: 'Account Balance', 
      value: `$${userProfile.accountBalance.toLocaleString()}`, 
      icon: CreditCard,
      change: '+2.5%'
    },
    { 
      label: 'This Month Spend', 
      value: `$${userProfile.monthlySpend.toLocaleString()}`, 
      icon: TrendingUp,
      change: '-12.3%'
    },
    { 
      label: 'Savings Goal', 
      value: '72% Complete', 
      icon: Eye,
      change: '↑ On track'
    },
    { 
      label: 'Card Limit', 
      value: '$50,000', 
      icon: Zap,
      change: '$7,892 used'
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 p-4 m-8 rounded-lg text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Welcome Header with Dark Theme */}
      <div className="bg-gradient-to-br from-black via-zinc-900 to-black border-b border-green-500/10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-green-400">{userProfile.name}</span>!
              </h1>
              <p className="text-gray-400">{userProfile.email}</p>
            </div>
            <div className="text-right bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <p className="text-sm text-green-400 mb-1">Account Status</p>
              <p className="text-2xl font-bold text-green-400">✓ Active</p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, idx) => {
              const IconComponent = stat.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-zinc-900/50 border border-green-500/10 rounded-lg p-4 hover:border-green-500/30 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <IconComponent className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-green-400">{stat.change}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-zinc-900/50 border border-green-500/20 p-6 hover:border-green-500/40 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Income</p>
                <p className="text-3xl font-bold text-white">${(summary?.totalRevenue || 45230).toLocaleString()}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-green-400">↑ 8.2% from last month</p>
          </Card>

          <Card className="bg-zinc-900/50 border border-green-500/20 p-6 hover:border-green-500/40 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white">${(summary?.monthlyRevenue || 8392).toLocaleString()}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-green-400">📊 Latest 30 days</p>
          </Card>

          <Card className="bg-zinc-900/50 border border-green-500/20 p-6 hover:border-green-500/40 transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending Actions</p>
                <p className="text-3xl font-bold text-white">{(summary?.pendingTasks || 3)}</p>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-green-400">⚡ Requires attention</p>
          </Card>
        </div>

        {/* Featured Banking Services */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Banking Services</h2>
            <Link href="/dashboard/analytics">
              <span className="text-green-400 hover:text-green-300 flex items-center gap-2 text-sm cursor-pointer">
                View All <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankingServices.map((service, idx) => {
              const IconComponent = service.icon;
              return (
                <Link key={idx} href={service.href}>
                  <div className="group h-full">
                    <div className={`p-6 bg-gradient-to-br ${service.color} text-white rounded-lg hover:shadow-xl hover:shadow-green-500/20 transition cursor-pointer h-full`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="bg-white/10 rounded-lg p-3">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <p className="font-semibold mb-2 text-lg">{service.title}</p>
                      <p className="text-sm opacity-90">{service.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & Getting Started */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-zinc-900/50 border border-green-500/20 p-6 hover:border-green-500/40 transition">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition">
                Send Money
              </button>
              <button className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 font-medium py-2 px-4 rounded-lg border border-green-500/30 transition">
                Request Payment
              </button>
              <button className="w-full bg-green-500/10 hover:bg-green-500/20 text-green-400 font-medium py-2 px-4 rounded-lg border border-green-500/30 transition">
                View Statement
              </button>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-zinc-900/50 border border-green-500/20 p-6 hover:border-green-500/40 transition">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div>
                  <p className="text-white font-medium">Salary Deposit</p>
                  <p className="text-xs text-gray-500">Today at 9:30 AM</p>
                </div>
                <p className="text-green-400 font-semibold">+$4,500</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div>
                  <p className="text-white font-medium">Utilities Payment</p>
                  <p className="text-xs text-gray-500">Yesterday at 2:15 PM</p>
                </div>
                <p className="text-red-400 font-semibold">-$245</p>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-white font-medium">Grocery Store</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
                <p className="text-red-400 font-semibold">-$127.50</p>
              </div>
            </div>
            <Link href="/dashboard/analytics">
              <span className="text-green-400 hover:text-green-300 flex items-center gap-2 text-sm mt-4 cursor-pointer">
                View All <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </Card>
        </div>

        {/* Bottom CTA Section */}
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Unlock Premium Features</h2>
            <p className="text-gray-400 mb-6">
              Get exclusive benefits, advanced analytics, and priority support with TaxMate Premium.
            </p>
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg transition">
              Upgrade Now
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
