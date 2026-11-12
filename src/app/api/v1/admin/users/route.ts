import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { ensureRole } from '@/lib/backend/rbac';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { badRequest } from '@/lib/backend/errors';

const ALLOWED_ROLES = new Set(['CLIENT', 'CA', 'STAFF', 'ADMIN', 'SUPER_ADMIN']);
const ALLOWED_STATUSES = new Set(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION']);

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, ['SUPER_ADMIN', 'ADMIN']);

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, status, email_verified, created_at, last_login_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    return ok({ users: data || [] }, 'Users fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, ['SUPER_ADMIN', 'ADMIN']);

    const body = await request.json();
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) {
      throw badRequest('userId is required');
    }

    const userUpdates: Record<string, unknown> = {};
    const profileUpdates: Record<string, unknown> = {};

    if (body.role !== undefined) {
      const normalizedRole = String(body.role).toUpperCase();
      if (!ALLOWED_ROLES.has(normalizedRole)) {
        throw badRequest('Invalid user role');
      }
      userUpdates.role = normalizedRole;
      profileUpdates.role = normalizedRole === 'SUPER_ADMIN' ? 'ADMIN' : normalizedRole;
      try {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          app_metadata: { role: normalizedRole },
        });
      } catch (metaErr) {
        console.warn('Could not sync Auth app_metadata role (user may be legacy):', metaErr);
      }
    }

    if (body.status !== undefined) {
      const normalizedStatus = String(body.status).toUpperCase();
      if (!ALLOWED_STATUSES.has(normalizedStatus)) {
        throw badRequest('Invalid user status');
      }
      userUpdates.status = normalizedStatus;
      profileUpdates.is_active = normalizedStatus === 'ACTIVE';
    }

    if (Object.keys(userUpdates).length === 0) {
      throw badRequest('No valid fields supplied for update');
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(userUpdates)
      .eq('id', userId)
      .select('id, email, name, role, status')
      .single();

    if (error) {
      throw error;
    }

    if (Object.keys(profileUpdates).length > 0) {
      await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', userId);
    }

    return ok({ user: data }, 'User updated');
  } catch (error) {
    return fail(error);
  }
}
