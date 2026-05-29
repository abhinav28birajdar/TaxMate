/**
 * Email Notification Service
 * Handles sending email notifications using Resend
 * 
 * Endpoint: POST /api/notifications/email
 * Usage: Send emails for various events (task reminders, invoice paid, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification, type EmailNotificationPayload } from '@/lib/notifications';

export const runtime = 'nodejs';

// Email templates
const emailTemplates = {
  TASK_ASSIGNED: (userName: string, taskTitle: string, dueDate: string) => `
    <h2>New Task Assigned</h2>
    <p>Hi ${userName},</p>
    <p>A new task has been assigned to you:</p>
    <p><strong>${taskTitle}</strong></p>
    <p>Due: ${dueDate}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/tasks">View Task</a></p>
  `,
  
  INVOICE_PAID: (userName: string, invoiceNumber: string, amount: string) => `
    <h2>Invoice Paid</h2>
    <p>Hi ${userName},</p>
    <p>Invoice <strong>#${invoiceNumber}</strong> has been paid.</p>
    <p>Amount: <strong>₹${amount}</strong></p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices">View Invoice</a></p>
  `,
  
  APPOINTMENT_REMINDER: (userName: string, appointmentTitle: string, appointmentTime: string) => `
    <h2>Appointment Reminder</h2>
    <p>Hi ${userName},</p>
    <p>Reminder: You have an appointment coming up</p>
    <p><strong>${appointmentTitle}</strong></p>
    <p>Time: ${appointmentTime}</p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/appointments">View Appointment</a></p>
  `,
  
  MESSAGE: (userName: string, senderName: string, previewText: string) => `
    <h2>New Message</h2>
    <p>Hi ${userName},</p>
    <p><strong>${senderName}</strong> sent you a message:</p>
    <p><em>${previewText}</em></p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/chat">View Message</a></p>
  `,
  
  PAYMENT_DUE: (userName: string, invoiceNumber: string, amount: string, dueDate: string) => `
    <h2>Payment Due</h2>
    <p>Hi ${userName},</p>
    <p>Payment is due for invoice <strong>#${invoiceNumber}</strong></p>
    <p>Amount: <strong>₹${amount}</strong></p>
    <p>Due Date: <strong>${dueDate}</strong></p>
    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices">Pay Now</a></p>
  `,
};

export async function POST(request: NextRequest) {
  try {
    const payload: EmailNotificationPayload = await request.json();

    const res = await sendEmailNotification(payload);

    if (!res.success) {
      return NextResponse.json({ error: res.error || 'Failed to send email' }, { status: 500 });
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

