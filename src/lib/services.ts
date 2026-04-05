// ============================================================================
// TAXMATE: Core Service Management & API Layer
// ============================================================================

import {
  Client,
  Document,
  Task,
  Invoice,
  Appointment,
  Service,
  ComplianceFiling,
  ApiResponse,
  PaginatedResponse,
  User,
  CAProfile,
  Notification,
  Payment,
} from '@/lib/types/complete.types';
import { supabase } from '@/lib/supabase/client';

const API_BASE = '/api';

// ============================================================================
// CLIENT SERVICE MANAGEMENT
// ============================================================================

export const clientService = {
  // Get all clients for CA
  async getClients(
    caId: string,
    options?: { search?: string; status?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<Client>> {
    try {
      const limit = options?.limit || 10;
      const page = options?.page || 1;
      const from = (page - 1) * limit;

      let query = supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .eq('ca_id', caId);

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.search) {
        query = query.or(
          `name.ilike.%${options.search}%,gst_number.ilike.%${options.search}%,pan_number.ilike.%${options.search}%`
        );
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
    } catch (error) {
      throw new Error(`Failed to fetch clients: ${error}`);
    }
  },

  // Get single client
  async getClient(clientId: string): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch client: ${error}`);
    }
  },

  // Create new client
  async createClient(caId: string, clientData: Partial<Client>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...clientData, ca_id: caId }])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await activityService.logActivity(caId, 'client_added', `Added client: ${clientData.name}`);

      return data;
    } catch (error) {
      throw new Error(`Failed to create client: ${error}`);
    }
  },

  // Update client
  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update client: ${error}`);
    }
  },

  // Delete client
  async deleteClient(clientId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: 'archived' })
        .eq('id', clientId);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to delete client: ${error}`);
    }
  },

  // Get client statistics
  async getClientStats(caId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id,status,created_at', { count: 'exact' })
        .eq('ca_id', caId);

      if (error) throw error;

      const active = data?.filter((c: any) => c.status === 'active').length || 0;
      const total = data?.length || 0;

      return {
        total_clients: total,
        active_clients: active,
        archived_clients: total - active,
      };
    } catch (error) {
      throw new Error(`Failed to fetch client stats: ${error}`);
    }
  },
};

// ============================================================================
// DOCUMENT MANAGEMENT SERVICE
// ============================================================================

export const documentService = {
  // Get documents for client
  async getDocuments(
    clientId: string,
    options?: { category?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<Document>> {
    try {
      const limit = options?.limit || 10;
      const page = options?.page || 1;
      const from = (page - 1) * limit;

      let query = supabase
        .from('documents')
        .select('*', { count: 'exact' })
        .eq('client_id', clientId);

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch documents: ${error}`);
    }
  },

  // Upload document
  async uploadDocument(
    clientId: string,
    caId: string,
    file: File,
    category: string,
    metadata?: Record<string, any>
  ): Promise<Document> {
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `documents/${clientId}/${category}/${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('taxmate-docs')
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('taxmate-docs').getPublicUrl(filePath);

      // Create document record
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            client_id: clientId,
            ca_id: caId,
            file_url: publicUrl,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            category,
            ...metadata,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await activityService.logActivity(
        caId,
        'document_uploaded',
        `${file.name} uploaded`
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to upload document: ${error}`);
    }
  },

  // Get documents expiring soon
  async getExpiringDocuments(caId: string): Promise<Document[]> {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('ca_id', caId)
        .lt('expiry_date', thirtyDaysFromNow.toISOString())
        .gt('expiry_date', new Date().toISOString());

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch expiring documents: ${error}`);
    }
  },

  // Delete document (archive)
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ status: 'deleted' })
        .eq('id', documentId);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to delete document: ${error}`);
    }
  },
};

// ============================================================================
// TASK MANAGEMENT SERVICE
// ============================================================================

export const taskService = {
  // Get tasks
  async getTasks(
    caId: string,
    options?: {
      status?: string;
      priority?: string;
      clientId?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<Task>> {
    try {
      const limit = options?.limit || 10;
      const page = options?.page || 1;
      const from = (page - 1) * limit;

      let query = supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .eq('ca_id', caId);

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.priority) {
        query = query.eq('priority', options.priority);
      }
      if (options?.clientId) {
        query = query.eq('client_id', options.clientId);
      }

      const { data, error, count } = await query
        .order('due_date', { ascending: true })
        .range(from, from + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error}`);
    }
  },

  // Create task
  async createTask(caId: string, taskData: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, ca_id: caId, created_by: caId }])
        .select()
        .single();

      if (error) throw error;

      // Create notification for assigned user
      if (taskData.assigned_to) {
        await notificationService.createNotification(
          taskData.assigned_to,
          'task_assigned',
          `Task assigned: ${taskData.title}`,
          taskData.id,
          'task'
        );
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to create task: ${error}`);
    }
  },

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to update task: ${error}`);
    }
  },

  // Get overdue tasks
  async getOverdueTasks(caId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('ca_id', caId)
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed');

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch overdue tasks: ${error}`);
    }
  },
};

// ============================================================================
// INVOICE & BILLING SERVICE
// ============================================================================

export const invoiceService = {
  // Get invoices
  async getInvoices(
    caId: string,
    options?: { status?: string; clientId?: string; page?: number; limit?: number }
  ): Promise<PaginatedResponse<Invoice>> {
    try {
      const limit = options?.limit || 10;
      const page = options?.page || 1;
      const from = (page - 1) * limit;

      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .eq('ca_id', caId);

      if (options?.status) {
        query = query.eq('status', options.status);
      }
      if (options?.clientId) {
        query = query.eq('client_id', options.clientId);
      }

      const { data, error, count } = await query
        .order('invoice_date', { ascending: false })
        .range(from, from + limit - 1);

      if (error) throw error;

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    } catch (error) {
      throw new Error(`Failed to fetch invoices: ${error}`);
    }
  },

  // Create invoice
  async createInvoice(
    caId: string,
    invoiceData: Partial<Invoice>
  ): Promise<Invoice> {
    try {
      // Generate invoice number
      const invoiceNumber = `TM-${Date.now()}`;

      const { data, error } = await supabase
        .from('invoices')
        .insert([
          {
            ...invoiceData,
            ca_id: caId,
            invoice_number: invoiceNumber,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await activityService.logActivity(
        caId,
        'invoice_created',
        `Invoice ${invoiceNumber} created`
      );

      return data;
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error}`);
    }
  },

  // Get pending invoices
  async getPendingInvoices(caId: string): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('ca_id', caId)
        .in('status', ['issued', 'sent', 'viewed', 'partially_paid', 'overdue']);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch pending invoices: ${error}`);
    }
  },

  // Calculate revenue analytics
  async getRevenueAnalytics(caId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('total_amount,amount_paid,created_at')
        .eq('ca_id', caId)
        .eq('status', 'paid');

      if (error) throw error;

      const total = data?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
      const paid = data?.reduce((sum, inv) => sum + inv.amount_paid, 0) || 0;

      return {
        total_revenue: total,
        total_paid: paid,
        total_pending: total - paid,
        invoice_count: data?.length || 0,
      };
    } catch (error) {
      throw new Error(`Failed to fetch revenue analytics: ${error}`);
    }
  },
};

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export const notificationService = {
  // Create notification
  async createNotification(
    userId: string,
    type: string,
    message: string,
    relatedId?: string,
    relatedType?: string
  ): Promise<Notification> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: userId,
            notification_type: type,
            title: message.split(':')[0],
            message,
            related_id: relatedId,
            related_type: relatedType,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create notification: ${error}`);
    }
  },

  // Get notifications
  async getNotifications(
    userId: string,
    options?: { unread_only?: boolean; limit?: number }
  ): Promise<Notification[]> {
    try {
      const limit = options?.limit || 20;

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      if (options?.unread_only) {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error}`);
    }
  },

  // Mark as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error}`);
    }
  },
};

// ============================================================================
// ACTIVITY FEED SERVICE
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
