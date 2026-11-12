import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/backend/supabase';
import {
  canAccessClientRecord,
  createSignedStorageUrl,
  getResolvedClientIdsForUser,
  getSessionUser,
} from '@/lib/api/server-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedClientId = searchParams.get('clientId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const signed = searchParams.get('signed') === 'true';
    const skip = Math.max(0, parseInt(searchParams.get('skip') || '0', 10) || 0);
    const take = Math.min(100, Math.max(1, parseInt(searchParams.get('take') || '20', 10) || 20));

    const serviceClient = getServiceClient();
    let query = serviceClient
      .from('documents')
      .select('*', { count: 'exact' });

    if (requestedClientId) {
      const allowed = await canAccessClientRecord(auth, requestedClientId);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      query = query.eq('client_id', requestedClientId);
    } else if (!auth.isAdmin) {
      if (auth.role === 'CLIENT') {
        const clientIds = await getResolvedClientIdsForUser(auth.userId);
        const orParts = [`user_id.eq.${auth.userId}`, `uploaded_by.eq.${auth.userId}`];
        if (clientIds.length > 0) {
          orParts.push(`client_id.in.(${clientIds.join(',')})`);
        }
        query = query.or(orParts.join(','));
      } else {
        query = query.or(`ca_id.eq.${auth.userId},user_id.eq.${auth.userId},uploaded_by.eq.${auth.userId}`);
      }
    }

    if (category && category !== 'all') {
      query = query.eq('document_type', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'deleted');
    }

    const { data: documents, error, count } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + take - 1);

    if (error) throw error;

    const enrichedDocs = await Promise.all(
      (documents || []).map(async (doc: any) => {
        if (!signed) return doc;
        const objectPath = doc.file_path || doc.metadata?.file_key || doc.file_url;
        const signedUrl = objectPath ? await createSignedStorageUrl('documents', objectPath, 3600) : null;
        return {
          ...doc,
          signed_url: signedUrl,
          file_url: signedUrl || doc.file_url,
        };
      })
    );

    return NextResponse.json({
      documents: enrichedDocs,
      total: count || 0,
    });
  } catch (error: any) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const targetClientId = body.clientId || body.client_id || auth.userId;

    const allowed = await canAccessClientRecord(auth, targetClientId);
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const fileName = String(body.name || body.fileName || body.file_name || '').trim();
    if (!fileName) {
      return NextResponse.json({ error: 'Document name is required' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    const filePath = body.fileKey || body.file_key || body.filePath || body.file_path || null;
    const rawFileUrl = body.fileUrl || body.file_url || filePath || '';

    const { data: document, error } = await serviceClient
      .from('documents')
      .insert({
        user_id: auth.userId,
        uploaded_by: auth.userId,
        ca_id: auth.isCAOrStaff ? auth.userId : body.caId || body.ca_id || null,
        client_id: targetClientId,
        case_id: body.caseId || body.case_id || null,
        file_name: fileName,
        file_type: body.type || body.fileType || body.mimeType || 'other',
        file_size: Number(body.fileSize || body.file_size || 0),
        file_path: filePath,
        file_url: rawFileUrl,
        document_type: body.documentType || body.document_type || body.type || 'other',
        financial_year: body.financialYear || body.financial_year || null,
        status: 'active',
        metadata: {
          original_name: body.originalName || fileName,
          mime_type: body.mimeType || null,
          description: body.description || null,
          file_key: filePath,
        },
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, document },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 400 }
    );
  }
}
