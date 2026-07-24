"use client";

import React, { useState } from 'react';
import { ToggleLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState({
    gemini_ai_assistant: true,
    livekit_video_consultation: true,
    whatsapp_notifications: true,
    razorpay_subscriptions: true,
    tesseract_ocr_client: true,
    maintenance_banner: false
  });

  const handleSave = () => {
    toast.success('Feature flags configuration updated live');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ToggleLeft className="w-6 h-6 text-lime-500" /> Feature Flags & Module Controls
          </h1>
          <p className="text-sm text-slate-400">Dynamically enable or disable platform services and AI models</p>
        </div>
        <Button className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2" onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Flags
        </Button>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-100 block">Gemini 1.5 Pro Tax AI Assistant</span>
              <span className="text-xs text-slate-400">Enable tax notice summarizer & chatbot for CAs</span>
            </div>
            <Switch checked={flags.gemini_ai_assistant} onCheckedChange={v => setFlags({...flags, gemini_ai_assistant: v})} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-100 block">LiveKit HD Video Consultation</span>
              <span className="text-xs text-slate-400">Enable WebRTC video call rooms</span>
            </div>
            <Switch checked={flags.livekit_video_consultation} onCheckedChange={v => setFlags({...flags, livekit_video_consultation: v})} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <span className="font-semibold text-slate-100 block">WhatsApp Business Receipts</span>
              <span className="text-xs text-slate-400">Send WhatsApp notifications via MSG91</span>
            </div>
            <Switch checked={flags.whatsapp_notifications} onCheckedChange={v => setFlags({...flags, whatsapp_notifications: v})} />
          </div>
        </div>
      </Card>
    </div>
  );
}
