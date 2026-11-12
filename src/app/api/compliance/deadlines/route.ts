import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get('status');
    const deadlineType = req.nextUrl.searchParams.get('type');
    const clientId = req.nextUrl.searchParams.get('clientId');

    const supabase = getServiceClient();
    let query = supabase
      .from('compliance_deadlines')
      .select('*')
      .order('due_date', { ascending: true });

    if (clientId) {
      const allowed = await canAccessClientRecord(auth, clientId);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query = query.eq('client_id', clientId);
    } else if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(auth.userId);
        query = query.in('client_id', clientIds);
      } else {
        query = query.or(`ca_id.eq.${auth.userId},client_id.eq.${auth.userId}`);
      }
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (deadlineType && deadlineType !== 'all') {
      query = query.eq('deadline_type', deadlineType);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching compliance deadlines:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deadlines' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, deadlineType, dueDate, clientId, caseId, reminderDays, description } = body;

    if (!title || !deadlineType || !dueDate) {
      return NextResponse.json(
        { error: 'title, deadlineType, and dueDate are required' },
        { status: 400 }
      );
    }

    const targetClientId = clientId || auth.userId;
    const allowed = await canAccessClientRecord(auth, targetClientId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('compliance_deadlines')
      .insert([
        {
          title,
          description: description || null,
          deadline_type: deadlineType,
          compliance_type: deadlineType,
          due_date: dueDate,
          client_id: targetClientId,
          ca_id: auth.isCAOrStaff ? auth.userId : null,
          case_id: caseId || null,
          status: 'pending',
          is_automated: false,
          reminder_days: reminderDays || [7, 3, 1],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating compliance deadline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create deadline' },
      { status: 500 }
    );
  }
}
