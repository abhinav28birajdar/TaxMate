// ============================================
// ANALYTICS & REPORTING API ENDPOINTS
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// GET /api/analytics/dashboard - Get CA dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caId = searchParams.get('caId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!caId) {
      return NextResponse.json(
        { success: false, error: 'CA ID required' },
        { status: 400 }
      );
    }

    // Get total clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id', { count: 'exact' })
      .eq('ca_id', caId);

    // Get total revenue
    const { data: invoices } = await supabase
      .from('invoices')
      .select('amount')
      .eq('ca_id', caId)
      .eq('status', 'paid');

    // Get pending tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id', { count: 'exact' })
      .eq('ca_id', caId)
      .in('status', ['pending', 'in-progress']);

    // Get pending documents
    const { data: documents } = await supabase
      .from('documents')
      .select('id', { count: 'exact' })
      .eq('ca_id', caId);

    // Get GST filings due
    const { data: gstDue } = await supabase
      .from('gst_records')
      .select('id', { count: 'exact' })
      .eq('ca_id', caId)
      .eq('status', 'not-started')
      .lt('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalClients: clients?.length || 0,
        totalRevenue,
        pendingTasks: tasks?.length || 0,
        totalDocuments: documents?.length || 0,
        gstDueSoon: gstDue?.length || 0,
        averageInvoiceValue: clients && clients.length > 0 ? totalRevenue / clients.length : 0,
      },
    });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
