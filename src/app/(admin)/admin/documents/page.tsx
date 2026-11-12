'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Search, Download, CheckCircle2, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminDocItem {
  id: string;
  title: string;
  fileName: string;
  category: string;
  fileSize: number;
  status: string;
  verified: boolean;
  ownerName: string;
  createdAt: string;
}

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<AdminDocItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDocs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=documents', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load documents');
      setDocs(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load vault audit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch('/api/admin/overview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ section: 'documents', id, status: 'VERIFIED' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Verification failed');
      toast.success('Document marked verified');
      await loadDocs();
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/overview?section=documents&id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Delete failed');
      toast.success('Document removed');
      await loadDocs();
    } catch (err: any) {
      toast.error(err?.message || 'Delete failed');
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/download?id=${encodeURIComponent(id)}`, { credentials: 'include' });
      const json = await res.json();
      const targetUrl = json.url || json.signedUrl;
      if (!targetUrl) throw new Error(json.error || 'Signed URL unavailable');
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      toast.error(err?.message || 'Download failed');
    }
  };

  const filtered = docs.filter((d) => {
    const q = search.trim().toLowerCase();
    return !q || d.title.toLowerCase().includes(q) || d.ownerName.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-lime-500" /> Document Vault Audit
          </h1>
          <p className="text-sm text-slate-400">Inspect uploaded tax files, verify compliance records, or inspect storage links</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDocs} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <Input
          placeholder="Search file title, uploader, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
        />
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Document Name</TableHead>
                <TableHead className="text-slate-400">Uploader</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Size</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading documents...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No uploaded documents found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((d) => (
                  <TableRow key={d.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell className="font-semibold text-slate-100 text-sm">{d.title}</TableCell>
                    <TableCell className="text-xs text-slate-300">{d.ownerName}</TableCell>
                    <TableCell><Badge className="bg-slate-800 text-slate-300 text-[10px]">{d.category}</Badge></TableCell>
                    <TableCell className="text-xs font-mono text-slate-400">
                      {d.fileSize > 0 ? `${(d.fileSize / 1024).toFixed(1)} KB` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={d.verified ? 'bg-lime-600/20 text-lime-400 text-[10px]' : 'bg-amber-500/20 text-amber-400 text-[10px]'}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownload(d.id)} className="border-slate-800 text-slate-300 h-7 text-xs">
                        <Download className="w-3.5 h-3.5 mr-1" /> Open
                      </Button>
                      {!d.verified && (
                        <Button size="sm" variant="outline" onClick={() => handleVerify(d.id)} className="border-lime-500/30 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verify
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(d.id)} className="text-red-400 h-7">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
