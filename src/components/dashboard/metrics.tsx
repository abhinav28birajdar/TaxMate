'use client';

import { useEffect, useState } from 'react';

export default function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    pendingTasks: 0,
    totalRevenue: 0,
    pendingDocuments: 0,
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    // Fetch metrics from API
    setMetrics({
      totalClients: 42,
      pendingTasks: 12,
      totalRevenue: 125000,
      pendingDocuments: 8,
    });
  };

  const MetricCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`text-3xl ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-4 gap-6">
      <MetricCard
        title="Total Clients"
        value={metrics.totalClients}
        icon="👥"
        color="text-blue-600"
      />
      <MetricCard
        title="Pending Tasks"
        value={metrics.pendingTasks}
        icon="✓"
        color="text-orange-600"
      />
      <MetricCard
        title="Total Revenue"
        value={`₹${(metrics.totalRevenue / 1000).toFixed(1)}K`}
        icon="💰"
        color="text-green-600"
      />
      <MetricCard
        title="Pending Docs"
        value={metrics.pendingDocuments}
        icon="📄"
        color="text-purple-600"
      />
    </div>
  );
}
