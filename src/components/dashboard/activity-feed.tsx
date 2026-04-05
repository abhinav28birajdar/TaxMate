'use client';

export default function ActivityFeed() {
  const activities = [
    { id: 1, action: 'Client uploaded document', time: '2 hours ago', type: 'document' },
    { id: 2, action: 'Invoice INV-12345 paid', time: '4 hours ago', type: 'payment' },
    { id: 3, action: 'Task assigned to you', time: '6 hours ago', type: 'task' },
    { id: 4, action: 'New client registered', time: '1 day ago', type: 'client' },
  ];

  const getIcon = (type: string) => {
    const icons: any = {
      document: '📄',
      payment: '💰',
      task: '✓',
      client: '👤',
    };
    return icons[type] || '📌';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0"
          >
            <div className="text-2xl">{getIcon(activity.type)}</div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{activity.action}</p>
              <p className="text-gray-500 text-sm">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
