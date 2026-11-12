'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, FileText, Mail, Phone, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id || '';
  const router = useRouter();

  const [client, setClient] = useState<any | null>(null);
  const [counts, setCounts] = useState({ filings: 0, invoices: 0, documents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadClient = useCallback(async () => {
    if (!clientId) return;
    try {
      setLoading(true);
      setError(null);
      const [cRes, dRes, itrRes, invRes] = await Promise.all([
        fetch(`/api/clients/${encodeURIComponent(clientId)}`, { credentials: 'include' }),
        fetch(`/api/documents?clientId=${encodeURIComponent(clientId)}&take=1`, {
          credentials: 'include',
        }),
        fetch(`/api/itr?clientId=${encodeURIComponent(clientId)}`, { credentials: 'include' }),
        fetch('/api/invoices?take=100', { credentials: 'include' }),
      ]);

      const cJson = await cRes.json();
      if (!cRes.ok || cJson.error) {
        throw new Error(cJson.error || 'Client not found');
      }
      setClient(cJson);

      const dJson = dRes.ok ? await dRes.json() : {};
      const itrJson = itrRes.ok ? await itrRes.json() : {};
      const invJson = invRes.ok ? await invRes.json() : {};
      const matchIds = new Set([cJson.id, cJson.portal_user_id].filter(Boolean));
      const clientInvCount = (invJson.invoices || []).filter((i: any) =>
        matchIds.has(i.client_id)
      ).length;

      setCounts({
        filings: (itrJson.data || []).length,
        invoices: clientInvCount,
        documents: Number(dJson.total || (dJson.documents || []).length || 0),
      });
    } catch (err: any) {
      setError(err.message || 'Unable to load client details');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const handleDelete = async () => {
    if (!client || !confirm(`Delete client "${client.full_name || client.display_name}"?`)) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/clients/${encodeURIComponent(client.id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Delete failed');
      toast.success('Client removed');
      router.push('/clients');
    } catch (err: any) {
      toast.error(err.message || 'Could not remove client');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading client record...
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Card className="p-8 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-semibold">{error || 'Client not found'}</p>
        </Card>
      </div>
    );
  }

  const displayName = client.display_name || client.full_name || 'Client';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{displayName}</h1>
            <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 uppercase">
              {client.status || 'active'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/ca/clients/${client.id}`}>
            <Button variant="outline" size="sm">
              Open Full Workspace
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            disabled={deleting}
            onClick={handleDelete}
            className="gap-2 text-red-500 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs">
            <Mail className="w-4 h-4" /> Email
          </div>
          <p className="font-semibold text-slate-100 truncate">{client.email}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs">
            <Phone className="w-4 h-4" /> Phone
          </div>
          <p className="font-semibold text-slate-100">{client.phone || 'Not provided'}</p>
        </Card>
        <Card className="p-4">
          <div className="text-slate-400 mb-2 font-medium text-xs">PAN</div>
          <p className="font-mono font-semibold text-slate-100">{client.pan || 'N/A'}</p>
        </Card>
        <Card className="p-4">
          <div className="text-slate-400 mb-2 font-medium text-xs">GSTIN</div>
          <p className="font-mono font-semibold text-slate-100">{client.gstin || 'N/A'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-lime-500">{counts.filings}</div>
          <p className="text-slate-400 mt-1 text-xs">ITR Filings</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-lime-500">{counts.invoices}</div>
          <p className="text-slate-400 mt-1 text-xs">Invoices</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-lime-500">{counts.documents}</div>
          <p className="text-slate-400 mt-1 text-xs">Documents</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Link href="/ca/invoices">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> View Invoices
          </Button>
        </Link>
        <Link href="/ca/tasks">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> View Tasks
          </Button>
        </Link>
        <Link href="/ca/compliance">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> Compliance
          </Button>
        </Link>
        <Link href="/ca/documents">
          <Button variant="outline" className="w-full gap-2">
            <FileText className="w-4 h-4" /> Documents
          </Button>
        </Link>
      </div>
    </div>
  );
}
