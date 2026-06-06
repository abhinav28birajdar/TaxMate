'use client';
import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = React.useState([
    {
      id: 1,
      timestamp: '2024-03-28 14:35:22',
      user: 'Rajesh Kumar',
      action: 'Approved GST filing',
      resource: 'XYZ Corp - GST Return',
      status: 'success',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      timestamp: '2024-03-28 13:28:45',
      user: 'Neha Singh',
      action: 'Uploaded documents',
      resource: 'Client Account - 5 files',
      status: 'success',
      ip: '203.45.67.89',
    },
    {
      id: 3,
      timestamp: '2024-03-28 12:15:33',
      user: 'Priya Sharma',
      action: 'Modified invoice',
      resource: 'Invoice INV-2024-001',
      status: 'success',
      ip: '192.168.1.105',
    },
    {
      id: 4,
      timestamp: '2024-03-28 11:42:18',
      user: 'Admin',
      action: 'Added new CA',
      resource: 'User Account - CA Profile',
      status: 'success',
      ip: '192.168.1.50',
    },
    {
      id: 5,
      timestamp: '2024-03-28 10:28:52',
      user: 'Amit Patel',
      action: 'Failed login attempt',
      resource: 'User Authentication',
      status: 'failed',
      ip: '203.45.67.90',
    },
  ]);

  const [complianceStatus, setComplianceStatus] = React.useState([
    { area: 'Data Security', status: 'compliant', lastAudit: '2024-03-15', nextAudit: '2024-04-15', score: 98 },
    { area: 'GST Compliance', status: 'compliant', lastAudit: '2024-03-20', nextAudit: '2024-04-20', score: 95 },
    { area: 'Financial Reporting', status: 'compliant', lastAudit: '2024-03-10', nextAudit: '2024-04-10', score: 96 },
    { area: 'User Access Control', status: 'compliant', lastAudit: '2024-02-28', nextAudit: '2024-03-28', score: 94 },
  ]);

  const [dataRetention, setDataRetention] = React.useState({
    total: 2.4,
    unit: 'TB',
    documents: 1.8,
    backups: 0.6,
    retention: '2 years',
  });

  const [securityMetrics, setSecurityMetrics] = React.useState({
    loginAttempts: 1256,
    failedAttempts: 3,
    successRate: 99.76,
    activeUsers: 14,
    devices: 21,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🔒 Audit Logs & Compliance</h1>
        <p className="text-slate-600">Monitor system activities, security events, and compliance status</p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-xs opacity-90">Login Success Rate</p>
          <p className="text-2xl font-bold">{securityMetrics.successRate}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <p className="text-xs opacity-90">Active Users</p>
          <p className="text-2xl font-bold">{securityMetrics.activeUsers}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <p className="text-xs opacity-90">Failed Attempts</p>
          <p className="text-2xl font-bold">{securityMetrics.failedAttempts}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-xs opacity-90">Connected Devices</p>
          <p className="text-2xl font-bold">{securityMetrics.devices}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-xs opacity-90">Total Login Attempts</p>
          <p className="text-2xl font-bold">{securityMetrics.loginAttempts.toLocaleString()}</p>
        </Card>
      </div>

      {/* Compliance Status */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">✅ Compliance Status</h2>
        <div className="space-y-4">
          {complianceStatus.map((comp, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{comp.area}</p>
                  <p className="text-sm text-slate-600">Last audit: {comp.lastAudit}</p>
                </div>
                <div className="text-right">
                  <Badge variant="success">✓ Compliant</Badge>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{comp.score}/100</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">Next audit scheduled: {comp.nextAudit}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Logs */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📋 Recent Activity Logs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-3 font-semibold text-slate-900">Timestamp</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-900">User</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-900">Action</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-900">Resource</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-900">Status</th>
                <th className="text-left py-3 px-3 font-semibold text-slate-900">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <span className="text-slate-600">{log.timestamp}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-900">{log.user}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-700">{log.action}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-600 text-xs">{log.resource}</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={log.status === 'success' ? 'success' : 'danger'}>
                      {log.status === 'success' ? '✓ Success' : '✗ Failed'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-slate-600 text-xs font-mono">{log.ip}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Data & Storage */}
      <div className="grid grid-cols-2 gap-8">
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">💾 Data Storage & Retention</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <p className="text-sm text-slate-600 mb-2">Total Storage Used</p>
              <p className="text-3xl font-bold text-blue-600">{dataRetention.total}{dataRetention.unit}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-slate-600 mb-1">Documents</p>
                <p className="text-2xl font-bold text-indigo-600">{dataRetention.documents}{dataRetention.unit}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                <p className="text-sm text-slate-600 mb-1">Backups</p>
                <p className="text-2xl font-bold text-emerald-600">{dataRetention.backups}{dataRetention.unit}</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Retention Policy</p>
              <p className="font-medium text-slate-900">{dataRetention.retention}</p>
            </div>
          </div>
        </Card>

        {/* Export & Backup */}
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">📦 Backup & Export</h2>
          <div className="space-y-3">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="font-medium text-slate-900 mb-2">Last Backup</p>
              <p className="text-sm text-slate-600 mb-3">2024-03-28 02:00 AM (Automated)</p>
              <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700 text-sm">Backup Now</Button>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="font-medium text-slate-900 mb-2">Export Audit Logs</p>
              <p className="text-sm text-slate-600 mb-3">Download full audit history</p>
              <div className="grid grid-cols-2 gap-2">
                <Button className="bg-emerald-600 text-white hover:bg-emerald-700 text-sm">CSV</Button>
                <Button className="bg-slate-600 text-white hover:bg-slate-700 text-sm">JSON</Button>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-medium text-slate-900 mb-2">Disaster Recovery</p>
              <p className="text-sm text-slate-600 mb-3">Restore from backup</p>
              <Button className="w-full bg-orange-600 text-white hover:bg-orange-700 text-sm">Restore</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
