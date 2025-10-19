'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function CADashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle verification status display
  const verificationStatus = profile?.verificationStatus || 'pending';
  
  const renderVerificationBanner = () => {
    if (verificationStatus === 'pending') {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Verification pending</h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Your account is pending verification. Please complete your profile and upload your professional credentials.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab('verification')}
                    className="bg-yellow-50 dark:bg-yellow-800 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                  >
                    Complete verification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (verificationStatus === 'rejected') {
      return (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Verification failed</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>
                  Your verification was not successful. Please review the requirements and resubmit your credentials.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={() => setActiveTab('verification')}
                    className="bg-red-50 dark:bg-red-800 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Review and resubmit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

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
          {renderVerificationBanner()}

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
                  onClick={() => setActiveTab('clients')}
                  className={`${
                    activeTab === 'clients'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'clients'
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
                  <span>Clients</span>
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
                  <span>Schedule</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`${
                    activeTab === 'services'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'services'
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                  <span>My Services</span>
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
                  <span>Documents</span>
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
                  <span>Earnings</span>
                </button>

                <button
                  onClick={() => setActiveTab('verification')}
                  className={`${
                    activeTab === 'verification'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full`}
                >
                  <svg
                    className={`${
                      activeTab === 'verification'
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
                  <span>Verification</span>
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
                    CA Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Welcome to your practice management dashboard
                  </p>

                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Today's appointments */}
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
                                Today's Appointments
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
                            href="/ca/appointments"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View calendar
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* New client requests */}
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
                                New Client Requests
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
                            href="/ca/clients"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View all
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Earnings */}
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
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                Monthly Earnings
                              </dt>
                              <dd>
                                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                  ₹0.00
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                        <div className="text-sm">
                          <Link
                            href="/ca/earnings"
                            className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                          >
                            View details
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
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Set Availability
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Update your working hours and available slots
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
                              Manage Services
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Create or update the services you offer
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
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Stripe Connect
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Set up your payment account to receive funds
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
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                              Complete Profile
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Add your practice details and qualifications
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'verification' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Professional Verification
                  </h1>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Complete your verification to unlock all CA features
                  </p>

                  <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Verification Status: 
                        <span className={`ml-2 ${
                          verificationStatus === 'verified' 
                            ? 'text-green-600 dark:text-green-400' 
                            : verificationStatus === 'pending' 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {verificationStatus.charAt(0).toUpperCase() + verificationStatus.slice(1)}
                        </span>
                      </h3>
                    </div>
                    
                    <div className="px-4 py-5 sm:p-6">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            ICAI Membership Number
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                              placeholder="e.g. 123456"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Certificate of Practice Number
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                              placeholder="e.g. COP/12345/2023"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload Certificate of Practice
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, JPG, PNG up to 10MB
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Upload Photo ID (Aadhaar/PAN)
                          </label>
                          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                  htmlFor="id-upload"
                                  className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="id-upload"
                                    name="id-upload"
                                    type="file"
                                    className="sr-only"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, JPG, PNG up to 10MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          type="button"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          Submit for Verification
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs will be similar */}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}