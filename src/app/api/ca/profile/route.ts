import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const [{ data: user }, { data: caProfile }, { data: reviews }, { count: clientsCount }] =
      await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, phone, avatar_url, role, verified')
          .eq('id', auth.userId)
          .maybeSingle(),
        supabase
          .from('ca_profiles')
          .select('*')
          .eq('user_id', auth.userId)
          .maybeSingle(),
        supabase
          .from('reviews')
          .select('id, client_id, rating, title, comment, created_at')
          .eq('ca_id', auth.userId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_ca_id', auth.userId),
      ]);

    const reviewerIds = Array.from(
      new Set((reviews || []).map((r: any) => r.client_id).filter(Boolean))
    );
    const reviewerMap = new Map<string, string>();
    if (reviewerIds.length > 0) {
      const { data: revUsers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', reviewerIds);
      for (const ru of revUsers || []) reviewerMap.set(ru.id, ru.name || 'Client');
    }

    const avgRating =
      reviews && reviews.length > 0
        ? Number(
            (
              reviews.reduce((sum: number, r: any) => sum + Number(r.rating || 5), 0) /
              reviews.length
            ).toFixed(1)
          )
        : 4.8;

    return NextResponse.json({
      success: true,
      profile: {
        id: auth.userId,
        name: user?.name || caProfile?.firm_name || 'Chartered Accountant',
        email: user?.email || auth.email || '',
        phone: user?.phone || '',
        avatarUrl: user?.avatar_url || null,
        verified: Boolean(user?.verified || caProfile?.status === 'APPROVED'),
        membershipNo: caProfile?.icai_membership_number || '',
        designation: caProfile?.designation || 'FCA',
        firmName: caProfile?.firm_name || '',
        bio: caProfile?.bio || '',
        city: caProfile?.city || '',
        state: caProfile?.state || '',
        officeAddress: caProfile?.office_address || '',
        experienceYears: Number(caProfile?.years_of_experience || 0),
        consultationFee: Number(caProfile?.consultation_fee || 1500),
        hourlyRate: Number(caProfile?.hourly_rate || 2500),
        specializations: Array.isArray(caProfile?.specializations)
          ? caProfile.specializations
          : ['Income Tax', 'GST Compliance'],
        languages: Array.isArray(caProfile?.languages)
          ? caProfile.languages
          : ['English', 'Hindi'],
        clientsServed: clientsCount || 0,
        rating: avgRating,
        reviewCount: reviews?.length || 0,
        recentReviews: (reviews || []).map((r: any) => ({
          id: r.id,
          client: reviewerMap.get(r.client_id) || 'Verified Client',
          rating: Number(r.rating || 5),
          date: r.created_at
            ? new Date(r.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : 'Recent',
          comment: r.comment || '',
        })),
      },
    });
  } catch (error: any) {
    console.error('CA profile GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch CA profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const supabase = getServiceClient();

    const userUpdates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (typeof body.name === 'string' && body.name.trim()) {
      userUpdates.name = body.name.trim();
    }
    if (typeof body.phone === 'string') {
      userUpdates.phone = body.phone.trim();
    }
    if (Object.keys(userUpdates).length > 1) {
      await supabase.from('users').update(userUpdates).eq('id', auth.userId);
      await supabase
        .from('profiles')
        .update({
          ...(userUpdates.name ? { full_name: userUpdates.name } : {}),
          ...(userUpdates.phone ? { phone: userUpdates.phone } : {}),
        })
        .eq('id', auth.userId);
    }

    const specializations = Array.isArray(body.specializations)
      ? body.specializations
      : typeof body.specializations === 'string'
        ? body.specializations
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined;

    const languages = Array.isArray(body.languages)
      ? body.languages
      : typeof body.languages === 'string'
        ? body.languages
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined;

    const { data: existingProfile } = await supabase
      .from('ca_profiles')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    const caPayload: Record<string, any> = {
      user_id: auth.userId,
      updated_at: new Date().toISOString(),
    };
    if (body.firmName !== undefined) caPayload.firm_name = String(body.firmName || '').trim();
    if (body.membershipNo !== undefined) caPayload.icai_membership_number = String(body.membershipNo || '').trim();
    if (body.designation !== undefined) caPayload.designation = String(body.designation || '').trim();
    if (body.bio !== undefined) caPayload.bio = String(body.bio || '').trim();
    if (body.city !== undefined) caPayload.city = String(body.city || '').trim();
    if (body.state !== undefined) caPayload.state = String(body.state || '').trim();
    if (body.officeAddress !== undefined) caPayload.office_address = String(body.officeAddress || '').trim();
    if (body.experienceYears !== undefined) {
      caPayload.years_of_experience = Math.max(0, parseInt(String(body.experienceYears), 10) || 0);
    }
    if (body.consultationFee !== undefined) {
      caPayload.consultation_fee = Math.max(0, Number(body.consultationFee) || 0);
    }
    if (body.hourlyRate !== undefined) {
      caPayload.hourly_rate = Math.max(0, Number(body.hourlyRate) || 0);
    }
    if (specializations !== undefined) caPayload.specializations = specializations;
    if (languages !== undefined) caPayload.languages = languages;

    if (existingProfile) {
      const { error } = await supabase
        .from('ca_profiles')
        .update(caPayload)
        .eq('user_id', auth.userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('ca_profiles').insert({
        icai_membership_number: body.membershipNo || `ICAI-${auth.userId.slice(0, 6).toUpperCase()}`,
        ...caPayload,
      });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, message: 'CA profile updated' });
  } catch (error: any) {
    console.error('CA profile PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update CA profile' },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
