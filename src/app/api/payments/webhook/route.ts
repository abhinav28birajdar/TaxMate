import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';

export const dynamic = 'force-dynamic';

function timingSafeHexCompare(expectedHex: string, receivedHex: string): boolean {
  const expected = new Uint8Array(Buffer.from(expectedHex, 'hex'));
  const received = new Uint8Array(Buffer.from(receivedHex, 'hex'));
  if (expected.length === 0 || expected.length !== received.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, received);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Signature header missing' },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret.includes('placeholder')) {
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured on server' },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!timingSafeHexCompare(expectedSignature, signature)) {
      return NextResponse.json(
        { success: false, error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ success: true, message: 'Event acknowledged; no payment entity' });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const paymentMethod = paymentEntity.method;
    const now = new Date().toISOString();

    if (event === 'payment.captured') {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .or(`gateway_order_id.eq.${razorpayOrderId},razorpay_order_id.eq.${razorpayOrderId},id.eq.${razorpayOrderId}`)
        .maybeSingle();

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'SUCCESS',
            gateway_payment_id: razorpayPaymentId,
            razorpay_payment_id: razorpayPaymentId,
            payment_method: paymentMethod,
            paid_at: now,
            updated_at: now,
          })
          .eq('id', payment.id);

        if (payment.invoice_id) {
          await supabase
            .from('invoices')
            .update({
              status: 'PAID',
              paid_at: now,
              updated_at: now,
            })
            .eq('id', payment.invoice_id);

          if (payment.ca_id) {
            await supabase.from('notifications').insert([
              {
                user_id: payment.ca_id,
                title: 'Payment Captured',
                message: `Payment of ₹${payment.amount} was confirmed via Razorpay.`,
                type: 'PAYMENT_RECEIVED',
                read: false,
                is_read: false,
                created_at: now,
              },
            ]);
          }
        }
      }
    } else if (event === 'payment.failed') {
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .or(`gateway_order_id.eq.${razorpayOrderId},razorpay_order_id.eq.${razorpayOrderId},id.eq.${razorpayOrderId}`)
        .maybeSingle();

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'FAILED',
            gateway_payment_id: razorpayPaymentId,
            razorpay_payment_id: razorpayPaymentId,
            updated_at: now,
          })
          .eq('id', payment.id);
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
