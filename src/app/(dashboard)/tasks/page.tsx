'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/UnifiedAuthContext'
import Link from 'next/link'

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch(
          `/api/tasks?status=${statusFilter === 'all' ? '' : statusFilter}&priority=${priorityFilter === 'all' ? '' : priorityFilter}`,
          { headers: { 'x-ca-id': user?.id || '' } }
        )
        const data = await res.json()
        setTasks(data.tasks || [])
      } catch (error) {
        console.error('Failed to load tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      loadTasks()
    }
  }, [user?.id, statusFilter, priorityFilter])

  const statusColors: any = {
    TODO: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800',
    DONE: 'bg-green-100 text-green-800',
  }

  const priorityColors: any = {
    LOW: 'text-gray-500',
    MEDIUM: 'text-orange-500',
    HIGH: 'text-red-500',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tasks</h1>
            <p className="text-gray-600 mt-2">Track and manage your workflow</p>
          </div>
          <Link href="/dashboard/tasks/new">
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              + New Task
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-200">
            <p className="text-gray-600 text-lg">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100'}`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-2xl ${priorityColors[task.priority] || 'text-gray-500'}`}>
                        ●
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <div>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {task.client && (
                        <div>👤 {task.client.name}</div>
                      )}
                    </div>
                  </div>
                  <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
