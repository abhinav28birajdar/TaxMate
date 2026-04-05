import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/backend/response';
import { requireAuth, supabaseAdmin } from '@/lib/backend/supabase';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
];

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const form = await request.formData();

    const file = form.get('file') as File | null;
    const filePurpose = (form.get('purpose') as string) || 'document';

    if (!file) {
      return fail(new Error('File is required'));
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return fail(new Error('Unsupported file type'));
    }

    if (file.size > 10 * 1024 * 1024) {
      return fail(new Error('File size exceeds 10MB'));
    }

    const ext = file.name.split('.').pop() || 'bin';
    const objectPath = `${auth.userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('uploads')
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: signed } = await supabaseAdmin.storage
      .from('uploads')
      .createSignedUrl(objectPath, 60 * 60);

    const { data: dbFile, error: dbError } = await supabaseAdmin
      .from('file_uploads')
      .insert({
        user_id: auth.userId,
        file_name: file.name,
        file_path: objectPath,
        file_type: file.type,
        file_size: file.size,
        purpose: filePurpose,
      })
      .select('*')
      .single();

    if (dbError) {
      throw dbError;
    }

    return ok(
      {
        file: dbFile,
        signedUrl: signed?.signedUrl || null,
      },
      'File uploaded',
      201
    );
  } catch (error) {
    return fail(error);
  }
}
