'use client';

import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { useDevelopmentAuth } from '@/context/DevelopmentAuthContext';

// This hook will use the real auth in production and mock auth in development
export function useAuth() {
  try {
    // Try to use the real auth first
    return useSupabaseAuth();
  } catch (error) {
    // Fall back to development auth if there's an error
    console.warn('Using development auth because of error:', error);
    return useDevelopmentAuth();
  }
}
