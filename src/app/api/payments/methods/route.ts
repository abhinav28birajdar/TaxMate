import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const createPaymentMethodSchema = z.object({
  methodType: z.enum(['upi', 'card', 'netbanking']).default('upi'),
  label: z.string().trim().min(2).max(100),
  upiId: z.string().trim().max(120).optional().nullable(),
  cardLast4: z.string().trim().regex(/^\d{4}$/).optional().nullable(),
  cardBrand: z.string().trim().max(40).optional().nullable(),
  bankName: z.string().trim().max(100).optional().nullable(),
  accountLast4: z.string().trim().regex(/^\d{4}$/).optional().nullable(),
  ifsc: z.string().trim().max(20).optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const [{ data: methods, error: methodsError }, { data: subscriptions, error: subError }] =
      await Promise.all([
        supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', auth.userId)
          .order('is_default', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', auth.userId)
          .order('created_at', { ascending: false }),
      ]);

    if (methodsError) throw methodsError;
    if (subError) throw subError;

    return NextResponse.json({
      success: true,
      methods: methods || [],
      subscriptions: subscriptions || [],
    });
  } catch (error: any) {
    console.error('Payment methods GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createPaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const v = parsed.data;
    if (v.methodType === 'upi' && (!v.upiId || !v.upiId.includes('@'))) {
      return NextResponse.json(
        { error: 'Valid UPI VPA (e.g. name@bank) is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    if (v.isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', auth.userId);
    }

    const { data: method, error } = await supabase
      .from('payment_methods')
      .insert([
        {
          user_id: auth.userId,
          method_type: v.methodType,
          label: v.label,
          upi_id: v.upiId || null,
          card_last4: v.cardLast4 || null,
          card_brand: v.cardBrand || null,
          bank_name: v.bankName || null,
          account_last4: v.accountLast4 || null,
          ifsc: v.ifsc || null,
          is_default: Boolean(v.isDefault),
          is_verified: true,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, method }, { status: 201 });
  } catch (error: any) {
    console.error('Payment methods POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save payment method' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Payment methods DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete payment method' },
      { status: 500 }
    );
  }
}

