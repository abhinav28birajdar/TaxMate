'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, UploadCloud, Search, Eye, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface VaultDocument {
  id: string;
  file_name: string;
  name?: string;
  file_size?: number;
  size?: number;
  category?: string;
  document_type?: string;
  financial_year?: string;
  description?: string;
  created_at: string;
}

export default function ClientDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('identity');
  const [financialYear, setFinancialYear] = useState('2026-27');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busyDocId, setBusyDocId] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/documents?take=100', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Failed to load vault documents');
      }
      setDocuments(json.documents || []);
    } catch (err: any) {
      toast.error(err.message || 'Could not load vault documents.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDocuments();
    } else {
      setLoading(false);
    }
  }, [user, loadDocuments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', selectedCategory);
      formData.append('financialYear', financialYear);
      formData.append('description', description.trim());
      formData.append('isSharedWithCa', 'true');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Document upload failed');
      }

      toast.success('Document uploaded to secure vault.');
      setSelectedFile(null);
      setDescription('');
      await loadDocuments();
    } catch (err: any) {
      toast.error(err.message || 'Upload transaction failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDocument = async (doc: VaultDocument, mode: 'view' | 'download') => {
    try {
      setBusyDocId(doc.id);
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(doc.id)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.signedUrl) {
        throw new Error(json.error || 'Signed download link unavailable');
      }

      if (mode === 'view') {
        window.open(json.signedUrl, '_blank', 'noopener,noreferrer');
      } else {
        const a = document.createElement('a');
        a.href = json.signedUrl;
        a.download = json.fileName || doc.file_name || doc.name || 'document';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Downloading ${doc.file_name || doc.name || 'document'}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to retrieve document file.');
    } finally {
      setBusyDocId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocs = documents.filter((doc) => {
    const fileName = doc.file_name || doc.name || '';
    const cat = (doc.category || doc.document_type || 'other').toLowerCase();
    const matchesSearch =
      fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || cat === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-lime-500 border-lime-600/10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">
            Secure Document Vault
          </span>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic mt-1 text-white">
            Vault Files & Shares
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wide">
            ACCESS CA-SHARED DOCUMENTS AND SUBMIT RECORDS SECURELY
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadDocuments}
          className="border-slate-800 text-slate-300 hover:bg-slate-800 rounded-none self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-2" />
          Sync Vault
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-none">
            <CardHeader className="border-b border-slate-800 pb-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                    Vault Inventory
                  </CardTitle>
                  <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                    Verify and download certificates, filings and bills
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-8 rounded-none focus:border-lime-600/50 outline-none"
                  >
                    <option value="all">ALL CATEGORIES</option>
                    <option value="identity">IDENTITY/KYC</option>
                    <option value="financial">FINANCIAL BILLING</option>
                    <option value="tax_return">TAX RETURNS</option>
                    <option value="gst">GST FILINGS</option>
                    <option value="tds">TDS RETURNS</option>
                    <option value="other">OTHER DOCUMENTS</option>
                  </select>
                </div>
              </div>

              <div className="relative w-full group mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-lime-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="SEARCH DOCUMENTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black border-slate-800 focus:border-lime-600/50 pl-10 h-9 rounded-none text-[10px] font-bold uppercase tracking-widest placeholder:text-slate-600 transition-all"
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-[10px] font-bold uppercase tracking-widest italic">
                  No documents uploaded in this vault view yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocs.map((doc) => {
                    const displayName = doc.file_name || doc.name || 'Document';
                    const cat = (doc.category || doc.document_type || 'general').toUpperCase();
                    const isBusy = busyDocId === doc.id;

                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-black border border-slate-800 hover:border-slate-700 transition-all gap-4 rounded-none"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-900 border border-slate-800 text-lime-500 rounded-none">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-black text-white truncate max-w-md">
                              {displayName}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                              <span>{formatBytes(doc.file_size || doc.size || 0)}</span>
                              <span>•</span>
                              <span className="text-lime-500">{cat}</span>
                              <span>•</span>
                              <span>FY {doc.financial_year || 'N/A'}</span>
                            </div>
                            {doc.description && (
                              <p className="text-[10px] text-slate-400 italic pt-1">
                                {doc.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isBusy}
                            className="w-8 h-8 rounded-none border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                            onClick={() => handleOpenDocument(doc, 'view')}
                            title="Preview document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isBusy}
                            className="w-8 h-8 rounded-none border border-lime-600/30 text-lime-500 hover:bg-lime-600 hover:text-black"
                            onClick={() => handleOpenDocument(doc, 'download')}
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 rounded-none">
            <CardHeader className="border-b border-slate-800 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">
                File Transmission Console
              </CardTitle>
              <CardDescription className="text-[9px] uppercase tracking-wider text-slate-500">
                Submit compliance files to your CA advisor
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    File Type Category
                  </Label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                  >
                    <option value="identity">IDENTITY/KYC DOCUMENT</option>
                    <option value="financial">FINANCIAL STATEMENT / BANK</option>
                    <option value="tax_return">ITR RETURN ASSISTANCE</option>
                    <option value="gst">GST FILING RECEIPTS</option>
                    <option value="tds">TDS PROOFS</option>
                    <option value="other">OTHER SUPPORTING EVIDENCE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Financial Year
                  </Label>
                  <select
                    value={financialYear}
                    onChange={(e) => setFinancialYear(e.target.value)}
                    className="w-full bg-black border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 h-10 rounded-none focus:border-lime-600/50 outline-none"
                  >
                    <option value="2026-27">FY 2026-27 (Current)</option>
                    <option value="2025-26">FY 2025-26</option>
                    <option value="2024-25">FY 2024-25</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    Description / Memo
                  </Label>
                  <Input
                    type="text"
                    placeholder="E.g. Bank Statements May 2026"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-black border-slate-800 focus:border-lime-600/50 h-10 rounded-none text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-wider text-slate-300">
                    File Selection
                  </Label>
                  <div className="border border-dashed border-slate-800 bg-black p-6 text-center hover:border-lime-600/30 transition-all cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-600 group-hover:text-lime-500 mx-auto transition-colors" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 truncate px-2">
                      {selectedFile ? selectedFile.name : 'Select or Drop File'}
                    </p>
                    <p className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">
                      PDF, JPG, PNG, CSV, XLS up to 25MB
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-lime-600 hover:bg-lime-500 text-black font-black uppercase tracking-widest italic rounded-none h-11 transition-all"
                >
                  {uploading ? 'TRANSMITTING FILE...' : 'TRANSMIT FILE TO VAULT'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
