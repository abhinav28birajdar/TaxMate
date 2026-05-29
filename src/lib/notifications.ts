import { Resend } from 'resend';
import { createClient } from '@/utils/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailNotificationPayload = {
  userId: string;
  userEmail: string;
  userName: string;
  type: 'TASK_ASSIGNED' | 'INVOICE_PAID' | 'APPOINTMENT_REMINDER' | 'MESSAGE' | 'DOCUMENT_READY' | 'PAYMENT_DUE' | 'CUSTOM';
  subject: string;
  htmlContent?: string;
  metadata?: Record<string, any>;
};

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

export async function sendEmailNotification(payload: EmailNotificationPayload) {
  // Basic validation
  if (!payload.userId || !payload.userEmail || !payload.subject) {
    return { success: false, error: 'Missing required fields: userId, userEmail, subject' };
  }

  // Generate HTML content if needed
  let htmlContent = payload.htmlContent;
  if (!htmlContent && payload.type !== 'CUSTOM' && payload.metadata) {
    switch (payload.type) {
      case 'TASK_ASSIGNED':
        htmlContent = emailTemplates.TASK_ASSIGNED(
          payload.userName,
          payload.metadata.taskTitle || 'New Task',
          payload.metadata.dueDate || 'Not set'
        );
        break;
      case 'INVOICE_PAID':
        htmlContent = emailTemplates.INVOICE_PAID(
          payload.userName,
          payload.metadata.invoiceNumber || '000',
          payload.metadata.amount || '0'
        );
        break;
      case 'APPOINTMENT_REMINDER':
        htmlContent = emailTemplates.APPOINTMENT_REMINDER(
          payload.userName,
          payload.metadata.appointmentTitle || 'Appointment',
          payload.metadata.appointmentTime || 'Not set'
        );
        break;
      case 'MESSAGE':
        htmlContent = emailTemplates.MESSAGE(
          payload.userName,
          payload.metadata.senderName || 'Someone',
          payload.metadata.previewText || 'No preview'
        );
        break;
      case 'PAYMENT_DUE':
        htmlContent = emailTemplates.PAYMENT_DUE(
          payload.userName,
          payload.metadata.invoiceNumber || '000',
          payload.metadata.amount || '0',
          payload.metadata.dueDate || 'Not set'
        );
        break;
    }
  }

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@taxmate.com',
      to: payload.userEmail,
      subject: payload.subject,
      html: htmlContent || `<p>Mail sent successfully</p>`,
    });

    // Persist notification
    const supabase = await createClient();
    const { data: notification, error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: payload.userId,
        title: payload.subject,
        message: htmlContent || 'Email sent',
        type: payload.type,
        channel: 'EMAIL',
        metadata: payload.metadata,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Notification insert error:', dbError);
    }

    return {
      success: true,
      emailResult: result,
      notification: notification ?? null,
    };
  } catch (err) {
    console.error('sendEmailNotification error:', err);
    return { success: false, error: err };
  }
}
