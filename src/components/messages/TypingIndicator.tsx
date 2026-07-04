'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

export default function TypingIndicator({
  users,
  className,
}: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const userText = users.length === 1 
    ? users[0]
    : users.length === 2
    ? `${users[0]} and ${users[1]}`
    : `${users.slice(0, -1).join(', ')} and ${users[users.length - 1]}`;

  return (
    <div className={cn('flex items-center gap-2 p-3 text-sm text-slate-600', className)}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>
        {userText} {users.length === 1 ? 'is' : 'are'} typing...
      </span>
    </div>
  );
}
