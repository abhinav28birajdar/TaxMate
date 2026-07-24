"use client";

import React, { useState } from 'react';
import { Clock, Save, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function CAAvailabilityPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [mode, setMode] = useState('both');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSave = () => {
    toast.success('Consultation availability schedule saved!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-6 h-6 text-lime-500" /> Consultation Availability Settings
          </h1>
          <p className="text-sm text-slate-400">Configure online consultation hours, instant bookings, and buffer times</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Schedule
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="font-semibold text-slate-100 block">Accept Instant Bookings</span>
            <span className="text-xs text-slate-400">Clients can book available slots automatically</span>
          </div>
          <Switch checked={isOnline} onCheckedChange={setIsOnline} />
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-100">Weekly Consultation Hours</h3>
          {days.map(d => (
            <div key={d} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-sm">
              <span className="font-medium text-slate-200 w-32">{d}</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">10:00 AM</span>
                <span className="text-slate-500">to</span>
                <span className="text-slate-400">06:00 PM</span>
              </div>
              <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30">Active</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
