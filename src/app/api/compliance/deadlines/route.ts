/**
 * POST /api/compliance/deadlines
 * Get or create compliance deadlines
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@lib/supabase/server';
import ComplianceService from '@/lib/services/compliance-service';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = req.nextUrl.searchParams.get('status');
    const deadlineType = req.nextUrl.searchParams.get('type');

    const complianceService = ComplianceService;
    const deadlines = await complianceService.getDeadlines(user.id, {
      status: status || undefined,
      deadline_type: deadlineType || undefined,
    });

    return NextResponse.json({ data: deadlines });
  } catch (error: any) {
    console.error('Error fetching compliance deadlines:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch deadlines' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/deadlines
 * Create a new compliance deadline
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, deadlineType, dueDate, clientId, caseId, reminderDays } = body;

    if (!title || !deadlineType || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const complianceService = ComplianceService;
    const deadline = await complianceService.createDeadline({
      title,
      deadline_type: deadlineType,
      due_date: dueDate,
      client_id: clientId,
      case_id: caseId,
      status: 'pending',
      is_automated: false,
      reminder_days: reminderDays || [7, 3, 1],
    });

    return NextResponse.json({ data: deadline }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating compliance deadline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create deadline' },
      { status: 500 }
    );
  }
}
