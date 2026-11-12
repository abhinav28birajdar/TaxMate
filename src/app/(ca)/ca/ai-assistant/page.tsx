'use client';

import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatTurn[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your TaxMate AI Tax Assistant. Ask me anything about Indian Tax Laws, GST Notifications, Income Tax Sections (80C, 115BAC), TDS compliance, or ask about your workspace deadlines.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const history = messages.map((m) => ({
      role: m.role,
      content: m.text,
    }));

    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: trimmed, history }),
      });

      const json = await res.json();
      if (!res.ok || !json.reply) {
        throw new Error(json.error || 'AI Assistant could not process request');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: json.reply,
          source: json.source,
        },
      ]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to query AI Assistant');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Unable to reach AI Tax service right now. Please retry shortly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-lime-600" /> AI Tax Assistant
          </h1>
          <p className="text-xs text-slate-500">
            Real-time GST/ITR law interpretation, workspace deadline summaries, and notice drafting
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-lime-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-lime-600 text-white font-medium rounded-br-none shadow-md shadow-lime-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-center text-xs text-lime-600 dark:text-lime-400 font-semibold animate-pulse">
            <Sparkles className="w-4 h-4" /> Analyzing tax provisions and workspace data...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <Input
          type="text"
          placeholder="Ask a tax law question, TDS rule, or check upcoming deadlines..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm py-5 rounded-xl"
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-lime-600 hover:bg-lime-500 text-white px-5 rounded-xl shadow-md shadow-lime-600/20"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
