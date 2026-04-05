'use client';

export default function QuickActions() {
  const actions = [
    { label: 'Add Client', icon: '👤', href: '/dashboard/clients' },
    { label: 'Upload Document', icon: '📄', href: '/dashboard/documents' },
    { label: 'Create Task', icon: '✓', href: '/dashboard/tasks' },
    { label: 'Send Invoice', icon: '💰', href: '/dashboard/invoices' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-4">
        {actions.map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-center"
          >
            <div className="text-2xl mb-2">{action.icon}</div>
            <p className="text-sm font-medium text-gray-700">{action.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
