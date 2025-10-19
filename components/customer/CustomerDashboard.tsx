'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function CustomerDashboard() {
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
                        {profile?.displayName || user?.email?.split('@')[0]}
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
                    aria-hidden="true"
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
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>Appointments</span>
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
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Documents</span>
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
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>Payments</span>
                </button>

                <button
                  onClick={() => setActiveTab('messages')}
                  className={`${
                    activeTab === 'messages'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'messages'
                        ? 'text-primary-500'
                        : 'text-gray-400 dark:text-gray-500'
                    } flex-shrink-0 -ml-1 mr-3 h-6 w-6`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span>Messages</span>
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
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile</span>
                </button>
              </nav>
            </div>

            {/* Main content */}
            <main className="lg:col-span-9">
              {activeTab === 'dashboard' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Welcome back, {profile?.displayName || user?.email?.split('@')[0]}!
                  </h1>
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Upcoming appointments */}
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
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Upcoming Appointments
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
                            href="/customer/appointments"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View all
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Pending Documents */}
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Documents Pending Review
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
                            href="/customer/documents"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View all
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Unread Messages */}
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
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Unread Messages
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
                            href="/customer/messages"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View all
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Find a CA section */}
                  <div className="mt-8">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      Find a Chartered Accountant
                    </h2>
                    <div className="mt-5 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="max-w-2xl">
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="text"
                              className="form-input block w-full pl-4 pr-12 sm:text-sm sm:leading-5 dark:bg-gray-700 dark:border-gray-600"
                              placeholder="Search for services or CA experts..."
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center">
                              <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:border-primary-700 focus:shadow-outline-primary active:bg-primary-700 transition ease-in-out duration-150"
                              >
                                Search
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                              <div className="flex-shrink-0">
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <Link href="/customer/services/tax-filing" className="text-base text-gray-900 dark:text-gray-100 hover:text-primary-600">
                                Income Tax Return Filing
                              </Link>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                              <div className="flex-shrink-0">
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <Link href="/customer/services/gst-filing" className="text-base text-gray-900 dark:text-gray-100 hover:text-primary-600">
                                GST Filing
                              </Link>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Link
                            href="/customer/find-ca"
                            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View all services →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appointments' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Your Appointments
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your scheduled appointments with CAs.
                  </p>

                  {/* Empty state */}
                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No appointments
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You haven't scheduled any appointments yet.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/customer/find-ca"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Book an Appointment
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Your Documents
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Access and manage your secure document repository.
                  </p>

                  {/* Empty state */}
                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No documents
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have any documents in your repository yet.
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Upload a Document
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Payments & Invoices
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    View your payment history and download invoices.
                  </p>

                  {/* Empty state */}
                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No payment history
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You haven't made any payments yet.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'messages' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Messages
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Communicate with your CAs securely.
                  </p>

                  {/* Empty state */}
                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md p-6 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                      No messages
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      You don't have any messages yet.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Profile Settings
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your account preferences and personal information.
                  </p>

                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Personal Information
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                        Your personal details and preferences.
                      </p>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <dl>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Full name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                            {profile?.displayName || 'Not set'}
                          </dd>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Email address
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                            {user?.email}
                          </dd>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Phone number
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                            {profile?.phoneNumber || 'Not set'}
                          </dd>
                        </div>
                        <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Account created
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                            {profile?.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString()
                              : 'Unknown'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
                      <button
                        type="button"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}