'use client';

import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldAlert, 
  Save, 
  Key, 
  Mail, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function MaintenanceAdminPage() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [message, setMessage] = useState('We are performing scheduled maintenance on TaxMate. We will be back shortly.');
  const [bypassKey, setBypassKey] = useState('taxmate-secret-bypass-2026');
  const [estimatedEnd, setEstimatedEnd] = useState('2026-07-22T02:00:00');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
          System Maintenance Settings
          <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">Super Admin Control</Badge>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Configure global maintenance status, public message banners, and emergency bypass keys.</p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" /> Maintenance configuration updated successfully!
        </div>
      )}

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isMaintenance ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-slate-100">Global Maintenance Mode</CardTitle>
                <CardDescription className="text-slate-400">When enabled, all non-admin traffic will be redirected to maintenance screen.</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{isMaintenance ? 'ENABLED' : 'DISABLED'}</span>
              <Switch checked={isMaintenance} onCheckedChange={setIsMaintenance} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* Public Maintenance Message */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Maintenance Banner Message</label>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-200"
            />
          </div>

          {/* Bypass Key */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-lime-400" /> Admin Bypass Secret Key
            </label>
            <Input
              value={bypassKey}
              onChange={(e) => setBypassKey(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-200 font-mono"
            />
            <p className="text-[11px] text-slate-500">Append ?bypass=KEY to URL to bypass maintenance mode during updates.</p>
          </div>

          {/* Estimated End Time */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Estimated Completion Time</label>
            <Input
              type="datetime-local"
              value={estimatedEnd}
              onChange={(e) => setEstimatedEnd(e.target.value)}
              className="bg-slate-950 border-slate-800 text-slate-200"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button onClick={handleSave} className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold px-6">
              <Save className="w-4 h-4 mr-2" /> Save Maintenance Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
