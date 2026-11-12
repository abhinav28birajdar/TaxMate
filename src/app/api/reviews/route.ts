import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const caIdParam = request.nextUrl.searchParams.get('caId');
    const auth = await getSessionUser(request).catch(() => null);

    if (!caIdParam && !auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getServiceClient();
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (caIdParam) {
      query = query.eq('ca_id', caIdParam);
    } else if (auth && auth.role === 'CLIENT') {
      query = query.eq('client_id', auth.userId);
    } else if (auth && auth.role === 'CA') {
      query = query.eq('ca_id', auth.userId);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const userIds = Array.from(
      new Set((rows || []).flatMap((r: any) => [r.ca_id, r.client_id]).filter(Boolean))
    );

    const userMap = new Map<string, any>();
    const caProfileMap = new Map<string, any>();
    if (userIds.length > 0) {
      const [{ data: users }, { data: profiles }] = await Promise.all([
        supabase.from('users').select('id, name, avatar_url').in('id', userIds),
        supabase.from('ca_profiles').select('user_id, firm_name').in('user_id', userIds),
      ]);
      for (const u of users || []) userMap.set(u.id, u);
      for (const p of profiles || []) caProfileMap.set(p.user_id, p);
    }

    const reviews = (rows || []).map((r: any) => {
      const caUser = userMap.get(r.ca_id);
      const caProfile = caProfileMap.get(r.ca_id);
      const clientUser = userMap.get(r.client_id);

      return {
        id: r.id,
        caId: r.ca_id,
        caName: caUser?.name || caProfile?.firm_name || 'Chartered Accountant',
        firmName: caProfile?.firm_name || '',
        clientId: r.client_id,
        clientName: clientUser?.name || 'Verified Client',
        rating: Number(r.rating || 5),
        title: r.title || null,
        comment: r.comment || '',
        isVerified: Boolean(r.is_verified),
        createdAt: r.created_at,
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent',
      };
    });

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load reviews' },
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
    const rating = Number(body.rating);
    const comment = String(body.comment || '').trim();
    const title = body.title ? String(body.title).trim() : null;

    if (!caId) {
      return NextResponse.json({ error: 'caId is required' }, { status: 400 });
    }
    if (caId === auth.userId) {
      return NextResponse.json({ error: 'You cannot review yourself' }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (comment.length < 5) {
      return NextResponse.json({ error: 'Please write at least 5 characters of feedback' }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Check if client has an active relationship with this CA for verified badge
    const [{ data: rel }, { data: clientRow }] = await Promise.all([
      supabase
        .from('ca_client_relationships')
        .select('id')
        .eq('ca_id', caId)
        .eq('client_id', auth.userId)
        .in('status', ['active', 'accepted'])
        .maybeSingle(),
      supabase
        .from('clients')
        .select('id')
        .eq('assigned_ca_id', caId)
        .eq('portal_user_id', auth.userId)
        .maybeSingle(),
    ]);

    const isVerified = Boolean(rel || clientRow);

    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        ca_id: caId,
        client_id: auth.userId,
        rating,
        title,
        comment,
        is_verified: isVerified,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('notifications').insert({
      user_id: caId,
      title: 'New Client Review Received',
      message: `You received a ${rating}-star review from a client.`,
      type: 'REVIEW_RECEIVED',
      read: false,
      is_read: false,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}

