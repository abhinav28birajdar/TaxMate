'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Sparkles,
    Send,
    Bot,
    User,
    Loader2,
    RotateCcw,
    BookOpen,
    Scale,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedPrompts = [
    { icon: FileText, label: "Check my return status", prompt: "Can you check the latest status of my ITR filing?" },
    { icon: Scale, label: "New tax regime vs Old", prompt: "Which is better for me this year: New or Old tax regime?" },
    { icon: BookOpen, label: "Deductions guide", prompt: "Explain common 80C deductions I should know about." },
];

export function AiConsultant() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am your AI Tax Consultant. How can I help you with your taxes today?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const handleSend = async (content: string = input) => {
        if (!content.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // Simulate AI response for now (real integration would call an edge function)
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I've analyzed your request about "${content}". Based on current tax laws and your profile as a resident individual, you should consider the following... [This is a demonstration of the AI interface. Real AI logic can be connected via Gemini API]`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1500);
    };

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    return (
        <Card className="flex flex-col h-full min-h-[600px] shadow-lg border-2 border-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary text-white shadow-md shadow-primary/20">
                            <Bot className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                TaxMate AI Consultant
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] py-0">Beta</Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">Expert tax advice powered by AI</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => setMessages([messages[0]])}>
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden bg-dot-pattern">
                <ScrollArea ref={scrollAreaRef} className="h-full p-4">
                    <div className="space-y-6">
                        <AnimatePresence>
                            {messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <Avatar className={cn(
                                        "w-8 h-8 shrink-0 mt-1 shadow-sm",
                                        m.role === 'assistant' ? "bg-primary text-primary-foreground" : "bg-muted shadow-none"
                                    )}>
                                        <AvatarImage src={m.role === 'assistant' ? undefined : undefined} />
                                        <AvatarFallback>
                                            {m.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={cn(
                                        "rounded-2xl p-4 text-sm shadow-sm",
                                        m.role === 'assistant'
                                            ? "bg-muted font-medium leading-relaxed"
                                            : "bg-primary text-primary-foreground shadow-primary/20"
                                    )}>
                                        {m.content}
                                        <div className={cn(
                                            "text-[10px] mt-2 opacity-50",
                                            m.role === 'user' ? "text-right" : "text-left"
                                        )}>
                                            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isLoading && (
                            <div className="flex gap-3 mr-auto max-w-[85%]">
                                <Avatar className="w-8 h-8 shrink-0 mt-1 bg-primary text-primary-foreground">
                                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-2xl p-4 flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {messages.length === 1 && (
                        <div className="mt-8 space-y-4">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">Suggested queries</p>
                            <div className="grid grid-cols-1 gap-2">
                                {suggestedPrompts.map((p, i) => {
                                    const Icon = p.icon;
                                    return (
                                        <Button
                                            key={i}
                                            variant="outline"
                                            className="justify-start h-auto py-3 px-4 text-left border-dashed hover:border-primary hover:bg-primary/5 transition-all group"
                                            onClick={() => handleSend(p.prompt)}
                                        >
                                            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/20 mr-3 transition-colors">
                                                <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <span className="text-sm font-medium">{p.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 bg-muted/20 border-t">
                <form
                    className="flex items-center gap-2 w-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                >
                    <div className="relative flex-1">
                        <Input
                            placeholder="Ask about tax saving, deductions..."
                            className="pr-10 bg-background border-none focus-visible:ring-1 ring-primary/20 shadow-inner"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <Sparkles className="absolute right-3 top-2.5 h-4 w-4 text-primary/40 animate-pulse" />
                    </div>
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="shrink-0 shadow-lg shadow-primary/20"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
