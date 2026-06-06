import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Missing payment signature details' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Signature verification failed' },
        { status: 400 }
      );
    }

    // Fetch corresponding payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('gateway_order_id', razorpay_order_id)
      .maybeSingle();

    if (paymentError || !payment) {
      console.warn('Payment not found for order id:', razorpay_order_id);
    } else {
      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: 'SUCCESS',
          gateway_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      // Update invoice status if linked
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

    return NextResponse.json({
      success: true,
      message: 'Payment verified and recorded successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
