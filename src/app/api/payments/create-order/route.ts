import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const body = await request.json();
    const { invoiceId, amount, currency = 'INR', clientName, clientEmail, serviceName, paymentMethod } = body;

    let invoiceRecord: any = null;
    let amountInPaise: number;

    if (invoiceId) {
      const { data: inv, error: invError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .maybeSingle();

      if (invError || !inv) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      const canPay =
        auth.isAdmin ||
        inv.ca_id === auth.userId ||
        (inv.client_id && (await canAccessClientRecord(auth, inv.client_id)));

      if (!canPay) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (String(inv.status || '').toUpperCase() === 'PAID') {
        return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
      }

      invoiceRecord = inv;
      const invoiceRupees = Number(inv.total_amount ?? inv.amount ?? 0);
      if (!Number.isFinite(invoiceRupees) || invoiceRupees <= 0) {
        return NextResponse.json({ error: 'Invoice has invalid amount' }, { status: 400 });
      }
      // Authoritative amount derived from database invoice (in paise)
      amountInPaise = Math.round(invoiceRupees * 100);
    } else {
      const parsedPaise = Math.round(Number(amount));
      if (!Number.isFinite(parsedPaise) || parsedPaise < 100) {
        return NextResponse.json(
          { error: 'Valid payment amount (minimum ₹1 / 100 paise) is required' },
          { status: 400 }
        );
      }
      amountInPaise = parsedPaise;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let orderId: string;

    if (keyId && keySecret && !keyId.includes('placeholder') && !keySecret.includes('placeholder')) {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: String(currency).toUpperCase(),
          receipt: invoiceId ? `inv_${String(invoiceId).slice(0, 30)}` : `rcpt_${Date.now()}`,
          notes: {
            invoiceId: invoiceId || '',
            userId: auth.userId,
            clientName: clientName || '',
            clientEmail: clientEmail || '',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.description || 'Failed to create Razorpay order');
      }

      const orderData = await response.json();
      orderId = orderData.id;
    } else {
      orderId = `order_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    }

    const now = new Date().toISOString();
    const paymentData = {
      invoice_id: invoiceId || null,
      client_id: invoiceRecord?.client_id || auth.userId,
      ca_id: invoiceRecord?.ca_id || null,
      amount: amountInPaise / 100,
      currency: String(currency).toUpperCase(),
      gateway_order_id: orderId,
      razorpay_order_id: orderId,
      payment_method: paymentMethod || null,
      notes: serviceName || invoiceRecord?.description || null,
      metadata: {
        serviceName: serviceName || invoiceRecord?.description || null,
        invoiceNumber: invoiceRecord?.invoice_number || null,
      },
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    };

    const { data: paymentRecord, error: insertError } = await supabase
      .from('payments')
      .insert([paymentData])
      .select()
      .maybeSingle();

    if (insertError) {
      throw new Error(`Failed to persist payment order: ${insertError.message}`);
    }

    return NextResponse.json(
      {
        id: orderId,
        orderId,
        amount: amountInPaise,
        currency: String(currency).toUpperCase(),
        paymentId: paymentRecord?.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment order' },
      { status: 500 }
    );
  }
}
