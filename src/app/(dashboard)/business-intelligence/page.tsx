import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function BusinessIntelligencePage() {
  const [dashboard, setDashboard] = React.useState({
    mrr: 485000,
    arr: 5820000,
    churn: 2.1,
    ltv: 285000,
    cac: 12000,
    roi: 23.75,
  });

  const [topClients, setTopClients] = React.useState([
    { rank: 1, name: 'Tech Solutions Ltd', revenue: 125000, services: 5, growth: 28 },
    { rank: 2, name: 'Manufacturing Industries', revenue: 98000, services: 4, growth: 15 },
    { rank: 3, name: 'Retail Chain Corporation', revenue: 87000, services: 3, growth: 12 },
    { rank: 4, name: 'Healthcare Ventures', revenue: 76000, services: 4, growth: 18 },
    { rank: 5, name: 'Education Network', revenue: 65000, services: 2, growth: 8 },
  ]);

  const [clientSegmentation, setClientSegmentation] = React.useState([
    { segment: 'Enterprise (>1L/year)', count: 8, revenue: 980000, churn: 0, retention: 100 },
    { segment: 'Mid-Market (25K-1L/year)', count: 32, revenue: 2100000, churn: 2.3, retention: 97.7 },
    { segment: 'SME (10K-25K/year)', count: 68, revenue: 1360000, churn: 4.1, retention: 95.9 },
    { segment: 'Startup (<10K/year)', count: 42, revenue: 280000, churn: 8.4, retention: 91.6 },
  ]);

  const [serviceMetrics, setServiceMetrics] = React.useState([
    {
      service: 'GST Filing',
      clients: 95,
      revenue: 1710000,
      margin: 62,
      growth: 22,
      rating: 4.8,
    },
    {
      service: 'ITR Filing',
      clients: 102,
      revenue: 1530000,
      margin: 58,
      growth: 18,
      rating: 4.7,
    },
    {
      service: 'Company Registration',
      clients: 28,
      revenue: 672000,
      margin: 68,
      growth: 35,
      rating: 4.9,
    },
    {
      service: 'Audit & Compliance',
      clients: 18,
      revenue: 810000,
      margin: 72,
      growth: 12,
      rating: 4.6,
    },
    {
      service: 'Financial Consulting',
      clients: 24,
      revenue: 1080000,
      margin: 75,
      growth: 28,
      rating: 4.8,
    },
  ]);

  const [trends, setTrends] = React.useState({
    monthlyGrowth: 8.5,
    clientAcquisition: 12,
    conversionRate: 34.2,
    repeatPurchase: 72,
  });

  const [predictions, setPredictions] = React.useState([
    { metric: 'Next Quarter Revenue', value: '₹18.5L', confidence: '91%', status: 'up' },
    { metric: 'Projected Client Growth', value: '+26 clients', confidence: '87%', status: 'up' },
    { metric: 'Expected Churn Rate', value: '2.8%', confidence: '85%', status: 'stable' },
    { metric: 'Recommended Service Launch', value: 'Virtual CFO Services', confidence: '82%', status: 'opportunity' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">📊 Business Intelligence & Analytics</h1>
        <p className="text-slate-600">Comprehensive insights and data-driven decisions</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-xs opacity-90">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold">₹{(dashboard.mrr / 100000).toFixed(2)}L</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <p className="text-xs opacity-90">Annual Run Rate</p>
          <p className="text-2xl font-bold">₹{(dashboard.arr / 100000).toFixed(2)}L</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-xs opacity-90">Client LTV</p>
          <p className="text-2xl font-bold">₹{(dashboard.ltv / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <p className="text-xs opacity-90">CAC</p>
          <p className="text-2xl font-bold">₹{dashboard.cac.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-xs opacity-90">LTV/CAC Ratio</p>
          <p className="text-2xl font-bold">{(dashboard.ltv / dashboard.cac).toFixed(1)}x</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <p className="text-xs opacity-90">Monthly Churn</p>
          <p className="text-2xl font-bold">{dashboard.churn}%</p>
        </Card>
      </div>

      {/* AI Predictions */}
      <Card className="p-8 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">🔮 AI Predictions & Insights</h2>
        <div className="grid grid-cols-4 gap-6">
          {predictions.map((pred, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg shadow-sm">
              <p className="text-sm text-slate-600 mb-2">{pred.metric}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2">{pred.value}</p>
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    pred.status === 'up'
                      ? 'success'
                      : pred.status === 'opportunity'
                      ? 'info'
                      : 'neutral'
                  }
                >
                  {pred.status === 'up' ? '↑ Growing' : pred.status === 'opportunity' ? '💡 Opportunity' : '→ Stable'}
                </Badge>
                <span className="text-xs text-slate-500">{pred.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Clients */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">🏆 Top Clients by Revenue</h2>
        <div className="space-y-3">
          {topClients.map((client) => (
            <div key={client.rank} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {client.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{client.name}</p>
                    <p className="text-sm text-slate-600">{client.services} services</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-indigo-600">₹{(client.revenue / 100000).toFixed(2)}L</p>
                  <Badge variant="success">+{client.growth}% YoY</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Client Segmentation */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">👥 Client Segmentation & Health</h2>
        <div className="space-y-4">
          {clientSegmentation.map((segment, idx) => (
            <div key={idx} className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-900 mb-1">{segment.segment}</p>
                  <div className="flex gap-4 text-sm text-slate-600">
                    <span>📊 {segment.count} clients</span>
                    <span>💰 ₹{(segment.revenue / 100000).toFixed(2)}L revenue</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="success">{segment.retention}% Retention</Badge>
                  <p className="text-sm text-red-600 mt-1">{segment.churn}% Churn</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${segment.retention}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Service Performance Matrix */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📈 Service Performance Matrix</h2>
        <div className="space-y-4">
          {serviceMetrics.map((service, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{service.service}</p>
                  <div className="flex gap-6 text-sm text-slate-600 mt-1">
                    <span>👥 {service.clients} clients</span>
                    <span>💰 ₹{(service.revenue / 100000).toFixed(2)}L</span>
                    <span>📊 {service.margin}% margin</span>
                    <span>⭐ {service.rating}/5</span>
                  </div>
                </div>
                <Badge variant="success">+{service.growth}% Growth</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Performance Score:</span>
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all bg-gradient-to-r ${
                      service.growth > 20
                        ? 'from-emerald-500 to-teal-500'
                        : 'from-indigo-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min(service.growth * 3, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Growth Trends */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <p className="text-sm text-slate-600 mb-2">Monthly Revenue Growth</p>
          <p className="text-4xl font-bold text-emerald-600 mb-2">+{trends.monthlyGrowth}%</p>
          <p className="text-xs text-slate-600">vs previous month</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
          <p className="text-sm text-slate-600 mb-2">New Clients This Month</p>
          <p className="text-4xl font-bold text-blue-600 mb-2">+{trends.clientAcquisition}</p>
          <p className="text-xs text-slate-600">vs target</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
          <p className="text-sm text-slate-600 mb-2">Conversion Rate</p>
          <p className="text-4xl font-bold text-purple-600 mb-2">{trends.conversionRate}%</p>
          <p className="text-xs text-slate-600">from leads to clients</p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
          <p className="text-sm text-slate-600 mb-2">Repeat Purchase Rate</p>
          <p className="text-4xl font-bold text-orange-600 mb-2">{trends.repeatPurchase}%</p>
          <p className="text-xs text-slate-600">clients for additional services</p>
        </Card>
      </div>
    </div>
  );
}
