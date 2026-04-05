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
      .select('id, email, name, role, avatarUrl, status')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new ApiError('User not found', {
        code: ERROR_CODES.NOT_FOUND,
        statusCode: HTTP_STATUS.NOT_FOUND,
      });
    }

    return data;
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

    // Sanitize input
    const sanitized = sanitizeObject({
      title: caseData.title,
      description: caseData.description,
      clientId: caseData.clientId,
      priority: caseData.priority,
    });

    const { data, error } = await supabase
      .from('cases')
      .insert({
        ...sanitized,
        assignedCaId: caseData.assignedCaId,
        createdBy: userId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
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
      .select('createdBy, assignedCaId')
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
      caseRecord.createdBy !== userId &&
      caseRecord.assignedCaId !== userId
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
      status: caseData.status,
      priority: caseData.priority,
    });

    const { data, error } = await supabase
      .from('cases')
      .update({
        ...sanitized,
        updatedAt: new Date().toISOString(),
      })
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
        ...sanitized,
        clientId: invoiceData.clientId,
        caseId: invoiceData.caseId,
        amount: invoiceData.amount,
        dueDate: invoiceData.dueDate,
        createdBy: userId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
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
      type: appointmentData.type,
      notes: appointmentData.notes || '',
    });

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        ...sanitized,
        clientId: appointmentData.clientId,
        caId: userId,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        createdAt: new Date().toISOString(),
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
        ...sanitized,
        conversationId: messageData.conversationId,
        senderId: userId,
        fileUrl: messageData.fileUrl,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last message timestamp
    await supabase
      .from('conversations')
      .update({ lastMessageAt: new Date().toISOString() })
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
