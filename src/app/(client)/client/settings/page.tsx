'use client';

import { useState } from 'react';
import { Settings, Lock, Bell, ShieldCheck, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ClientSettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Account settings saved!');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-lime-600" /> Client Account Settings & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure password, 2FA authentication, and email notification preferences.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
            Change Account Password
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
              <Input type="password" placeholder="••••••••" className="text-xs" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
              <Input type="password" placeholder="••••••••" className="text-xs" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Two-Factor Security (SMS OTP)</h4>
            <p className="text-[11px] text-slate-500">Require SMS OTP code when accessing tax returns.</p>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30">
            Enabled
          </span>
        </div>

        <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold text-xs shadow-md shadow-lime-600/20">
            <Save className="w-4 h-4 mr-1.5" /> Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
