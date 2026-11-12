import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { data: entries, error } = await supabase
      .from('time_entries')
      .select('*')
      .eq('user_id', auth.userId)
      .order('start_time', { ascending: false })
      .limit(200);

    if (error) throw error;

    const clientIds = Array.from(
      new Set((entries || []).map((e: any) => e.client_id).filter(Boolean))
    );
    const taskIds = Array.from(
      new Set((entries || []).map((e: any) => e.task_id).filter(Boolean))
    );

    const clientMap = new Map<string, string>();
    const taskMap = new Map<string, string>();

    if (clientIds.length > 0) {
      const { data: clients } = await supabase
        .from('clients')
        .select('id, full_name, display_name')
        .in('id', clientIds);
      for (const c of clients || []) {
        clientMap.set(c.id, c.display_name || c.full_name || 'Client');
      }
    }

    if (taskIds.length > 0) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title')
        .in('id', taskIds);
      for (const t of tasks || []) {
        taskMap.set(t.id, t.title || 'Task');
      }
    }

    const enriched = (entries || []).map((entry: any) => ({
      ...entry,
      clients: { full_name: clientMap.get(entry.client_id) || 'General Practice' },
      tasks: { title: taskMap.get(entry.task_id) || 'General Advisory' },
    }));

    return NextResponse.json({ success: true, entries: enriched });
  } catch (error: any) {
    console.error('Time entries GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch time entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Only CAs or staff can log time' }, { status: 403 });
    }

    const body = await request.json();
    const durationMinutes = Math.max(1, Math.round(Number(body.durationMinutes || body.duration_minutes || 0)));
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return NextResponse.json({ error: 'Valid duration is required' }, { status: 400 });
    }

    const clientId = body.clientId || body.client_id || null;
    if (clientId) {
      const allowed = await canAccessClientRecord(auth, clientId);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden for target client' }, { status: 403 });
      }
    }

    const isBillable = body.isBillable !== undefined ? Boolean(body.isBillable) : true;
    const hourlyRate = Number(body.hourlyRate ?? (isBillable ? 1500 : 0));
    const amount = isBillable ? Math.round((durationMinutes / 60) * hourlyRate) : 0;

    const startTime = body.startTime ? new Date(body.startTime) : new Date();
    const endTime = body.endTime
      ? new Date(body.endTime)
      : new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const supabase = getServiceClient();
    const { data: created, error } = await supabase
      .from('time_entries')
      .insert({
        user_id: auth.userId,
        client_id: clientId,
        task_id: body.taskId || body.task_id || null,
        case_id: body.caseId || body.case_id || null,
        description: String(body.description || '').trim() || 'Consultation / Tax Preparation',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        work_date: startTime.toISOString().split('T')[0],
        duration_minutes: durationMinutes,
        is_billable: isBillable,
        hourly_rate: hourlyRate,
        amount,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, entry: created }, { status: 201 });
  } catch (error: any) {
    console.error('Time entries POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log time entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Time entry id is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: existing } = await supabase
      .from('time_entries')
      .select('id, user_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    if (!auth.isAdmin && existing.user_id !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
