import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// GET - Get dashboard data
export async function GET(request: NextRequest) {
  try {
    const caId = request.headers.get('x-ca-id');

    if (!caId) {
      return NextResponse.json(
        { success: false, error: 'CA ID required' },
        { status: 400 }
      );
    }

    // Get metrics in parallel
    const [
      { data: clients },
      { data: tasks },
      { data: invoices },
      { data: documents },
    ] = await Promise.all([
      supabase
        .from('clients')
        .select('id, status')
        .eq('ca_id', caId),
      supabase
        .from('tasks')
        .select('id, status')
        .eq('ca_id', caId),
      supabase
        .from('invoices')
        .select('id, status, total')
        .eq('ca_id', caId),
      supabase
        .from('documents')
        .select('id, expiry_date')
        .eq('ca_id', caId),
    ]);

    const metrics = {
      totalClients: clients?.length || 0,
      activeClients: clients?.filter((c: any) => c.status === 'active').length || 0,
      pendingTasks: tasks?.filter((t: any) => t.status === 'pending').length || 0,
      completedTasks: tasks?.filter((t: any) => t.status === 'completed').length || 0,
      totalRevenue: invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0,
      unpaidInvoices:
        invoices?.filter((inv: any) =>
          ['draft', 'sent', 'overdue'].includes(inv.status)
        ).length || 0,
      expiredDocuments:
        documents?.filter((d: any) => d.expiry_date && new Date(d.expiry_date) < new Date())
          .length || 0,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
