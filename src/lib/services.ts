/**
 * UNIFIED SERVICES LAYER
 * Complete API operations for all features
 * 
 * Updated: 2026-04-08
 */

import { createClient } from '@/utils/supabase/client';

// Type definitions
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Task {
  id: string;
  ca_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  ca_id: string;
  client_id: string;
  invoice_number: string;
  total_amount: number;
  amount_paid: number;
  status: string;
  invoice_date: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  user_id?: string;
  client_id?: string;
  ca_id?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category?: string;
  status?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

interface ComplianceFiling {
  id: string;
  ca_id: string;
  client_id: string;
  filing_type: string;
  status: string;
  due_date: string;
  filed_date?: string;
  created_at: string;
  updated_at: string;
}

const supabase = createClient();

// ============================================================================
// TASK SERVICES
// ============================================================================

export const taskService = {
  async create(caId: string, clientId: string, data: any) {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ca_id: caId,
        client_id: clientId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return task;
  },

  async getAll(userId: string, filters?: any) {
    let query = supabase
      .from('tasks')
      .select('*')
      .or(`ca_id.eq.${userId},client_id.eq.${userId},assigned_to.eq.${userId}`);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.priority) query = query.eq('priority', filters.priority);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(taskId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(taskId: string, data: any) {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();
    if (error) throw error;
    return task;
  },

  async delete(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
  },
};

// ============================================================================
// INVOICE SERVICES
// ============================================================================

export const invoiceService = {
  async create(caId: string, clientId: string, data: any) {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .insert({
        ca_id: caId,
        client_id: clientId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return invoice;
  },

  async getAll(userId: string, filters?: any) {
    let query = supabase
      .from('invoices')
      .select('*')
      .or(`ca_id.eq.${userId},client_id.eq.${userId}`);

    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(invoiceId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(invoiceId: string, data: any) {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select()
      .single();
    if (error) throw error;
    return invoice;
  },

  async delete(invoiceId: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);
    if (error) throw error;
  },
};

// ============================================================================
// APPOINTMENT SERVICES
// ============================================================================

export const appointmentService = {
  async create(caId: string, clientId: string, data: any) {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        ca_id: caId,
        client_id: clientId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return appointment;
  },

  async getAll(userId: string, filters?: any) {
    let query = supabase
      .from('appointments')
      .select('*')
      .or(`ca_id.eq.${userId},client_id.eq.${userId}`);

    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('start_time', { ascending: true });
    if (error) throw error;
    return data;
  },

  async get(appointmentId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(appointmentId: string, data: any) {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return appointment;
  },

  async delete(appointmentId: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);
    if (error) throw error;
  },
};

// ============================================================================
// DOCUMENT SERVICES
// ============================================================================

export const documentService = {
  async create(userId: string, data: any) {
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return document;
  },

  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(documentId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    if (error) throw error;
    return data;
  },

  async delete(documentId: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
    if (error) throw error;
  },

  async upload(file: File, userId: string, folder: string = 'documents') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return {
      path: fileName,
      url: urlData.publicUrl,
      name: file.name
    };
  },
};

// ============================================================================
// CONVERSATION & MESSAGE SERVICES
// ============================================================================

export const conversationService = {
  async create(caId: string, clientId: string, data?: any) {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        ca_id: caId,
        client_id: clientId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return conversation;
  },

  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`ca_id.eq.${userId},client_id.eq.${userId}`)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async get(conversationId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    if (error) throw error;
    return data;
  },
};

export const messageService = {
  async create(conversationId: string, senderId: string, content: string, type = 'TEXT') {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return message;
  },

  async getAll(conversationId: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data?.reverse() || [];
  },

  async delete(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', messageId);
    if (error) throw error;
  },
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export const notificationService = {
  async create(userId: string, data: any) {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return notification;
  },

  async getAll(userId: string, unreadOnly = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw error;
  },
};

// ============================================================================
// DASHBOARD SERVICES  
// ============================================================================

export const dashboardService = {
  async getSummary(userId: string) {
    const [tasks, invoices, appointments, notifications] = await Promise.all([
      supabase
        .from('tasks')
        .select('id')
        .or(`ca_id.eq.${userId},client_id.eq.${userId},assigned_to.eq.${userId}`)
        .eq('status', 'TODO')
        .then((r) => r.data),
      supabase
        .from('invoices')
        .select('amount, status')
        .or(`ca_id.eq.${userId},client_id.eq.${userId}`)
        .then((r) => r.data),
      supabase
        .from('appointments')
        .select('id')
        .or(`ca_id.eq.${userId},client_id.eq.${userId}`)
        .eq('status', 'PENDING')
        .then((r) => r.data),
      supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false)
        .then((r) => r.data),
    ]);

    const unpaidAmount = (invoices || []).reduce((sum, inv: any) => {
      if (inv.status !== 'PAID') return sum + (inv.amount || 0);
      return sum;
    }, 0);

    return {
      pendingTasks: tasks?.length || 0,
      unpaidAmount,
      pendingAppointments: appointments?.length || 0,
      unreadNotifications: notifications?.length || 0,
    };
  },
};

// ============================================================================
// LEGACY EXPORTS (for backward compatibility)
// ============================================================================

// Keep old clientService structure for compatibility
export const clientService = {
  async getClients(caId: string, options?: any) {
    const limit = options?.limit || 10;
    const page = options?.page || 1;
    const from = (page - 1) * limit;

    let query = supabase
      .from('client_profiles')
      .select('*', { count: 'exact' })
      .eq('ca_id', caId);

    if (options?.search) {
      query = query.ilike('business_name', `%${options.search}%`);
    }

    const { data, error, count } = await query.range(from, from + limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  async getClient(clientId: string) {
    const { data, error } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) throw error;
    return data;
  },
};

// ============================================================================
export const activityService = {
  // Log activity
  async logActivity(
    userId: string,
    type: string,
    description: string,
    relatedId?: string
  ): Promise<void> {
    try {
      await supabase.from('activity_feed').insert([
        {
          user_id: userId,
          activity_type: type,
          title: description,
          description,
          related_id: relatedId,
          related_type: type,
        },
      ]);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  },

  // Get activity feed
  async getActivityFeed(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch activity feed: ${error}`);
    }
  },
};

// ============================================================================
// COMPLIANCE SERVICE
// ============================================================================

export const complianceService = {
  // Get compliance filings
  async getFilings(
    clientId: string,
    options?: { status?: string; type?: string }
  ): Promise<ComplianceFiling[]> {
    try {
      let query = supabase
        .from('compliance_filings')
        .select('*')
        .eq('client_id', clientId);

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.type) {
        query = query.eq('filing_type', options.type);
      }

      const { data, error } = await query.order('due_date', {
        ascending: true,
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch filings: ${error}`);
    }
  },

  // Get pending filings
  async getPendingFilings(caId: string): Promise<ComplianceFiling[]> {
    try {
      const { data, error } = await supabase
        .from('compliance_filings')
        .select('*')
        .eq('ca_id', caId)
        .neq('status', 'filed');

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch pending filings: ${error}`);
    }
  },
};

export default {
  clientService,
  documentService,
  taskService,
  invoiceService,
  notificationService,
  activityService,
  complianceService,
};
