import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isAdmin && auth.role !== 'ADMIN' && auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;
    const supabase = getServiceClient();

    const [{ data: userRow, error: userErr }, { data: profileRow }, { data: caProfile }, { data: logs }] =
      await Promise.all([
        supabase
          .from('users')
          .select('id, email, name, role, status, email_verified, created_at, last_login_at')
          .eq('id', userId)
          .maybeSingle(),
        supabase.from('profiles').select('phone, city, state, bio, is_active').eq('id', userId).maybeSingle(),
        supabase.from('ca_profiles').select('icai_membership_number, firm_name, status, years_of_experience').eq('user_id', userId).maybeSingle(),
        supabase.from('audit_logs').select('id, action, details, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      ]);

    if (userErr || !userRow) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userRow.id,
        email: userRow.email,
        name: userRow.name || userRow.email,
        role: userRow.role,
        status: userRow.status,
        emailVerified: Boolean(userRow.email_verified),
        createdAt: userRow.created_at,
        lastLoginAt: userRow.last_login_at,
        phone: profileRow?.phone || '',
        location: [profileRow?.city, profileRow?.state].filter(Boolean).join(', ') || '',
        bio: profileRow?.bio || '',
        caProfile: caProfile || null,
        auditLogs: logs || [],
      },
    });
  } catch (error: any) {
    console.error('Admin user detail GET error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to load user' }, { status: 500 });
  }
}
