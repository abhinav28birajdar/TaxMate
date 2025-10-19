import { redirect } from 'next/navigation';
import EnhancedAuthForms from '@/components/auth/EnhancedAuthForms';

export default async function RegisterPage() {
  // In a real implementation, you would verify authentication server-side using 
  // Firebase Admin SDK or a similar approach
  const isAuthenticated = false; // Replace with actual auth check
  
  if (isAuthenticated) {
    // Redirect already logged in users to their dashboard
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            TaxMate
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Your Enterprise-Grade Financial Services Marketplace
          </p>
        </div>
        <EnhancedAuthForms initialMode="register" />
      </div>
    </div>
  );
}