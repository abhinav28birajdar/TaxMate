import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth } from '@/lib/backend/supabase';
import { getSettings, updateSettings } from '@/lib/backend/settings-service';
import { settingsSchema } from '@/lib/backend/validation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const settings = await getSettings(auth.userId);
    return ok({ settings }, 'Settings fetched');
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const body = await request.json();
    const parsed = settingsSchema.parse(body);

    const settings = await updateSettings(auth.userId, parsed);
    return ok({ settings }, 'Settings updated');
  } catch (error) {
    return fail(error);
  }
}
