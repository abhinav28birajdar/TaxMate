/**
 * POST /api/documents/upload
 * Upload and process documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const caseId = formData.get('caseId') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;

    if (!file || !caseId || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload file to Supabase storage
    const fileName = `${caseId}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('case-documents')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('case-documents')
      .getPublicUrl(uploadData.path);

    // Create document record in database
    const { data: docData, error: docError } = await (supabase
      .from('documents') as any)
      .insert([
        {
          case_id: caseId,
          uploaded_by: user.id,
          name: file.name,
          original_name: file.name,
          file_url: urlData.publicUrl,
          file_path: uploadData.path,
          file_type: file.type.split('/')[1],
          mime_type: file.type,
          size: file.size,
          category,
          description,
          status: 'draft',
          is_shared_with_ca: true,
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
          fileUrl: urlData.publicUrl,
          category: docData.category,
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
 * GET /api/documents
 * Get documents for a case
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = req.nextUrl.searchParams.get('caseId');

    if (!caseId) {
      return NextResponse.json(
        { error: 'Missing caseId parameter' },
        { status: 400 }
      );
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: documents || [] });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
