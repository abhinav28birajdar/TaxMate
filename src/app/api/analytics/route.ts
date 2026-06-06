import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/enhanced-services';

export async function GET(request: NextRequest) {
  try {
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

    const month = monthStr ? parseInt(monthStr) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

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
