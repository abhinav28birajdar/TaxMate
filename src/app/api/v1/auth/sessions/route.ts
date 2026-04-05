import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('id, type, ip_address, user_agent, created_at, expires_at, is_active')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ok({ sessions: data || [] }, 'Sessions fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json().catch(() => ({}));

    if (body.sessionId) {
      await supabaseAdmin
        .from('sessions')
        .update({ is_active: false })
        .eq('id', body.sessionId)
        .eq('user_id', auth.userId);
    } else {
      await supabaseAdmin
        .from('sessions')
        .update({ is_active: false })
        .eq('user_id', auth.userId)
        .neq('id', auth.sessionId);
    }

    return ok({}, 'Session(s) revoked');
  } catch (error) {
    return fail(error);
  }
}
