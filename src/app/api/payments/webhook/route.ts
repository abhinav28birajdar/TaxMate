import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '../../../../lib/backend/supabase';

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
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_webhook_secret';

    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { success: false, error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      return NextResponse.json({ success: true, message: 'No payment entity to process' });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const paymentMethod = paymentEntity.method;

    if (event === 'payment.captured') {
      // Find and update payment
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('gateway_order_id', razorpayOrderId)
        .maybeSingle();

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'SUCCESS',
            gateway_payment_id: razorpayPaymentId,
            payment_method: paymentMethod,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);

        if (payment.invoice_id) {
          await supabase
            .from('invoices')
            .update({
              status: 'PAID',
              paid_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.invoice_id);
        }
      }
    } else if (event === 'payment.failed') {
      // Find and update payment to FAILED
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('gateway_order_id', razorpayOrderId)
        .maybeSingle();

      if (payment) {
        await supabase
          .from('payments')
          .update({
            status: 'FAILED',
            gateway_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id);
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
