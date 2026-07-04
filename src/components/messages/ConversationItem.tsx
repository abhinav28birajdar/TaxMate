'use client';

import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Users, Archive, Trash2, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ConversationItemProps {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  participantCount?: number;
  isArchived?: boolean;
  isPinned?: boolean;
  avatar?: string;
  onClick?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
  active?: boolean;
  className?: string;
}

export default function ConversationItem({
  id,
  name,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  participantCount,
  isArchived = false,
  isPinned = false,
  avatar,
  onClick,
  onArchive,
  onDelete,
  onPin,
  active = false,
  className,
}: ConversationItemProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors',
        active && 'border-lime-600 bg-lime-50',
        isArchived && 'opacity-60',
        className
      )}
    >
      {/* Avatar and Content */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm',
            avatar ? 'bg-cover bg-center' : 'bg-slate-300'
          )}
          style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
        >
          {!avatar && name.charAt(0).toUpperCase()}
        </div>

        {/* Text Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className={cn('font-semibold truncate', unreadCount > 0 && 'text-slate-900 font-bold')}>
              {name}
            </p>
            {participantCount && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3 h-3" />
                {participantCount}
              </div>
            )}
            {isPinned && (
              <Pin className="w-3 h-3 text-lime-600 flex-shrink-0" />
            )}
          </div>
          <p className={cn('text-sm truncate', unreadCount > 0 ? 'text-slate-900' : 'text-slate-600')}>
            {lastMessage}
          </p>
        </div>

        {/* Time and Unread */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-xs text-slate-500">
            {formatDistanceToNow(new Date(lastMessageTime), { addSuffix: false })}
          </span>
          {unreadCount > 0 && (
            <Badge className="bg-lime-600 text-white text-xs px-2 py-0.5">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="hover:bg-slate-100"
            >
              ⋯
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onPin && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPin(); }}>
                {isPinned ? 'Unpin' : 'Pin Conversation'}
              </DropdownMenuItem>
            )}
            {onArchive && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                {isArchived ? 'Unarchive' : 'Archive'}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
