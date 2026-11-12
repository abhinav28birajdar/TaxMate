import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

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
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const body = await request.json();

    const orderId = body.razorpay_order_id || body.razorpayOrderId || body.orderId;
    const paymentId = body.razorpay_payment_id || body.razorpayPaymentId || body.paymentId;
    const signature = body.razorpay_signature || body.razorpaySignature || body.signature;
    const invoiceId = body.invoiceId || body.invoice_id;

    if (!orderId || !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification details (orderId or paymentId)' },
        { status: 400 }
      );
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .or(`gateway_order_id.eq.${orderId},razorpay_order_id.eq.${orderId},id.eq.${orderId}`)
      .maybeSingle();

    const targetInvoiceId = invoiceId || payment?.invoice_id;

    if (payment) {
      const canVerifyPayment =
        auth.isAdmin ||
        payment.ca_id === auth.userId ||
        (payment.client_id && (await canAccessClientRecord(auth, payment.client_id)));
      if (!canVerifyPayment) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    } else if (targetInvoiceId) {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id, client_id, ca_id')
        .eq('id', targetInvoiceId)
        .maybeSingle();
      if (!invoice) {
        return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
      }
      const canVerifyInv =
        auth.isAdmin ||
        invoice.ca_id === auth.userId ||
        (invoice.client_id && (await canAccessClientRecord(auth, invoice.client_id)));
      if (!canVerifyInv) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment order record not found' },
        { status: 404 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hasConfiguredSecret = Boolean(keySecret && !keySecret.includes('placeholder'));

    if (hasConfiguredSecret) {
      if (!signature || typeof signature !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Signature is required for verification' },
          { status: 400 }
        );
      }

      const generatedSignature = crypto
        .createHmac('sha256', keySecret!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (!timingSafeHexCompare(generatedSignature, signature)) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    } else if (process.env.NODE_ENV === 'production' || !process.env.ALLOW_SANDBOX_PAYMENTS) {
      return NextResponse.json(
        { success: false, error: 'Payment gateway secret not configured on server' },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    const paymentUpdate = {
      status: 'SUCCESS',
      gateway_payment_id: paymentId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature || null,
      paid_at: now,
      updated_at: now,
    };

    if (payment) {
      await supabase
        .from('payments')
        .update(paymentUpdate)
        .eq('id', payment.id);
    }

    if (targetInvoiceId) {
      await supabase
        .from('invoices')
        .update({
          status: 'PAID',
          paid_at: now,
          updated_at: now,
        })
        .eq('id', targetInvoiceId);

      if (payment?.ca_id) {
        await supabase.from('notifications').insert([
          {
            user_id: payment.ca_id,
            title: 'Payment Received',
            message: `Payment of ₹${payment.amount || ''} successfully received for invoice #${targetInvoiceId}.`,
            type: 'PAYMENT_RECEIVED',
            read: false,
            is_read: false,
            created_at: now,
          },
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      paymentId,
      orderId,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
