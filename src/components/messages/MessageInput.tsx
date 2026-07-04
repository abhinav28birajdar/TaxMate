'use client';

import React, { useRef } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  onTyping?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  maxLength?: number;
  allowAttachments?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function MessageInput({
  onSend,
  onTyping,
  isLoading = false,
  placeholder = 'Type your message...',
  maxLength = 5000,
  allowAttachments = true,
  disabled = false,
  className,
}: MessageInputProps) {
  const [message, setMessage] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping?.();

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const canSend = (message.trim().length > 0 || attachments.length > 0) && !isLoading && !disabled;

  return (
    <div className={cn('flex flex-col gap-2 bg-white rounded-lg border border-slate-200 p-4', className)}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 bg-slate-100 rounded border border-slate-300 text-xs"
            >
              <span className="truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => handleRemoveAttachment(index)}
                className="text-red-600 hover:text-red-700 font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Message Input */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled || isLoading}
          className={cn(
            'resize-none bg-white text-sm min-h-10',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          rows={1}
        />
        <div className="flex gap-1">
          {allowAttachments && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isLoading}
                className="hover:bg-slate-100"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4 text-slate-600" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled || isLoading}
            className="hover:bg-slate-100"
            title="Add emoji"
          >
            <Smile className="w-4 h-4 text-slate-600" />
          </Button>
          <Button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'bg-lime-600 hover:bg-lime-700 text-white',
              !canSend && 'opacity-50 cursor-not-allowed'
            )}
            title="Send message (Ctrl+Enter)"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Ctrl+Enter to send</span>
        <span>
          {message.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
