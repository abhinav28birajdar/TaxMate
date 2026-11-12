'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, ShieldCheck, Loader2, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ? String(params.id) : '';
  const router = useRouter();

  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState('CLIENT');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUser = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success || !json.user) throw new Error(json.error || 'User not found');
      setUser(json.user);
      setRole(json.user.role || 'CLIENT');
      setStatus(json.user.status || 'ACTIVE');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to load account details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: user.id, role, status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed');
      toast.success('Account privileges updated');
      await loadUser();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center text-slate-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-lime-500" /> Loading account details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
        <p className="text-slate-300">Account not found.</p>
        <Button variant="outline" onClick={() => router.push('/admin/users')}>
          Back to User Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push('/admin/users')} className="text-slate-400">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to User Directory
      </Button>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-lime-600/15 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">{user.name}</h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-800 text-lime-400 border-slate-700">{user.role}</Badge>
            <Badge className={user.status === 'ACTIVE' ? 'bg-lime-600/20 text-lime-400' : 'bg-red-500/20 text-red-400'}>
              {user.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400">Phone</span>
            <p className="text-slate-200 font-medium">{user.phone || 'Not provided'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400">Location</span>
            <p className="text-slate-200 font-medium">{user.location || 'India'}</p>
          </div>
          {user.caProfile && (
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-lime-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> CA Practice Profile
              </span>
              <p className="text-slate-200">
                Firm: {user.caProfile.firm_name || '-'} • ICAI #: {user.caProfile.icai_membership_number || '-'} • Status: {user.caProfile.status}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Account Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs"
            >
              <option value="CLIENT">CLIENT</option>
              <option value="CA">CA</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={saving} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold">
            <Save className="w-4 h-4 mr-1.5" /> {saving ? 'Saving...' : 'Update Access Controls'}
          </Button>
        </div>

        {Array.isArray(user.auditLogs) && user.auditLogs.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Audit Trail</h2>
            <div className="space-y-2">
              {user.auditLogs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-mono">{log.action}</span>
                  <span className="text-slate-500">{new Date(log.created_at).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
