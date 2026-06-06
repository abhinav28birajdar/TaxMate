import { createClient } from '@/utils/supabase/server';

export const invoiceService = {
  // Create invoice
  async createInvoice(data: {
    caId: string;
    clientId: string;
    amount: number;
    taxAmount?: number;
    description?: string;
    dueDate?: Date;
    items?: any[];
  }) {
    const supabase = await createClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ca_id: data.caId,
        client_id: data.clientId,
        amount: data.amount + (data.taxAmount || 0), // total amount
        description: data.description,
        due_date: data.dueDate ? data.dueDate.toISOString().split('T')[0] : null,
        status: 'DRAFT',
        invoice_number: `INV-${Date.now()}`,
        metadata: { taxAmount: data.taxAmount || 0, items: data.items || [] },
      })
      .select()
      .single();

    if (error) throw error;
    return invoice;
  },

  // Get invoices
  async getInvoices(filters?: {
    caId?: string;
    clientId?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) {
    const supabase = await createClient();

    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:users!invoices_client_id_fkey (id, name, email, phone, status),
        ca:users!invoices_ca_id_fkey (id, name, email, phone, status),
        payments (*)
      `, { count: 'exact' });

    if (filters?.caId) query = query.eq('ca_id', filters.caId);
    if (filters?.clientId) query = query.eq('client_id', filters.clientId);
    if (filters?.status) query = query.eq('status', filters.status.toUpperCase());

    const skip = filters?.skip || 0;
    const take = filters?.take || 20;

    query = query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    const { data: invoices, error, count } = await query;
    if (error) throw error;

    return { invoices: invoices || [], total: count || 0 };
  },

  // Get invoice by ID
  async getInvoiceById(invoiceId: string) {
    const supabase = await createClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:users!invoices_client_id_fkey (id, name, email, phone, status),
        ca:users!invoices_ca_id_fkey (id, name, email, phone, status),
        payments (*)
      `)
      .eq('id', invoiceId)
      .single();

    if (error) throw error;
    return invoice;
  },

  // Update invoice
  async updateInvoice(invoiceId: string, data: any) {
    const supabase = await createClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update(data)
      .eq('id', invoiceId)
      .select(`
        *,
        client:users!invoices_client_id_fkey (id, name, email, phone, status),
        ca:users!invoices_ca_id_fkey (id, name, email, phone, status),
        payments (*)
      `)
      .single();

    if (error) throw error;
    return invoice;
  },

  // Send invoice
  async sendInvoice(invoiceId: string) {
    const supabase = await createClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({
        status: 'SENT',
        issued_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)
      .select(`
        *,
        client:users!invoices_client_id_fkey (id, name, email, phone, status)
      `)
      .single();

    if (error) throw error;
    return invoice;
  },

  // Get overdue invoices
  async getOverdueInvoices(caId: string) {
    const supabase = await createClient();

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:users!invoices_client_id_fkey (id, name, email, phone, status),
        payments (*)
      `)
      .eq('ca_id', caId)
      .in('status', ['SENT', 'OVERDUE'])
      .lt('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) throw error;
    return invoices || [];
  },

  // Get invoice summary
  async getInvoiceSummary(caId: string) {
    const supabase = await createClient();

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, payments (*)')
      .eq('ca_id', caId);

    if (error) throw error;

    const invList = invoices || [];
    const total = invList.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
    const paid = invList
      .filter((inv: any) => inv.status === 'PAID')
      .reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
    const pending = total - paid;

    return {
      totalInvoices: invList.length,
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: pending,
      pendingCount: invList.filter((inv: any) => inv.status !== 'PAID').length,
    };
  },

  // Record payment
  async recordPayment(invoiceId: string, data: {
    amount: number;
    method: string;
    transactionId?: string;
    notes?: string;
  }) {
    const supabase = await createClient();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, payments (*)')
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) throw new Error('Invoice not found');

    const totalPaid = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
    const isPaid = totalPaid + data.amount >= Number(invoice.amount || 0);

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        ca_id: invoice.ca_id,
        client_id: invoice.client_id,
        amount: data.amount,
        payment_method: data.method,
        gateway_transaction_id: data.transactionId || `TXN-${Date.now()}`,
        notes: data.notes,
        status: 'SUCCESS',
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    if (isPaid) {
      await supabase
        .from('invoices')
        .update({ status: 'PAID', paid_at: new Date().toISOString() })
        .eq('id', invoiceId);
    }

    return payment;
  },
};
