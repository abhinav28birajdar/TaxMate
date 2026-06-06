'use client';
import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function RealtimeCollaborationPage() {
  const [activeUsers, setActiveUsers] = React.useState([
    { id: 1, name: 'Rajesh Kumar', role: 'CA', status: 'online', location: 'Mumbai', activity: 'Reviewing client documents' },
    { id: 2, name: 'Priya Sharma', role: 'CA', status: 'online', location: 'Delhi', activity: 'Creating GST schedule' },
    { id: 3, name: 'Amit Patel', role: 'Staff', status: 'away', location: 'Bangalore', activity: 'Data entry' },
    { id: 4, name: 'Neha Singh', role: 'Client', status: 'online', location: 'Hyderabad', activity: 'Uploading documents' },
  ]);

  const [sharedProjects, setSharedProjects] = React.useState([
    {
      id: 1,
      name: 'Q1 2024 GST Filing - Batch A',
      clients: 8,
      members: 3,
      progress: 78,
      deadline: '2024-04-15',
      status: 'in_progress',
    },
    {
      id: 2,
      name: 'Annual Audit - Tech Companies',
      clients: 5,
      members: 4,
      progress: 45,
      deadline: '2024-05-30',
      status: 'in_progress',
    },
    {
      id: 3,
      name: 'ITR Filing 2023-24',
      clients: 12,
      members: 2,
      progress: 92,
      deadline: '2024-06-30',
      status: 'almost_done',
    },
  ]);

  const [recentActivities, setRecentActivities] = React.useState([
    { id: 1, user: 'Rajesh Kumar', action: 'Approved GST filing for XYZ Corp', time: '2 mins ago', icon: '✓' },
    { id: 2, user: 'Neha Singh', action: 'Uploaded bank statements (3 files)', time: '8 mins ago', icon: '📤' },
    { id: 3, user: 'Priya Sharma', action: 'Added comment on ITR schedule', time: '15 mins ago', icon: '💬' },
    { id: 4, user: 'Amit Patel', action: 'Completed data entry for 5 clients', time: '23 mins ago', icon: '✓' },
    { id: 5, user: 'Rajesh Kumar', action: 'Assigned task to Priya', time: '1 hour ago', icon: '📋' },
  ]);

  const [collaborationStats, setCollaborationStats] = React.useState({
    activeCollab: 8,
    sharedProjects: 24,
    teamMembers: 15,
    documentsShared: 342,
    commentsToday: 87,
    taskAssigned: 34,
  });

  const teamPerformance = [
    { member: 'Rajesh Kumar', tasksCompleted: 28, documents: 156, avgTime: '8 days' },
    { member: 'Priya Sharma', tasksCompleted: 24, documents: 142, avgTime: '9 days' },
    { member: 'Amit Patel', tasksCompleted: 19, documents: 98, avgTime: '7 days' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🤝 Real-Time Collaboration Hub</h1>
        <p className="text-slate-600">Work together seamlessly with your team and clients</p>
      </div>

      {/* Collaboration Stats */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <p className="text-xs opacity-90">Active Collaborations</p>
          <p className="text-2xl font-bold">{collaborationStats.activeCollab}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-xs opacity-90">Shared Projects</p>
          <p className="text-2xl font-bold">{collaborationStats.sharedProjects}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <p className="text-xs opacity-90">Team Members</p>
          <p className="text-2xl font-bold">{collaborationStats.teamMembers}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-xs opacity-90">Docs Shared</p>
          <p className="text-2xl font-bold">{collaborationStats.documentsShared}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-xs opacity-90">Comments Today</p>
          <p className="text-2xl font-bold">{collaborationStats.commentsToday}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
          <p className="text-xs opacity-90">Tasks Assigned</p>
          <p className="text-2xl font-bold">{collaborationStats.taskAssigned}</p>
        </Card>
      </div>

      {/* Online Team Status */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">👥 Team Status</h2>
        <div className="grid grid-cols-2 gap-4">
          {activeUsers.map((user) => (
            <div key={user.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {user.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-600">{user.role} • {user.location}</p>
                  </div>
                </div>
                <Badge variant={user.status === 'online' ? 'success' : 'neutral'}>
                  {user.status === 'online' ? '🟢 Online' : '🟡 Away'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 bg-white px-2 py-1 rounded">
                {user.activity}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Shared Projects */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📁 Shared Projects</h2>
        <div className="space-y-4">
          {sharedProjects.map((project) => (
            <div key={project.id} className="p-6 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-slate-900">{project.name}</p>
                  <div className="flex gap-4 text-sm text-slate-600 mt-1">
                    <span>👥 {project.members} members</span>
                    <span>📊 {project.clients} clients</span>
                    <span>📅 Due: {project.deadline}</span>
                  </div>
                </div>
                <Badge
                  variant={
                    project.status === 'in_progress'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {project.status === 'in_progress' ? '⏳ In Progress' : '✓ Almost Done'}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Completion</span>
                  <span className="font-medium text-slate-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      project.status === 'in_progress'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <Button className="text-indigo-600 hover:bg-indigo-50 px-3 py-2">View Project Details</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Real-Time Activity Feed */}
      <div className="grid grid-cols-2 gap-8">
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">📢 Live Activity Feed</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-slate-900">
                    <span className="font-semibold">{activity.user}</span>
                    <span className="text-slate-600"> {activity.action}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Performance */}
        <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 mb-6">⭐ Team Performance</h2>
          <div className="space-y-4">
            {teamPerformance.map((perf, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                <p className="font-semibold text-slate-900 mb-3">{perf.member}</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Tasks</p>
                    <p className="text-2xl font-bold text-indigo-600">{perf.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Documents</p>
                    <p className="text-2xl font-bold text-purple-600">{perf.documents}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Avg Time</p>
                    <p className="text-lg font-bold text-slate-900">{perf.avgTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
