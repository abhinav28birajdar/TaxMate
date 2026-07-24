"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, Shield, ArrowLeft, Mail, Phone, Calendar, Ban, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  const user = {
    id: params.id,
    name: 'CA Rajesh Sharma',
    email: 'rajesh.sharma@taxmate.in',
    phone: '+91 98765 43210',
    role: 'CA Firm Admin',
    firm: 'Sharma & Associates',
    status: 'active',
    joined: '12 Jan 2026',
    lastLogin: 'Today, 02:14 PM'
  };

  const handleToggleStatus = () => {
    toast.success('User status updated');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{user.name}</h1>
            <p className="text-sm text-slate-400">User UUID: {user.id}</p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {user.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b border-slate-800 pb-6">
          <div>
            <span className="text-slate-400 text-xs block">Email Address</span>
            <span className="font-medium text-slate-100">{user.email}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Assigned Role</span>
            <span className="font-semibold text-lime-400">{user.role}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Joined Date</span>
            <span className="text-slate-200">{user.joined}</span>
          </div>
          <div>
            <span className="text-slate-400 text-xs block">Last Login Timestamp</span>
            <span className="text-slate-200">{user.lastLogin}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="destructive" className="gap-2" onClick={handleToggleStatus}>
            <Ban className="w-4 h-4" /> Suspend User Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
