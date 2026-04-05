import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const BUCKETS = {
    AVATARS: 'avatars',
    DOCUMENTS: 'documents',
    INVOICES: 'invoice-pdfs',
    RECEIPTS: 'receipts',
    CA_ASSETS: 'ca-assets',
    CHAT_FILES: 'chat-files',
} as const;

const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg', 'image/png', 'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/csv',
];

export async function uploadFile(
    bucket: string,
    path: string,
    file: File | Buffer,
    options?: { contentType?: string; upsert?: boolean }
) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: options?.contentType, upsert: options?.upsert });
    if (error) throw error;
    return data;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data.signedUrl;
}

export function getPublicUrl(bucket: string, path: string) {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function deleteFile(bucket: string, paths: string[]) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) throw error;
}

export async function validateAndUploadDocument(
    file: File,
    caId: string,
    clientId?: string,
    type = 'OTHER'
): Promise<{ fileUrl: string; fileKey: string; fileName: string; fileSize: number; mimeType: string }> {
    if (file.size > 50 * 1024 * 1024) throw new Error('File exceeds 50MB limit');
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error('File type not supported');

    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${caId}/${clientId || 'general'}/${type}/${fileName}`;

    await uploadFile(BUCKETS.DOCUMENTS, path, file, { contentType: file.type });
    const fileUrl = await getSignedUrl(BUCKETS.DOCUMENTS, path, 365 * 24 * 3600);

    return { fileUrl, fileKey: path, fileName: file.name, fileSize: file.size, mimeType: file.type };
}
