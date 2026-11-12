import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planType = 'pro', interval = 'monthly' } = body;
    const requestedUserId = body.userId;

    if (requestedUserId && requestedUserId !== auth.userId && !auth.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = requestedUserId && auth.isAdmin ? requestedUserId : auth.userId;
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let subscriptionId = `sub_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    if (keyId && keySecret && !keyId.includes('placeholder') && !keySecret.includes('placeholder')) {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const planIdMap: Record<string, string> = {
        basic: process.env.RAZORPAY_PLAN_BASIC || '',
        pro: process.env.RAZORPAY_PLAN_PRO || '',
        enterprise: process.env.RAZORPAY_PLAN_ENTERPRISE || '',
      };
      const planId = planIdMap[String(planType).toLowerCase()] || '';

      if (planId) {
        const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            plan_id: planId,
            total_count: interval === 'annual' ? 1 : 12,
            quantity: 1,
            notes: { userId: targetUserId, planType },
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error?.description || 'Failed to create Razorpay subscription');
        }
        const data = await res.json();
        subscriptionId = data.id;
      }
    }

    const normalizedPlan = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'].includes(
      String(planType).toUpperCase()
    )
      ? String(planType).toUpperCase()
      : 'PRO';

    const supabase = getServiceClient();
    const { data: created, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          user_id: targetUserId,
          plan: normalizedPlan,
          plan_type: String(planType).toLowerCase(),
          billing_cycle: interval,
          razorpay_subscription_id: subscriptionId,
          status: 'ACTIVE',
          starts_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        id: subscriptionId,
        subscription: created,
        userId: targetUserId,
        plan: normalizedPlan,
        planType,
        interval,
        status: 'ACTIVE',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
