'use client';
import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function PerformanceKPIPage() {
  const [kpis, setKpis] = React.useState({
    teamProductivity: 87.5,
    clientSatisfaction: 4.7,
    taskCompletion: 92.3,
    documentAccuracy: 96.8,
    responseTime: '2.3 hrs',
    revisingRate: 3.2,
  });

  const [teamMetrics, setTeamMetrics] = React.useState([
    {
      member: 'Rajesh Kumar',
      role: 'Senior CA',
      tasksCompleted: 42,
      clientsServed: 12,
      avgRating: 4.9,
      productivity: 94,
      accuracy: 98,
    },
    {
      member: 'Priya Sharma',
      role: 'CA',
      tasksCompleted: 38,
      clientsServed: 15,
      avgRating: 4.8,
      productivity: 91,
      accuracy: 97,
    },
    {
      member: 'Amit Patel',
      role: 'Staff',
      tasksCompleted: 28,
      clientsServed: 8,
      avgRating: 4.6,
      productivity: 78,
      accuracy: 94,
    },
  ]);

  const [serviceKpis, setServiceKpis] = React.useState([
    {
      service: 'GST Filing',
      metric1: 'Avg Processing Time',
      value1: '3.2 days',
      metric2: 'Client Satisfaction',
      value2: '4.8/5',
      metric3: 'Error Rate',
      value3: '1.2%',
    },
    {
      service: 'ITR Filing',
      metric1: 'Avg Processing Time',
      value1: '5.1 days',
      metric2: 'Client Satisfaction',
      value2: '4.7/5',
      metric3: 'Error Rate',
      value3: '2.1%',
    },
    {
      service: 'Company Registration',
      metric1: 'Avg Processing Time',
      value1: '8.3 days',
      metric2: 'Client Satisfaction',
      value2: '4.9/5',
      metric3: 'Error Rate',
      value3: '0.8%',
    },
  ]);

  const [monthlyPerformance, setMonthlyPerformance] = React.useState([
    { month: 'January', completion: 85, satisfaction: 4.6, revenue: 420000 },
    { month: 'February', completion: 88, satisfaction: 4.7, revenue: 450000 },
    { month: 'March', completion: 92, satisfaction: 4.8, revenue: 485000 },
  ]);

  const [alerts, setAlerts] = React.useState([
    { type: 'warning', message: 'Amit Patel productivity below target', action: 'Review' },
    { type: 'info', message: 'GST Filing error rate trending up', action: 'Analyze' },
    { type: 'success', message: 'Team satisfaction reached all-time high', action: 'Celebrate' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">📈 Performance & KPI Tracking</h1>
        <p className="text-slate-600">Monitor and optimize team and service performance metrics</p>
      </div>

      {/* Critical KPIs */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <p className="text-xs opacity-90">Team Productivity</p>
          <p className="text-2xl font-bold">{kpis.teamProductivity}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-xs opacity-90">Client Satisfaction</p>
          <p className="text-2xl font-bold">{kpis.clientSatisfaction}/5</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <p className="text-xs opacity-90">Task Completion</p>
          <p className="text-2xl font-bold">{kpis.taskCompletion}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-xs opacity-90">Doc Accuracy</p>
          <p className="text-2xl font-bold">{kpis.documentAccuracy}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-xs opacity-90">Avg Response Time</p>
          <p className="text-2xl font-bold">{kpis.responseTime}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <p className="text-xs opacity-90">Rework Rate</p>
          <p className="text-2xl font-bold">{kpis.revisingRate}%</p>
        </Card>
      </div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6 bg-white/80 backdrop-blur border border-white/20 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">🔔 Performance Alerts</h3>
          <div className="space-y-2">
            {alerts.map((alert, idx) => (
              <div key={idx} className={`p-3 rounded-lg flex items-start justify-between ${
                alert.type === 'warning' ? 'bg-orange-50 border border-orange-200' :
                alert.type === 'success' ? 'bg-emerald-50 border border-emerald-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm ${
                  alert.type === 'warning' ? 'text-orange-900' :
                  alert.type === 'success' ? 'text-emerald-900' :
                  'text-blue-900'
                }`}>{alert.message}</p>
                <Button className="text-xs">{alert.action}</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Performance */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">👥 Team Member Performance</h2>
        <div className="space-y-4">
          {teamMetrics.map((member, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{member.member}</p>
                  <p className="text-sm text-slate-600">{member.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600">⭐ {member.avgRating}</p>
                  <p className="text-xs text-slate-600">Client Rating</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Tasks This Month</p>
                  <p className="text-2xl font-bold text-slate-900">{member.tasksCompleted}</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Clients Served</p>
                  <p className="text-2xl font-bold text-slate-900">{member.clientsServed}</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Productivity</p>
                  <p className="text-2xl font-bold text-emerald-600">{member.productivity}%</p>
                </div>
                <div className="p-3 bg-white rounded">
                  <p className="text-xs text-slate-600 mb-1">Accuracy</p>
                  <p className="text-2xl font-bold text-blue-600">{member.accuracy}%</p>
                </div>
              </div>

              {/* Performance Bars */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Productivity</span>
                    <span className="font-medium">{member.productivity}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${member.productivity}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Accuracy</span>
                    <span className="font-medium">{member.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${member.accuracy}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Service Performance */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📊 Service KPIs</h2>
        <div className="space-y-4">
          {serviceKpis.map((service, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <p className="text-lg font-semibold text-slate-900 mb-4">{service.service}</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">{service.metric1}</p>
                  <p className="text-2xl font-bold text-indigo-600">{service.value1}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">{service.metric2}</p>
                  <p className="text-2xl font-bold text-emerald-600">{service.value2}</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-xs text-slate-600 mb-1">{service.metric3}</p>
                  <p className="text-2xl font-bold text-red-600">{service.value3}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly Trends */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📈 Monthly Trends</h2>
        <div className="space-y-4">
          {monthlyPerformance.map((month, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-900">{month.month}</p>
                <p className="text-lg font-bold text-indigo-600">₹{(month.revenue / 100000).toFixed(2)}L</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Task Completion</span>
                    <span className="font-medium">{month.completion}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${month.completion}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Satisfaction</span>
                    <span className="font-medium">{(month.satisfaction * 100) / 5}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(month.satisfaction * 100) / 5}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
