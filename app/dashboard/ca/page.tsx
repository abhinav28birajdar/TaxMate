'use client';

import { useAuth } from '@/context/AuthHook';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';

export default function CADashboard() {
  const { profile } = useAuth();

  return (
    <AuthGuard requiredRole="ca">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Chartered Accountant Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome back, {profile?.display_name || 'CA Professional'}
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Summary Cards */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Clients</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">42</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/ca/clients" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all clients
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Upcoming Appointments</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">8</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/ca/appointments" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Manage appointments
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Services</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">5</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/ca/services" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Manage services
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Revenue (This Month)</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">₹86,400</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/ca/finances" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View financial details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="mt-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Upcoming Appointments</h2>
          <div className="mt-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* In a real app, this would be loaded from your API */}
              {[
                { 
                  id: 1,
                  clientName: 'Rahul Sharma',
                  type: 'Tax Planning',
                  date: 'Today',
                  time: '11:00 AM - 12:00 PM',
                  status: 'confirmed'
                },
                { 
                  id: 2,
                  clientName: 'Priya Patel',
                  type: 'Financial Consultation',
                  date: 'Tomorrow',
                  time: '2:00 PM - 3:00 PM',
                  status: 'confirmed'
                },
                { 
                  id: 3,
                  clientName: 'Aditya Singh',
                  type: 'Tax Return Filing',
                  date: 'Mar 15, 2024',
                  time: '10:00 AM - 11:30 AM',
                  status: 'pending'
                }
              ].map((appointment) => (
                <li key={appointment.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{appointment.clientName}</p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <button className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 text-sm">
                          View details
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {appointment.type}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p>
                          {appointment.date} <span className="text-gray-400">•</span> {appointment.time}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/ca/appointments"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all appointments →
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Activity</h2>
          <div className="mt-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                {
                  id: 1,
                  title: 'New client registration',
                  name: 'Vikram Mehta',
                  description: 'Signed up for tax planning services',
                  date: '2 hours ago',
                  icon: (
                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  ),
                },
                {
                  id: 2,
                  title: 'Document uploaded',
                  name: 'Neha Gupta',
                  description: 'Uploaded income statements for 2023',
                  date: '5 hours ago',
                  icon: (
                    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
                {
                  id: 3,
                  title: 'Appointment rescheduled',
                  name: 'Rajiv Kumar',
                  description: 'Moved from Mar 10 to Mar 15',
                  date: 'Yesterday',
                  icon: (
                    <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((activity) => (
                <li key={activity.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">{activity.icon}</div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.name} - {activity.description}
                      </p>
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{activity.date}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}