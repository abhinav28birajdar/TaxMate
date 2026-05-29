import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { ensureRole } from '@/lib/backend/rbac';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, ['admin', 'moderator']);

    const userId = request.nextUrl.searchParams.get('userId');
    let query = supabaseAdmin
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return ok({ activity: data || [] }, 'Activity logs fetched');
  } catch (error) {
    return fail(error);
  }
}
