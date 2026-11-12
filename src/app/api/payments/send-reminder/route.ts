import { NextRequest, NextResponse } from 'next/server';
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
    const { invoiceId, clientEmail, dueDate } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!auth.isAdmin && invoice.ca_id !== auth.userId && invoice.created_by !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && !resendKey.includes('mock') && !resendKey.includes('placeholder')) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'billing@taxmate.com';
        const recipient = clientEmail || invoice.client_email;

        if (recipient) {
          await resend.emails.send({
            from: fromEmail,
            to: recipient,
            subject: `Payment Reminder: Invoice #${invoice.invoice_number}`,
            text: `Dear Client,\n\nThis is a friendly reminder that invoice #${invoice.invoice_number} for ₹${invoice.total_amount || invoice.amount || 0} is due on ${dueDate || invoice.due_date || 'soon'}. Please log in to your TaxMate account to settle the outstanding balance.\n\nThank you,\nTaxMate Team`,
          });
        }
      } catch (emailErr) {
        console.warn('Reminder email error:', emailErr);
      }
    }

    if (invoice.client_id) {
      await supabase.from('notifications').insert([
        {
          user_id: invoice.client_id,
          title: 'Payment Reminder',
          message: `Reminder: Invoice #${invoice.invoice_number} is pending payment (Due: ${dueDate || invoice.due_date || 'soon'}).`,
          type: 'payment_due',
          read: false,
          is_read: false,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment reminder dispatched successfully',
      invoiceId,
    });
  } catch (error: any) {
    console.error('Send reminder error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send payment reminder' },
      { status: 500 }
    );
  }
}
