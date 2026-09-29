'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Video, 
  Phone, 
  MoreVertical, 
  FileText, 
  CheckCheck, 
  Sparkles,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CAChatRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string || 'ROOM-842';

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'client',
      senderName: 'Rohan Deshmukh (Acme Tech)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      time: '11:15 AM',
      text: 'Good morning CA Rajesh. We just uploaded our revised HDFC Bank statement and Form 26AS for Q1. Could you check if the TDS mismatch is resolved?',
      attachments: [
        { name: 'HDFC_Bank_Statement_Q1.pdf', size: '2.8 MB', type: 'pdf' }
      ]
    },
    {
      id: 2,
      sender: 'ca',
      senderName: 'CA Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      time: '11:22 AM',
      text: 'Hello Rohan. I have reviewed the AIS and 26AS. The ₹45,000 TDS deduction by client Globex has now been credited. Our team is updating the draft Tax Audit report (Form 3CD).',
      attachments: []
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'ca',
      senderName: 'CA Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      time: 'Just now',
      text: inputMessage,
      attachments: []
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    toast.success('Message delivered!');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Top Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <Link href="/ca/chat" className="text-slate-500 hover:text-lime-600">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
              alt="Acme Tech"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime-600 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Acme Technologies Pvt Ltd
              <Badge className="bg-lime-600/10 text-lime-700 dark:text-lime-400 text-[10px]">Client</Badge>
            </div>
            <div className="text-[11px] text-slate-500">Rohan Deshmukh • Online • Room #{roomId}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/ca/calls/${roomId}?type=video`}>
            <Button size="sm" variant="outline" className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
              <Video className="w-3.5 h-3.5 mr-1 text-lime-600" /> Start Video Call
            </Button>
          </Link>
          <Link href={`/ca/calls/${roomId}?type=voice`}>
            <Button size="sm" variant="outline" className="text-xs rounded-xl border-slate-200 dark:border-slate-800">
              <Phone className="w-3.5 h-3.5 mr-1 text-lime-600" /> Voice Call
            </Button>
          </Link>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'ca' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender !== 'ca' && (
              <img src={msg.avatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
            )}

            <div className={`max-w-md rounded-2xl p-4 space-y-2 ${
              msg.sender === 'ca'
                ? 'bg-lime-600 text-white shadow-md shadow-lime-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-[11px] opacity-80 mb-1 gap-4">
                <span className="font-semibold">{msg.senderName}</span>
                <span>{msg.time}</span>
              </div>

              <p className="text-xs leading-relaxed">{msg.text}</p>

              {msg.attachments.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-black/10 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate">{att.name}</span>
                      </div>
                      <span className="text-[10px] opacity-75">{att.size}</span>
                    </div>
                  ))}
                </div>
              )}

              {msg.sender === 'ca' && (
                <div className="flex justify-end text-[10px] opacity-75">
                  <CheckCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {msg.sender === 'ca' && (
              <img src={msg.avatar} alt={msg.senderName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => toast.info('File attachment dialog')} className="text-slate-500 hover:text-lime-600">
          <Paperclip className="w-4 h-4" />
        </Button>
        <Input
          placeholder="Type message, compliance question, or paste text..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl text-xs"
        />
        <Button
          type="submit"
          disabled={!inputMessage.trim()}
          className="bg-lime-600 hover:bg-lime-500 text-white font-bold text-xs rounded-xl px-4 shadow-md shadow-lime-600/20"
        >
          <Send className="w-3.5 h-3.5 mr-1" /> Send
        </Button>
      </form>
    </div>
  );
}
