'use client';

import { Task } from '@/lib/types/complete.types';

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
}

export default function TasksList({ tasks, loading }: TasksListProps) {
  if (loading) {
    return <div className="text-center py-10">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <p className="text-gray-500">No tasks found. Create your first task!</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      pending: '⏳',
      in_progress: '🔄',
      completed: '✅',
    };
    return icons[status] || '📌';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Task</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Priority</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deadline</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900">{task.title}</p>
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(task.status)}</span>
                  <span className="text-sm text-gray-600 capitalize">{task.status}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {new Date(task.deadline).toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <button className="text-sm text-indigo-600 hover:text-indigo-700">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
