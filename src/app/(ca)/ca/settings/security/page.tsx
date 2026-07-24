"use client";

import React, { useState } from 'react';
import { ShieldCheck, Key, Lock, Smartphone, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function CASecuritySettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Security password updated successfully');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-lime-500" /> Account Security & 2FA
        </h1>
        <p className="text-sm text-slate-400">Manage two-factor authentication, active login sessions, and password security</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-lime-600/10 text-lime-500 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="font-semibold text-slate-100 block">Two-Factor Authentication (TOTP Authenticator)</span>
              <span className="text-xs text-slate-400">Enforce 6-digit authenticator code on login</span>
            </div>
          </div>
          <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 border-t border-slate-800 pt-6">
          <h3 className="text-base font-semibold text-slate-100">Change Account Password</h3>
          <div className="space-y-2">
            <Label className="text-slate-300">Current Password</Label>
            <Input type="password" className="bg-slate-950 border-slate-800 text-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">New Password</Label>
              <Input type="password" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirm New Password</Label>
              <Input type="password" className="bg-slate-950 border-slate-800 text-slate-100" />
            </div>
          </div>
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Lock className="w-4 h-4" /> Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
