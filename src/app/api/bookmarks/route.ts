import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

async function getSavedCaIds(userId: string): Promise<{ ids: string[]; metadata: Record<string, any> }> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('settings')
    .select('metadata')
    .eq('user_id', userId)
    .maybeSingle();

  const metadata = (data?.metadata && typeof data.metadata === 'object' ? data.metadata : {}) as Record<string, any>;
  const rawIds = Array.isArray(metadata.bookmarked_ca_ids) ? metadata.bookmarked_ca_ids : [];
  const ids = rawIds.map((id: any) => String(id)).filter(Boolean);
  return { ids, metadata };
}

async function persistSavedCaIds(
  userId: string,
  ids: string[],
  existingMetadata: Record<string, any>
) {
  const supabase = getServiceClient();
  const nextMeta = {
    ...existingMetadata,
    bookmarked_ca_ids: Array.from(new Set(ids)),
  };

  const { error } = await supabase
    .from('settings')
    .upsert(
      {
        user_id: userId,
        metadata: nextMeta,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
  return nextMeta.bookmarked_ca_ids as string[];
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { ids } = await getSavedCaIds(auth.userId);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, bookmarks: [], bookmarkedIds: [] });
    }

    const supabase = getServiceClient();
    const [{ data: caUsers }, { data: caProfiles }, { data: reviews }] = await Promise.all([
      supabase.from('users').select('id, name, avatar_url, verified').in('id', ids),
      supabase
        .from('ca_profiles')
        .select('user_id, firm_name, designation, years_of_experience, specializations, city, state, consultation_fee, icai_membership_number')
        .in('user_id', ids),
      supabase.from('reviews').select('ca_id, rating').in('ca_id', ids),
    ]);

    const userMap = new Map((caUsers || []).map((u: any) => [u.id, u]));
    const profMap = new Map((caProfiles || []).map((p: any) => [p.user_id, p]));
    const ratingMap = new Map<string, number[]>();
    for (const r of reviews || []) {
      const list = ratingMap.get(r.ca_id) || [];
      list.push(Number(r.rating || 5));
      ratingMap.set(r.ca_id, list);
    }

    const bookmarks = ids
      .map((caId) => {
        const u = userMap.get(caId);
        const p = profMap.get(caId);
        if (!u && !p) return null;
        const ratings = ratingMap.get(caId) || [];
        const avgRating =
          ratings.length > 0
            ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
            : 4.8;
        const expYears = Number(p?.years_of_experience || 0);
        const specs = Array.isArray(p?.specializations) && p.specializations.length > 0
          ? p.specializations.join(', ')
          : 'Tax Advisory & Compliance';

        return {
          caId,
          name: u?.name || p?.firm_name || 'Chartered Accountant',
          firm: p?.firm_name || p?.designation || 'Independent CA Practice',
          exp: expYears > 0 ? `${expYears}+ Years` : 'Verified CA',
          rating: avgRating,
          spec: specs,
          location: [p?.city, p?.state].filter(Boolean).join(', ') || 'India',
          fee: p?.consultation_fee ? `₹${Number(p.consultation_fee).toLocaleString('en-IN')}` : '₹1,500',
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      bookmarks,
      bookmarkedIds: ids,
    });
  } catch (error: any) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const caId = String(body.caId || '').trim();
    const action = body.action === 'remove' ? 'remove' : body.action === 'toggle' ? 'toggle' : 'add';

    if (!caId) {
      return NextResponse.json({ error: 'caId is required' }, { status: 400 });
    }

    const { ids, metadata } = await getSavedCaIds(auth.userId);
    const exists = ids.includes(caId);

    let nextIds: string[];
    let bookmarked: boolean;

    if (action === 'remove' || (action === 'toggle' && exists)) {
      nextIds = ids.filter((id) => id !== caId);
      bookmarked = false;
    } else {
      nextIds = exists ? ids : [...ids, caId];
      bookmarked = true;
    }

    const updated = await persistSavedCaIds(auth.userId, nextIds, metadata);
    return NextResponse.json({
      success: true,
      bookmarked,
      bookmarkedIds: updated,
    });
  } catch (error: any) {
    console.error('Bookmarks POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update bookmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const caId = request.nextUrl.searchParams.get('caId');
    if (!caId) {
      return NextResponse.json({ error: 'caId query param is required' }, { status: 400 });
    }

    const { ids, metadata } = await getSavedCaIds(auth.userId);
    const updated = await persistSavedCaIds(
      auth.userId,
      ids.filter((id) => id !== caId),
      metadata
    );

    return NextResponse.json({
      success: true,
      bookmarkedIds: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to remove bookmark' },
      { status: 500 }
    );
  }
}

