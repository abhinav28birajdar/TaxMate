'use client';

export default function RecentClients() {
  const clients = [
    { id: 1, name: 'Tech Startup Inc.', type: 'Business', status: 'active' },
    { id: 2, name: 'John Doe', type: 'Individual', status: 'active' },
    { id: 3, name: 'Manufacturing Co.', type: 'Business', status: 'pending' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Clients</h3>
      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
          >
            <p className="font-medium text-gray-900">{client.name}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">{client.type}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {client.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
