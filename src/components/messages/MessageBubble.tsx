'use client';

import React from 'react';
import { format } from 'date-fns';
import { Copy, Trash2, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

interface MessageBubbleProps {
  id: string;
  content: string;
  sender: string;
  senderRole?: 'ca' | 'client' | 'staff';
  timestamp: string;
  avatar?: string;
  isOwn?: boolean;
  attachments?: MessageAttachment[];
  isEdited?: boolean;
  reactions?: Record<string, number>;
  onDelete?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
  onDownload?: (attachment: MessageAttachment) => void;
  className?: string;
}

const roleColors: Record<string, string> = {
  ca: 'bg-blue-100 text-blue-700',
  client: 'bg-green-100 text-green-700',
  staff: 'bg-purple-100 text-purple-700',
};

export default function MessageBubble({
  id,
  content,
  sender,
  senderRole,
  timestamp,
  avatar,
  isOwn = false,
  attachments = [],
  isEdited = false,
  reactions = {},
  onDelete,
  onCopy,
  onReply,
  onDownload,
  className,
}: MessageBubbleProps) {
  return (
    <div
      className={cn('flex gap-3 mb-4', isOwn && 'flex-row-reverse', className)}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs',
          avatar ? 'bg-cover bg-center' : 'bg-slate-300'
        )}
        style={avatar ? { backgroundImage: `url(${avatar})` } : undefined}
      >
        {!avatar && sender.charAt(0).toUpperCase()}
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col gap-1 max-w-md', isOwn && 'items-end')}>
        {/* Sender Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{sender}</span>
          {senderRole && (
            <Badge className={cn('text-xs py-0 px-1.5', roleColors[senderRole])}>
              {senderRole.toUpperCase()}
            </Badge>
          )}
          <span className="text-xs text-slate-500">{format(new Date(timestamp), 'HH:mm')}</span>
          {isEdited && <span className="text-xs text-slate-400 italic">(edited)</span>}
        </div>

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-lg p-3 break-words',
            isOwn
              ? 'bg-lime-600 text-white rounded-br-none'
              : 'bg-slate-100 text-slate-900 rounded-bl-none'
          )}
        >
          <p className="text-sm">{content}</p>
        </div>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded border text-xs',
                  isOwn
                    ? 'bg-lime-100 border-lime-300'
                    : 'bg-slate-100 border-slate-300'
                )}
              >
                <span className="truncate font-medium">{attachment.name}</span>
                <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{attachment.size}</span>
                {onDownload && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => onDownload(attachment)}
                  >
                    ↓
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex gap-1 mt-1">
            {Object.entries(reactions).map(([emoji, count]) => (
              <div
                key={emoji}
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  isOwn
                    ? 'bg-lime-700 text-white'
                    : 'bg-slate-200 text-slate-700'
                )}
              >
                {emoji} {count}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1 mt-1 opacity-0 hover:opacity-100 transition-opacity">
          {onCopy && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={onCopy}
              title="Copy message"
            >
              <Copy className="w-3 h-3" />
            </Button>
          )}
          {onReply && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={onReply}
              title="Reply to message"
            >
              <Reply className="w-3 h-3" />
            </Button>
          )}
          {isOwn && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  title="More options"
                >
                  ⋯
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
