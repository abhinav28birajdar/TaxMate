import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '../../../lib/backend/supabase';
import { getResolvedClientIdsForUser, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

// GET - Get dashboard data
export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();

    if (auth.role === 'CLIENT') {
      const clientIds = await getResolvedClientIdsForUser(auth.userId);
      const [{ data: tasks }, { data: invoices }, { data: documents }] = await Promise.all([
        supabase.from('tasks').select('id, status').in('client_id', clientIds),
        supabase.from('invoices').select('id, status, amount, total_amount, total').in('client_id', clientIds),
        supabase.from('documents').select('id, expiry_date').or(`user_id.eq.${auth.userId},client_id.in.(${clientIds.join(',')})`),
      ]);

      const metrics = {
        totalClients: 0,
        activeClients: 0,
        pendingTasks: (tasks || []).filter((t: any) => !['COMPLETED', 'CANCELLED'].includes(String(t.status || '').toUpperCase())).length,
        completedTasks: (tasks || []).filter((t: any) => String(t.status || '').toUpperCase() === 'COMPLETED').length,
        totalRevenue: (invoices || []).reduce((sum: number, inv: any) => sum + Number(inv.total_amount ?? inv.amount ?? inv.total ?? 0), 0),
        unpaidInvoices: (invoices || []).filter((inv: any) =>
          ['DRAFT', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(String(inv.status || '').toUpperCase())
        ).length,
        expiredDocuments: (documents || []).filter((d: any) => d.expiry_date && new Date(d.expiry_date) < new Date()).length,
      };

      return NextResponse.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
      });
    }

    const caId = auth.userId;

    // Get metrics in parallel for CA / Admin
    const [
      { data: clients },
      { data: tasks },
      { data: invoices },
      { data: documents },
    ] = await Promise.all([
      auth.isAdmin
        ? supabase.from('clients').select('id, status')
        : supabase.from('clients').select('id, status').eq('assigned_ca_id', caId),
      auth.isAdmin
        ? supabase.from('tasks').select('id, status')
        : supabase.from('tasks').select('id, status').or(`ca_id.eq.${caId},assigned_to.eq.${caId}`),
      auth.isAdmin
        ? supabase.from('invoices').select('id, status, amount, total_amount, total')
        : supabase.from('invoices').select('id, status, amount, total_amount, total').eq('ca_id', caId),
      auth.isAdmin
        ? supabase.from('documents').select('id, expiry_date')
        : supabase.from('documents').select('id, expiry_date').or(`ca_id.eq.${caId},user_id.eq.${caId}`),
    ]);

    const metrics = {
      totalClients: clients?.length || 0,
      activeClients: (clients || []).filter((c: any) => String(c.status || '').toLowerCase() === 'active').length,
      pendingTasks: (tasks || []).filter((t: any) => !['COMPLETED', 'CANCELLED'].includes(String(t.status || '').toUpperCase())).length,
      completedTasks: (tasks || []).filter((t: any) => String(t.status || '').toUpperCase() === 'COMPLETED').length,
      totalRevenue: (invoices || []).reduce((sum: number, inv: any) => sum + Number(inv.total_amount ?? inv.amount ?? inv.total ?? 0), 0),
      unpaidInvoices: (invoices || []).filter((inv: any) =>
        ['DRAFT', 'SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(String(inv.status || '').toUpperCase())
      ).length,
      expiredDocuments:
        (documents || []).filter((d: any) => d.expiry_date && new Date(d.expiry_date) < new Date())
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
