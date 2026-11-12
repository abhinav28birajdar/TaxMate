import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getSessionUser,
  ServerAuthContext,
} from '@/lib/api/server-auth';

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

function normalizeTaskPriority(raw: string): string {
  const clean = raw.trim().toUpperCase();
  return ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(clean) ? clean : 'MEDIUM';
}

async function authorizeTaskAccess(auth: ServerAuthContext, task: any): Promise<boolean> {
  if (auth.isAdmin) return true;
  if (task.ca_id === auth.userId || task.assigned_to === auth.userId) return true;
  if (task.client_id) {
    return canAccessClientRecord(auth, task.client_id);
  }
  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: task, error } = await serviceClient
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!(await authorizeTaskAccess(auth, task))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: existingTask } = await serviceClient
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!(await authorizeTaskAccess(auth, existingTask))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) {
      updates.status = normalizeTaskStatus(String(body.status));
      if (updates.status === 'COMPLETED') {
        updates.completed_at = new Date().toISOString();
      }
    }
    if (body.priority !== undefined) updates.priority = normalizeTaskPriority(String(body.priority));
    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.due_date !== undefined) updates.due_date = body.due_date;
    if (body.assignedTo !== undefined) updates.assigned_to = body.assignedTo;
    if (Array.isArray(body.tags)) updates.tags = body.tags;
    if (body.metadata && typeof body.metadata === 'object') {
      updates.metadata = {
        ...((existingTask.metadata as Record<string, any>) || {}),
        ...body.metadata,
      };
    }

    const { data: updatedTask, error } = await serviceClient
      .from('tasks')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: existingTask } = await serviceClient
      .from('tasks')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!(await authorizeTaskAccess(auth, existingTask)) || (!auth.isCAOrStaff && !auth.isAdmin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await serviceClient
      .from('tasks')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
