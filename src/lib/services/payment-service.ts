/**
 * Payment Service
 * Handles payments, invoices, and billing through Razorpay
 */

import { createClient } from '@/utils/supabase/client';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caId: string;
  clientId: string;
  caseId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  description?: string;
  gstNumber?: string;
  gstRate?: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  razorpayPaymentId?: string;
  razoraypOrderId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paidAt?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private supabase = createClient();
  private razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  private constructor() {}

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create an invoice
   */
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .insert([invoiceData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get invoices for a CA
   */
  async getCAInvoices(caId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> {
    let query = this.supabase
      .from('invoices')
      .select('*')
      .eq('ca_id', caId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('issue_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('issue_date', filters.endDate);
    }

    const { data, error } = await query.order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get invoices for a client
   */
  async getClientInvoices(clientId: string): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('client_id', clientId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<any> {
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    const { data: items, error: itemsError } = await this.supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    if (itemsError) throw itemsError;

    return {
      ...invoice,
      items: items || [],
    };
  }

  /**
   * Create Razorpay payment order
   */
  async createPaymentOrder(invoiceId: string, amount: number): Promise<any> {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          amount: Math.round(amount * 100), // Razorpay expects amount in paise
          currency: 'INR',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Save order to database
      await this.supabase.from('payments').insert([
        {
          invoice_id: invoiceId,
          amount,
          currency: 'INR',
          razorpay_order_id: data.id,
          status: 'pending',
        },
      ]);

      return data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    invoiceId: string
  ): Promise<Payment> {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      // Update payment status
      const { data: payment, error } = await this.supabase
        .from('payments')
        .update({
          status: 'completed',
          razorpay_payment_id: razorpayPaymentId,
          paid_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpayOrderId)
        .select()
        .single();

      if (error) throw error;

      // Update invoice status
      const invoice = await this.getInvoice(invoiceId);
      await this.updateInvoiceStatus(invoiceId, 'paid', new Date().toISOString());

      return payment;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Update invoice status
   */
  async updateInvoiceStatus(invoiceId: string, status: string, paidAt?: string): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoices')
      .update({
        status,
        paid_at: paidAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Add invoice items
   */
  async addInvoiceItem(
    invoiceId: string,
    description: string,
    quantity: number,
    unitPrice: number,
    taxRate: number = 0
  ): Promise<any> {
    const total = quantity * unitPrice;

    const { data, error } = await this.supabase
      .from('invoice_items')
      .insert([
        {
          invoice_id: invoiceId,
          description,
          quantity,
          unit_price: unitPrice,
          tax_rate: taxRate,
          total,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update invoice totals
    const items = await this.supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId);

    let subtotal = 0;
    let taxAmount = 0;

    if (items.data) {
      items.data.forEach((item: any) => {
        subtotal += item.total;
        taxAmount += (item.total * item.tax_rate) / 100;
      });
    }

    await this.supabase.from('invoices').update({
      subtotal,
      tax_amount: taxAmount,
      total_amount: subtotal + taxAmount,
    }).eq('id', invoiceId);

    return data;
  }

  /**
   * Send invoice to client
   */
  async sendInvoice(invoiceId: string): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);

    try {
      await fetch('/api/payments/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          clientEmail: invoice.client_email,
          invoiceNumber: invoice.invoice_number,
        }),
      });

      // Update invoice status
      await this.updateInvoiceStatus(invoiceId, 'sent');
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  /**
   * Generate payment link
   */
  async generatePaymentLink(invoiceId: string): Promise<string> {
    const invoice = await this.getInvoice(invoiceId);
    const order = await this.createPaymentOrder(invoiceId, invoice.total_amount);

    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout?orderId=${order.id}`;
    return paymentUrl;
  }

  /**
   * Get payment history for an invoice
   */
  async getPaymentHistory(invoiceId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending payments for a CA
   */
  async getPendingPayments(caId: string): Promise<Invoice[]> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('ca_id', caId)
      .in('status', ['sent', 'partially_paid'])
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(caId: string): Promise<Invoice[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('ca_id', caId)
      .eq('status', 'sent')
      .lt('due_date', today);

    if (error) throw error;
    return data || [];
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(invoiceId: string): Promise<void> {
    const invoice = await this.getInvoice(invoiceId);

    try {
      await fetch('/api/payments/send-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          clientEmail: invoice.client_email,
          dueDate: invoice.due_date,
        }),
      });

      // Update reminder count
      await this.supabase
        .from('invoices')
        .update({ reminder_sent_count: (invoice.reminder_sent_count || 0) + 1 })
        .eq('id', invoiceId);
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  /**
   * Cancel invoice
   */
  async cancelInvoice(invoiceId: string): Promise<Invoice> {
    return this.updateInvoiceStatus(invoiceId, 'cancelled');
  }

  /**
   * Get revenue summary for a CA
   */
  async getRevenueSummary(
    caId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalRevenue: number;
    paidAmount: number;
    pendingAmount: number;
    invoiceCount: number;
  }> {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .eq('ca_id', caId)
      .gte('issue_date', startDate)
      .lte('issue_date', endDate);

    if (error) throw error;

    const totalRevenue = data?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const paidAmount =
      data?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const pendingAmount = totalRevenue - paidAmount;

    return {
      totalRevenue,
      paidAmount,
      pendingAmount,
      invoiceCount: data?.length || 0,
    };
  }

  /**
   * Create subscription
   */
  async createSubscription(userId: string, planType: string, interval: string): Promise<any> {
    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          planType,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      // Save subscription to database
      await this.supabase.from('subscriptions').insert([
        {
          user_id: userId,
          plan_type: planType,
          billing_cycle: interval,
          razorpay_subscription_id: data.id,
          status: 'active',
          starts_at: new Date().toISOString(),
        },
      ]);

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }
}

export default PaymentService.getInstance();
