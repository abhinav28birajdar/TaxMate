import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth, UserRole } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

// Define validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'ca', 'business']),
  termsAccepted: z.boolean()
    .refine((val) => val === true, { message: 'You must accept the terms and conditions' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface EnhancedAuthFormsProps {
  initialMode?: 'login' | 'register';
}

export default function EnhancedAuthForms({ initialMode = 'login' }: EnhancedAuthFormsProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  
  // Login form hook
  const { 
    register: registerLogin, 
    handleSubmit: handleSubmitLogin, 
    formState: { errors: loginErrors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Register form hook
  const { 
    register: registerSignUp, 
    handleSubmit: handleSubmitRegister, 
    formState: { errors: registerErrors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'customer',
      termsAccepted: false
    }
  });

  // Handler for email/password login
  const onLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for user registration
  const onRegister = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);

      const roleMap: Record<RegisterFormData['role'], UserRole> = {
        customer: 'CLIENT',
        ca: 'CA',
        business: 'STAFF',
      };

      await signUp(data.email, data.password, data.email.split('@')[0], roleMap[data.role]);
      
      toast.success('Account created successfully!');
      
      // Redirect based on role and onboarding status
      if (String(data.role).toLowerCase() === 'ca') {
        toast.success('Please complete the verification process to use your account.');
        // Redirect to CA onboarding will happen via protected routes
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success('Signing in with Google...');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      toast.error(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-card">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {mode === 'login' ? 'Sign In to TaxMate' : 'Create TaxMate Account'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {mode === 'login' 
            ? 'Access your account to manage your financial services' 
            : 'Join our platform to connect with financial experts'}
        </p>
      </div>

      {/* Social Sign In Button */}
      <div className="mb-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? 'Processing...' : 'Continue with Google'}
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            or continue with email
          </span>
        </div>
      </div>

      {mode === 'login' ? (
        // Login Form
        <form onSubmit={handleSubmitLogin(onLogin)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              {...registerLogin('email')}
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              disabled={isLoading}
            />
            {loginErrors.email && (
              <p className="text-red-500 text-sm mt-1">{loginErrors.email.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <a 
                href="/forgot-password" 
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </a>
            </div>
            <input
              {...registerLogin('password')}
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              disabled={isLoading}
            />
            {loginErrors.password && (
              <p className="text-red-500 text-sm mt-1">{loginErrors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      ) : (
        // Register Form
        <form onSubmit={handleSubmitRegister(onRegister)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="reg-email">
              Email
            </label>
            <input
              {...registerSignUp('email')}
              type="email"
              id="reg-email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              disabled={isLoading}
            />
            {registerErrors.email && (
              <p className="text-red-500 text-sm mt-1">{registerErrors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="reg-password">
              Password
            </label>
            <input
              {...registerSignUp('password')}
              type="password"
              id="reg-password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              disabled={isLoading}
            />
            {registerErrors.password && (
              <p className="text-red-500 text-sm mt-1">{registerErrors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              {...registerSignUp('confirmPassword')}
              type="password"
              id="confirm-password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
              disabled={isLoading}
            />
            {registerErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{registerErrors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Account Type</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <input
                  {...registerSignUp('role')}
                  type="radio"
                  id="role-customer"
                  value="customer"
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <label
                  htmlFor="role-customer"
                  className="flex flex-col items-center justify-center p-4 text-gray-500 border border-gray-300 rounded-md cursor-pointer peer-checked:border-primary-500 peer-checked:text-primary-500 hover:text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-300 dark:peer-checked:text-primary-500 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span>Individual</span>
                </label>
              </div>
              
              <div>
                <input
                  {...registerSignUp('role')}
                  type="radio"
                  id="role-ca"
                  value="ca"
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <label
                  htmlFor="role-ca"
                  className="flex flex-col items-center justify-center p-4 text-gray-500 border border-gray-300 rounded-md cursor-pointer peer-checked:border-primary-500 peer-checked:text-primary-500 hover:text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-300 dark:peer-checked:text-primary-500 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>CA</span>
                </label>
              </div>
              
              <div>
                <input
                  {...registerSignUp('role')}
                  type="radio"
                  id="role-business"
                  value="business"
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <label
                  htmlFor="role-business"
                  className="flex flex-col items-center justify-center p-4 text-gray-500 border border-gray-300 rounded-md cursor-pointer peer-checked:border-primary-500 peer-checked:text-primary-500 hover:text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:text-gray-300 dark:peer-checked:text-primary-500 dark:hover:bg-gray-700"
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span>Business</span>
                </label>
              </div>
            </div>
            {registerErrors.role && (
              <p className="text-red-500 text-sm mt-1">{registerErrors.role.message}</p>
            )}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...registerSignUp('termsAccepted')}
                id="terms"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:focus:ring-offset-gray-800"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
                I accept the <a className="font-medium text-primary-600 hover:underline" href="#">Terms and Conditions</a>
              </label>
              {registerErrors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1">{registerErrors.termsAccepted.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}

      <p className="text-center mt-6">
        {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-primary-600 hover:text-primary-700 ml-1 font-medium"
          disabled={isLoading}
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>
    </div>
  );
}
