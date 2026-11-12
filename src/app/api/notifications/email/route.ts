import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification, type EmailNotificationPayload } from '@/lib/notifications';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: EmailNotificationPayload = await request.json();

    if (!payload.userId || !payload.userEmail || !payload.subject) {
      return NextResponse.json(
        { error: 'userId, userEmail, and subject are required' },
        { status: 400 }
      );
    }

    if (!auth.isAdmin && payload.userId !== auth.userId) {
      const canSendToClient = auth.isCAOrStaff && (await canAccessClientRecord(auth, payload.userId));
      if (!canSendToClient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const res = await sendEmailNotification(payload);

    if (!res.success) {
      return NextResponse.json(
        { error: typeof res.error === 'string' ? res.error : 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      email: res.emailResult,
      notification: res.notification,
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
