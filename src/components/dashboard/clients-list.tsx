'use client';

import { Client } from '@/lib/types/complete.types';

interface ClientsListProps {
  clients: Client[];
  loading: boolean;
}

export default function ClientsList({ clients, loading }: ClientsListProps) {
  if (loading) {
    return <div className="text-center py-10">Loading clients...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <p className="text-gray-500">No clients found. Create your first client!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">GST/PAN</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{client.name}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">{client.type}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {client.gst_number || client.pan_number || '—'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Active
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="text-sm text-indigo-600 hover:text-indigo-700">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
