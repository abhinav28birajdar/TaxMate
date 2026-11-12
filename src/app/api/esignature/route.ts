import { NextRequest, NextResponse } from 'next/server';
import { ESignatureService } from '@/lib/services/esignature-service';
import { getServiceClient } from '@/lib/backend/supabase';
import { canAccessClientRecord, getSessionUser } from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/esignature - Create an e-signature request
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { documentId, signerId, title, message } = body;

    if (!documentId || !signerId || !title) {
      return NextResponse.json(
        { error: 'documentId, signerId, and title are required' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    const { data: doc, error: docError } = await serviceClient
      .from('documents')
      .select('id, user_id, uploaded_by, ca_id, client_id')
      .eq('id', documentId)
      .maybeSingle();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const canRequest =
      auth.isAdmin ||
      doc.user_id === auth.userId ||
      doc.uploaded_by === auth.userId ||
      doc.ca_id === auth.userId ||
      (doc.client_id && (await canAccessClientRecord(auth, doc.client_id)));

    if (!canRequest) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const esignatureService = new ESignatureService(serviceClient);
    const created = await esignatureService.createSignatureRequest(
      documentId,
      auth.userId,
      signerId,
      title,
      message
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating signature request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create signature request' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/esignature - Get signature requests for current user
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get('type') || 'pending';
    const serviceClient = getServiceClient();
    const esignatureService = new ESignatureService(serviceClient);

    if (type === 'pending') {
      const requests = await esignatureService.getPendingSignatures(auth.userId);
      return NextResponse.json({ success: true, data: requests });
    }

    const { sent, received } = await esignatureService.getUserSignatureRequests(auth.userId);
    return NextResponse.json({ success: true, data: { sent, received } });
  } catch (error: any) {
    console.error('Error fetching signature requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch signature requests' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/esignature - Sign or reject an e-signature request
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const signatureRequestId = body.signatureRequestId || body.id;
    const action = String(body.action || 'sign').toLowerCase();

    if (!signatureRequestId) {
      return NextResponse.json(
        { error: 'signatureRequestId is required' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    const { data: existing, error: fetchError } = await serviceClient
      .from('esignature_requests')
      .select('*')
      .eq('id', signatureRequestId)
      .maybeSingle();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Signature request not found' }, { status: 404 });
    }

    if (action === 'reject' || body.status === 'rejected') {
      if (
        !auth.isAdmin &&
        existing.signer_id !== auth.userId &&
        existing.requester_id !== auth.userId
      ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const esignatureService = new ESignatureService(serviceClient);
      await esignatureService.rejectSignatureRequest(signatureRequestId, body.reason);
      return NextResponse.json({ success: true, message: 'Signature request rejected' });
    }

    // Signing requires being the designated signer (or admin override)
    if (!auth.isAdmin && existing.signer_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Only the designated signer can sign this request' },
        { status: 403 }
      );
    }

    if (existing.expires_at && new Date(existing.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Signature request has expired' },
        { status: 400 }
      );
    }

    const signatureUrl = body.signatureUrl || `signed://user/${auth.userId}/${Date.now()}`;
    const esignatureService = new ESignatureService(serviceClient);
    const signed = await esignatureService.signDocument(
      signatureRequestId,
      signatureUrl,
      existing.signer_id
    );

    return NextResponse.json({ success: true, data: signed });
  } catch (error: any) {
    console.error('Error processing signature request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update signature request' },
      { status: 500 }
    );
  }
}
