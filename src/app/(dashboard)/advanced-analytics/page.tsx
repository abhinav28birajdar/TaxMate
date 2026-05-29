import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function AdvancedAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('month');
  const [selectedMetric, setSelectedMetric] = React.useState('revenue');

  // Revenue metrics
  const revenueMetrics = {
    total: 450000,
    growth: 23.5,
    forecast: 520000,
    clientValue: {
      avg: 15000,
      topClient: 85000,
    },
  };

  // Financial trends
  const trends = [
    { month: 'Jan', revenue: 350000, forecast: 360000, target: 380000 },
    { month: 'Feb', revenue: 380000, forecast: 395000, target: 400000 },
    { month: 'Mar', revenue: 420000, forecast: 450000, target: 420000 },
    { month: 'Apr', revenue: 450000, forecast: 480000, target: 450000 },
  ];

  // Service breakdown
  const services = [
    { name: 'GST Filing', revenue: 180000, clients: 85, growth: 15 },
    { name: 'ITR Filing', revenue: 150000, clients: 92, growth: 18 },
    { name: 'Company Registration', revenue: 74000, clients: 18, growth: 22 },
    { name: 'Audit', revenue: 46000, clients: 12, growth: 8 },
  ];

  // Client value distribution
  const clientTiers = [
    { tier: 'Premium (>50k)', count: 8, revenue: 520000, churn: 2 },
    { tier: 'Silver (20-50k)', count: 24, revenue: 960000, churn: 8 },
    { tier: 'Bronze (<20k)', count: 68, revenue: 680000, churn: 15 },
  ];

  // Predictive analytics
  const predictions = [
    { metric: 'Next Month Revenue', value: '₹520K', confidence: '92%', trend: 'up' },
    { metric: 'Revenue per Client', value: '₹15.8K', confidence: '88%', trend: 'up' },
    { metric: 'Client Retension Rate', value: '94.2%', confidence: '85%', trend: 'stable' },
    { metric: 'Service Growth', value: '+18%', confidence: '89%', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Advanced Analytics</h1>
        <p className="text-slate-600">AI-powered insights & predictive analytics</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {['week', 'month', 'quarter', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Predictive Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {predictions.map((pred, idx) => (
          <Card key={idx} className="p-6 bg-white/80 backdrop-blur border border-white/20">
            <p className="text-sm text-slate-600 mb-2">{pred.metric}</p>
            <div className="mb-3">
              <p className="text-2xl font-bold text-slate-900">{pred.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={pred.trend === 'up' ? 'success' : pred.trend === 'down' ? 'danger' : 'neutral'}>
                  {pred.trend === 'up' ? '↑ Up' : pred.trend === 'down' ? '↓ Down' : '→ Stable'}
                </Badge>
                <span className="text-xs text-slate-500">{pred.confidence} confidence</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Trends & Forecast */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Revenue Forecast (Next 90 Days)</h2>
        <div className="grid grid-cols-2 gap-8">
          {/* Revenue Graph Placeholder */}
          <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg flex items-end justify-around p-4">
            {trends.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="flex gap-1 items-end h-40">
                  <div
                    className="w-3 bg-emerald-500 rounded-t opacity-70"
                    style={{ height: `${(t.revenue / 450000) * 100}%` }}
                  />
                  <div
                    className="w-3 bg-indigo-500 rounded-t opacity-70"
                    style={{ height: `${(t.forecast / 450000) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 mt-2">{t.month}</span>
              </div>
            ))}
          </div>

          {/* Revenue Metrics */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Current Revenue (This Month)</p>
              <p className="text-3xl font-bold text-emerald-600">₹{(revenueMetrics.total / 100000).toFixed(2)}L</p>
              <p className="text-sm text-emerald-600 mt-1">+{revenueMetrics.growth}% vs last month</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Forecasted Revenue (Next Month)</p>
              <p className="text-3xl font-bold text-indigo-600">₹{(revenueMetrics.forecast / 100000).toFixed(2)}L</p>
              <p className="text-sm text-indigo-600 mt-1">+{((revenueMetrics.forecast - revenueMetrics.total) / revenueMetrics.total * 100).toFixed(1)}% growth</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Average Client Value</p>
              <p className="text-2xl font-bold text-slate-900">₹{(revenueMetrics.clientValue.avg / 1000).toFixed(0)}K</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Service Performance */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Service Performance Analytics</h2>
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-600">{service.clients} clients</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">₹{(service.revenue / 100000).toFixed(2)}L</p>
                  <Badge variant="success">+{service.growth}% YoY</Badge>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                  style={{ width: `${(service.revenue / 200000) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Client Tier Analysis */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Client Tier Analysis & Churn Risk</h2>
        <div className="grid grid-cols-3 gap-6">
          {clientTiers.map((tier, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-900 mb-3">{tier.tier}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Clients:</span>
                  <span className="font-semibold text-slate-900">{tier.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Revenue:</span>
                  <span className="font-semibold text-slate-900">₹{(tier.revenue / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Potential Churn:</span>
                  <Badge variant={tier.churn > 10 ? 'danger' : 'neutral'}>{tier.churn} clients</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
