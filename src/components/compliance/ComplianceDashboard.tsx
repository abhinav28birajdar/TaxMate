/**
 * Compliance Dashboard Component
 * Displays compliance deadlines and automation
 */

'use client';

import React, { useEffect, useState } from 'react';
import ComplianceService from '@/lib/services/compliance-service';

interface ComplianceDeadline {
  id: string;
  title: string;
  deadline_type: string;
  due_date: string;
  status: string;
  daysUntilDue: number;
}

export const ComplianceDashboard = () => {
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    overdue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    const loadDeadlines = async () => {
      try {
        const complianceService = ComplianceService;
        const pendingDeadlines = await complianceService.getPendingDeadlines('');
        const compliance = await complianceService.getComplianceStatus('');

        const deadlinesWithDays = pendingDeadlines.map(d => ({
          ...d,
          daysUntilDue: complianceService.daysUntilDeadline(d.due_date),
        }));

        setDeadlines(deadlinesWithDays);
        setStats(compliance);
      } catch (error) {
        console.error('Error loading compliance deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeadlines();
  }, []);

  const getStatusBadgeColor = (status: string, daysUntilDue: number): string => {
    if (daysUntilDue < 0) return 'bg-red-100 text-red-800';
    if (daysUntilDue === 0) return 'bg-orange-100 text-orange-800';
    if (daysUntilDue <= 3) return 'bg-amber-100 text-amber-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading compliance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-gray-600">Total Deadlines</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-gray-600">Overdue</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">{stats.completionRate.toFixed(0)}%</div>
          <div className="text-gray-600">Completion</div>
        </div>
      </div>

      {/* Deadlines List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Upcoming Compliance Deadlines</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deadline</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Days Left</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deadlines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No upcoming deadlines
                  </td>
                </tr>
              ) : (
                deadlines.map(deadline => (
                  <tr key={deadline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{deadline.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{deadline.deadline_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(deadline.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-semibold ${deadline.daysUntilDue < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {deadline.daysUntilDue < 0 ? `Overdue by ${Math.abs(deadline.daysUntilDue)} days` : `${deadline.daysUntilDue} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(deadline.status, deadline.daysUntilDue)}`}>
                        {deadline.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
