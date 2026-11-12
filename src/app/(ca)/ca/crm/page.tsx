'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Filter, Phone, Mail, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface CRMClient {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  pan: string;
  gstin: string;
  tag: string;
  status: string;
}

export default function CACRMPage() {
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients?take=100', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch CRM contacts');

      const mapped: CRMClient[] = (json.clients || []).map((c: any) => ({
        id: c.id,
        name: c.display_name || c.full_name || c.email || 'Client',
        type: String(c.client_type || 'individual').replace(/_/g, ' ').toUpperCase(),
        email: c.email || 'No email on file',
        phone: c.phone || 'Not provided',
        pan: c.pan || '',
        gstin: c.gstin || '',
        tag: c.gstin ? 'GST + ITR' : c.client_type === 'business' ? 'Business' : 'Individual Tax',
        status: String(c.status || 'active').toUpperCase(),
      }));
      setClients(mapped);
    } catch (err: any) {
      toast.error(err.message || 'Could not load CRM directory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.pan.toLowerCase().includes(q) ||
      c.tag.toLowerCase().includes(q);
    const matchesType =
      typeFilter === 'all' || c.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-lime-600" /> CA Client Relationship CRM
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            360° Client profile view, PAN/GSTIN directory, and engagement workspaces.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadClients} className="text-xs">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/ca/clients/add">
            <Button className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20">
              <Plus className="w-4 h-4 mr-1.5" /> Add Client Contact
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client name, PAN, phone, email, or tags..."
            className="text-xs pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
          >
            <option value="all">All Client Types</option>
            <option value="individual">Individual</option>
            <option value="business">Business / Corporate</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading client CRM...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">No CRM clients found</p>
          <p className="text-xs text-slate-500">
            Add your first client or adjust your search filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-lime-500 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h3>
                  <span className="text-[11px] text-slate-400">{c.type}</span>
                </div>
                <span className="px-2 py-0.5 bg-lime-600/20 text-lime-600 dark:text-lime-400 text-[10px] font-bold rounded-full">
                  {c.tag}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.phone}
                </div>
                {c.pan && (
                  <div className="text-[11px] font-mono text-slate-400">PAN: {c.pan}</div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{c.status}</span>
                <Link href={`/ca/clients/${c.id}`}>
                  <Button size="sm" variant="ghost" className="text-lime-600 font-bold text-xs">
                    View 360° CRM Profile
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
