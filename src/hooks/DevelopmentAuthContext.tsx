'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useState,
} from 'react';

// Mock context type that mirrors the real auth context
interface MockAuthContextType {
  user: any | null;
  profile: any | null;
  loading: boolean;
  signUp: (email: string, password: string, role: any, additionalData?: any) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  session: any | null;
}

// Create a mock context with stub implementations
const MockAuthContext = createContext<MockAuthContextType | null>(null);

export const DevelopmentAuthProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [user] = useState({
    id: 'mock-user-id',
    email: 'dev@example.com',
  });
  
  const [profile] = useState({
    id: 'mock-user-id',
    email: 'dev@example.com',
    display_name: 'Development User',
    photo_url: null,
    role: 'customer',
  });
  
  const [session] = useState({
    user,
    expires_at: Date.now() + 3600,
  });

  // Mock implementations that just log instead of making actual API calls
  const signUp = async () => {
    console.log('[Development Mode] Sign up called - no actual auth in development');
  };

  const login = async () => {
    console.log('[Development Mode] Login called - user is automatically logged in during development');
  };

  const logout = async () => {
    console.log('[Development Mode] Logout called - user stays logged in during development');
  };

  const updateProfile = async (data: any) => {
    console.log('[Development Mode] Update profile called with:', data);
  };

  return (
    <MockAuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        login,
        logout,
        updateProfile,
        session,
      }}
    >
      <div className="bg-yellow-100 p-2 text-sm text-yellow-800 rounded mb-2">
        [Development Mode] Using mock authentication
      </div>
      {children}
    </MockAuthContext.Provider>
  );
};

// This hook returns the mock auth context during development
export const useDevelopmentAuth = () => {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useDevelopmentAuth must be used within a DevelopmentAuthProvider');
  }
  return context;
};
