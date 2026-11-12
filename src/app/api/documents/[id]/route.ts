import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, createSignedStorageUrl, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: doc, error } = await serviceClient
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      doc.user_id === auth.userId ||
      doc.uploaded_by === auth.userId ||
      doc.ca_id === auth.userId ||
      (doc.client_id ? await canAccessClientRecord(auth, doc.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pathOrUrl = doc.file_path || doc.metadata?.path || doc.metadata?.file_key || doc.file_url;
    const signedUrl = pathOrUrl ? await createSignedStorageUrl('documents', pathOrUrl, 3600) : null;

    let clientName = 'Client';
    let uploaderName = 'TaxMate User';
    if (doc.client_id) {
      const { data: c } = await serviceClient
        .from('clients')
        .select('full_name, display_name')
        .or(`id.eq.${doc.client_id},portal_user_id.eq.${doc.client_id}`)
        .maybeSingle();
      if (c) clientName = c.display_name || c.full_name || clientName;
    }
    if (doc.uploaded_by || doc.user_id) {
      const { data: u } = await serviceClient
        .from('users')
        .select('name')
        .eq('id', doc.uploaded_by || doc.user_id)
        .maybeSingle();
      if (u?.name) uploaderName = u.name;
    }

    return NextResponse.json({
      success: true,
      document: {
        ...doc,
        signed_url: signedUrl || doc.file_url || null,
        client_name: clientName,
        uploaded_by_name: uploaderName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document' },
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

    const serviceClient = getServiceClient();
    const { data: doc, error: fetchError } = await serviceClient
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      doc.user_id === auth.userId ||
      doc.uploaded_by === auth.userId ||
      doc.ca_id === auth.userId ||
      (doc.client_id ? await canAccessClientRecord(auth, doc.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const existingMeta = doc.metadata && typeof doc.metadata === 'object' ? doc.metadata : {};
    const existingHistory = Array.isArray(existingMeta.history) ? existingMeta.history : [];

    const nextName = typeof body.name === 'string' && body.name.trim()
      ? body.name.trim()
      : doc.file_name || doc.name;
    const nextCategory = typeof body.category === 'string' && body.category.trim()
      ? body.category.trim()
      : doc.category || doc.document_type || 'Other Documents';
    const nextAY = typeof body.financialYear === 'string'
      ? body.financialYear.trim()
      : doc.financial_year;

    const historyNote =
      typeof body.historyAction === 'string' && body.historyAction.trim()
        ? body.historyAction.trim()
        : `Updated metadata (${nextName})`;

    const updatePayload: Record<string, any> = {
      name: nextName,
      file_name: nextName,
      category: nextCategory,
      document_type: nextCategory,
      financial_year: nextAY,
      updated_at: new Date().toISOString(),
      metadata: {
        ...existingMeta,
        ...(body.lifecycleStatus ? { lifecycleStatus: body.lifecycleStatus } : {}),
        ...(body.rejectionReason !== undefined ? { rejectionReason: body.rejectionReason } : {}),
        history: [
          ...existingHistory,
          {
            action: historyNote,
            timestamp: new Date().toISOString(),
            user: auth.email || auth.userId,
          },
        ],
      },
    };

    if (typeof body.status === 'string') {
      updatePayload.status = body.status;
    }
    if (typeof body.isSharedWithCa === 'boolean') {
      updatePayload.is_shared_with_ca = body.isSharedWithCa;
    }
    if (typeof body.isSharedWithClient === 'boolean') {
      updatePayload.is_shared_with_client = body.isSharedWithClient;
    }

    const { data: updated, error: updateError } = await serviceClient
      .from('documents')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const pathOrUrl = updated.file_path || updated.file_url;
    const signedUrl = pathOrUrl ? await createSignedStorageUrl('documents', pathOrUrl, 3600) : null;

    return NextResponse.json({
      success: true,
      document: {
        ...updated,
        signed_url: signedUrl || updated.file_url,
      },
    });
  } catch (error: any) {
    console.error('Document PATCH error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
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

    const serviceClient = getServiceClient();
    const { data: doc, error: fetchError } = await serviceClient
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const authorized =
      auth.isAdmin ||
      doc.user_id === auth.userId ||
      doc.uploaded_by === auth.userId ||
      doc.ca_id === auth.userId ||
      (doc.client_id ? await canAccessClientRecord(auth, doc.client_id) : false);

    if (!authorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const storagePath = doc.file_path || doc.metadata?.path || doc.metadata?.file_key;
    if (storagePath && typeof storagePath === 'string' && !storagePath.startsWith('http')) {
      await serviceClient.storage.from('documents').remove([storagePath]).catch(() => null);
    }

    const { error: deleteError } = await serviceClient
      .from('documents')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true, id: params.id });
  } catch (error: any) {
    console.error('Document DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}

