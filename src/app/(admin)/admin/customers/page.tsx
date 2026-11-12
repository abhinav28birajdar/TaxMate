'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Users, Search, Loader2, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminCustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  clientType: string;
  location: string;
  status: string;
  assignedCA: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/overview?section=customers', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load customers');
      setCustomers(Array.isArray(json.items) ? json.items : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.assignedCA.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-lime-500" /> Customer &amp; Taxpayer Directory
          </h1>
          <p className="text-sm text-slate-400">Live roster of registered businesses and individual taxpayers assigned across CAs</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadCustomers} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <Input
          placeholder="Search customer, email, city, or assigned CA..."
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
                <TableHead className="text-slate-400">Customer Name</TableHead>
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Assigned CA</TableHead>
                <TableHead className="text-slate-400">Location</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Onboarded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading customers...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={6} className="py-12 text-center text-slate-400">
                    No customer accounts match your query.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 uppercase">{c.clientType}</TableCell>
                    <TableCell className="text-xs text-lime-400 font-medium">{c.assignedCA}</TableCell>
                    <TableCell className="text-xs text-slate-400">{c.location}</TableCell>
                    <TableCell>
                      <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 text-[10px]">
                        {c.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '-'}
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
