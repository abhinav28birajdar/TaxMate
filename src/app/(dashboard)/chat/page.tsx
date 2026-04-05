'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Image as ImageIcon,
  File,
  Check,
  CheckCheck,
  Edit2,
  Trash2,
  Archive,
  X,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/AuthContext';
import { useConversations, useMessages, useTyping } from '@/hooks/useChat';
import { usePresence, formatLastSeen } from '@/hooks/usePresence';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { createClient } from '@/utils/supabase/client';
import { Conversation, Message } from '@/types/database.types';

// Types for enhanced conversation data
interface ConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface EnhancedConversation extends Conversation {
  participants?: ConversationParticipant[];
  unread_count?: number;
}

// Helper to format message date
function formatMessageDate(date: Date): string {
  if (isToday(date)) return format(date, 'p');
  if (isYesterday(date)) return 'Yesterday ' + format(date, 'p');
  return format(date, 'MMM d, p');
}

// Helper to format conversation date
function formatConversationDate(date: Date): string {
  if (isToday(date)) return format(date, 'p');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

// Helper to get initials
function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
}

// Date separator component
function DateSeparator({ date }: { date: Date }) {
  let label = format(date, 'MMMM d, yyyy');
  if (isToday(date)) label = 'Today';
  if (isYesterday(date)) label = 'Yesterday';

  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// Typing indicator component
function TypingIndicator({ users }: { users: { firstName: string; lastName: string }[] }) {
  if (users.length === 0) return null;

  const names = users.map(u => u.firstName).join(', ');
  const text = users.length === 1 ? `${names} is typing...` : `${names} are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-pulse">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  );
}

// Message bubble component
function MessageBubble({
  message,
  isOwn,
  onEdit,
  onDelete,
  showAvatar = false,
  participantName = '',
  participantAvatar = '',
}: {
  message: Message;
  isOwn: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  showAvatar?: boolean;
  participantName?: string;
  participantAvatar?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(message.id, editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className={cn('flex gap-2 group', isOwn ? 'justify-end' : 'justify-start')}>
      {!isOwn && showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={participantAvatar} />
          <AvatarFallback className="text-xs">
            {getInitials(participantName.split(' ')[0], participantName.split(' ')[1] || '')}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      <div className={cn('flex flex-col gap-1 max-w-[70%]', isOwn && 'items-end')}>
        <div className="flex items-center gap-2">
          {isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete?.(message.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div
            className={cn(
              'rounded-2xl px-4 py-2 text-sm',
              isOwn
                ? 'bg-primary text-primary-foreground rounded-br-none'
                : 'bg-muted rounded-bl-none'
            )}
          >
            {message.message_type === 'image' && message.file_url && (
              <img
                src={message.file_url}
                alt={message.file_name || 'Image'}
                className="rounded-lg max-w-full max-h-60 mb-2"
              />
            )}
            {message.message_type === 'file' && message.file_url && (
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-background/50 rounded-lg mb-2 hover:bg-background/80 transition-colors"
              >
                <File className="h-5 w-5" />
                <span className="text-sm truncate">{message.file_name || 'File'}</span>
              </a>
            )}
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-w-[200px]"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              message.content && <p>{message.content}</p>
            )}
          </div>
        </div>

        <div className={cn('flex items-center gap-1 text-[10px] text-muted-foreground', isOwn && 'flex-row-reverse')}>
          <span>{formatMessageDate(new Date(message.created_at))}</span>
          {message.is_edited && <span>(edited)</span>}
          {isOwn && (
            <span>
              {message.is_read ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Conversation list item
function ConversationItem({
  conversation,
  isSelected,
  isOnline,
  onClick,
}: {
  conversation: EnhancedConversation;
  isSelected: boolean;
  isOnline: boolean;
  onClick: () => void;
}) {
  const participant = conversation.participants?.[0];
  const name = participant
    ? `${participant.first_name} ${participant.last_name}`
    : 'Unknown User';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 text-left rounded-lg transition-colors hover:bg-muted w-full',
        isSelected && 'bg-primary/10'
      )}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage src={participant?.avatar_url || ''} />
          <AvatarFallback>
            {getInitials(participant?.first_name || '', participant?.last_name || '')}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="font-semibold truncate">{name}</span>
          {conversation.last_message_at && (
            <span className="text-xs text-muted-foreground">
              {formatConversationDate(new Date(conversation.last_message_at))}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.last_message_preview || 'No messages yet'}
          </p>
          {(conversation.unread_count || 0) > 0 && (
            <Badge variant="default" className="ml-2">
              {conversation.unread_count}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}

// New conversation dialog
function NewConversationDialog({
  onCreateConversation,
}: {
  onCreateConversation: (userId: string) => Promise<void>;
}) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { user, role } = useAuth();

  const searchUsers = useCallback(async () => {
    if (!search.trim() || !user) return;

    setLoading(true);
    try {
      // Search based on role - CAs search clients, clients search CAs
      const table = role === 'ca' ? 'client_profiles' : 'ca_profiles';
      const { data } = await supabase
        .from(table)
        .select('user_id, first_name, last_name, avatar_url')
        .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
        .neq('user_id', user.id)
        .limit(10);

      setUsers(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setLoading(false);
    }
  }, [search, user, role, supabase]);

  useEffect(() => {
    const timeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search, searchUsers]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Plus className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${role === 'ca' ? 'clients' : 'CAs'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-2">
                {users.map((u) => (
                  <button
                    key={u.user_id}
                    onClick={() => onCreateConversation(u.user_id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted w-full text-left transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback>
                        {getInitials(u.first_name, u.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {u.first_name} {u.last_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : search ? (
              <p className="text-center text-muted-foreground py-8">
                No users found
              </p>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Start typing to search
              </p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const {
    conversations,
    loading: conversationsLoading,
    createConversation,
    archiveConversation,
  } = useConversations();
  const { isUserOnline, getLastSeen } = usePresence();

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Get selected conversation data
  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId) as EnhancedConversation | undefined,
    [conversations, selectedConversationId]
  );

  const participantId = useMemo(() => {
    if (!selectedConversation || !user) return null;
    return selectedConversation.participant_ids.find((id: string) => id !== user.id) || null;
  }, [selectedConversation, user]);

  // Messages and typing for selected conversation
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
    loadMore,
    hasMore,
  } = useMessages(selectedConversationId);

  const { typingUsers, setTyping } = useTyping(selectedConversationId);

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return (conversations as EnhancedConversation[]).filter((conv) => {
      const participant = conv.participants?.[0];
      if (!participant) return false;
      const name = `${participant.first_name} ${participant.last_name}`.toLowerCase();
      return name.includes(query);
    });
  }, [conversations, searchQuery]);

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead();
    }
  }, [selectedConversationId, markAsRead]);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    await sendMessage(messageInput);
    setMessageInput('');
    setTyping(false);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversationId || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `chat-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      await sendMessage('', publicUrl, file.name);
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle create new conversation
  const handleCreateConversation = async (userId: string) => {
    const conversation = await createConversation(userId);
    if (conversation) {
      setSelectedConversationId(conversation.id);
    }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    setTyping(e.target.value.length > 0);
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: Date; messages: Message[] }[] = [];
    let currentGroup: { date: Date; messages: Message[] } | null = null;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.created_at);
      if (!currentGroup || !isSameDay(currentGroup.date, msgDate)) {
        currentGroup = { date: msgDate, messages: [msg] };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  // Get participant info
  const participant = (selectedConversation as EnhancedConversation)?.participants?.[0];
  const participantName = participant
    ? `${participant.first_name} ${participant.last_name}`
    : 'Unknown User';
  const participantOnline = participantId ? isUserOnline(participantId) : false;

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-card overflow-hidden shadow-sm">
      {/* Sidebar - Conversations */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Messages</h2>
            <NewConversationDialog onCreateConversation={handleCreateConversation} />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {conversationsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a new conversation to begin chatting
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherParticipantId = conv.participant_ids.find(
                  (id: string) => id !== user?.id
                );
                return (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv as EnhancedConversation}
                    isSelected={selectedConversationId === conv.id}
                    isOnline={otherParticipantId ? isUserOnline(otherParticipantId) : false}
                    onClick={() => setSelectedConversationId(conv.id)}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={participant?.avatar_url || ''} />
                    <AvatarFallback>
                      {getInitials(
                        participant?.first_name || '',
                        participant?.last_name || ''
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {participantOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{participantName}</h3>
                  <p
                    className={cn(
                      'text-xs flex items-center gap-1',
                      participantOnline ? 'text-green-600' : 'text-muted-foreground'
                    )}
                  >
                    {participantOnline ? (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Online
                      </>
                    ) : (
                      `Last seen ${formatLastSeen(participantId ? getLastSeen(participantId) : null)}`
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5 text-muted-foreground" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => archiveConversation(selectedConversation.id)}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/5">
              <div className="space-y-4">
                {hasMore && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" onClick={loadMore}>
                      Load earlier messages
                    </Button>
                  </div>
                )}

                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  groupedMessages.map((group, groupIndex) => (
                    <div key={groupIndex}>
                      <DateSeparator date={group.date} />
                      <div className="space-y-2">
                        {group.messages.map((msg, msgIndex) => {
                          const isOwn = msg.sender_id === user?.id;
                          const prevMsg = group.messages[msgIndex - 1];
                          const showAvatar =
                            !isOwn &&
                            (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                          return (
                            <MessageBubble
                              key={msg.id}
                              message={msg}
                              isOwn={isOwn}
                              onEdit={editMessage}
                              onDelete={deleteMessage}
                              showAvatar={showAvatar}
                              participantName={participantName}
                              participantAvatar={participant?.avatar_url || ''}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}

                <TypingIndicator users={typingUsers} />
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 bg-background border-t">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Paperclip className="w-5 h-5 text-muted-foreground" />
                  )}
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!messageInput.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
            <div className="text-center">
              <p className="text-lg font-medium">Welcome to Messages</p>
              <p className="text-sm">Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
