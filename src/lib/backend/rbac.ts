import { getServiceClient } from './supabase';
import { forbidden } from './errors';

export async function getUserRoles(userId: string): Promise<string[]> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data?.map((ur: any) => ur.roles?.name).filter(Boolean) || [];
}

export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes(roleName);
}

export async function hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const client = getServiceClient();

  const { data, error } = await client
    .from('user_roles')
    .select(
      `
      role_id,
      roles!inner(
        role_permissions(
          permission_id,
          permissions!inner(resource, action)
        )
      )
    `
    )
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

export async function requireRole(userId: string, ...roleNames: string[]): Promise<void> {
  const roles = await getUserRoles(userId);
  const hasRequiredRole = roleNames.some((role) => roles.includes(role));

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
  const hasRequiredRole = roles.some((role) => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    throw forbidden(`Requires one of these roles: ${allowedRoles.join(', ')}`);
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'admin');
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'super_admin');
}
