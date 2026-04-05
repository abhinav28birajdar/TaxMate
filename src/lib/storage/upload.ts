import { createClient } from '../../utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (
    file: File,
    bucket: string,
    folder: string = 'uploads'
): Promise<{ path: string; url: string } | null> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return {
        path: filePath,
        url: publicUrl
    };
};

export const uploadVerificationDocument = async (
    file: File,
    userId: string,
    type: 'certificate' | 'id_proof'
) => {
    return uploadFile(file, 'verification-documents', `${userId}/${type}`);
}
