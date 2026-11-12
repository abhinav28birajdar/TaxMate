import { createClient } from '../../utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const PRIVATE_BUCKETS = new Set(['verification-documents', 'documents', 'case-documents', 'uploads']);

export const uploadFile = async (
    file: File,
    bucket: string,
    folder: string = 'uploads'
): Promise<{ path: string; url: string } | null> => {
    const supabase = createClient();
    const rawExt = file.name.split('.').pop() || 'bin';
    const fileExt = rawExt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10) || 'bin';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    if (PRIVATE_BUCKETS.has(bucket)) {
        const { data: signedData } = await supabase.storage
            .from(bucket)
            .createSignedUrl(filePath, 3600);

        return {
            path: filePath,
            url: signedData?.signedUrl || filePath,
        };
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return {
        path: filePath,
        url: publicUrl,
    };
};

export const uploadVerificationDocument = async (
    file: File,
    userId: string,
    type: 'certificate' | 'id_proof'
) => {
    return uploadFile(file, 'verification-documents', `${userId}/${type}`);
};
