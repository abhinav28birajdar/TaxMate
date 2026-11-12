import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

function normalizeTaskStatus(raw: string): string {
  const clean = raw.trim().toUpperCase().replace(/-/g, '_');
  const map: Record<string, string> = {
    TODO: 'TODO',
    PENDING: 'TODO',
    NOT_STARTED: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    PROGRESS: 'IN_PROGRESS',
    IN_REVIEW: 'IN_REVIEW',
    REVIEW: 'IN_REVIEW',
    ON_HOLD: 'ON_HOLD',
    BLOCKED: 'ON_HOLD',
    COMPLETED: 'COMPLETED',
    DONE: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  };
  return map[clean] || 'TODO';
}

/**
 * PATCH /api/tasks/[id]/status - Update task status (used by Kanban board)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taskId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    const { data: existingTask } = await serviceClient
      .from('tasks')
      .select('id, ca_id, client_id, assigned_to')
      .eq('id', taskId)
      .maybeSingle();

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const isOwner =
      auth.isAdmin ||
      existingTask.ca_id === auth.userId ||
      existingTask.assigned_to === auth.userId ||
      (existingTask.client_id ? await canAccessClientRecord(auth, existingTask.client_id) : false);

    if (!isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const normalizedStatus = normalizeTaskStatus(String(status));
    const updatePayload: Record<string, any> = {
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    };
    if (normalizedStatus === 'COMPLETED') {
      updatePayload.completed_at = new Date().toISOString();
    }

    const { data: updatedTask, error } = await serviceClient
      .from('tasks')
      .update(updatePayload)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      task: updatedTask,
    });
  } catch (error: any) {
    console.error('Update task status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update task status' },
      { status: 500 }
    );
  }
}
