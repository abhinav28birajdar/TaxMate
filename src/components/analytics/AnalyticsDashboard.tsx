/**
 * Analytics Dashboard Component
 * Displays performance metrics and analytics
 */

'use client';

import React, { useEffect, useState } from 'react';
import AnalyticsService from '@/lib/services/analytics-service';

interface PerformanceMetrics {
  activeCases: number;
  completedCases: number;
  completionRate: number;
  averageRating: number;
  totalClients: number;
  avgResponseTime: number;
}

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const analyticsService = AnalyticsService;
        // Get user role and load appropriate metrics
        const summary = await analyticsService.getDashboardSummary('', 'ca');
        setMetrics(summary);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading analytics...</div>;
  }

  if (!metrics) {
    return <div className="p-8 text-center text-gray-500">No data available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Active Cases */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Active Cases</p>
            <p className="text-3xl font-bold mt-2">{metrics.activeCases}</p>
          </div>
          <div className="text-4xl text-blue-200">📋</div>
        </div>
      </div>

      {/* Completed Cases */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Completed Cases</p>
            <p className="text-3xl font-bold mt-2">{metrics.completedCases}</p>
          </div>
          <div className="text-4xl text-green-200">✓</div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Completion Rate</p>
            <p className="text-3xl font-bold mt-2">{metrics.completionRate.toFixed(1)}%</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold">{Math.floor(metrics.completionRate)}%</span>
          </div>
        </div>
      </div>

      {/* Average Rating */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Average Rating</p>
            <p className="text-3xl font-bold mt-2">{metrics.averageRating.toFixed(1)}</p>
          </div>
          <div className="text-4xl text-yellow-400">⭐</div>
        </div>
      </div>

      {/* Total Clients */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Total Clients</p>
            <p className="text-3xl font-bold mt-2">{metrics.totalClients}</p>
          </div>
          <div className="text-4xl text-purple-200">👥</div>
        </div>
      </div>

      {/* Avg Response Time */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Avg Response Time</p>
            <p className="text-3xl font-bold mt-2">{metrics.avgResponseTime}m</p>
          </div>
          <div className="text-4xl text-blue-200">⏱️</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
