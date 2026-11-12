import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { data: msg, error: fetchError } = await supabase
      .from('messages')
      .select('*, conversations(participant_ids)')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError || !msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const participants: string[] = msg.conversations?.participant_ids || [];
    if (!auth.isAdmin && !participants.includes(auth.userId) && msg.sender_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatePayload: Record<string, any> = {};

    if (typeof body.content === 'string') {
      if (msg.sender_id !== auth.userId && !auth.isAdmin) {
        return NextResponse.json({ error: 'Only the sender can edit a message' }, { status: 403 });
      }
      const trimmed = body.content.trim();
      if (!trimmed) {
        return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
      }
      updatePayload.content = trimmed;
      updatePayload.is_edited = true;
      updatePayload.edited_at = new Date().toISOString();
    }

    if (typeof body.reaction === 'string' && body.reaction.trim()) {
      const emoji = body.reaction.trim().slice(0, 8);
      const reactions = { ...(msg.reactions || {}) };
      reactions[emoji] = Number(reactions[emoji] || 0) + 1;
      updatePayload.reactions = reactions;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from('messages')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: updated });
  } catch (error: any) {
    console.error('Message PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { data: msg } = await supabase
      .from('messages')
      .select('id, sender_id')
      .eq('id', params.id)
      .maybeSingle();

    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (!auth.isAdmin && msg.sender_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    console.error('Message DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete message' },
      { status: 500 }
    );
  }
}

