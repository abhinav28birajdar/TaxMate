import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function ClientPortalPage() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [documents, setDocuments] = React.useState([
    { id: 1, name: 'GST Certificate.pdf', date: '2024-03-15', status: 'verified', size: '2.4MB' },
    { id: 2, name: 'PAN Card Scan.jpg', date: '2024-03-10', status: 'pending', size: '1.8MB' },
    { id: 3, name: 'Bank Statements Jan-Mar.pdf', date: '2024-03-01', status: 'verified', size: '5.2MB' },
  ]);

  const [filings, setFilings] = React.useState([
    { id: 1, type: 'GSTR-3B', dueDate: '2024-04-20', status: 'completed', filed: '2024-04-15' },
    { id: 2, type: 'GSTR-1', dueDate: '2024-06-11', status: 'in_progress', filed: null },
    { id: 3, type: 'ITR', dueDate: '2024-07-31', status: 'not_started', filed: null },
  ]);

  const [invoices, setInvoices] = React.useState([
    { id: 'INV-001', amount: 15000, date: '2024-03-01', status: 'paid', dueDate: '2024-04-01' },
    { id: 'INV-002', amount: 8500, date: '2024-03-15', status: 'due', dueDate: '2024-04-15' },
    { id: 'INV-003', amount: 12000, date: '2024-03-25', status: 'overdue', dueDate: '2024-04-25' },
  ]);

  const stats = [
    { label: 'Documents Uploaded', value: '23', color: 'from-blue-500 to-cyan-500' },
    { label: 'Pending Filings', value: '3', color: 'from-orange-500 to-red-500' },
    { label: 'Outstanding Invoices', value: '₹20.5K', color: 'from-purple-500 to-pink-500' },
    { label: 'Compliance Score', value: '92%', color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Client Portal</h1>
        <p className="text-slate-600">Manage your filings, documents, and payments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-gradient-to-br ${stat.color} p-6 rounded-lg text-white shadow-lg`}>
            <p className="text-sm opacity-90 mb-2">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200">
        {['dashboard', 'documents', 'filings', 'invoices'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-lg font-medium">
                📤 Upload Documents
              </Button>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-700 py-3 rounded-lg font-medium">
                📋 View Filings
              </Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-lg font-medium">
                💰 Pay Invoice
              </Button>
              <Button className="bg-purple-600 text-white hover:bg-purple-700 py-3 rounded-lg font-medium">
                📅 Schedule Meeting
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {[
                { icon: '✓', message: 'GSTR-3B filing completed', time: '2 hours ago', color: 'emerald' },
                { icon: '📤', message: 'New document uploaded', time: '1 day ago', color: 'blue' },
                { icon: '💰', message: 'Invoice INV-001 paid', time: '3 days ago', color: 'emerald' },
                { icon: '⚠️', message: 'Invoice INV-003 overdue', time: '5 days ago', color: 'red' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className={`w-10 h-10 rounded-full bg-${activity.color}-100 flex items-center justify-center text-${activity.color}-600 font-bold`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-medium">{activity.message}</p>
                    <p className="text-sm text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Compliance Checklist */}
          <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Compliance Checklist</h2>
            <div className="space-y-3">
              {[
                { task: 'Submit GST Certificate', completed: true },
                { task: 'Upload PAN Card', completed: false },
                { task: 'Bank Statements (Last 6 months)', completed: true },
                { task: 'ITR Previous Year', completed: true },
                { task: 'Udyam Registration', completed: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    className="w-5 h-5 rounded text-emerald-600 cursor-pointer"
                  />
                  <span className={item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}>
                    {item.task}
                  </span>
                  {item.completed && <Badge variant="success" className="ml-auto">Done</Badge>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">My Documents</h2>
            <Button className="bg-indigo-600 text-white">+ Upload New</Button>
          </div>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">📄</div>
                  <div>
                    <p className="font-medium text-slate-900">{doc.name}</p>
                    <p className="text-sm text-slate-500">{doc.date} • {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={doc.status === 'verified' ? 'success' : 'info'}>
                    {doc.status === 'verified' ? '✓ Verified' : '⏳ Pending'}
                  </Badge>
                  <Button className="text-indigo-600 hover:bg-indigo-50 px-3">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filings Tab */}
      {activeTab === 'filings' && (
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Filing Status</h2>
          <div className="space-y-4">
            {filings.map((filing) => (
              <div key={filing.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{filing.type}</p>
                    <p className="text-sm text-slate-600">Due: {filing.dueDate}</p>
                  </div>
                  <Badge
                    variant={
                      filing.status === 'completed'
                        ? 'success'
                        : filing.status === 'in_progress'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {filing.status === 'completed'
                      ? '✓ Completed'
                      : filing.status === 'in_progress'
                      ? '⏳ In Progress'
                      : 'Not Started'}
                  </Badge>
                </div>
                {filing.filed && (
                  <p className="text-sm text-emerald-600">✓ Filed on {filing.filed}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Invoices</h2>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{invoice.id}</p>
                  <p className="text-sm text-slate-600">Due: {invoice.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">₹{invoice.amount.toLocaleString()}</p>
                  <Badge
                    variant={
                      invoice.status === 'paid'
                        ? 'success'
                        : invoice.status === 'due'
                        ? 'info'
                        : 'warning'
                    }
                  >
                    {invoice.status === 'paid' ? '✓ Paid' : invoice.status === 'due' ? 'Due' : 'Overdue'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
