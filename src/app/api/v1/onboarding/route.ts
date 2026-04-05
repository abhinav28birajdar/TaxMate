import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { onboardingSchema } from '@/lib/backend/validation';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);

    const { data, error } = await supabaseAdmin
      .from('onboarding_data')
      .select('*')
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return ok({ onboarding: data || null }, 'Onboarding fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const parsed = onboardingSchema.parse(body);

    const payload = {
      user_id: auth.userId,
      current_step: parsed.step,
      basic_info: parsed.basicInfo || {},
      preferences: parsed.preferences || {},
      interests: parsed.interests || [],
      is_completed: Boolean(parsed.completed),
      completed_at: parsed.completed ? new Date().toISOString() : null,
    };

    const { data, error } = await supabaseAdmin
      .from('onboarding_data')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return ok({ onboarding: data }, 'Onboarding updated');
  } catch (error) {
    return fail(error);
  }
}
