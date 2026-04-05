// ============================================
// COMPLIANCE MANAGEMENT API ENDPOINTS
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ComplianceService } from '@/lib/enhanced-services';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// GET /api/compliance - Get all compliance items
export async function GET(request: NextRequest) {
  try {
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
    if (status) query = query.eq('status', status);
    if (overdueOnly) {
      query = query
        .lt('due_date', new Date().toISOString())
        .neq('status', 'completed');
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
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
    const body = await request.json();

    const { data, error } = await supabase
      .from('compliance_items')
      .insert([
        {
          ca_id: body.caId,
          client_id: body.clientId,
          title: body.title,
          description: body.description,
          type: body.type,
          due_date: body.dueDate,
          status: 'not-started',
          priority: body.priority || 'medium',
          frequency: body.frequency || 'once',
          checklist: body.checklist || [],
          documents: body.documents || [],
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Compliance POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance item' },
      { status: 500 }
    );
  }
}

// PUT /api/compliance/:id - Update compliance item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    const { data, error } = await supabase
      .from('compliance_items')
      .update({
        status: body.status,
        priority: body.priority,
        notes: body.notes,
        documents: body.documents,
        checklist: body.checklist,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Compliance PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update compliance item' },
      { status: 500 }
    );
  }
}

// DELETE /api/compliance/:id - Delete compliance item
export async function DELETE(request: NextRequest) {
  try {
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

// GET /api/compliance/dashboard - Get compliance dashboard
export async function getComplianceDashboard(caId: string) {
  try {
    const { data: items } = await supabase
      .from('compliance_items')
      .select('*')
      .eq('ca_id', caId);

    const total = items?.length || 0;
    const completed = items?.filter(i => i.status === 'completed').length || 0;
    const overdue = items?.filter(i => 
      i.status !== 'completed' && new Date(i.due_date) < new Date()
    ).length || 0;
    const dueSoon = items?.filter(i =>
      i.status !== 'completed' &&
      new Date(i.due_date) > new Date() &&
      new Date(i.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length || 0;

    return {
      totalItems: total,
      completedItems: completed,
      overdueItems: overdue,
      dueSoonItems: dueSoon,
      complianceScore: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  } catch (error) {
    console.error('Dashboard error:', error);
    return {};
  }
}
