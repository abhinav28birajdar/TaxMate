'use client';

import { useAuth } from '@/hooks/UnifiedAuthContext';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';

export function usePermission(permission: keyof typeof PERMISSIONS): boolean {
  const { user } = useAuth();
  const userRole = user?.role;
  if (!userRole) return false;
  return hasPermission(userRole, permission);
}

