import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

function normalizeTaskStatus(raw?: string | null): string {
  const clean = String(raw || 'TODO').trim().toUpperCase().replace(/-/g, '_');
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

function normalizeTaskPriority(raw?: string | null): string {
  const clean = String(raw || 'MEDIUM').trim().toUpperCase();
  if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(clean)) return clean;
  return 'MEDIUM';
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const clientId = searchParams.get('clientId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50') || 50));

    if (clientId) {
      const allowed = await canAccessClientRecord(auth, clientId);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const serviceClient = getServiceClient();
    let query = serviceClient
      .from('tasks')
      .select('*', { count: 'exact' });

    if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(auth.userId);
        query = query.in('client_id', clientIds);
      } else {
        query = query.or(`ca_id.eq.${auth.userId},assigned_to.eq.${auth.userId}`);
      }
    }

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    if (status && status !== 'all') {
      const normalized = normalizeTaskStatus(status);
      query = query.in('status', [normalized, status.toLowerCase(), status.toUpperCase()]);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', normalizeTaskPriority(priority));
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: tasks, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const clientIds = Array.from(new Set((tasks || []).map((t: any) => t.client_id).filter(Boolean)));
    const assigneeIds = Array.from(new Set((tasks || []).flatMap((t: any) => [t.assigned_to, t.ca_id]).filter(Boolean)));
    const clientNameMap = new Map<string, string>();
    const userNameMap = new Map<string, string>();

    if (clientIds.length > 0) {
      const [{ data: clientRows }, { data: clientUsers }] = await Promise.all([
        serviceClient.from('clients').select('id, full_name, display_name').in('id', clientIds),
        serviceClient.from('users').select('id, name').in('id', clientIds),
      ]);
      for (const c of clientRows || []) clientNameMap.set(c.id, c.display_name || c.full_name);
      for (const u of clientUsers || []) if (!clientNameMap.has(u.id)) clientNameMap.set(u.id, u.name);
    }

    if (assigneeIds.length > 0) {
      const { data: users } = await serviceClient.from('users').select('id, name').in('id', assigneeIds);
      for (const u of users || []) userNameMap.set(u.id, u.name);
    }

    const enrichedTasks = (tasks || []).map((t: any) => ({
      ...t,
      client_name: t.client_id ? clientNameMap.get(t.client_id) || t.metadata?.clientName || 'Client' : t.metadata?.clientName || 'Self',
      assigned_to_name: t.assigned_to ? userNameMap.get(t.assigned_to) || 'CA Partner' : (t.ca_id ? userNameMap.get(t.ca_id) || 'CA Partner' : 'Self'),
    }));

    return NextResponse.json({
      tasks: enrichedTasks,
      total: count || enrichedTasks.length || 0,
      page,
      limit,
      success: true,
    });
  } catch (error: any) {
    console.error('Tasks GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tasks' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    const requestedClientId = body.clientId || body.client_id;
    if (requestedClientId) {
      const allowed = await canAccessClientRecord(auth, requestedClientId);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const serviceClient = getServiceClient();
    const effectiveCaId = auth.isCAOrStaff
      ? (body.caId || auth.userId)
      : (body.caId || auth.userId);

    if (!auth.isAdmin && auth.isCAOrStaff && effectiveCaId !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: task, error } = await serviceClient
      .from('tasks')
      .insert({
        ca_id: effectiveCaId,
        client_id: requestedClientId || auth.userId,
        assigned_to: body.assignedTo || body.assigned_to || effectiveCaId,
        title,
        description: body.description || '',
        status: normalizeTaskStatus(body.status),
        priority: normalizeTaskPriority(body.priority),
        due_date: body.dueDate || body.due_date || null,
        metadata: body.metadata && typeof body.metadata === 'object' ? body.metadata : {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, task },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Tasks POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create task' },
      { status: 400 }
    );
  }
}
