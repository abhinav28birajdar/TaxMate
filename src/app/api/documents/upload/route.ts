/**
 * POST /api/documents/upload
 * Upload and process documents
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  createSignedStorageUrl,
  getSessionUser,
} from '@/lib/api/server-auth';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument',
  'audio/webm',
  'audio/ogg',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
];

export async function POST(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caseId = (formData.get('caseId') as string) || null;
    const clientId = (formData.get('clientId') as string) || auth.userId;
    const category = ((formData.get('category') as string) || 'general').trim();
    const financialYear = ((formData.get('financialYear') as string) || '').trim() || null;
    const lifecycleStatus = ((formData.get('lifecycleStatus') as string) || 'Under Review').trim();
    const isSharedWithCaRaw = formData.get('isSharedWithCa');
    const isSharedWithCa = isSharedWithCaRaw === null ? true : String(isSharedWithCaRaw) !== 'false';
    const description = (formData.get('description') as string) || '';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File size exceeds 25MB limit' },
        { status: 400 }
      );
    }

    const mimeType = file.type || 'application/octet-stream';
    const mimeAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
    if (!mimeAllowed) {
      return NextResponse.json(
        { error: 'Unsupported document file type' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    let resolvedCaId: string | null = auth.isCAOrStaff ? auth.userId : null;
    let resolvedClientId: string = clientId || auth.userId;

    if (caseId) {
      const { data: caseRow } = await serviceClient
        .from('cases')
        .select('id, ca_id, client_id, assigned_to')
        .eq('id', caseId)
        .maybeSingle();

      if (!caseRow) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      const canAccessCase =
        auth.isAdmin ||
        caseRow.ca_id === auth.userId ||
        caseRow.assigned_to === auth.userId ||
        (caseRow.client_id ? await canAccessClientRecord(auth, caseRow.client_id) : false);

      if (!canAccessCase) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      resolvedCaId = caseRow.ca_id || resolvedCaId;
      resolvedClientId = caseRow.client_id || resolvedClientId;
    } else if (clientId) {
      const canAccessClient = await canAccessClientRecord(auth, clientId);
      if (!canAccessClient) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const rawExt = file.name.split('.').pop() || 'bin';
    const safeExt = rawExt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'bin';
    const folder = caseId || resolvedClientId;
    const objectPath = `${auth.userId}/${folder}/${Date.now()}-${crypto.randomUUID()}.${safeExt}`;

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('documents')
      .upload(objectPath, file, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const signedUrl = await createSignedStorageUrl('documents', uploadData.path, 3600);

    // Create document record in database
    const { data: docData, error: docError } = await serviceClient
      .from('documents')
      .insert([
        {
          case_id: caseId,
          ca_id: resolvedCaId,
          client_id: resolvedClientId,
          user_id: auth.userId,
          uploaded_by: auth.userId,
          name: file.name,
          file_name: file.name,
          original_name: file.name,
          file_url: signedUrl || uploadData.path,
          file_path: uploadData.path,
          file_type: mimeType.split('/')[1] || safeExt,
          mime_type: mimeType,
          file_size: file.size,
          size: file.size,
          category,
          document_type: category,
          financial_year: financialYear,
          description,
          status: 'active',
          is_shared_with_ca: isSharedWithCa,
          metadata: {
            path: uploadData.path,
            original_name: file.name,
            mime_type: mimeType,
            lifecycleStatus,
            history: [
              {
                action: `Uploaded by ${auth.email || auth.userId}`,
                timestamp: new Date().toISOString(),
                user: auth.email || auth.userId,
              },
            ],
          },
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (docError) {
      throw new Error(docError.message);
    }

    return NextResponse.json(
      {
        data: {
          id: docData.id,
          name: docData.name,
          fileUrl: signedUrl,
          filePath: uploadData.path,
          category: docData.category,
          financialYear: docData.financial_year,
          lifecycleStatus,
          document: docData,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/upload
 * Get documents for a case (scoped by ownership)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getSessionUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = req.nextUrl.searchParams.get('caseId');
    if (!caseId) {
      return NextResponse.json(
        { error: 'Missing caseId parameter' },
        { status: 400 }
      );
    }

    const serviceClient = getServiceClient();
    const { data: caseRow } = await serviceClient
      .from('cases')
      .select('id, ca_id, client_id, assigned_to')
      .eq('id', caseId)
      .maybeSingle();

    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const canAccessCase =
      auth.isAdmin ||
      caseRow.ca_id === auth.userId ||
      caseRow.assigned_to === auth.userId ||
      (caseRow.client_id ? await canAccessClientRecord(auth, caseRow.client_id) : false);

    if (!canAccessCase) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: documents, error } = await serviceClient
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const withUrls = await Promise.all(
      (documents || []).map(async (doc: any) => {
        const pathOrUrl = doc.file_path || doc.file_url;
        const signedUrl = pathOrUrl ? await createSignedStorageUrl('documents', pathOrUrl, 3600) : null;
        return {
          ...doc,
          signedUrl: signedUrl || doc.file_url,
        };
      })
    );

    return NextResponse.json({ data: withUrls });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
