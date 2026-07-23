'use client';

import { useState } from 'react';
import { MessageSquare, Send, Paperclip, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ClientChatPage() {
  const [messages, setMessages] = useState([
    { sender: 'CA Rajesh Sharma', text: 'Hello! We have reviewed your Form 26AS for AY 2026-27. Please upload your HDFC bank interest certificate.', time: '10:30 AM', isCA: true },
    { sender: 'You', text: 'Sure CA Rajesh, I will upload it to the vault shortly.', time: '10:35 AM', isCA: false },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'You', text: input, time: 'Just now', isCA: false }]);
    setInput('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-lime-600 text-white font-bold flex items-center justify-center">
          RS
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            CA Rajesh Sharma <ShieldCheck className="w-4 h-4 text-lime-600" />
          </h3>
          <p className="text-xs text-slate-400">Apex Tax & Audit Firm • Online</p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-3 shadow-sm">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.isCA ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-md p-3 rounded-2xl text-xs ${m.isCA ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'bg-lime-600 text-white'}`}>
              <div className="font-semibold text-[10px] opacity-80 mb-1">{m.sender}</div>
              {m.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{m.time}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
        <Input placeholder="Type message to your CA..." value={input} onChange={(e) => setInput(e.target.value)} className="border-0 focus-visible:ring-0 text-xs shadow-none" />
        <Button type="submit" size="sm" className="bg-lime-600 hover:bg-lime-500 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
