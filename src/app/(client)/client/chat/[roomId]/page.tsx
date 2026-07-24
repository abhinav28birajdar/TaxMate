"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send, Paperclip, ArrowLeft, Phone, Video, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function ClientChatRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'CA Rajesh Sharma', text: 'Hello! I have completed reviewing your GSTR-2B purchase register.', time: '10:30 AM', isMe: false },
    { id: '2', sender: 'You', text: 'Great! Is there any ITC mismatch for June?', time: '10:32 AM', isMe: true },
    { id: '3', sender: 'CA Rajesh Sharma', text: 'Only a minor 2% variance from 1 vendor. We can claim 98% safely.', time: '10:35 AM', isMe: false }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages([...messages, {
      id: String(Date.now()),
      sender: 'You',
      text: inputText,
      time: 'Just now',
      isMe: true
    }]);
    setInputText('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-950 text-slate-300" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar>
            <AvatarFallback className="bg-lime-600/20 text-lime-400 font-bold">RS</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
              CA Rajesh Sharma <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
            </h2>
            <span className="text-xs text-lime-400">Online | End-to-End Encrypted</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-950 text-slate-300">
            <Phone className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="outline" size="icon" className="border-slate-800 bg-slate-950 text-slate-300">
            <Video className="w-4 h-4 text-lime-400" />
          </Button>
        </div>
      </div>

      <Card className="flex-1 bg-slate-900 border-slate-800 p-4 overflow-y-auto space-y-3">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-md p-3.5 rounded-2xl text-sm ${
              m.isMe 
                ? 'bg-lime-600 text-slate-950 font-medium rounded-tr-none' 
                : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none'
            }`}>
              <p>{m.text}</p>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
          </div>
        ))}
      </Card>

      <form onSubmit={handleSend} className="flex items-center gap-2">
        <Input 
          placeholder="Type message to CA..." 
          className="bg-slate-900 border-slate-800 text-slate-100 h-12" 
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-semibold h-12 px-6">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
