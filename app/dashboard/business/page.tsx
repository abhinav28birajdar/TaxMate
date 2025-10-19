'use client';

import { useAuth } from '@/context/AuthHook';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';

export default function BusinessDashboard() {
  const { profile } = useAuth();

  return (
    <AuthGuard requiredRole="business">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Business Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome back, {profile?.display_name || 'Business Owner'}
          {profile?.company_name ? ` | ${profile.company_name}` : ''}
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Summary Cards */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Compliance Score</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">92%</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/business/compliance" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View compliance report
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
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Tax Payments Due</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">₹245,800</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/business/taxes" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View tax schedule
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
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Upcoming Deadlines</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">4</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/business/deadlines" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  View all deadlines
                </Link>
              </div>
            </div>
          </div>

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
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Current CA</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">Rohit Verma</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/business/ca" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Contact your CA
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="mt-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Upcoming Deadlines</h2>
          <div className="mt-2 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {[
                { 
                  id: 1, 
                  title: 'GST Filing', 
                  description: 'Monthly GSTR-3B filing',
                  date: 'Mar 20, 2024',
                  status: 'high',
                  completed: false
                },
                { 
                  id: 2, 
                  title: 'TDS Return', 
                  description: 'Quarterly TDS return filing',
                  date: 'Mar 31, 2024',
                  status: 'medium',
                  completed: false
                },
                { 
                  id: 3, 
                  title: 'Advance Tax Payment', 
                  description: 'Fourth installment of advance tax',
                  date: 'Mar 15, 2024',
                  status: 'high',
                  completed: false
                },
                { 
                  id: 4, 
                  title: 'Income Tax Audit', 
                  description: 'Annual income tax audit report',
                  date: 'Apr 30, 2024',
                  status: 'low',
                  completed: false
                }
              ].map((deadline) => (
                <li key={deadline.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <div className="flex text-sm">
                          <p className="font-medium text-blue-600 dark:text-blue-400 truncate">{deadline.title}</p>
                          <p className="ml-1 flex-shrink-0 font-normal text-gray-500 dark:text-gray-400">
                            — {deadline.description}
                          </p>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>
                              Due <time dateTime="2020-01-07">{deadline.date}</time>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0">
                        <div className="flex overflow-hidden">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            deadline.status === 'high'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                              : deadline.status === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          }`}>
                            {deadline.status === 'high' ? 'High Priority' : deadline.status === 'medium' ? 'Medium Priority' : 'Low Priority'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0">
                      <button 
                        type="button" 
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mt-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Documents</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: 1,
                name: 'Balance_Sheet_FY23-24.xlsx',
                category: 'Financial Statement',
                date: 'Mar 1, 2024',
              },
              {
                id: 2,
                name: 'GST_Returns_Feb2024.pdf',
                category: 'Tax Filing',
                date: 'Feb 28, 2024',
              },
              {
                id: 3,
                name: 'Audit_Report_FY22-23.pdf',
                category: 'Audit',
                date: 'Feb 15, 2024',
              }
            ].map((document) => (
              <div key={document.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0 4a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">{document.name}</h3>
                      <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <span>{document.category}</span>
                        <span className="mx-2 inline-flex h-1 w-1 rounded-full bg-gray-400"></span>
                        <span>{document.date}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button type="button" className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                      <svg className="mr-1.5 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href="/dashboard/business/documents" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              View all documents →
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}