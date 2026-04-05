import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function WorkflowAutomationPage() {
  const [workflows, setWorkflows] = React.useState([
    {
      id: 1,
      name: 'Monthly GST Filing Process',
      status: 'active',
      triggers: 1,
      actions: 5,
      executions: 24,
      lastRun: '2024-03-25 10:30 AM',
      nextRun: '2024-04-25 10:30 AM',
      timeSaved: '8 hours/month',
    },
    {
      id: 2,
      name: 'Invoice Generation & Payment Reminder',
      status: 'active',
      triggers: 2,
      actions: 3,
      executions: 156,
      lastRun: '2024-03-28 02:00 AM',
      nextRun: '2024-04-01 02:00 AM',
      timeSaved: '20 hours/month',
    },
    {
      id: 3,
      name: 'Client Document Expiry Alerts',
      status: 'active',
      triggers: 1,
      actions: 2,
      executions: 89,
      lastRun: '2024-03-28 06:00 AM',
      nextRun: '2024-03-29 06:00 AM',
      timeSaved: '5 hours/month',
    },
  ]);

  const [automationStats, setAutomationStats] = React.useState({
    totalWorkflows: 12,
    activeWorkflows: 12,
    tasksAutomated: 2840,
    monthlyTimeSaved: 156,
    errorRate: 0.8,
    successRate: 99.2,
  });

  const rules = [
    {
      event: 'Client Added',
      condition: 'Business Type = Corporate',
      action: 'Send welcome email + GST checklist + Schedule call',
    },
    {
      event: 'Document Uploaded',
      condition: 'Category = Bank Statement',
      action: 'Auto-categorize + Extract data + Update compliance',
    },
    {
      event: 'Invoice Created',
      condition: 'Amount > ₹50,000',
      action: 'Send for approval + Schedule payment reminder',
    },
    {
      event: 'Task Deadline',
      condition: 'Due in < 24 hours',
      action: 'Send reminder + Escalate to manager + Update dashboard',
    },
  ];

  const integrations = [
    { name: 'Email (SendGrid)', status: 'connected', actions: '12 per day', lastSync: '2 mins ago' },
    { name: 'Google Calendar', status: 'connected', actions: '8 per day', lastSync: '5 mins ago' },
    { name: 'Razorpay', status: 'connected', actions: '24 per day', lastSync: '10 secs ago' },
    { name: 'WhatsApp', status: 'pending', actions: 'N/A', lastSync: 'Not connected' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">⚙️ Workflow Automation</h1>
        <p className="text-slate-600">Automate repetitive tasks and streamline your business processes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <Card className="p-4 bg-primary text-white">
          <p className="text-xs opacity-90">Total Workflows</p>
          <p className="text-2xl font-bold">{automationStats.totalWorkflows}</p>
        </Card>
        <Card className="p-4 bg-green-600 text-white">
          <p className="text-xs opacity-90">Active</p>
          <p className="text-2xl font-bold">{automationStats.activeWorkflows}</p>
        </Card>
        <Card className="p-4 bg-red-600 text-white">
          <p className="text-xs opacity-90">Tasks Automated</p>
          <p className="text-2xl font-bold">{automationStats.tasksAutomated.toLocaleString()}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-xs opacity-90">Time Saved (Monthly)</p>
          <p className="text-2xl font-bold">{automationStats.monthlyTimeSaved}h</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-xs opacity-90">Success Rate</p>
          <p className="text-2xl font-bold">{automationStats.successRate}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <p className="text-xs opacity-90">Error Rate</p>
          <p className="text-2xl font-bold">{automationStats.errorRate}%</p>
        </Card>
      </div>

      {/* Create New Workflow */}
      <Card className="p-6 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Workflow</h2>
            <p className="text-sm text-slate-600">Build custom automation rules for your business</p>
          </div>
          <Button className="bg-primary text-white hover:bg-purple-700">+ New Workflow</Button>
        </div>
      </Card>

      {/* Active Workflows */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Active Workflows</h2>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="p-6 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{workflow.name}</p>
                  <div className="flex gap-4 text-sm text-slate-600 mt-2">
                    <span>📥 {workflow.triggers} trigger(s)</span>
                    <span>⚡ {workflow.actions} action(s)</span>
                    <span>✓ {workflow.executions} executions</span>
                  </div>
                </div>
                <Badge variant="success">✓ Active</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-white rounded-lg mb-4">
                <div>
                  <p className="text-xs text-slate-600">Last Run</p>
                  <p className="text-sm font-medium text-slate-900">{workflow.lastRun}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Next Run</p>
                  <p className="text-sm font-medium text-slate-900">{workflow.nextRun}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Time Saved</p>
                  <p className="text-sm font-medium text-primary">{workflow.timeSaved}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="text-primary hover:bg-primary/10 px-3 py-2">Edit</Button>
                <Button className="text-slate-600 hover:bg-slate-200 px-3 py-2">View Logs</Button>
                <Button className="text-red-600 hover:bg-red-50 px-3 py-2 ml-auto">Disable</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Automation Rules */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Active Rules & Triggers</h2>
        <div className="space-y-4">
          {rules.map((rule, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-4">
                <div className="text-2xl">⚡</div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-2">Event: {rule.event}</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium">If:</span> {rule.condition}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium">Then:</span> {rule.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Integrations Status */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Connected Integrations</h2>
        <div className="grid grid-cols-2 gap-4">
          {integrations.map((integration, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold text-slate-900">{integration.name}</p>
                <Badge
                  variant={integration.status === 'connected' ? 'success' : 'info'}
                >
                  {integration.status === 'connected' ? '✓ Connected' : '⏳ Pending'}
                </Badge>
              </div>
              <div className="text-sm text-slate-600 space-y-1">
                <p>Actions per day: {integration.actions}</p>
                <p>Last sync: {integration.lastSync}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
