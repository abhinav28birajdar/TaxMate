import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/enhanced-services';
import { createServerSupabaseClient } from '@lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const caId = searchParams.get('caId');
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');

    if (!caId) {
      return NextResponse.json(
        { success: false, error: 'CA ID required' },
        { status: 400 }
      );
    }

    if (caId !== user.id) {
      const role = String(user.app_metadata?.role || '').toUpperCase();
      if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

    if (!Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ success: false, error: 'Invalid month or year' }, { status: 400 });
    }

    const metrics = await AnalyticsService.calculateCAMetrics(caId, month, year);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
