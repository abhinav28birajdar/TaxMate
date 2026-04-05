/**
 * POST /api/messages - Send a message
 * Protected route: Requires authentication
 */

import { NextRequest } from 'next/server';
import { handleApiRequest, checkRateLimit } from '@/lib/api/auth-middleware';
import { validateInput, RequestSchemas } from '@/lib/api/validation';
import { createMessageRecord } from '@/lib/api/db-operations';
import { ApiError, HTTP_STATUS } from '@/lib/api/response';

export async function POST(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      // Stricter rate limiting for messages (prevent spam)
      if (!checkRateLimit(user.sub, 100, 60000)) {
        throw new ApiError('Message rate limit exceeded. Please wait before sending another message.', {
          code: 'RATE_LIMIT',
          statusCode: HTTP_STATUS.INTERNAL_ERROR,
        });
      }

      // Parse and validate
      const body = await request.json();
      const validation = validateInput(body, RequestSchemas.sendMessage);

      if (!validation.success) {
        throw new ApiError('Validation failed', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
          details: validation.errors,
        });
      }

      // Create message
      const result = await createMessageRecord(user.sub, validation.data);

      return {
        id: result.id,
        conversationId: result.conversationId,
        senderId: result.senderId,
        content: result.content,
        createdAt: result.createdAt,
      };
    },
    {
      method: 'POST',
      requireAuth: true,
    }
  );
}

/**
 * GET /api/messages - Get conversation messages
 */
export async function GET(request: NextRequest) {
  return handleApiRequest(
    request,
    async (req, user) => {
      const { searchParams } = new URL(req.url);
      const conversationId = searchParams.get('conversationId');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

      if (!conversationId) {
        throw new ApiError('Conversation ID is required', {
          code: 'VALIDATION_ERROR',
          statusCode: HTTP_STATUS.BAD_REQUEST,
        });
      }

      const { createClient } = await import('@/utils/supabase/server');
      const supabase = await createClient();

      // Verify user is part of conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('participant_ids')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        throw new ApiError('Conversation not found', {
          code: 'NOT_FOUND',
          statusCode: HTTP_STATUS.NOT_FOUND,
        });
      }

      if (!conversation.participant_ids?.includes(user.sub)) {
        throw new ApiError('Not authorized to view this conversation', {
          code: 'FORBIDDEN',
          statusCode: HTTP_STATUS.FORBIDDEN,
        });
      }

      // Fetch messages
      const { data, count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversationId', conversationId)
        .order('createdAt', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ readAt: new Date().toISOString() })
        .eq('conversationId', conversationId)
        .neq('senderId', user.sub)
        .is('readAt', null);

      return {
        messages: (data || []).reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    },
    {
      method: 'GET',
      requireAuth: true,
    }
  );
}
