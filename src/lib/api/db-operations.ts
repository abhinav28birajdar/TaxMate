/**
 * Secure Database Operations Wrapper
 * All database operations go through here with validation & error handling
 */

import { createClient as createServerClient } from '@/utils/supabase/server';
import { ApiError, ERROR_CODES, HTTP_STATUS } from './response';
import { sanitizeObject } from './validation';

// Type for operation result
export interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Wrapped database query with error handling
 */
export async function dbQuery<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.error(`Database operation failed: ${operationName}`, error);

    throw new ApiError(`Database operation failed: ${operationName}`, {
      code: ERROR_CODES.DATABASE_ERROR,
      statusCode: HTTP_STATUS.INTERNAL_ERROR,
      details: {
        operation: operationName,
        originalError: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
}

/**
 * Get user profile with caching consideration
 */
export async function getUserProfile(userId: string) {
  return dbQuery(async () => {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, status')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new ApiError('User not found', {
        code: ERROR_CODES.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatarUrl: data.avatar_url,
      status: data.status,
    };
  }, 'getUserProfile');
}

/**
 * Create case with validation
 */
export async function createCaseRecord(
  userId: string,
  caseData: {
    title: string;
    description: string;
    clientId: string;
    assignedCaId?: string;
    priority: string;
    deadline?: string;
  }
) {
  return dbQuery(async () => {
    const supabase = await createServerClient();

    const sanitized = sanitizeObject({
      title: caseData.title,
      description: caseData.description,
    });

    const priorityMap: Record<string, string> = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'urgent': 'URGENT',
    };
    const dbPriority = priorityMap[caseData.priority?.toLowerCase()] || 'MEDIUM';

    const { data, error } = await supabase
      .from('cases')
      .insert({
        title: sanitized.title,
        description: sanitized.description,
        ca_id: userId,
        client_id: caseData.clientId,
        assigned_to: caseData.assignedCaId || userId,
        status: 'open',
        priority: dbPriority as any,
        deadline: caseData.deadline,
        case_number: `CASE-${Date.now()}`,
        case_type: 'GENERAL',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, 'createCase');
}

/**
 * Update case with validation
 */
export async function updateCaseRecord(
  caseId: string,
  userId: string,
  caseData: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
  }
) {
  return dbQuery(async () => {
    const supabase = await createServerClient();

    // Verify user has access to this case
    const { data: caseRecord, error: fetchError } = await supabase
      .from('cases')
      .select('ca_id, assigned_to')
      .eq('id', caseId)
      .single();

    if (fetchError || !caseRecord) {
      throw new ApiError('Case not found', {
        code: ERROR_CODES.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    }

    // Check authorization
    if (
      caseRecord.ca_id !== userId &&
      caseRecord.assigned_to !== userId
    ) {
      throw new ApiError('Not authorized to update this case', {
        code: ERROR_CODES.FORBIDDEN,
        statusCode: HTTP_STATUS.FORBIDDEN,
      });
    }

    // Sanitize input
    const sanitized = sanitizeObject({
      title: caseData.title,
      description: caseData.description,
    });

    const updatePayload: any = {
      ...sanitized,
    };

    if (caseData.status !== undefined) {
      updatePayload.status = caseData.status.toLowerCase();
    }

    if (caseData.priority !== undefined) {
      const priorityMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'URGENT',
      };
      updatePayload.priority = priorityMap[caseData.priority.toLowerCase()] || 'MEDIUM';
    }

    const { data, error } = await supabase
      .from('cases')
      .update(updatePayload)
      .eq('id', caseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }, 'updateCase');
}

/**
 * Create invoice with validation
 */
export async function createInvoiceRecord(
  userId: string,
  invoiceData: {
    clientId: string;
    caseId?: string;
    amount: number;
    description: string;
    dueDate: string;
  }
) {
  return dbQuery(async () => {
    const supabase = await createServerClient();

    const sanitized = sanitizeObject({
      description: invoiceData.description,
    });

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        description: sanitized.description,
        client_id: invoiceData.clientId,
        amount: invoiceData.amount,
        due_date: invoiceData.dueDate,
        ca_id: userId,
        status: 'DRAFT',
        invoice_number: `INV-${Date.now()}`,
        metadata: invoiceData.caseId ? { caseId: invoiceData.caseId } : {},
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, 'createInvoice');
}

/**
 * Create appointment with validation
 */
export async function createAppointmentRecord(
  userId: string,
  appointmentData: {
    clientId: string;
    title: string;
    startTime: string;
    endTime: string;
    type: string;
    notes?: string;
  }
) {
  return dbQuery(async () => {
    const supabase = await createServerClient();

    const sanitized = sanitizeObject({
      title: appointmentData.title,
      notes: appointmentData.notes || '',
    });

    const typeMap: Record<string, string> = {
      'video_call': 'VIDEO_CALL',
      'in_person': 'IN_PERSON',
      'phone_call': 'PHONE_CALL',
    };
    const dbType = typeMap[appointmentData.type?.toLowerCase()] || 'VIDEO_CALL';

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        title: sanitized.title,
        notes: sanitized.notes,
        client_id: appointmentData.clientId,
        ca_id: userId,
        type: dbType as any,
        start_time: appointmentData.startTime,
        end_time: appointmentData.endTime,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }, 'createAppointment');
}

/**
 * Send message with validation
 */
export async function createMessageRecord(
  userId: string,
  messageData: {
    conversationId: string;
    content: string;
    fileUrl?: string;
  }
) {
  return dbQuery(async () => {
    const supabase = await createServerClient();

    const sanitized = sanitizeObject({
      content: messageData.content,
    });

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: sanitized.content,
        conversation_id: messageData.conversationId,
        sender_id: userId,
        message_type: messageData.fileUrl ? 'FILE' : 'TEXT',
        metadata: messageData.fileUrl ? { fileUrl: messageData.fileUrl } : {},
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', messageData.conversationId);

    return data;
  }, 'createMessage');
}

/**
 * Get paginated data
 */
export async function getPaginatedData<T>(
  table: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    searchFields?: string[];
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  } = {}
): Promise<{ data: T[]; total: number; page: number; pages: number }> {
  return dbQuery(async () => {
    const supabase = await createServerClient();
    const page = options.page || 1;
    const limit = Math.min(options.limit || 20, 100); // Max 100 per page
    const start = (page - 1) * limit;

    let query = supabase.from(table).select('*', { count: 'exact' });

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply search
    if (options.search && options.searchFields) {
      const searchConditions = options.searchFields
        .map((field) => `${field}.ilike.%${options.search}%`)
        .join(',');
      query = query.or(searchConditions);
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection !== 'desc',
      });
    }

    // Apply pagination
    query = query.range(start, start + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: (data || []) as T[],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    };
  }, `getPaginatedData(${table})`);
}
