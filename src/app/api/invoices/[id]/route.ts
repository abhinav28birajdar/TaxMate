import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const supabase = getServiceClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*, payments(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      invoice.ca_id === auth.userId ||
      invoice.created_by === auth.userId ||
      (invoice.client_id ? await canAccessClientRecord(auth, invoice.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Resolve CA & Client names cleanly
    const [caRes, caProfileRes, clientRes] = await Promise.all([
      invoice.ca_id
        ? supabase.from('users').select('id, name, email').eq('id', invoice.ca_id).maybeSingle()
        : Promise.resolve({ data: null }),
      invoice.ca_id
        ? supabase.from('ca_profiles').select('firm_name, gstin').eq('user_id', invoice.ca_id).maybeSingle()
        : Promise.resolve({ data: null }),
      invoice.client_id
        ? supabase
            .from('clients')
            .select('id, full_name, display_name, email')
            .or(`id.eq.${invoice.client_id},portal_user_id.eq.${invoice.client_id}`)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    let resolvedClientName =
      invoice.client_name ||
      clientRes.data?.display_name ||
      clientRes.data?.full_name ||
      null;
    let resolvedClientEmail = invoice.client_email || clientRes.data?.email || null;

    if (!resolvedClientName && invoice.client_id) {
      const { data: cUser } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', invoice.client_id)
        .maybeSingle();
      if (cUser) {
        resolvedClientName = cUser.name;
        resolvedClientEmail = resolvedClientEmail || cUser.email;
      }
    }

    const rawItems = Array.isArray(invoice.metadata?.items) && invoice.metadata.items.length > 0
      ? invoice.metadata.items
      : [
          {
            description: invoice.description || 'Chartered Accountancy & Advisory Services',
            quantity: 1,
            unitPrice: Number(invoice.subtotal ?? invoice.amount ?? 0),
            amount: Number(invoice.subtotal ?? invoice.amount ?? 0),
          },
        ];

    return NextResponse.json({
      success: true,
      invoice: {
        ...invoice,
        ca_name: caRes.data?.name || caProfileRes.data?.firm_name || 'Chartered Accountant',
        firm_name: caProfileRes.data?.firm_name || caRes.data?.name || 'TaxMate CA Practice',
        ca_email: caRes.data?.email || null,
        client_name: resolvedClientName || 'Client',
        client_email: resolvedClientEmail || '',
        items: rawItems,
      },
    });
  } catch (error: any) {
    console.error('Get invoice detail error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invoice' },
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
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Only CAs or admins can update invoices' }, { status: 403 });
    }

    const { id } = params;
    const supabase = getServiceClient();

    const { data: existing, error: findErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (!auth.isAdmin && existing.ca_id !== auth.userId && existing.created_by !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status) {
      updates.status = String(body.status).toUpperCase();
      if (updates.status === 'PAID') {
        updates.paid_at = new Date().toISOString();
        updates.paid_amount = existing.total_amount ?? existing.amount;
        updates.balance_due = 0;
      }
      if (updates.status === 'SENT' && !existing.issued_at) {
        updates.issued_at = new Date().toISOString();
      }
    }
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.description !== undefined) updates.description = body.description;
    if (body.dueDate !== undefined) {
      updates.due_date = body.dueDate ? new Date(body.dueDate).toISOString().split('T')[0] : null;
    }

    const { data: updated, error: updateErr } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!auth.isCAOrStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = params;
    const supabase = getServiceClient();

    const { data: existing } = await supabase
      .from('invoices')
      .select('id, ca_id, created_by, status')
      .eq('id', id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    if (!auth.isAdmin && existing.ca_id !== auth.userId && existing.created_by !== auth.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (String(existing.status || '').toUpperCase() === 'PAID') {
      return NextResponse.json({ error: 'Cannot delete a paid invoice' }, { status: 400 });
    }

    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}

