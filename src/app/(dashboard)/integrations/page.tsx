import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function IntegrationsMarketplacePage() {
  const [connectedIntegrations, setConnectedIntegrations] = React.useState([
    {
      id: 1,
      name: 'Razorpay',
      category: 'Payments',
      status: 'connected',
      lastSync: '2 mins ago',
      transactions: 156,
      icon: '💳',
    },
    {
      id: 2,
      name: 'SendGrid',
      category: 'Email',
      status: 'connected',
      lastSync: '5 mins ago',
      transactions: 342,
      icon: '✉️',
    },
    {
      id: 3,
      name: 'Google Calendar',
      category: 'Calendar',
      status: 'connected',
      lastSync: '10 mins ago',
      transactions: 87,
      icon: '📅',
    },
  ]);

  const [availableIntegrations, setAvailableIntegrations] = React.useState([
    {
      id: 4,
      name: 'Twilio',
      category: 'SMS & Voice',
      icon: '📱',
      description: 'Send SMS reminders and notifications',
      pricing: 'Pay per SMS',
      rating: 4.8,
      users: 2400,
    },
    {
      id: 5,
      name: 'AWS S3',
      category: 'Cloud Storage',
      icon: '☁️',
      description: 'Secure cloud storage for documents',
      pricing: 'Pay per GB',
      rating: 4.9,
      users: 5600,
    },
    {
      id: 6,
      name: 'OpenAI',
      category: 'AI & Automation',
      icon: '🤖',
      description: 'AI-powered chatbot and document analysis',
      pricing: 'Usage-based',
      rating: 4.7,
      users: 3200,
    },
    {
      id: 7,
      name: 'Slack',
      category: 'Team Communication',
      icon: '💬',
      description: 'Send notifications and updates to Slack',
      pricing: 'Free + Premium',
      rating: 4.8,
      users: 4100,
    },
    {
      id: 8,
      name: 'Stripe',
      category: 'Payments',
      icon: '💰',
      description: 'Alternative payment gateway',
      pricing: '2.9% + ₹2',
      rating: 4.9,
      users: 3800,
    },
    {
      id: 9,
      name: 'Zapier',
      category: 'Automation',
      icon: '⚡',
      description: 'Connect to 1000+ apps',
      pricing: 'Subscription',
      rating: 4.6,
      users: 2900,
    },
  ]);

  const [systemSettings, setSystemSettings] = React.useState({
    apiLimit: '1000 requests/day',
    dataRetention: '2 years',
    backupFreq: 'Daily',
    maxFileSize: '500MB',
    sessionTimeout: '30 minutes',
    twoFactor: 'Enabled',
  });

  const [notificationSettings, setNotificationSettings] = React.useState([
    { type: 'Email Notifications', enabled: true, frequency: 'Realtime' },
    { type: 'SMS Alerts', enabled: true, frequency: 'Immediate' },
    { type: 'Push Notifications', enabled: true, frequency: 'Realtime' },
    { type: 'Digest Email', enabled: true, frequency: 'Daily' },
    { type: 'Slack Messages', enabled: false, frequency: 'Not set' },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🔌 Integrations & Marketplace</h1>
        <p className="text-slate-600">Connect Taxmate with your favorite tools and services</p>
      </div>

      {/* Connected Integrations */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">✅ Connected Services</h2>
        <div className="grid grid-cols-3 gap-6">
          {connectedIntegrations.map((integration) => (
            <div key={integration.id} className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-4xl mb-2">{integration.icon}</p>
                  <p className="text-lg font-semibold text-slate-900">{integration.name}</p>
                  <p className="text-xs text-slate-600">{integration.category}</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <p className="text-slate-600">
                  <span className="font-medium">Last sync:</span> {integration.lastSync}
                </p>
                <p className="text-slate-600">
                  <span className="font-medium">Transactions:</span> {integration.transactions}
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="text-indigo-600 hover:bg-indigo-50 px-3 py-2 flex-1 text-sm">Settings</Button>
                <Button className="text-red-600 hover:bg-red-50 px-3 py-2 text-sm">Disconnect</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Available Integrations */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">🎯 Popular Integrations</h2>
        <div className="grid grid-cols-3 gap-6">
          {availableIntegrations.map((integration) => (
            <div key={integration.id} className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-200 hover:border-indigo-300 transition">
              <div className="mb-4">
                <p className="text-4xl mb-2">{integration.icon}</p>
                <p className="text-lg font-semibold text-slate-900">{integration.name}</p>
                <p className="text-xs text-slate-600 mb-2">{integration.category}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{integration.description}</p>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">⭐ Rating:</span>
                  <span className="font-medium text-slate-900">{integration.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">👥 Users:</span>
                  <span className="font-medium text-slate-900">{integration.users.toLocaleString()}+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">💰 Pricing:</span>
                  <span className="font-medium text-slate-900">{integration.pricing}</span>
                </div>
              </div>
              <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">Connect</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* System Settings */}
      <div className="grid grid-cols-2 gap-8">
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">⚙️ System Settings</h2>
          <div className="space-y-4">
            {Object.entries(systemSettings).map(([key, value]) => (
              <div key={key} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-slate-600 text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">🔔 Notification Preferences</h2>
          <div className="space-y-3">
            {notificationSettings.map((setting, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={setting.enabled}
                    className="w-5 h-5 rounded text-indigo-600 cursor-pointer"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{setting.type}</p>
                    <p className="text-xs text-slate-600">{setting.frequency}</p>
                  </div>
                </div>
                <Badge variant={setting.enabled ? 'success' : 'neutral'}>
                  {setting.enabled ? 'On' : 'Off'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
