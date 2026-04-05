import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { settingsSchema } from '@/lib/backend/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return ok({ settings: data || null }, 'Settings fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const parsed = settingsSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .upsert(
        {
          user_id: auth.userId,
          theme: parsed.theme || 'system',
          preferences: parsed.preferences || {},
          notification_settings: parsed.notificationSettings || {},
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return ok({ settings: data }, 'Settings updated');
  } catch (error) {
    return fail(error);
  }
}
