'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';

export default function DocumentUploadPage() {
  const router = useRouter();
  const [docCategory, setDocCategory] = useState('Bank Statement');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Please sign in before uploading a document.');
      return;
    }
    if (!selectedFile) {
      toast.error('Choose a PDF, JPG, or PNG file first.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('Files must be smaller than 10 MB.');
      return;
    }

    setUploading(true);
    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, selectedFile, { contentType: selectedFile.type, upsert: false });

      if (uploadError) throw uploadError;

      const { error: documentError } = await supabase.from('documents').insert({
        user_id: user.id,
        client_id: user.id,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        file_url: storagePath,
        document_type: docCategory,
        metadata: { storage_path: storagePath, extraction_status: 'pending' },
      });

      if (documentError) {
        await supabase.storage.from('documents').remove([storagePath]);
        throw documentError;
      }

      toast.success('Document uploaded. Processing will continue in the background.');
      router.push('/client/documents');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Document upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Tax Document</h1>
          <p className="text-xs text-slate-500">Supported Formats: PDF, JPG, PNG (Auto OCR Enabled)</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Document Category *</label>
          <select
            value={docCategory}
            onChange={(e) => setDocCategory(e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-600"
          >
            <option value="Form 16">Form 16 / Salary Certificate</option>
            <option value="Form 26AS">Form 26AS / AIS / TIS</option>
            <option value="Bank Statement">Bank Statement (PDF / Excel)</option>
            <option value="Investment Proof">80C / 80D Investment Proof</option>
            <option value="GST Sales Invoice">GST Sales & Purchase Invoices</option>
            <option value="PAN / Aadhaar">PAN Card / Aadhaar Verification</option>
          </select>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          className="sr-only"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4 bg-slate-50/50 dark:bg-slate-800/40 hover:border-primary transition-all cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-lime-600/10 text-lime-600 mx-auto flex items-center justify-center border border-lime-600/20">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedFile?.name ?? 'Choose a document file'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">PDF, JPG, or PNG up to 10 MB</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-600/10 text-lime-600 dark:text-lime-400 rounded-full text-[10px] font-bold">
            <Sparkles className="w-3 h-3" /> Automatic Tesseract OCR Enabled
          </div>
        </button>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={uploading || !selectedFile} className="font-semibold shadow-md shadow-primary/20">
            {uploading ? 'Uploading...' : 'Upload File to Vault'}
          </Button>
        </div>
      </form>
    </div>
  );
}
