'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, FileText, ShieldAlert, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your TaxMate Gemini Tax Assistant. Ask me anything about Indian Tax Laws, GST Notifications, Income Tax Sections (80C, 115BAC), or ask me to draft a Notice Response.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Based on Section ${userMsg.includes('GST') ? '16(4) of the CGST Act 2017' : '115BAC of the Income Tax Act 1961'}: ${
            userMsg.includes('GST')
              ? 'Input Tax Credit (ITC) for any invoice can be claimed up to 30th November following the end of the financial year.'
              : 'Under the New Tax Regime, tax slabs apply with zero tax up to ₹7 Lakhs after standard deduction of ₹75,000.'
          } Feel free to ask for detailed legal citations or automated reply drafting!`,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-lime-600" /> AI Tax Assistant (Gemini Powered)
          </h1>
          <p className="text-xs text-slate-500">Real-time GST/ITR law interpretation, legal drafting, and notice analysis</p>
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
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
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
            <Sparkles className="w-4 h-4" /> Gemini AI is analyzing tax provisions...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <Input
          type="text"
          placeholder="Ask a tax law question or request notice draft..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm py-5 rounded-xl"
        />
        <Button type="submit" disabled={loading} className="bg-lime-600 hover:bg-lime-500 text-white px-5 rounded-xl shadow-md shadow-lime-600/20">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
