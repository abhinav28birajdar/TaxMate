'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthHook';
import { Database } from '@/lib/types/database.types';

type UserRole = Database['public']['Enums']['user_role'];

type FormData = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
};

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      role: 'customer',
    },
  });

  const password = watch('password');
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await signUp(
        data.email, 
        data.password, 
        data.role, 
        { display_name: data.displayName }
      );
      
      // Redirect to login after successful registration
      router.push('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Create your account
          </h2>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label 
                htmlFor="displayName" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name
              </label>
              <input
                {...register('displayName', {
                  required: 'Full name is required',
                })}
                id="displayName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.displayName.message}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                id="email"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Password
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
                  },
                })}
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirm Password
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: value => 
                    value === password || 'The passwords do not match',
                })}
                id="confirmPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <div>
              <label 
                htmlFor="role" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                I am a
              </label>
              <select
                {...register('role')}
                id="role"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="customer">Individual Customer</option>
                <option value="ca">Chartered Accountant</option>
                <option value="business">Business Owner</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Privacy Policy
                </Link>
              </label>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.229 4.933c-2.306-.551-4.677.838-5.228 3.143-.284 1.192-.101 2.346.48 3.293.576.945 1.486 1.66 2.678 1.944.284.066.566.1.846.1 1.517 0 2.948-.832 3.686-2.239.739-1.406.565-3.046-.48-4.297-.843-1.007-1.397-1.591-1.982-1.944zm-2.294 7.315c-1.106-.265-2.01-.838-2.538-1.625-.528-.787-.685-1.739-.445-2.714.372-1.563 1.837-2.621 3.4-2.621.238 0 .477.024.716.073.372.222.812.689 1.486 1.503.788.945.928 2.188.372 3.293-.555 1.106-1.738 1.833-2.991 1.625v-.534z" />
                  <path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.901-7.423c-1.688-1.406-3.839-1.997-6.099-1.643-2.446.383-4.688 2.017-5.585 4.077-.716 1.643-.63 3.491.237 5.112.867 1.625 2.388 2.785 4.269 3.275 1.313.352 2.694.183 3.839-.48.376.376.725.711 1.101 1.087l3.33 3.331c.156.155.34.28.551.368.379.157.813.157 1.192 0 .379-.156.675-.453.831-.831.157-.379.157-.813 0-1.192-.087-.211-.212-.396-.367-.552l-3.331-3.331c-.376-.376-.711-.725-1.087-1.101.663-1.145.832-2.526.48-3.839-.49-1.881-1.65-3.402-3.275-4.27-.196-.102-.379-.189-.579-.277-.72-.31-1.464-.524-2.218-.631.349.502.634 1.063.843 1.677.351.055.702.135 1.031.271.158.066.304.148.458.22 1.304.688 2.214 1.877 2.533 3.299.318 1.421-.035 2.857-.982 4.019l-.26.316-.317-.26c-1.162-.947-2.599-1.3-4.02-.982-1.42.318-2.61 1.228-3.298 2.533-.688 1.304-.808 2.817-.331 4.211.477 1.395 1.534 2.546 2.93 3.133 1.398.588 2.954.478 4.3-.305 1.346-.782 2.24-2.085 2.469-3.597.23-1.511-.224-3.040-1.254-4.227l.26-.317.317.26c1.188 1.03 2.715 1.484 4.227 1.254 1.512-.229 2.815-1.123 3.597-2.469.783-1.346.893-2.901.306-4.299-.586-1.397-1.739-2.453-3.134-2.93-1.106-.375-2.282-.349-3.376.074.495.93.893 1.958 1.162 3.079.351-.122.729-.177 1.097-.138.676.078 1.275.454 1.688 1.059.413.604.537 1.34.351 2.035-.186.697-.677 1.27-1.362 1.597-.687.329-1.45.31-2.112-.052-.662-.362-1.122-.99-1.289-1.757-.167-.767.041-1.548.582-2.191.54-.644 1.302-.98 2.138-.94.363.018.719.11 1.038.26-.293-1.117-.733-2.135-1.29-3.058-1.12-.498-2.365-.591-3.553-.268-1.844.505-3.28 1.937-3.784 3.781-.324 1.186-.23 2.432.267 3.553.923.557 1.941.996 3.059 1.29-.151-.319-.242-.675-.261-1.039-.039-.836.295-1.599.94-2.138.643-.54 1.425-.75 2.191-.582.767.168 1.396.627 1.756 1.289.363.663.381 1.426.053 2.112-.327.686-.9 1.176-1.596 1.363-.696.186-1.433.063-2.036-.352-.605-.413-.981-1.012-1.059-1.688-.039-.367.016-.746.138-1.096-1.12-.269-2.149-.667-3.08-1.163-.421 1.095-.449 2.27-.073 3.376.477 1.396 1.534 2.547 2.93 3.134 1.398.588 2.954.478 4.3-.305 1.346-.782 2.24-2.085 2.47-3.597.229-1.511-.224-3.04-1.255-4.227l.261-.317.316.26c1.188 1.03 2.716 1.484 4.227 1.254 1.512-.229 2.815-1.123 3.598-2.469.782-1.346.893-2.901.306-4.299-.588-1.397-1.738-2.453-3.134-2.93-1.108-.375-2.283-.348-3.377.074.496.929.894 1.958 1.163 3.079.352-.121.728-.178 1.096-.139.676.078 1.276.454 1.689 1.059.413.604.538 1.34.351 2.036-.186.696-.677 1.27-1.362 1.597-.687.327-1.45.31-2.112-.053-.663-.362-1.122-.989-1.29-1.756-.166-.767.042-1.548.583-2.192.54-.643 1.302-.98 2.139-.94.362.018.719.111 1.038.261-.294-1.118-.734-2.135-1.29-3.058-1.121-.499-2.366-.592-3.554-.268-1.843.505-3.28 1.937-3.783 3.781-.324 1.186-.231 2.432.267 3.553.922.557 1.941.997 3.059 1.29-.15-.319-.242-.675-.261-1.039-.039-.836.295-1.599.94-2.138.643-.54 1.425-.75 2.191-.582.767.168 1.396.627 1.757 1.289.362.663.381 1.426.052 2.112-.327.686-.9 1.176-1.596 1.363-.697.186-1.433.063-2.035-.352-.605-.413-.981-1.012-1.059-1.688-.039-.368.016-.746.138-1.096-1.121-.269-2.149-.668-3.079-1.163-.422 1.094-.449 2.27-.074 3.376.477 1.396 1.533 2.547 2.93 3.134 1.398.588 2.954.478 4.3-.305 1.346-.782 2.239-2.085 2.469-3.597.23-1.511-.224-3.04-1.255-4.227l.261-.316.316.26c1.188 1.03 2.716 1.484 4.227 1.254 1.512-.23 2.815-1.123 3.598-2.469.782-1.346.893-2.902.306-4.299-.588-1.397-1.738-2.453-3.134-2.93-1.394-.474-2.906-.373-4.211.331-1.307.704-2.217 1.894-2.534 3.317-.317 1.422.035 2.857.983 4.019l.26.317-.317.26c-1.162.947-2.599 1.301-4.02.983-1.42-.318-2.61-1.228-3.298-2.533-.688-1.304-.809-2.817-.332-4.211.478-1.395 1.533-2.546 2.93-3.133 1.214-.51 2.551-.506 3.757-.041-.167-.466-.304-.947-.411-1.442-1.498-.03-2.996.403-4.278 1.24-1.67 1.09-2.827 2.717-3.264 4.584-.438 1.866-.057 3.768 1.073 5.363 1.129 1.595 2.825 2.669 4.765 3.022 1.941.354 3.885-.191 5.455-1.533.376.376.725.711 1.101 1.087l3.33 3.331c.543.543 1.344.766 2.103.584.758-.183 1.352-.776 1.535-1.534.182-.759-.041-1.56-.584-2.103l-3.331-3.33c-.376-.376-.711-.726-1.087-1.102 1.342-1.57 1.887-3.514 1.533-5.455-.353-1.94-1.427-3.636-3.022-4.765-1.595-1.129-3.497-1.511-5.363-1.073-1.808.424-3.4 1.534-4.479 3.127l-.789-1.015c-1.14-.376-2.273-.384-3.413-.069-1.843.505-3.28 1.936-3.784 3.781-.324 1.185-.23 2.432.267 3.553.923.557 1.941.997 3.059 1.29-.151-.32-.242-.675-.261-1.04-.039-.835.295-1.598.94-2.138.643-.54 1.425-.749 2.191-.582.767.167 1.396.627 1.757 1.289.362.663.38 1.426.052 2.112-.327.686-.9 1.177-1.596 1.363-.697.187-1.433.063-2.036-.351-.605-.414-.981-1.013-1.059-1.688-.039-.368.016-.746.138-1.097-1.12-.269-2.149-.667-3.08-1.162-.421 1.094-.449 2.27-.073 3.376.477 1.396 1.534 2.547 2.93 3.134 1.398.588 2.954.477 4.3-.306 1.346-.782 2.24-2.085 2.47-3.597.229-1.511-.224-3.04-1.255-4.227l.261-.316.316.26c1.188 1.03 2.716 1.484 4.227 1.254 1.512-.23 2.815-1.123 3.598-2.469.782-1.346.893-2.902.306-4.299-.588-1.397-1.738-2.453-3.134-2.93-1.394-.474-2.906-.372-4.211.331-1.307.704-2.217 1.894-2.534 3.317-.317 1.422.035 2.857.983 4.019l.26.317-.317.26c-1.162.947-2.599 1.301-4.02.983-1.42-.318-2.61-1.228-3.298-2.533-.688-1.304-.809-2.817-.332-4.211.478-1.395 1.533-2.547 2.93-3.133 1.514-.636 3.216-.466 4.613.458.72-.149 1.469-.215 2.231-.193-1.687-1.399-3.834-2.023-6.088-1.67z" />
                </svg>
                Microsoft
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}