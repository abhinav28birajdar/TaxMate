'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Business compliance calendar component
export default function ComplianceCalendar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Define the type for compliance events
  type ComplianceEvent = {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    category: string;
    status: string;
    assignedTo: string | null;
  };

  // Mock compliance events - would come from Firestore in production
  const [complianceEvents, setComplianceEvents] = useState<ComplianceEvent[]>([
    {
      id: '1',
      title: 'Annual Tax Filing',
      description: 'Submit annual company tax return',
      dueDate: '2024-03-31T23:59:59.000Z',
      category: 'tax',
      status: 'upcoming',
      assignedTo: null,
    },
    {
      id: '2',
      title: 'GST Filing - Quarter 1',
      description: 'Submit quarterly GST return',
      dueDate: '2024-01-15T23:59:59.000Z',
      category: 'gst',
      status: 'upcoming',
      assignedTo: null,
    },
    {
      id: '3',
      title: 'Annual Company Return',
      description: 'File annual company return with Companies House',
      dueDate: '2024-02-28T23:59:59.000Z',
      category: 'company',
      status: 'upcoming',
      assignedTo: null,
    },
    {
      id: '4',
      title: 'Confirmation Statement',
      description: 'Submit confirmation statement',
      dueDate: '2023-12-15T23:59:59.000Z', // Past due
      category: 'company',
      status: 'overdue',
      assignedTo: null,
    }
  ]);
  
  // Categories for filtering and color coding
  const categories = [
    { id: 'all', name: 'All Categories', color: 'gray' },
    { id: 'tax', name: 'Tax', color: 'red' },
    { id: 'gst', name: 'GST/VAT', color: 'blue' },
    { id: 'company', name: 'Company Registration', color: 'green' },
    { id: 'payroll', name: 'Payroll', color: 'yellow' },
  ];
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter events based on selected category
  const filteredEvents = complianceEvents.filter(
    event => selectedCategory === 'all' || event.category === selectedCategory
  );

  // Sort events by due date
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  // For demonstration, group events by month
  const groupedEvents = sortedEvents.reduce((groups, event) => {
    const date = new Date(event.dueDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(event);
    return groups;
  }, {} as Record<string, ComplianceEvent[]>);

  // Handle assigning compliance task
  const handleAssignTask = (id: string, email: string) => {
    setComplianceEvents(complianceEvents.map(event => 
      event.id === id ? { ...event, assignedTo: email } : event
    ));
  };

  // Handle marking as complete
  const handleMarkComplete = (id: string) => {
    setComplianceEvents(complianceEvents.map(event => 
      event.id === id ? { ...event, status: 'completed' } : event
    ));
  };

  // Add a new compliance event
  const handleAddEvent = () => {
    router.push('/business/compliance/add');
  };

  // Function to get appropriate badge color based on due date
  const getStatusBadge = (dueDate: string, status: string) => {
    if (status === 'completed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
    
    const today = new Date();
    const due = new Date(dueDate);
    
    if (due < today) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
    
    const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 14) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
    
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  // Function to get category color
  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'gray';
  };

  // Function to generate month with days for calendar view
  const generateCalendarMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Generate calendar days array with padding for the first week
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Calculate calendar days
  const calendarDays = generateCalendarMonth(currentMonth);
  
  // Get events for a specific day
  const getEventsForDay = (day: Date | null) => {
    if (!day) return [];
    
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.dueDate);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-6">
      {/* Header with view toggle and filter */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl sm:truncate">
              Compliance Calendar
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Keep track of all your business compliance deadlines and regulatory obligations.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0">
            <button
              type="button"
              onClick={handleAddEvent}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Reminder
            </button>
          </div>
        </div>

        {/* View toggle and filters */}
        <div className="mt-6 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center">
            <span className="mr-3 text-sm font-medium text-gray-700 dark:text-gray-300">View:</span>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`px-3 py-1.5 text-sm font-medium rounded-l-md focus:outline-none ${
                  view === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 text-sm font-medium rounded-r-md focus:outline-none ${
                  view === 'calendar'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <label htmlFor="category" className="sr-only">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Upcoming Compliance Deadlines
            </h3>
          </div>
          {sortedEvents.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(groupedEvents).map(([monthYear, events]) => (
                <div key={monthYear} className="bg-white dark:bg-gray-800">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {monthYear}
                  </div>
                  <ul>
                    {events.map((event) => (
                      <li key={event.id} className="px-4 py-5 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <div
                                className={`h-2.5 w-2.5 rounded-full mr-2 bg-${getCategoryColor(event.category)}-500`}
                                aria-hidden="true"
                              ></div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.title}</h4>
                            </div>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {event.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(event.dueDate, event.status)}`}>
                              {event.status === 'overdue' 
                                ? 'Overdue'
                                : event.status === 'completed'
                                ? 'Completed'
                                : new Date(event.dueDate).toLocaleDateString()}
                            </span>
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => handleAssignTask(event.id, user?.email || '')}
                                className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                              >
                                {event.assignedTo ? 'Reassign' : 'Assign'}
                              </button>
                              <button
                                onClick={() => handleMarkComplete(event.id)}
                                disabled={event.status === 'completed'}
                                className={`inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded ${
                                  event.status === 'completed'
                                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                    : 'text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500'
                                }`}
                              >
                                {event.status === 'completed' ? 'Completed' : 'Complete'}
                              </button>
                            </div>
                          </div>
                        </div>
                        {event.assignedTo && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Assigned to: {event.assignedTo}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No compliance events found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a compliance reminder to get started.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddEvent}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Reminder
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar view */}
      {view === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={goToNextMonth}
                className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="px-2 py-2 sm:px-4">
            <div className="grid grid-cols-7 gap-px">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const isToday = day && 
                  day.getDate() === new Date().getDate() && 
                  day.getMonth() === new Date().getMonth() && 
                  day.getFullYear() === new Date().getFullYear();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[90px] p-1 border border-gray-200 dark:border-gray-700 ${
                      !day ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                    } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    {day && (
                      <>
                        <div className={`text-right text-sm ${
                          isToday 
                            ? 'font-bold text-primary-600 dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="mt-1 space-y-1">
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${
                                event.status === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                  : event.status === 'overdue'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                  : `bg-${getCategoryColor(event.category)}-100 dark:bg-${getCategoryColor(event.category)}-900/30 text-${getCategoryColor(event.category)}-800 dark:text-${getCategoryColor(event.category)}-200`
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compliance tips */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Compliance Resources
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">Tax Calendar</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View important tax deadlines for your business.</p>
              <Link href="/business/resources/tax-calendar" className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                Learn more →
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">Filing Guides</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Step-by-step guides for common business filings.</p>
              <Link href="/business/resources/filing-guides" className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                Learn more →
              </Link>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600">
              <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">Advisory Services</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get expert help with compliance requirements.</p>
              <Link href="/business/resources/advisory" className="mt-2 text-sm font-medium text-primary-600 dark:text-primary-400">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}