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
          statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
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
        conversationId: result.conversation_id,
        senderId: result.sender_id,
        replyToId: result.reply_to_id,
        messageType: result.message_type,
        attachments: result.attachments || [],
        reactions: result.reactions || {},
        isEdited: result.is_edited || false,
        content: result.content,
        createdAt: result.created_at,
        message: result,
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
      const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
      const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
      const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
      const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 50;

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
        .select('participant_ids, ca_id, client_id')
        .eq('id', conversationId)
        .single();

      if (convError || !conversation) {
        throw new ApiError('Conversation not found', {
          code: 'NOT_FOUND',
          statusCode: HTTP_STATUS.NOT_FOUND,
        });
      }

      const { getResolvedClientIdsForUser } = await import('@/lib/api/server-auth');
      const resolvedClientIds = await getResolvedClientIdsForUser(user.sub);
      const isAuthorized =
        conversation.participant_ids?.includes(user.sub) ||
        conversation.ca_id === user.sub ||
        (conversation.client_id && resolvedClientIds.includes(conversation.client_id));

      if (!isAuthorized) {
        throw new ApiError('Not authorized to view this conversation', {
          code: 'FORBIDDEN',
          statusCode: HTTP_STATUS.FORBIDDEN,
        });
      }

      // Fetch non-deleted messages
      const { data, count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;

      // Persist read state through the normalized read-receipts table.
      const { data: unreadMessages, error: unreadError } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .neq('sender_id', user.sub);

      if (unreadError) throw unreadError;

      let toMarkRead = (unreadMessages || []).map(({ id }) => id);
      if (toMarkRead.length > 0) {
        const { data: existingReceipts, error: receiptsError } = await supabase
          .from('message_read_receipts')
          .select('message_id')
          .eq('user_id', user.sub)
          .in('message_id', toMarkRead);

        if (receiptsError) throw receiptsError;

        const readMessageIds = new Set((existingReceipts || []).map(({ message_id }) => message_id));
        toMarkRead = toMarkRead.filter((id) => !readMessageIds.has(id));
      }

      if (toMarkRead.length > 0) {
        const { error: receiptError } = await supabase
          .from('message_read_receipts')
          .upsert(
            toMarkRead.map((id) => ({
              message_id: id,
              user_id: user.sub,
            })),
            { onConflict: 'message_id,user_id' }
          );

        if (receiptError) throw receiptError;
      }

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
