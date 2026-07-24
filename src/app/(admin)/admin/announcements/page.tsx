"use client";

import React, { useState } from 'react';
import { Megaphone, Plus, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    toast.success('System announcement broadcasted to all active user dashboards!');
    setTitle('');
    setContent('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-lime-500" /> Platform Announcements & Broadcasts
        </h1>
        <p className="text-sm text-slate-400">Broadcast maintenance notifications, statutory compliance alerts, and release notes</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Announcement Title</label>
            <Input 
              placeholder="e.g. Scheduled GST Portal Maintenance Alert - July 28" 
              className="bg-slate-950 border-slate-800 text-slate-100" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300">Broadcast Message Body</label>
            <Textarea 
              placeholder="Type message content for banners..." 
              className="bg-slate-950 border-slate-800 text-slate-100 min-h-[100px]" 
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
            <Send className="w-4 h-4" /> Broadcast Banner Now
          </Button>
        </form>
      </Card>
    </div>
  );
}
