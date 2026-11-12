'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Search, Loader2, RefreshCw, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  email_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/users', { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load users');
      const list = json?.data?.users || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (userId: string, nextStatus: string) => {
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed');
      toast.success(`Account status set to ${nextStatus}`);
      await loadUsers();
    } catch (err: any) {
      toast.error(err?.message || 'Update failed');
    }
  };

  const filtered = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'ALL' || String(u.role).toUpperCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-lime-500" /> User Access &amp; RBAC Directory
          </h1>
          <p className="text-sm text-slate-400">Inspect registered accounts, manage roles, and enforce platform suspensions</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadUsers} className="border-slate-800 bg-slate-900 text-slate-300">
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
        >
          <option value="ALL">All Roles</option>
          <option value="CLIENT">Clients</option>
          <option value="CA">Chartered Accountants</option>
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admins</option>
          <option value="SUPER_ADMIN">Super Admins</option>
        </select>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="rounded-xl border border-slate-800 overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-950">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Account</TableHead>
                <TableHead className="text-slate-400">Role</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Verified</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2 text-lime-500" /> Loading user roster...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow className="border-slate-800">
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    No accounts match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={u.id} className="border-slate-800 hover:bg-slate-950/50">
                    <TableCell>
                      <div className="font-semibold text-slate-100 text-sm">{u.name || u.email}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-slate-800 text-lime-400 border-slate-700 text-[10px]">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          u.status === 'ACTIVE'
                            ? 'bg-lime-600/20 text-lime-400 text-[10px]'
                            : 'bg-red-500/20 text-red-400 text-[10px]'
                        }
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">{u.email_verified ? 'Yes' : 'Pending'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/users/${u.id}`}>
                        <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 h-7 text-xs">
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Manage
                        </Button>
                      </Link>
                      {u.status === 'ACTIVE' ? (
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(u.id, 'SUSPENDED')} className="text-red-400 h-7 text-xs">
                          <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Suspend
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleToggleStatus(u.id, 'ACTIVE')} className="border-lime-500/30 text-lime-400 h-7 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Activate
                        </Button>
                      )}
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
