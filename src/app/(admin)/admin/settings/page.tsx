"use client";

import React, { useState } from 'react';
import { Settings, Save, Shield, Database, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AdminGlobalSettingsPage() {
  const [appVersion, setAppVersion] = useState('1.0.0');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Super admin system settings saved');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-lime-500" /> Super Admin System Settings
          </h1>
          <p className="text-sm text-slate-400">Configure global platform version, system maintenance bypass keys, and rate limits</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">App Version Tag</Label>
            <Input className="bg-slate-950 border-slate-800 text-slate-100" value={appVersion} onChange={e => setAppVersion(e.target.value)} />
          </div>
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
              <Save className="w-4 h-4" /> Save System Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
