import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request).catch(() => null);
    const searchParams = request.nextUrl.searchParams;
    const idFilter = (searchParams.get('id') || searchParams.get('username') || '').trim().toLowerCase();
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const cityFilter = (searchParams.get('city') || '').trim().toLowerCase();
    const specFilter = (searchParams.get('spec') || '').trim().toLowerCase();

    const supabase = getServiceClient();

    const [{ data: profiles }, { data: caUsers }, { data: services }, { data: reviews }] =
      await Promise.all([
        supabase
          .from('ca_profiles')
          .select(
            'user_id, icai_membership_number, firm_name, designation, bio, years_of_experience, specializations, languages, status, office_address, city, state, consultation_fee, hourly_rate, avg_response_time, availability_status'
          )
          .neq('status', 'REJECTED')
          .neq('status', 'SUSPENDED'),
        supabase
          .from('users')
          .select('id, name, avatar_url, role, status, is_active, verified')
          .eq('role', 'CA'),
        supabase
          .from('ca_services')
          .select('ca_id, title, price, turnaround_days, category, is_active')
          .eq('is_active', true),
        supabase
          .from('reviews')
          .select('ca_id, client_id, rating, comment, created_at, is_verified')
          .order('created_at', { ascending: false }),
      ]);

    const assignedCaIds = new Set<string>();
    if (auth) {
      const [{ data: clientRows }, { data: relRows }] = await Promise.all([
        supabase
          .from('clients')
          .select('assigned_ca_id')
          .eq('portal_user_id', auth.userId),
        supabase
          .from('ca_client_relationships')
          .select('ca_id, status')
          .eq('client_id', auth.userId)
          .in('status', ['accepted', 'active']),
      ]);

      for (const row of clientRows || []) {
        if (row.assigned_ca_id) assignedCaIds.add(row.assigned_ca_id);
      }
      for (const rel of relRows || []) {
        if (rel.ca_id) assignedCaIds.add(rel.ca_id);
      }
    }

    const userMap = new Map<string, any>();
    for (const u of caUsers || []) {
      if (u.is_active === false || u.status === 'SUSPENDED' || u.status === 'DELETED') continue;
      userMap.set(u.id, u);
    }

    const profileMap = new Map<string, any>();
    for (const p of profiles || []) {
      profileMap.set(p.user_id, p);
    }

    const servicesByCa = new Map<string, any[]>();
    for (const s of services || []) {
      const list = servicesByCa.get(s.ca_id) || [];
      list.push({
        name: s.title,
        price: Number(s.price) > 0 ? `₹${Number(s.price).toLocaleString('en-IN')}` : 'Included',
        tat: `${s.turnaround_days || 2} Business Days`,
        category: s.category || 'general',
      });
      servicesByCa.set(s.ca_id, list);
    }

    const reviewsByCa = new Map<string, any[]>();
    const reviewerIds = Array.from(
      new Set((reviews || []).map((r: any) => r.client_id).filter(Boolean))
    );
    const reviewerMap = new Map<string, string>();
    if (reviewerIds.length > 0) {
      const { data: reviewerUsers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', reviewerIds);
      for (const ru of reviewerUsers || []) {
        reviewerMap.set(ru.id, ru.name || 'Verified Client');
      }
    }

    for (const r of reviews || []) {
      const list = reviewsByCa.get(r.ca_id) || [];
      list.push({
        author: reviewerMap.get(r.client_id) || 'Verified Client',
        rating: Number(r.rating || 5),
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent',
        comment: r.comment || '',
      });
      reviewsByCa.set(r.ca_id, list);
    }

    const combinedIds = Array.from(new Set([...userMap.keys(), ...profileMap.keys()]));

    const cas = combinedIds
      .map((caId) => {
        const user = userMap.get(caId);
        const profile = profileMap.get(caId);
        if (!user && !profile) return null;

        const caReviews = reviewsByCa.get(caId) || [];
        const avgRating =
          caReviews.length > 0
            ? Number(
                (
                  caReviews.reduce((acc, item) => acc + Number(item.rating || 5), 0) /
                  caReviews.length
                ).toFixed(1)
              )
            : 4.8;

        const consultationFeeNum = Number(profile?.consultation_fee || profile?.hourly_rate || 1500);
        const expYears = Number(profile?.years_of_experience || 0);
        const locationParts = [profile?.city, profile?.state].filter(Boolean);
        const specializations =
          Array.isArray(profile?.specializations) && profile.specializations.length > 0
            ? profile.specializations
            : ['ITR Filing', 'GST Compliance', 'Tax Advisory'];

        return {
          id: caId,
          slug: String(user?.name || profile?.firm_name || caId)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
          name: user?.name || profile?.firm_name || 'Chartered Accountant',
          firm: profile?.firm_name || profile?.designation || 'Independent CA Practice',
          membershipNo: profile?.icai_membership_number || 'ICAI Verified',
          designation: profile?.designation || 'Chartered Accountant',
          experienceYears: expYears,
          experience: expYears > 0 ? `${expYears} Years` : 'Verified CA',
          rating: avgRating,
          reviewsCount: caReviews.length,
          location: locationParts.length > 0 ? locationParts.join(', ') : 'India (Remote & Office)',
          city: profile?.city || '',
          state: profile?.state || '',
          consultationFee: consultationFeeNum,
          fee: `₹${consultationFeeNum.toLocaleString('en-IN')} / session`,
          availability:
            profile?.availability_status === 'busy'
              ? 'Next Slot Tomorrow'
              : 'Available Today',
          avgResponseHours: Number(profile?.avg_response_time || 24),
          specializations,
          languages: Array.isArray(profile?.languages) ? profile.languages : ['English', 'Hindi'],
          qualifications: [
            profile?.designation || 'Chartered Accountant',
            profile?.icai_membership_number ? `ICAI #${profile.icai_membership_number}` : 'ICAI Member',
          ],
          bio:
            profile?.bio ||
            'Practicing Chartered Accountant specializing in income tax compliance, GST reconciliations, and statutory advisory.',
          avatarUrl: user?.avatar_url || null,
          verified: profile?.status === 'APPROVED' || Boolean(user?.verified),
          isAssigned: assignedCaIds.has(caId),
          services:
            servicesByCa.get(caId) || [
              {
                name: 'Income Tax Return & Computation Review',
                price: `₹${consultationFeeNum.toLocaleString('en-IN')}`,
                tat: '2 Business Days',
              },
            ],
          reviews: caReviews,
        };
      })
      .filter((ca): ca is NonNullable<typeof ca> => Boolean(ca))
      .filter((ca) => {
        if (idFilter) {
          const matchesId =
            ca.id.toLowerCase() === idFilter ||
            ca.slug === idFilter ||
            ca.membershipNo.toLowerCase() === idFilter;
          if (!matchesId) return false;
        }
        if (search) {
          const hay = [ca.name, ca.firm, ca.location, ...ca.specializations]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(search)) return false;
        }
        if (cityFilter && cityFilter !== 'all') {
          if (!ca.location.toLowerCase().includes(cityFilter)) return false;
        }
        if (specFilter && specFilter !== 'all') {
          if (!ca.specializations.some((s: string) => s.toLowerCase().includes(specFilter))) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => Number(b.isAssigned) - Number(a.isAssigned) || b.rating - a.rating);

    return NextResponse.json({
      success: true,
      cas,
      ca: idFilter ? cas[0] || null : null,
      total: cas.length,
    });
  } catch (error: any) {
    console.error('CA directory GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load CA directory' },
      { status: 500 }
    );
  }
}
