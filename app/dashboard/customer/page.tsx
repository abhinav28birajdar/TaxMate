'use client';

import { useAuth } from '@/context/AuthHook';
import AuthGuard from '@/components/auth/AuthGuard';
import Link from 'next/link';

export default function CustomerDashboard() {
  const { profile } = useAuth();

  return (
    <AuthGuard requiredRole="customer">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Customer Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Welcome back, {profile?.display_name || 'valued customer'}
        </p>
        
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
              <div className="mt-5 space-y-3">
                <Link 
                  href="/dashboard/customer/find-ca" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full justify-center"
                >
                  Find a CA
                </Link>
                <Link 
                  href="/dashboard/customer/appointments" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full justify-center"
                >
                  My Appointments
                </Link>
                <Link 
                  href="/dashboard/customer/documents" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 w-full justify-center"
                >
                  Upload Documents
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Appointments Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Appointments</h3>
              <div className="mt-5">
                <div className="flex flex-col space-y-3">
                  {/* In a real app, this would be loaded from your API */}
                  <div className="border dark:border-gray-700 rounded-md p-3">
                    <p className="font-medium">Tax Planning Consultation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CA: John Smith</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tomorrow, 10:00 AM</p>
                    <div className="mt-2 flex">
                      <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="border dark:border-gray-700 rounded-md p-3">
                    <p className="font-medium">Annual Tax Filing</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">CA: Sarah Johnson</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Next Week, 2:00 PM</p>
                    <div className="mt-2 flex">
                      <button className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        View Details
                      </button>
                    </div>
                  </div>

                  <Link 
                    href="/dashboard/customer/appointments" 
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 mt-2"
                  >
                    View all appointments →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Documents Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Documents</h3>
              <div className="mt-5">
                <div className="space-y-3">
                  {/* In a real app, this would be loaded from your API */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Income_Tax_2023.pdf</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded 2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">W2_Form_2023.pdf</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded 4 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Expense_Report_Q1.xlsx</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded 1 week ago</p>
                    </div>
                  </div>

                  <Link 
                    href="/dashboard/customer/documents" 
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 block mt-3"
                  >
                    View all documents →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Tips Card */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tax Tips & Resources</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h4 className="font-medium">2024 Tax Deadline Approaching</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  The deadline for filing your 2023 tax return is April 15, 2024. Make sure to schedule an appointment with your CA soon.
                </p>
                <a href="#" className="mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Read more
                </a>
              </div>
              <div className="border dark:border-gray-700 rounded-md p-4">
                <h4 className="font-medium">New Tax Credits for Green Energy</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  If you made energy-efficient improvements to your home in 2023, you may qualify for new tax credits.
                </p>
                <a href="#" className="mt-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Read more
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}