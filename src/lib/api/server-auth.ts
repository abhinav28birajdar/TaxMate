import { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getServiceClient } from '@/lib/backend/supabase';

export type CanonicalRole = 'CLIENT' | 'CA' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';

export interface ServerAuthContext {
  userId: string;
  email: string;
  role: CanonicalRole;
  isAdmin: boolean;
  isCAOrStaff: boolean;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

export function normalizeCanonicalRole(rawRole?: string | null): CanonicalRole {
  const upper = String(rawRole || 'CLIENT').toUpperCase();
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN';
  if (upper === 'ADMIN') return 'ADMIN';
  if (upper === 'STAFF') return 'STAFF';
  if (upper === 'CA') return 'CA';
  return 'CLIENT';
}

export function isAdminRole(role?: string | null): boolean {
  const normalized = normalizeCanonicalRole(role);
  return normalized === 'ADMIN' || normalized === 'SUPER_ADMIN';
}

export function isCaOrStaffRole(role?: string | null): boolean {
  const normalized = normalizeCanonicalRole(role);
  return normalized === 'CA' || normalized === 'STAFF' || isAdminRole(normalized);
}

/**
 * Resolve authenticated Supabase user from session cookies or Authorization Bearer token.
 * Fails closed (returns null) if unauthenticated, banned, or suspended.
 */
export async function getSessionUser(request?: NextRequest): Promise<ServerAuthContext | null> {
  try {
    const supabase = await createClient();
    const authHeader = request?.headers.get('authorization');

    let user = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data.user) {
          user = data.user;
        }
      }
    }

    if (!user) {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        user = data.user;
      }
    }

    if (!user) {
      return null;
    }

    const serviceClient = getServiceClient();
    const [{ data: userRow }, { data: profileRow }] = await Promise.all([
      serviceClient.from('users').select('role, status').eq('id', user.id).maybeSingle(),
      serviceClient.from('profiles').select('role, is_active').eq('id', user.id).maybeSingle(),
    ]);

    if (userRow?.status === 'BANNED' || userRow?.status === 'SUSPENDED' || profileRow?.is_active === false) {
      return null;
    }

    const rawRole =
      (user.app_metadata?.role as string | undefined) ||
      (userRow?.role as string | undefined) ||
      (profileRow?.role as string | undefined) ||
      'CLIENT';

    const role = normalizeCanonicalRole(rawRole);

    return {
      userId: user.id,
      email: user.email || '',
      role,
      isAdmin: isAdminRole(role),
      isCAOrStaff: isCaOrStaffRole(role),
      supabase,
    };
  } catch (err) {
    console.error('getSessionUser error:', err);
    return null;
  }
}

/**
 * Return all IDs representing a client user across users/profiles/clients/client_profiles.
 */
export async function getResolvedClientIdsForUser(userId: string): Promise<string[]> {
  const ids = new Set<string>([userId]);
  try {
    const serviceClient = getServiceClient();
    const [{ data: clientRows }, { data: clientProfiles }] = await Promise.all([
      serviceClient.from('clients').select('id').eq('portal_user_id', userId),
      serviceClient.from('client_profiles').select('id').eq('user_id', userId),
    ]);

    for (const row of clientRows || []) {
      if (row.id) ids.add(row.id);
    }
    for (const row of clientProfiles || []) {
      if (row.id) ids.add(row.id);
    }
  } catch (err) {
    console.error('getResolvedClientIdsForUser error:', err);
  }
  return Array.from(ids);
}

/**
 * Check whether the actor is permitted to read/act on a target client record or user ID.
 */
export async function canAccessClientRecord(
  actor: ServerAuthContext,
  targetClientOrUserId: string
): Promise<boolean> {
  if (!targetClientOrUserId) return false;
  if (actor.isAdmin || actor.userId === targetClientOrUserId) return true;

  try {
    const serviceClient = getServiceClient();

    // Check clients table (direct ID or portal user ID)
    const { data: clientRecord } = await serviceClient
      .from('clients')
      .select('id, assigned_ca_id, portal_user_id, organization_id')
      .or(`id.eq.${targetClientOrUserId},portal_user_id.eq.${targetClientOrUserId}`)
      .maybeSingle();

    if (clientRecord) {
      if (
        clientRecord.assigned_ca_id === actor.userId ||
        clientRecord.portal_user_id === actor.userId
      ) {
        return true;
      }

      if (actor.isCAOrStaff && clientRecord.organization_id) {
        const { data: actorProfile } = await serviceClient
          .from('profiles')
          .select('organization_id')
          .eq('id', actor.userId)
          .maybeSingle();
        if (actorProfile?.organization_id === clientRecord.organization_id) {
          return true;
        }
      }
    }

    // Check ca_client_relationships (supports user_id or client_profiles.id)
    const [{ data: caRel }, { data: targetClientProfile }] = await Promise.all([
      serviceClient
        .from('ca_client_relationships')
        .select('id, status')
        .eq('ca_id', actor.userId)
        .eq('client_id', targetClientOrUserId)
        .in('status', ['accepted', 'active', 'pending'])
        .maybeSingle(),
      serviceClient
        .from('client_profiles')
        .select('id, ca_id, user_id')
        .or(`id.eq.${targetClientOrUserId},user_id.eq.${targetClientOrUserId}`)
        .maybeSingle(),
    ]);

    if (caRel) return true;
    if (targetClientProfile?.user_id === actor.userId || targetClientProfile?.ca_id === actor.userId) {
      return true;
    }

    return false;
  } catch (err) {
    console.error('canAccessClientRecord error:', err);
    return false;
  }
}

/**
 * Create a short-lived signed URL for private storage buckets.
 */
export async function createSignedStorageUrl(
  bucket: string,
  filePathOrUrl: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!filePathOrUrl) return null;
  let objectPath = filePathOrUrl;
  const marker = `/storage/v1/object/`;
  if (filePathOrUrl.includes(marker)) {
    const afterMarker = filePathOrUrl.split(marker)[1] || '';
    const withoutScope = afterMarker.replace(/^(public|sign|authenticated)\//, '');
    objectPath = withoutScope.startsWith(`${bucket}/`)
      ? withoutScope.slice(bucket.length + 1)
      : withoutScope;
    objectPath = objectPath.split('?')[0];
  }

  const serviceClient = getServiceClient();
  const { data, error } = await serviceClient.storage
    .from(bucket)
    .createSignedUrl(objectPath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

