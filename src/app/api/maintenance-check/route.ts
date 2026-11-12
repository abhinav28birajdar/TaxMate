import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let isMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    let message =
      process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE ||
      'We are performing scheduled maintenance. We will be back shortly.';
    let estimatedEnd: string | null = null;

    try {
      const supabase = getServiceClient();
      const [{ data: flagRow }, { data: settingRow }] = await Promise.all([
        supabase
          .from('feature_flags')
          .select('enabled, description')
          .eq('key', 'maintenance_mode')
          .eq('is_deleted', false)
          .maybeSingle(),
        supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'maintenance_mode')
          .maybeSingle(),
      ]);

      if (flagRow?.enabled) {
        isMaintenance = true;
        if (flagRow.description) message = flagRow.description;
      }

      if (settingRow?.value && typeof settingRow.value === 'object') {
        const val = settingRow.value as Record<string, any>;
        if (typeof val.enabled === 'boolean') {
          isMaintenance = isMaintenance || val.enabled;
        }
        if (val.message) message = String(val.message);
        if (val.estimatedEnd) estimatedEnd = String(val.estimatedEnd);
      }
    } catch {
      // Fall back cleanly to environment settings if DB isn't reachable
    }

    return NextResponse.json({
      isMaintenance,
      message,
      estimatedEnd,
      appVersion: '1.0.0',
    });
  } catch (error: any) {
    return NextResponse.json({ isMaintenance: false, error: error.message }, { status: 500 });
  }
}
