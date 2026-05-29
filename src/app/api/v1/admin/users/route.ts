import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { ensureRole } from '@/lib/backend/rbac';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, ['admin']);

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, status, created_at, last_login_at')
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
    ensureRole(auth.roles, ['admin']);

    const body = await request.json();
    const userId = body.userId as string;

    if (body.role) {
      await supabaseAdmin.from('user_roles').delete().eq('user_id', userId);
      await supabaseAdmin.from('user_roles').insert({ user_id: userId, role_key: body.role });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ status: body.status })
      .eq('id', userId)
      .select('id, email, name, status')
      .single();

    if (error) {
      throw error;
    }

    return ok({ user: data }, 'User updated');
  } catch (error) {
    return fail(error);
  }
}
