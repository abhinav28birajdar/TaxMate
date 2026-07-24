"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, ArrowLeft, Video, User, Check, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    date: '',
    time: '',
    duration: '45',
    medium: 'livekit',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      toast.error('Please fill in required meeting fields');
      return;
    }
    toast.success('Meeting scheduled successfully! Invite sent to client.');
    router.push('/ca/meetings');
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Schedule Consultation Meeting</h1>
          <p className="text-sm text-slate-400">Set up a video or audio consultation session with a client</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300">Meeting Topic / Title *</Label>
            <Input 
              placeholder="e.g. Q2 GST Return Discussion & Tax Planning" 
              className="bg-slate-950 border-slate-800 text-slate-100" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Select Client *</Label>
            <Select onValueChange={v => setFormData({...formData, client: v})}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                <SelectValue placeholder="Choose client..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="acme">Acme Solutions Pvt Ltd</SelectItem>
                <SelectItem value="pooja">Pooja Verma (Individual)</SelectItem>
                <SelectItem value="technova">TechNova Solutions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Date *</Label>
              <Input 
                type="date" 
                className="bg-slate-950 border-slate-800 text-slate-100" 
                value={formData.date} 
                onChange={e => setFormData({...formData, date: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Time *</Label>
              <Input 
                type="time" 
                className="bg-slate-950 border-slate-800 text-slate-100" 
                value={formData.time} 
                onChange={e => setFormData({...formData, time: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Duration (Minutes)</Label>
              <Select defaultValue="45" onValueChange={v => setFormData({...formData, duration: v})}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  <SelectItem value="30">30 Mins</SelectItem>
                  <SelectItem value="45">45 Mins</SelectItem>
                  <SelectItem value="60">60 Mins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Meeting Platform</Label>
            <Select defaultValue="livekit" onValueChange={v => setFormData({...formData, medium: v})}>
              <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                <SelectItem value="livekit">LiveKit HD Video (Primary)</SelectItem>
                <SelectItem value="jitsi">Jitsi Meet Fallback</SelectItem>
                <SelectItem value="in_person">In-Person at Office</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Meeting Agenda / Notes</Label>
            <Textarea 
              placeholder="Add key agenda items or document requirements..." 
              className="bg-slate-950 border-slate-800 text-slate-100 min-h-[90px]" 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" className="border-slate-800 text-slate-300" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
              <Send className="w-4 h-4" /> Send Meeting Invite
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
