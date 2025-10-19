'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface BillingProps {}

// Business billing and payments component
export default function Billing({}: BillingProps) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Mock billing data - would come from Firestore in production
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      date: '2023-12-01',
      dueDate: '2023-12-15',
      amount: 499.99,
      status: 'paid',
      description: 'Monthly Tax Consultation',
      caName: 'Jane Smith, CPA'
    },
    {
      id: 'INV-002',
      date: '2023-11-01',
      dueDate: '2023-11-15',
      amount: 499.99,
      status: 'paid',
      description: 'Monthly Tax Consultation',
      caName: 'Jane Smith, CPA'
    },
    {
      id: 'INV-003',
      date: '2023-12-05',
      dueDate: '2023-12-19',
      amount: 299.50,
      status: 'pending',
      description: 'Financial Statement Review',
      caName: 'Robert Johnson, CPA'
    }
  ]);

  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm_1',
      type: 'card',
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2024,
      isDefault: true
    }
  ]);

  // Mock subscription data
  const [subscription, setSubscription] = useState({
    status: 'active',
    plan: 'Business Pro',
    amount: 99.99,
    interval: 'month',
    currentPeriodEnd: '2024-01-01',
    cancelAtPeriodEnd: false
  });

  const handlePayInvoice = (invoiceId: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setInvoices(
        invoices.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, status: 'paid' } 
            : invoice
        )
      );
      setIsLoading(false);
    }, 1500);
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    alert(`Downloading invoice ${invoiceId}. In production, this would generate a PDF.`);
  };

  const handleUpdateSubscription = (action: string) => {
    if (action === 'cancel') {
      if (confirm('Are you sure you want to cancel your subscription? It will remain active until the end of the current billing period.')) {
        setSubscription({ ...subscription, cancelAtPeriodEnd: true });
      }
    } else if (action === 'resume') {
      setSubscription({ ...subscription, cancelAtPeriodEnd: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription overview */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Subscription
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage your business subscription plan and billing preferences.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {subscription.plan}
              </h4>
              <div className="mt-1 flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {subscription.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                
                {subscription.cancelAtPeriodEnd && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    Cancels on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                ${subscription.amount}/{subscription.interval} · Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
            <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
              {subscription.cancelAtPeriodEnd ? (
                <button
                  type="button"
                  onClick={() => handleUpdateSubscription('resume')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Resume Subscription
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateSubscription('cancel')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel Subscription
                </button>
              )}
              <button
                type="button"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Plan Features
            </h4>
            <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Unlimited team members
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  50GB secure document storage
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Priority support
                </p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Advanced compliance tools
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Payment Methods
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Manage your payment methods for automatic billing.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center">
                    {method.brand === 'visa' && (
                      <svg className="h-8 w-12 mr-3" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="48" height="48" rx="6" fill="#2566AF" />
                        <path d="M22.0896 28.5858H18.9544L16.8353 20.2535C16.7261 19.8835 16.5031 19.5609 16.1898 19.3657C15.3796 18.875 14.4766 18.4796 13.4807 18.2844H13.3848V17.8889H18.4646C19.1819 17.8889 19.7076 18.3796 19.8035 18.9656L20.9416 24.9346L23.8489 17.8889H26.8879L22.0896 28.5858ZM27.8898 28.5858H25.0784L27.7939 17.8889H30.6053L27.8898 28.5858ZM35.2178 22.4423C35.3137 21.8563 35.8394 21.5608 36.4609 21.5608C37.3669 21.4608 38.3629 21.6561 39.1731 22.0515L39.7947 18.875C38.9845 18.5796 38.0785 18.3843 37.2683 18.3843C34.4569 18.3843 32.4649 19.9515 32.4649 22.0515C32.4649 23.6187 33.8351 24.4 34.8311 24.8905C35.8394 25.381 36.1773 25.7765 36.1773 26.2671C36.1773 26.9484 35.4599 27.3438 34.7426 27.3438C33.7467 27.3438 32.7508 27.0484 31.8448 26.6529L31.2232 29.8295C32.2192 30.225 33.3111 30.4202 34.4091 30.4202C37.5072 30.5155 39.3656 28.9484 39.3656 26.6529C39.3656 23.8718 35.2178 23.6766 35.2178 22.4423Z" fill="white" />
                        <path d="M23.9446 17.8889L19.9951 28.5858H17.1837L13.3848 19.4609C15.0927 20.2535 16.6048 21.3656 17.4341 22.6609L17.9189 24.6398L20.0885 17.8889H23.9446Z" fill="#EEE9E5" />
                        <path d="M40 30.3249V29.9295H39.9041V30.1247H39.8082V29.9295H39.7123V30.3249H39.8082V30.3249H40ZM39.5205 30.3249V30.0249H39.5844L39.6482 30.2202L39.7123 30.0249H39.7762V30.3249H39.7123V30.1247L39.6482 30.32H39.5844L39.5205 30.1247V30.3249Z" fill="white" />
                      </svg>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)} •••• {method.last4}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Expires {method.expMonth}/{method.expYear}
                        {method.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Default
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button type="button" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
                      Edit
                    </button>
                    <button type="button" className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No payment methods</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add a payment method to enable automatic billing.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Payment Method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices/Billing History */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Billing History
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            View and manage invoices for services provided.
          </p>
        </div>
        <div className="overflow-hidden">
          {invoices.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {invoice.id}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {invoice.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{new Date(invoice.date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invoice.status === 'pending' ? (
                        <button
                          onClick={() => handlePayInvoice(invoice.id)}
                          disabled={isLoading}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 mr-4"
                        >
                          {isLoading ? 'Processing...' : 'Pay'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-200 mr-4"
                        >
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No invoices</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You don't have any invoices yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Billing address */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Billing Address
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Update your billing information for tax purposes.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-4">
            <div className="sm:col-span-3">
              <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Company name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder={profile?.businessName || 'Your company name'}
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="tax-id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tax ID / VAT number
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="tax-id"
                  id="tax-id"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="address"
                  id="address"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="city"
                  id="city"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                ZIP / Postal code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="postal-code"
                  id="postal-code"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <div className="mt-1">
                <select
                  id="country"
                  name="country"
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}