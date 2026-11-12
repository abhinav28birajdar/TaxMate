import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

const VALID_APPOINTMENT_STATUSES = new Set([
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'COMPLETED',
  'NO_SHOW',
]);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServiceClient();
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (error || !appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      appointment.ca_id === auth.userId ||
      appointment.created_by === auth.userId ||
      (appointment.client_id ? await canAccessClientRecord(auth, appointment.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error('Appointment GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load appointment' },
      { status: 500 }
    );
  }
}

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
    const { data: existing, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      existing.ca_id === auth.userId ||
      existing.created_by === auth.userId ||
      (existing.client_id ? await canAccessClientRecord(auth, existing.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.status === 'string') {
      const normalized = body.status.toUpperCase().replace(/[\s-]/g, '_');
      if (!VALID_APPOINTMENT_STATUSES.has(normalized)) {
        return NextResponse.json({ error: 'Invalid appointment status' }, { status: 400 });
      }
      updatePayload.status = normalized;
    }

    if (typeof body.notes === 'string') {
      updatePayload.notes = body.notes.slice(0, 5000);
    }

    if (typeof body.meetingLink === 'string') {
      updatePayload.meeting_link = body.meetingLink.slice(0, 500);
    }

    if (typeof body.startTime === 'string') {
      const parsedStart = new Date(body.startTime);
      if (Number.isNaN(parsedStart.getTime())) {
        return NextResponse.json({ error: 'Invalid startTime' }, { status: 400 });
      }
      updatePayload.start_time = parsedStart.toISOString();
    }

    if (typeof body.endTime === 'string') {
      const parsedEnd = new Date(body.endTime);
      if (Number.isNaN(parsedEnd.getTime())) {
        return NextResponse.json({ error: 'Invalid endTime' }, { status: 400 });
      }
      updatePayload.end_time = parsedEnd.toISOString();
    }

    if (body.metadata && typeof body.metadata === 'object') {
      updatePayload.metadata = {
        ...(existing.metadata && typeof existing.metadata === 'object' ? existing.metadata : {}),
        ...body.metadata,
      };
    }

    const { data: updated, error: updateError } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    console.error('Appointment PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update appointment' },
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
    const { data: existing } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      existing.ca_id === auth.userId ||
      existing.created_by === auth.userId ||
      (existing.client_id ? await canAccessClientRecord(auth, existing.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: cancelled, error } = await supabase
      .from('appointments')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, appointment: cancelled });
  } catch (error: any) {
    console.error('Appointment DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}

