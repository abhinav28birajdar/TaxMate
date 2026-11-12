import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  createSignedStorageUrl,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/download?id=<documentId>
 * Returns a fresh short-lived signed URL for an authorized document.
 * Also supports ?bucket=verification-documents&path=<objectPath> for ADMIN or file owner.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = request.nextUrl.searchParams.get('id');
    const bucketParam = request.nextUrl.searchParams.get('bucket');
    const pathParam = request.nextUrl.searchParams.get('path');

    if (documentId) {
      const serviceClient = getServiceClient();
      const { data: doc, error } = await serviceClient
        .from('documents')
        .select('*')
        .eq('id', documentId)
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
      if (!pathOrUrl) {
        return NextResponse.json({ error: 'File path unavailable' }, { status: 404 });
      }

      const signedUrl = await createSignedStorageUrl('documents', pathOrUrl, 900);
      if (!signedUrl) {
        return NextResponse.json({ error: 'Unable to generate signed URL' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        signedUrl,
        fileName: doc.file_name || doc.name || 'document',
      });
    }

    if (bucketParam && pathParam) {
      const allowedBuckets = new Set(['verification-documents', 'documents', 'uploads']);
      if (!allowedBuckets.has(bucketParam)) {
        return NextResponse.json({ error: 'Invalid bucket' }, { status: 400 });
      }

      const isOwnerPrefix = pathParam.startsWith(`${auth.userId}/`);
      if (!auth.isAdmin && !isOwnerPrefix) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const signedUrl = await createSignedStorageUrl(bucketParam, pathParam, 900);
      if (!signedUrl) {
        return NextResponse.json({ error: 'Unable to generate signed URL' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        signedUrl,
      });
    }

    return NextResponse.json(
      { error: 'Either id or bucket+path query parameters are required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get document download URL' },
      { status: 500 }
    );
  }
}

