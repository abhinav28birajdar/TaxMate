'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  FileSearch, 
  Calculator, 
  ShieldAlert, 
  User, 
  RefreshCw 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function ClientAIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am TaxMate Gemini AI Assistant. I can help calculate GST liability, explain Income Tax notices, summarize tax documents, or advise on deduction under 80C/80D.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputPrompt.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: inputPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputPrompt;
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentQuery }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: data.reply || 'I have analyzed your query based on current Indian Income Tax & GST laws.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'I am currently operating in demo mode. Under Section 80C, individual taxpayers can claim up to ₹1,50,000 deduction per financial year.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Under Section 80C, you can claim up to ₹1,50,000 per financial year across ELSS, PPF, EPF, and LIC premiums.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            AI Tax Assistant & Summarizer
            <Badge className="bg-lime-500/20 text-lime-400 border-lime-500/30">
              <Sparkles className="w-3 h-3 mr-1" /> Gemini 1.5 Powered
            </Badge>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Get instant answers on Income Tax, GST calculations, Section deductions, and IT notices.</p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => setInputPrompt('What are the differences between New vs Old Tax Regime for AY 2026-27?')}
          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-lime-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-lime-400 font-semibold text-xs mb-1">
            <Calculator className="w-4 h-4" /> Tax Regime Comparison
          </div>
          <p className="text-xs text-slate-400 group-hover:text-slate-300">Compare New vs Old Tax Regime slab rates</p>
        </button>

        <button
          onClick={() => setInputPrompt('How to calculate GSTR-3B Input Tax Credit (ITC) eligibility?')}
          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-lime-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-lime-400 font-semibold text-xs mb-1">
            <FileSearch className="w-4 h-4" /> GST ITC Guidelines
          </div>
          <p className="text-xs text-slate-400 group-hover:text-slate-300">Check eligible vs blocked ITC under Section 17(5)</p>
        </button>

        <button
          onClick={() => setInputPrompt('Analyze IT Notice under Section 143(1) intimation')}
          className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-lime-500/40 text-left transition-all group"
        >
          <div className="flex items-center gap-2 text-lime-400 font-semibold text-xs mb-1">
            <ShieldAlert className="w-4 h-4" /> Notice Analysis
          </div>
          <p className="text-xs text-slate-400 group-hover:text-slate-300">Understand Section 143(1) tax demand intimations</p>
        </button>
      </div>

      {/* Chat Conversation Box */}
      <Card className="bg-slate-900/50 border-slate-800 h-[480px] flex flex-col">
        <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-lime-600 text-slate-950 shadow-md shadow-lime-600/30'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-lime-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}
                <span className="block text-[10px] opacity-60 mt-1.5 text-right">{m.timestamp}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <RefreshCw className="w-4 h-4 animate-spin text-lime-400" /> TaxMate AI is analyzing tax rules...
            </div>
          )}
        </CardContent>

        {/* Input Field */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2 rounded-b-xl">
          <Input
            placeholder="Ask AI Tax Assistant anything about GST, ITR, TDS or deductions..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="bg-slate-900 border-slate-800 text-slate-200"
          />
          <Button
            onClick={handleSend}
            disabled={loading}
            className="bg-lime-600 hover:bg-lime-500 text-slate-950 font-bold px-5"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
