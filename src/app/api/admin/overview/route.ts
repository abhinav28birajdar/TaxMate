import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

function requireAdminUser(user: Awaited<ReturnType<typeof getSessionUser>>) {
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!user.isAdmin && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

async function buildUserMap(supabase: ReturnType<typeof getServiceClient>, ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const map = new Map<string, { name: string; email: string; role?: string; status?: string }>();
  if (uniqueIds.length === 0) return map;

  const { data } = await supabase
    .from('users')
    .select('id, name, email, role, status')
    .in('id', uniqueIds);

  for (const row of data || []) {
    map.set(String(row.id), {
      name: row.name || row.email || 'User',
      email: row.email || '',
      role: row.role,
      status: row.status,
    });
  }
  return map;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    const denied = requireAdminUser(auth);
    if (denied) return denied;

    const section = request.nextUrl.searchParams.get('section') || 'customers';
    const supabase = getServiceClient();

    if (section === 'customers') {
      const { data: clients, error } = await supabase
        .from('clients')
        .select('id, full_name, display_name, email, phone, client_type, city, state, status, assigned_ca_id, portal_user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const caIds = (clients || []).map((c: any) => String(c.assigned_ca_id || '')).filter(Boolean);
      const userMap = await buildUserMap(supabase, caIds);

      const customers = (clients || []).map((c: any) => ({
        id: c.id,
        name: c.display_name || c.full_name || c.email || 'Client',
        email: c.email || '',
        phone: c.phone || '',
        clientType: c.client_type || 'individual',
        location: [c.city, c.state].filter(Boolean).join(', ') || 'India',
        status: String(c.status || 'active').toLowerCase(),
        assignedCA: c.assigned_ca_id ? userMap.get(String(c.assigned_ca_id))?.name || 'Assigned CA' : 'Unassigned',
        assignedCaId: c.assigned_ca_id || null,
        portalUserId: c.portal_user_id || null,
        createdAt: c.created_at,
      }));

      return NextResponse.json({ success: true, items: customers });
    }

    if (section === 'documents') {
      const { data: docs, error } = await supabase
        .from('documents')
        .select('id, name, file_name, category, file_size, size, status, user_id, client_id, uploaded_by, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (docs || []).flatMap((d: any) => [String(d.user_id || ''), String(d.uploaded_by || '')]).filter(Boolean);
      const userMap = await buildUserMap(supabase, userIds);

      const items = (docs || []).map((d: any) => {
        const meta = (d.metadata && typeof d.metadata === 'object' ? d.metadata : {}) as Record<string, any>;
        const rawStatus = String(d.status || meta.reviewStatus || 'ACTIVE').toUpperCase();
        const isVerified = Boolean(meta.verified || rawStatus === 'VERIFIED');
        return {
          id: d.id,
          title: d.name || d.file_name || 'Document',
          fileName: d.file_name || d.name || 'document',
          category: d.category || 'GENERAL',
          fileSize: Number(d.file_size || d.size || 0),
          status: rawStatus,
          verified: isVerified,
          ownerName: userMap.get(String(d.user_id || d.uploaded_by || ''))?.name || 'User',
          createdAt: d.created_at,
        };
      });

      return NextResponse.json({ success: true, items });
    }

    if (section === 'payments') {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('id, invoice_id, ca_id, client_id, amount, currency, status, gateway, gateway_transaction_id, razorpay_payment_id, payment_method, paid_at, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (payments || []).flatMap((p: any) => [String(p.ca_id || ''), String(p.client_id || '')]).filter(Boolean);
      const userMap = await buildUserMap(supabase, userIds);

      const items = (payments || []).map((p: any) => ({
        id: p.id,
        txId: p.razorpay_payment_id || p.gateway_transaction_id || p.id.slice(0, 12).toUpperCase(),
        amount: Number(p.amount || 0),
        currency: p.currency || 'INR',
        status: String(p.status || 'PENDING').toUpperCase(),
        gateway: p.gateway || p.payment_method || 'RAZORPAY',
        caName: userMap.get(String(p.ca_id || ''))?.name || 'CA Partner',
        clientName: userMap.get(String(p.client_id || ''))?.name || 'Client',
        paidAt: p.paid_at || p.created_at,
        createdAt: p.created_at,
      }));

      return NextResponse.json({ success: true, items });
    }

    if (section === 'subscriptions') {
      const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan, plan_type, billing_cycle, status, razorpay_subscription_id, next_billing_date, billing_period_end, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (subs || []).map((s: any) => String(s.user_id || '')).filter(Boolean);
      const userMap = await buildUserMap(supabase, userIds);

      const items = (subs || []).map((s: any) => ({
        id: s.id,
        userId: s.user_id,
        subscriberName: userMap.get(String(s.user_id))?.name || 'Subscriber',
        subscriberEmail: userMap.get(String(s.user_id))?.email || '',
        plan: String(s.plan_type || s.plan || 'FREE'),
        billingCycle: s.billing_cycle || 'monthly',
        status: String(s.status || 'ACTIVE').toLowerCase(),
        gateway: s.razorpay_subscription_id ? 'Razorpay Subscription' : 'Platform Billing',
        renewalDate: s.next_billing_date || s.billing_period_end || s.created_at,
      }));

      return NextResponse.json({ success: true, items });
    }

    if (section === 'appointments') {
      const { data: appts, error } = await supabase
        .from('appointments')
        .select('id, title, type, appointment_type, ca_id, client_id, created_by, start_time, duration_minutes, status, metadata, created_at')
        .order('start_time', { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (appts || []).flatMap((a: any) => [String(a.ca_id || ''), String(a.client_id || ''), String(a.created_by || '')]).filter(Boolean);
      const userMap = await buildUserMap(supabase, userIds);

      const items = (appts || []).map((a: any) => ({
        id: a.id,
        title: a.title || a.appointment_type || 'Tax Consultation',
        caName: userMap.get(String(a.ca_id || ''))?.name || 'Chartered Accountant',
        clientName: userMap.get(String(a.client_id || a.created_by || ''))?.name || 'Client',
        scheduledAt: a.start_time || a.created_at,
        durationMinutes: Number(a.duration_minutes || 45),
        meetingType: a.type || a.appointment_type || 'VIDEO_CALL',
        status: String(a.status || 'PENDING').toUpperCase(),
        fee: Number(a.metadata?.fee || 0),
      }));

      return NextResponse.json({ success: true, items });
    }

    if (section === 'kyc') {
      const { data: caProfiles, error } = await supabase
        .from('ca_profiles')
        .select('id, user_id, icai_membership_number, firm_name, city, state, status, rejection_reason, approved_at, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (caProfiles || []).map((c: any) => String(c.user_id || '')).filter(Boolean);
      const userMap = await buildUserMap(supabase, userIds);

      const items = (caProfiles || []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        name: userMap.get(String(c.user_id))?.name || c.firm_name || 'Applicant',
        email: userMap.get(String(c.user_id))?.email || '',
        firmName: c.firm_name || '',
        icaiNumber: c.icai_membership_number || 'Pending ICAI',
        location: [c.city, c.state].filter(Boolean).join(', ') || 'India',
        status: String(c.status || 'PENDING').toUpperCase(),
        rejectionReason: c.rejection_reason || '',
        createdAt: c.created_at,
      }));

      return NextResponse.json({ success: true, items });
    }

    if (section === 'communication') {
      const { data: inquiries, error } = await supabase
        .from('contact_inquiries')
        .select('id, inquiry_type, name, email, phone, company, subject, message, status, created_at')
        .order('created_at', { ascending: false })
        .limit(150);
      if (error) throw error;

      return NextResponse.json({ success: true, items: inquiries || [] });
    }

    if (section === 'maintenance') {
      const [{ data: setting }, { data: subscribers }] = await Promise.all([
        supabase.from('system_settings').select('*').eq('key', 'maintenance_mode').maybeSingle(),
        supabase.from('maintenance_subscribers').select('*').order('subscribed_at', { ascending: false }).limit(200),
      ]);

      let parsedConfig: Record<string, any> = {
        enabled: false,
        title: 'Scheduled Platform Upgrade',
        message: 'We are upgrading core database & filing infrastructure. Services will resume shortly.',
        estimatedResumeAt: '',
      };

      if (setting?.value) {
        try {
          parsedConfig = { ...parsedConfig, ...JSON.parse(setting.value) };
        } catch {
          parsedConfig.enabled = setting.value === 'true';
        }
      }

      return NextResponse.json({
        success: true,
        config: parsedConfig,
        subscribers: subscribers || [],
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported section' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin overview GET error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Admin query failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    const denied = requireAdminUser(auth);
    if (denied) return denied;

    const body = await request.json();
    const section = String(body.section || '').trim();
    const id = String(body.id || '').trim();
    const supabase = getServiceClient();

    if (section === 'kyc' && id) {
      const status = String(body.status || '').toUpperCase();
      if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
        return NextResponse.json({ success: false, error: 'Invalid KYC status' }, { status: 400 });
      }
      const { data: updated, error } = await supabase
        .from('ca_profiles')
        .update({
          status,
          rejection_reason: status === 'REJECTED' ? body.reason || 'Credentials did not match ICAI directory' : null,
          approved_at: status === 'APPROVED' ? new Date().toISOString() : null,
          approved_by: status === 'APPROVED' ? auth!.userId : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;

      if (updated?.user_id) {
        await supabase
          .from('users')
          .update({ status: status === 'APPROVED' ? 'ACTIVE' : status === 'REJECTED' ? 'SUSPENDED' : 'PENDING_VERIFICATION' })
          .eq('id', updated.user_id);
      }

      return NextResponse.json({ success: true, item: updated });
    }

    if (section === 'documents' && id) {
      const status = String(body.status || 'VERIFIED').toUpperCase();
      const { data: existingDoc } = await supabase.from('documents').select('metadata').eq('id', id).maybeSingle();
      const existingMeta = (existingDoc?.metadata && typeof existingDoc.metadata === 'object' ? existingDoc.metadata : {}) as Record<string, any>;
      const { data, error } = await supabase
        .from('documents')
        .update({
          status,
          metadata: {
            ...existingMeta,
            verified: status === 'VERIFIED',
            reviewStatus: status,
            reviewedBy: auth!.userId,
            reviewedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, item: data });
    }

    if (section === 'appointments' && id) {
      const status = String(body.status || '').toUpperCase();
      const { data, error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, item: data });
    }

    if (section === 'payments' && id) {
      const status = String(body.status || '').toUpperCase();
      const { data, error } = await supabase
        .from('payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, item: data });
    }

    if (section === 'subscriptions' && id) {
      const status = String(body.status || 'ACTIVE').toUpperCase();
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, item: data });
    }

    if (section === 'communication' && id) {
      const status = String(body.status || 'resolved').toLowerCase();
      const { data, error } = await supabase
        .from('contact_inquiries')
        .update({ status })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, item: data });
    }

    if (section === 'maintenance') {
      const payload = {
        enabled: Boolean(body.enabled),
        title: String(body.title || 'Scheduled Platform Upgrade'),
        message: String(body.message || 'System maintenance in progress.'),
        estimatedResumeAt: String(body.estimatedResumeAt || ''),
      };

      const { error } = await supabase
        .from('system_settings')
        .upsert(
          {
            key: 'maintenance_mode',
            value: JSON.stringify(payload),
            description: 'Global maintenance banner and window state',
            updated_by: auth!.userId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      if (error) throw error;

      return NextResponse.json({ success: true, config: payload });
    }

    return NextResponse.json({ success: false, error: 'Invalid section or id' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin overview PATCH error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Admin update failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    const denied = requireAdminUser(auth);
    if (denied) return denied;

    const body = await request.json();
    if (body.section === 'broadcast') {
      const title = String(body.title || '').trim();
      const message = String(body.message || '').trim();
      const targetRole = String(body.targetRole || 'ALL').toUpperCase();

      if (!title || !message) {
        return NextResponse.json({ success: false, error: 'Title and message are required' }, { status: 400 });
      }

      const supabase = getServiceClient();
      let usersQuery = supabase.from('users').select('id');
      if (targetRole === 'CA' || targetRole === 'CLIENT') {
        usersQuery = usersQuery.eq('role', targetRole);
      }

      const { data: recipients, error: usersErr } = await usersQuery.limit(200);
      if (usersErr) throw usersErr;

      const rows = (recipients || []).map((r: any) => ({
        user_id: r.id,
        title,
        message,
        type: 'SYSTEM',
        is_read: false,
        metadata: { broadcastBy: auth!.userId, targetRole },
      }));

      if (rows.length > 0) {
        const { error: insertErr } = await supabase.from('notifications').insert(rows);
        if (insertErr) throw insertErr;
      }

      return NextResponse.json({ success: true, deliveredCount: rows.length });
    }

    return NextResponse.json({ success: false, error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin overview POST error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Broadcast failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    const denied = requireAdminUser(auth);
    if (denied) return denied;

    const section = request.nextUrl.searchParams.get('section');
    const id = request.nextUrl.searchParams.get('id');
    if (!section || !id) {
      return NextResponse.json({ success: false, error: 'section and id are required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (section === 'documents') {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unsupported delete target' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin overview DELETE error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Delete failed' }, { status: 500 });
  }
}
