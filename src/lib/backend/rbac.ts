import { getServiceClient } from './supabase';
import { forbidden } from './errors';
import { PERMISSIONS } from '../permissions';

export async function getUserRoles(userId: string): Promise<string[]> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  const role = data.role;
  if (!role) return [];
  // Return different case formats for compatibility
  return [role, role.toLowerCase(), role.toUpperCase()];
}

export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(roleName.toUpperCase()) || roles.includes(roleName.toLowerCase()) || roles.includes(roleName);
}

export async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  if (roles.includes('SUPER_ADMIN')) {
    return true;
  }

  const key = `${resource}.${action}`;
  if (key in PERMISSIONS) {
    const allowedRoles = PERMISSIONS[key as keyof typeof PERMISSIONS] as readonly string[];
    return roles.some((role) => allowedRoles.includes(role.toUpperCase()));
  }

  return false;
}

export async function requireRole(userId: string, ...roleNames: string[]): Promise<void> {
  const roles = await getUserRoles(userId);
  const hasRequiredRole = roleNames.some((role) =>
    roles.includes(role.toUpperCase()) || roles.includes(role.toLowerCase()) || roles.includes(role)
  );

  if (!hasRequiredRole) {
    throw forbidden(`Requires one of these roles: ${roleNames.join(', ')}`);
  }
}

export async function requirePermission(userId: string, resource: string, action: string): Promise<void> {
  const hasPerms = await hasPermission(userId, resource, action);

  if (!hasPerms) {
    throw forbidden(`Requires permission: ${resource}:${action}`);
  }
}

// Helper function for checking roles synchronously in API routes
export function ensureRole(userRole: string | string[], allowedRoles: string[]): void {
  const roles = Array.isArray(userRole) ? userRole : [userRole];
  const hasRequiredRole = roles.some((role) =>
    allowedRoles.some(
      (allowed) =>
        role.toUpperCase() === allowed.toUpperCase() ||
        role.toLowerCase() === allowed.toLowerCase() ||
        role === allowed
    )
  );

  if (!hasRequiredRole) {
    throw forbidden(`Requires one of these roles: ${allowedRoles.join(', ')}`);
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes('SUPER_ADMIN') || roles.includes('CA');
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes('SUPER_ADMIN');
}
