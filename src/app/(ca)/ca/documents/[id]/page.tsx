'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FileText,
  ArrowLeft,
  Download,
  ShieldCheck,
  Eye,
  PenTool,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return 'N/A';
  const units = ['Bytes', 'KB', 'MB', 'GB'];
  const idx = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, idx)).toFixed(2)} ${units[idx]}`;
}

export default function CADocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const docId = params?.id || '';

  const [doc, setDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingSigned, setMarkingSigned] = useState(false);

  const loadDocument = useCallback(async () => {
    if (!docId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/documents/${encodeURIComponent(docId)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.document) {
        throw new Error(json.error || 'Document not found');
      }
      setDoc(json.document);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch document');
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(doc.id)}`, {
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.signedUrl) {
        throw new Error(json.error || 'Download link unavailable');
      }
      const a = document.createElement('a');
      a.href = json.signedUrl;
      a.download = doc.file_name || doc.name || 'document';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err: any) {
      toast.error(err.message || 'Could not download file');
    }
  };

  const handleMarkVerified = async () => {
    if (!doc) return;
    try {
      setMarkingSigned(true);
      const res = await fetch(`/api/documents/${encodeURIComponent(doc.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lifecycleStatus: 'Verified & CA Reviewed',
          historyAction: 'Reviewed and verified by CA',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.document) {
        throw new Error(json.error || 'Verification failed');
      }
      setDoc({ ...doc, ...json.document });
      toast.success('Document marked as CA Verified!');
    } catch (err: any) {
      toast.error(err.message || 'Could not update verification status');
    } finally {
      setMarkingSigned(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-lime-500" /> Loading document vault entry...
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="space-y-4">
        <Link href="/ca/documents" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Document Vault
        </Link>
        <div className="p-8 bg-slate-900 border border-rose-500/30 rounded-2xl text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-white font-semibold">{error || 'Document not found'}</p>
        </div>
      </div>
    );
  }

  const displayName = doc.file_name || doc.name || 'Document';
  const category = doc.category || doc.document_type || 'General';
  const isVerified = String(doc.metadata?.lifecycleStatus || '').toLowerCase().includes('verified');
  const isImage = String(doc.mime_type || '').startsWith('image/');
  const isPdf = String(doc.mime_type || '').includes('pdf');
  const historyList: any[] = Array.isArray(doc.metadata?.history) ? doc.metadata.history : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/ca/documents"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-lime-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Document Vault
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {displayName}
            </h1>
            <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 border-lime-600/30 text-xs font-bold">
              {category}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Doc ID: <span className="font-mono">{doc.id}</span> • Client:{' '}
            <strong className="text-slate-700 dark:text-slate-300">{doc.client_name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="text-xs rounded-xl border-slate-200 dark:border-slate-800"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download File
          </Button>
          {!isVerified ? (
            <Button
              size="sm"
              disabled={markingSigned}
              onClick={handleMarkVerified}
              className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-600/20"
            >
              <PenTool className="w-3.5 h-3.5 mr-1.5" />{' '}
              {markingSigned ? 'Verifying...' : 'Mark CA Verified'}
            </Button>
          ) : (
            <Badge className="bg-lime-600 text-white text-xs px-3 py-1.5 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> CA Verified
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="preview" className="w-full space-y-4">
            <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <TabsTrigger value="preview" className="rounded-xl text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> Document Preview
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl text-xs font-semibold">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Audit History ({historyList.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 min-h-[480px] flex flex-col items-center justify-center text-center shadow-sm overflow-hidden">
                {doc.signed_url && isImage ? (
                  <img
                    src={doc.signed_url}
                    alt={displayName}
                    className="max-h-[460px] object-contain rounded-xl"
                  />
                ) : doc.signed_url && isPdf ? (
                  <iframe
                    src={doc.signed_url}
                    title={displayName}
                    className="w-full h-[520px] rounded-xl border border-slate-800"
                  />
                ) : (
                  <div className="p-8 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-lime-600/10 text-lime-600 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {displayName}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Preview is unavailable for this format or external URL. Download the encrypted document to inspect it locally.
                    </p>
                    {doc.signed_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.signed_url, '_blank', 'noopener,noreferrer')}
                        className="mt-4 text-xs rounded-xl"
                      >
                        Open File in New Tab
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Document Audit Trail
                </span>
                {historyList.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Uploaded on {new Date(doc.created_at).toLocaleString('en-IN')}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {historyList.map((entry: any, i: number) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between"
                      >
                        <span className="text-slate-200">{entry.action}</span>
                        <span className="text-slate-500 font-mono">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString('en-IN') : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Properties</h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatBytes(doc.file_size || doc.size || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(doc.created_at).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded By:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {doc.uploaded_by_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Financial Year:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {doc.financial_year || 'General'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Lifecycle Status:</span>
                <span className="font-semibold text-lime-600">
                  {doc.metadata?.lifecycleStatus || doc.status || 'Active'}
                </span>
              </div>
            </div>
            {doc.description && (
              <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="block text-slate-500 mb-1">Notes</span>
                {doc.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
