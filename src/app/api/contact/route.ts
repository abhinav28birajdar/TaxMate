import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceClient } from '@/lib/backend/supabase';
import { checkRateLimit } from '@/lib/api/auth-middleware';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const inquirySchema = z.object({
  inquiryType: z.enum(['contact', 'sales', 'demo', 'ca_invite']).optional().default('contact'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  email: z.string().trim().email('Valid email address is required'),
  phone: z.string().trim().max(30).optional().nullable(),
  company: z.string().trim().max(150).optional().nullable(),
  teamSize: z.string().trim().max(50).optional().nullable(),
  subject: z.string().trim().max(200).optional().nullable(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(`contact:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again in a minute.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = inquirySchema.safeParse({
      inquiryType: body.inquiryType || body.inquiry_type || 'contact',
      name: body.name,
      email: body.email,
      phone: body.phone || null,
      company: body.company || null,
      teamSize: body.teamSize || body.team_size || null,
      subject: body.subject || null,
      message: body.message,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('contact_inquiries')
      .insert({
        inquiry_type: parsed.data.inquiryType,
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        company: parsed.data.company,
        team_size: parsed.data.teamSize,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: 'new',
      })
      .select('id, created_at')
      .single();

    if (error) throw error;

    const resendKey = process.env.RESEND_API_KEY;
    const supportEmail = process.env.SUPPORT_INBOX_EMAIL || process.env.RESEND_FROM_EMAIL;
    if (
      resendKey &&
      supportEmail &&
      !resendKey.includes('placeholder') &&
      !resendKey.includes('mock')
    ) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'TaxMate <noreply@taxmate.in>',
          to: supportEmail,
          subject: `[TaxMate ${parsed.data.inquiryType.toUpperCase()}] ${parsed.data.subject || parsed.data.name}`,
          text: `From: ${parsed.data.name} (${parsed.data.email})\nPhone: ${parsed.data.phone || 'N/A'}\nCompany: ${parsed.data.company || 'N/A'}\nTeam Size: ${parsed.data.teamSize || 'N/A'}\n\n${parsed.data.message}`,
        });
      } catch (emailErr) {
        console.warn('Contact notification email skipped:', emailErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        inquiryId: data.id,
        message: 'Thank you! Your inquiry has been recorded and our team will reach out shortly.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!auth.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ success: true, inquiries: data || [] });
  } catch (error: any) {
    console.error('Contact GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load inquiries' },
      { status: 500 }
    );
  }
}
