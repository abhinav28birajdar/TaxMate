import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';
import { ensureRole } from '@/lib/backend/rbac';
import { featureFlagSchema } from '@/lib/backend/validation';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, ['admin']);

    const { data, error } = await supabaseAdmin
      .from('feature_flags')
      .select('*')
      .eq('is_deleted', false)
      .order('key', { ascending: true });

    if (error) {
      throw error;
    }

    return ok({ flags: data || [] }, 'Feature flags fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    ensureRole(auth.roles, ['admin']);

    const body = await request.json();
    const parsed = featureFlagSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('feature_flags')
      .upsert(
        {
          key: parsed.key,
          description: parsed.description,
          enabled: parsed.isEnabled,
          rollout_percentage: parsed.rolloutPercentage,
        },
        { onConflict: 'key' }
      )
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return ok({ flag: data }, 'Feature flag upserted', 201);
  } catch (error) {
    return fail(error);
  }
}
