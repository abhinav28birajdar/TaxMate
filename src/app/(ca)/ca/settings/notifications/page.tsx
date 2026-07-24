"use client";

import React, { useState } from 'react';
import { Bell, Save, Mail, MessageSquare, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function CANotificationSettingsPage() {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true,
    whatsappAlerts: false,
    meetingReminders: true,
    complianceDeadlines: true,
    invoicePayments: true
  });

  const handleSave = () => {
    toast.success('Notification preferences updated successfully');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-lime-500" /> Notification Channels & Alerts
          </h1>
          <p className="text-sm text-slate-400">Configure email, SMS, WhatsApp and FCM push notification triggers</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Preferences
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <h3 className="text-base font-semibold text-slate-100 border-b border-slate-800 pb-2">Delivery Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">Email Alerts (Resend/Brevo)</span>
              <span className="text-xs text-slate-400">Receive tax deadline digests & invoice receipts via email</span>
            </div>
            <Switch checked={settings.emailAlerts} onCheckedChange={v => setSettings({...settings, emailAlerts: v})} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">SMS Alerts (MSG91/Twilio)</span>
              <span className="text-xs text-slate-400">Receive urgent meeting & OTP alerts on SMS</span>
            </div>
            <Switch checked={settings.smsAlerts} onCheckedChange={v => setSettings({...settings, smsAlerts: v})} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="font-medium text-slate-200 block">WhatsApp Notifications</span>
              <span className="text-xs text-slate-400">Send automatic GST filing receipts via WhatsApp Business</span>
            </div>
            <Switch checked={settings.whatsappAlerts} onCheckedChange={v => setSettings({...settings, whatsappAlerts: v})} />
          </div>
        </div>
      </Card>
    </div>
  );
}
