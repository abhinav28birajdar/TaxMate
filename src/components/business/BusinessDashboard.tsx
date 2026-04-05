'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function BusinessDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-primary-600">TaxMate</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
                <div className="relative ml-3">
                  <div className="flex items-center">
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                        {profile?.businessName || profile?.displayName || user?.email?.split('@')[0]}
                      </div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <nav className="space-y-1" aria-label="Sidebar">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`${
                    activeTab === 'dashboard'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'dashboard'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('team')}
                  className={`${
                    activeTab === 'team'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'team'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>Team Management</span>
                </button>

                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`${
                    activeTab === 'appointments'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'appointments'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Company Appointments</span>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`${
                    activeTab === 'documents'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'documents'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Company Documents</span>
                </button>

                <button
                  onClick={() => setActiveTab('compliance')}
                  className={`${
                    activeTab === 'compliance'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'compliance'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Compliance Calendar</span>
                </button>

                <button
                  onClick={() => setActiveTab('payments')}
                  className={`${
                    activeTab === 'payments'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'payments'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Billing & Payments</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${
                    activeTab === 'profile'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'profile'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>Company Profile</span>
                </button>
              </nav>
            </div>

            {/* Main content */}
            <main className="lg:col-span-9">
              {activeTab === 'dashboard' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Business Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Welcome to your company's financial management portal
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Upcoming compliance */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-800 rounded-md p-3">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-300"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Upcoming Compliance Deadlines
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                  0
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Link
                            href="/business/compliance"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View calendar
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Team members */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-800 rounded-md p-3">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-300"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Team Members
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                  1
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Link
                            href="/business/team"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            Manage team
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Active Services */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                      <div className="p-5">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-800 rounded-md p-3">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-300"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Active Services
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                  0
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Link
                            href="/business/services"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View services
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Quick Actions
                    </h2>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <button className="block bg-white dark:bg-gray-800 text-left px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Add Team Member
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Invite colleagues to access the platform
                            </p>
                          </div>
                        </div>
                      </button>

                      <button className="block bg-white dark:bg-gray-800 text-left px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Book Consultation
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Schedule time with a tax expert
                            </p>
                          </div>
                        </div>
                      </button>

                      <button className="block bg-white dark:bg-gray-800 text-left px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Upload Documents
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Share business documents securely
                            </p>
                          </div>
                        </div>
                      </button>

                      <button className="block bg-white dark:bg-gray-800 text-left px-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-6 w-6 text-primary-600 dark:text-primary-400"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Complete Company Profile
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Add your business details and preferences
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Company Information
                    </h2>
                    <div className="mt-4 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                          Business Details
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                          Your company information on record.
                        </p>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <dl>
                          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Company name
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                              {profile?.businessName || 'Not set'}
                            </dd>
                          </div>
                          <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Business type
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                              {profile?.businessType || 'Not set'}
                            </dd>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Primary email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                              {user?.email}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Team management tab */}
              {activeTab === 'team' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Team Management
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage team members and their permissions
                  </p>

                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Team Members
                      </h3>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Member
                      </button>
                    </div>
                    <div className="flex flex-col">
                      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                          <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                              <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Name/Email
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Role
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Status
                                  </th>
                                  <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                  >
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                <tr>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                          {user?.email?.[0].toUpperCase() || 'U'}
                                        </span>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                          {profile?.displayName || 'Admin User'}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                          {user?.email}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                                      Admin
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                                      Active
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300">
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs content would go here */}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
