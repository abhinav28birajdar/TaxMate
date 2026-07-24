"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, ArrowLeft, Send, User, ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CASupportTicketDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [reply, setReply] = useState('');

  const ticket = {
    id: params.id,
    subject: 'Issue with GST portal automated API sync',
    category: 'Technical Integration',
    status: 'in_progress',
    createdAt: '2026-07-22',
    messages: [
      { sender: 'CA Rajesh Sharma', text: 'Hi team, GSTR-2B data sync is failing for client GSTIN 27AABCU9603R1ZM with timeout error code 504.', time: '2 days ago' },
      { sender: 'TaxMate Support Agent', text: 'Hello Rajesh, we have re-triggered the API queue worker. Please verify if the reconciliation tab updates within 15 minutes.', time: '1 day ago' }
    ]
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    toast.success('Response added to ticket');
    setReply('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-900 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{ticket.subject}</h1>
            <p className="text-sm text-slate-400">Ticket ID: #{ticket.id} | {ticket.category}</p>
          </div>
        </div>
        <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 uppercase px-3 py-1">
          {ticket.status}
        </Badge>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <div className="space-y-4">
          {ticket.messages.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-lime-400">{m.sender}</span>
                <span className="text-slate-500">{m.time}</span>
              </div>
              <p className="text-sm text-slate-200">{m.text}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendReply} className="space-y-3 pt-4 border-t border-slate-800">
          <Textarea 
            placeholder="Type your reply to support..." 
            className="bg-slate-950 border-slate-800 text-slate-100 min-h-[90px]"
            value={reply}
            onChange={e => setReply(e.target.value)}
          />
          <div className="flex justify-end">
            <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold gap-2">
              <Send className="w-4 h-4" /> Post Reply
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
