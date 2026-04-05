/**
 * GET /api/recommendations
 * Get AI recommendations for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@lib/supabase/server';
import AIRecommendationService from '@/lib/services/ai-recommendations-service';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = req.nextUrl.searchParams.get('limit') || '5';

    const aiService = AIRecommendationService;
    const recommendations = await aiService.getDashboardRecommendations(
      user.id,
      parseInt(limit)
    );

    return NextResponse.json({ data: recommendations });
  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendations/dismiss
 * Dismiss a recommendation
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recommendationId } = body;

    if (!recommendationId) {
      return NextResponse.json(
        { error: 'Missing recommendationId' },
        { status: 400 }
      );
    }

    const aiService = AIRecommendationService;
    await aiService.dismissRecommendation(recommendationId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error dismissing recommendation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dismiss recommendation' },
      { status: 500 }
    );
  }
}
