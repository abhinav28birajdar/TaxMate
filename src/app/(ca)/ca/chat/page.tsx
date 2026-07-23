'use client';

import { useState } from 'react';
import { MessageSquare, Send, Paperclip, Mic, Image, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CAChatPage() {
  const [selectedRoom, setSelectedRoom] = useState('TechNova Solutions');
  const [messages, setMessages] = useState([
    { sender: 'TechNova Solutions', text: 'Hi CA Rajesh, we uploaded our Q2 bank statements and Form 26AS for review.', time: '10:30 AM' },
    { sender: 'You', text: 'Thanks! I am reviewing the GST ITC mismatches now.', time: '10:34 AM' },
  ]);
  const [input, setInput] = useState('');

  const rooms = [
    { name: 'TechNova Solutions', lastMsg: 'I am reviewing the GST ITC mismatches now.', time: '10:34 AM', unread: 0 },
    { name: 'Ananya Deshmukh', lastMsg: 'Can you verify my ITR-3 draft refund?', time: 'Yesterday', unread: 2 },
    { name: 'Apex Logistics India', lastMsg: 'TDS Challan payment receipt attached.', time: '18 Oct', unread: 0 },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'You', text: input, time: 'Just now' }]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Rooms Sidebar */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Client Messages</h2>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input placeholder="Search client chat..." className="pl-9 bg-slate-50 dark:bg-slate-800 text-xs" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {rooms.map((rm) => (
            <div
              key={rm.name}
              onClick={() => setSelectedRoom(rm.name)}
              className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                selectedRoom === rm.name
                  ? 'bg-lime-600/10 border-l-4 border-lime-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-lime-600/20 text-lime-600 font-bold flex items-center justify-center text-xs shrink-0">
                  {rm.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{rm.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{rm.lastMsg}</p>
                </div>
              </div>
              {rm.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-lime-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {rm.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lime-600 text-white font-bold flex items-center justify-center text-xs">
              {selectedRoom.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{selectedRoom}</h3>
              <span className="text-[10px] text-lime-600 dark:text-lime-400 font-medium">● Online</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'You'
                    ? 'bg-lime-600 text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{m.time}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 items-center bg-white dark:bg-slate-900">
          <Button type="button" variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-800 text-xs border-slate-200 dark:border-slate-700 py-4"
          />
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white px-4 rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
