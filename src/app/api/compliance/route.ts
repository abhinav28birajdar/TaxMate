import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '../../../lib/backend/supabase';

// GET /api/compliance - Get all compliance items
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const caId = searchParams.get('caId');
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const overdueOnly = searchParams.get('overdueOnly') === 'true';

    let query = supabase
      .from('compliance_items')
      .select('*')
      .order('due_date', { ascending: true });

    if (caId) query = query.eq('ca_id', caId);
    if (clientId) query = query.eq('client_id', clientId);
    if (status) query = query.eq('status', status.toLowerCase());
    if (overdueOnly) {
      query = query
        .lt('due_date', new Date().toISOString().split('T')[0])
        .neq('status', 'completed');
    }

    const { data, error } = await query;

    if (error) throw error;

    // Format for caller compatibility
    const items = (data || []).map((item) => ({
      ...item,
      type: item.compliance_type,
      priority: item.priority?.toLowerCase(),
      checklist: item.metadata?.checklist || item.document_checklist || [],
      documents: item.metadata?.documents || [],
      frequency: item.metadata?.frequency || 'once',
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Compliance GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance items' },
      { status: 500 }
    );
  }
}

// POST /api/compliance - Create compliance item
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();

    const priorityMap: Record<string, string> = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'urgent': 'URGENT',
    };
    const dbPriority = priorityMap[body.priority?.toLowerCase()] || 'MEDIUM';

    const { data, error } = await supabase
      .from('compliance_items')
      .insert([
        {
          ca_id: body.caId,
          client_id: body.clientId,
          title: body.title,
          description: body.description,
          compliance_type: body.type || 'GST',
          due_date: body.dueDate,
          status: 'not-started',
          priority: dbPriority as any,
          metadata: {
            frequency: body.frequency || 'once',
            checklist: body.checklist || [],
            documents: body.documents || [],
          },
        },
      ])
      .select();

    if (error || !data) throw error || new Error('No data returned');

    const item = data[0];
    const record = {
      ...item,
      type: item.compliance_type,
      priority: item.priority?.toLowerCase(),
      checklist: item.metadata?.checklist || [],
      documents: item.metadata?.documents || [],
      frequency: item.metadata?.frequency || 'once',
    };

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Compliance POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance item' },
      { status: 500 }
    );
  }
}

// PUT /api/compliance - Update compliance item
export async function PUT(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();
    const { id } = body;

    const priorityMap: Record<string, string> = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'urgent': 'URGENT',
    };
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.priority !== undefined) updatePayload.priority = priorityMap[body.priority?.toLowerCase()] || 'MEDIUM';
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    if (body.documents !== undefined || body.checklist !== undefined) {
      updatePayload.metadata = {
        checklist: body.checklist || [],
        documents: body.documents || [],
      };
    }

    const { data, error } = await supabase
      .from('compliance_items')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error || !data) throw error || new Error('Failed to update');

    const item = data[0];
    const record = {
      ...item,
      type: item.compliance_type,
      priority: item.priority?.toLowerCase(),
      checklist: item.metadata?.checklist || [],
      documents: item.metadata?.documents || [],
    };

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Compliance PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update compliance item' },
      { status: 500 }
    );
  }
}

// DELETE /api/compliance
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const body = await request.json();
    const { id } = body;

    const { error } = await supabase
      .from('compliance_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Compliance DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete compliance item' },
      { status: 500 }
    );
  }
}
