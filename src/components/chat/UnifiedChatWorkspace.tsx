"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Image as ImageIcon,
  FileText,
  Search,
  Check,
  CheckCheck,
  Phone,
  Video,
  ShieldCheck,
  Users,
  Play,
  Pause,
  Reply,
  Trash2,
  Edit3,
  X,
  Download,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/UnifiedAuthContext";

interface MessageAttachment {
  id?: string;
  name: string;
  size?: number;
  mimeType?: string;
  url?: string;
  path?: string;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isSelf: boolean;
  messageType: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "SYSTEM";
  isEdited?: boolean;
  replyTo?: { id: string; sender: string; text: string };
  reactions?: Record<string, number>;
  attachments?: MessageAttachment[];
}

interface ChatRoom {
  id: string;
  name: string;
  roleSubtitle: string;
  avatar: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
}

interface EligibleContact {
  id: string;
  name: string;
  email?: string;
  roleSubtitle: string;
}

function initialsFromName(name: string): string {
  const parts = String(name || "TM")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "TM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function formatClockTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export function UnifiedChatWorkspace({
  portal = "client",
  initialRoomId,
}: {
  portal: "client" | "ca";
  initialRoomId?: string;
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [contacts, setContacts] = useState<EligibleContact[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(initialRoomId || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [inputMessage, setInputMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  // Recording audio
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const [showEventTicker, setShowEventTicker] = useState(true);
  const [latestEvent, setLatestEvent] = useState("Encrypted Supabase Realtime messaging active");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showMessageSearchBar, setShowMessageSearchBar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingRooms(true);
      const res = await fetch("/api/conversations", { credentials: "include" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load conversations");
      }

      const mappedRooms: ChatRoom[] = (json.conversations || []).map((c: any) => ({
        id: c.id,
        name: c.displayTitle || "Consultation Channel",
        roleSubtitle: c.peerRoleSubtitle || (c.type === "group" ? "Group Channel" : "Encrypted Channel"),
        avatar: initialsFromName(c.displayTitle || "TM"),
        isGroup: c.type === "group",
        unreadCount: Number(c.unreadCount || 0),
        lastMessage: c.lastMessageText || "No messages yet",
        lastTime: formatClockTime(c.lastMessageAt),
      }));

      setRooms(mappedRooms);
      setContacts(json.contacts || []);
      if (mappedRooms.length > 0 && !selectedRoomId) {
        setSelectedRoomId(mappedRooms[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not load conversations");
    } finally {
      setLoadingRooms(false);
    }
  }, [selectedRoomId]);

  const mapRawMessage = useCallback(
    (raw: any, currentRoomName?: string): ChatMessage => {
      const isSelf = raw.sender_id === user?.id;
      const attachments: MessageAttachment[] = Array.isArray(raw.attachments)
        ? raw.attachments
        : raw.metadata?.fileUrl
          ? [{ name: "Shared Attachment", url: raw.metadata.fileUrl }]
          : [];
      return {
        id: raw.id,
        conversationId: raw.conversation_id,
        senderId: raw.sender_id,
        senderName: isSelf ? "You" : currentRoomName || "Participant",
        text: raw.content || "",
        time: formatClockTime(raw.created_at),
        isSelf,
        messageType: raw.message_type || "TEXT",
        isEdited: Boolean(raw.is_edited),
        reactions: raw.reactions || {},
        attachments,
      };
    },
    [user?.id]
  );

  const fetchMessagesForRoom = useCallback(
    async (roomId: string, roomName?: string) => {
      if (!roomId) return;
      try {
        setLoadingMessages(true);
        const res = await fetch(
          `/api/messages?conversationId=${encodeURIComponent(roomId)}&limit=100`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.message || json.error || "Failed to load messages");
        }
        const rawList = json.data?.messages || [];
        const baseMapped: ChatMessage[] = rawList.map((m: any) =>
          mapRawMessage(m, roomName)
        );
        // Hydrate reply previews cleanly
        const byId = new Map(baseMapped.map((m) => [m.id, m]));
        const hydrated = baseMapped.map((m, idx) => {
          const replyId = rawList[idx]?.reply_to_id;
          const target = replyId ? byId.get(replyId) : undefined;
          return target
            ? {
                ...m,
                replyTo: {
                  id: target.id,
                  sender: target.senderName,
                  text: target.text || target.attachments?.[0]?.name || "Attachment",
                },
              }
            : m;
        });

        setMessages(hydrated);
        // Clear local unread count for opened room
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r))
        );
      } catch (err: any) {
        toast.error(err.message || "Could not load messages");
      } finally {
        setLoadingMessages(false);
      }
    },
    [mapRawMessage]
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const currentRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  useEffect(() => {
    if (selectedRoomId) {
      fetchMessagesForRoom(selectedRoomId, currentRoom?.name);
    }
  }, [selectedRoomId, currentRoom?.name, fetchMessagesForRoom]);

  // Supabase Realtime subscription for selected conversation
  useEffect(() => {
    if (!supabase || !selectedRoomId) return;
    const channel = supabase
      .channel(`chat:${selectedRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedRoomId}`,
        },
        (payload: any) => {
          if (payload.eventType === "INSERT" && payload.new) {
            const incoming = mapRawMessage(payload.new, currentRoom?.name);
            setMessages((prev) =>
              prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]
            );
            setLatestEvent(
              `${incoming.senderName}: ${incoming.text.slice(0, 80) || "Attachment"}`
            );
          } else if (payload.eventType === "UPDATE" && payload.new) {
            if (payload.new.deleted_at) {
              setMessages((prev) => prev.filter((m) => m.id !== payload.new.id));
            } else {
              const updated = mapRawMessage(payload.new, currentRoom?.name);
              setMessages((prev) =>
                prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, selectedRoomId, currentRoom?.name, mapRawMessage]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages.length]);

  useEffect(() => {
    if (!isRecordingVoice) {
      setRecordingSeconds(0);
      return;
    }
    const timer = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRoomId || !inputMessage.trim() || sendingMessage) return;

    const cleanText = inputMessage.trim();
    try {
      setSendingMessage(true);

      if (editingMessage) {
        const res = await fetch(`/api/messages/${editingMessage.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: cleanText }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Edit failed");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === editingMessage.id ? { ...m, text: cleanText, isEdited: true } : m
          )
        );
        setEditingMessage(null);
        setInputMessage("");
        toast.success("Message updated.");
        return;
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: selectedRoomId,
          content: cleanText,
          messageType: "TEXT",
          ...(replyingTo ? { replyToId: replyingTo.id } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to send message");
      }

      const saved = json.data?.message;
      if (saved) {
        const mapped = mapRawMessage(saved, currentRoom?.name);
        if (replyingTo) {
          mapped.replyTo = {
            id: replyingTo.id,
            sender: replyingTo.senderName,
            text: replyingTo.text || "Attachment",
          };
        }
        setMessages((prev) =>
          prev.some((m) => m.id === mapped.id) ? prev : [...prev, mapped]
        );
      }

      setInputMessage("");
      setReplyingTo(null);
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoomId
            ? { ...r, lastMessage: cleanText, lastTime: formatClockTime(new Date().toISOString()) }
            : r
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Could not send message");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUploadAttachment = async (file: File) => {
    if (!selectedRoomId) return;
    try {
      setSendingMessage(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("category", "Other Documents");
      fd.append("isSharedWithCa", "true");

      const uploadRes = await fetch("/api/documents/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || "Attachment upload failed");
      }

      const doc = uploadJson.data;
      const isImg = file.type.startsWith("image/");
      const isAudio = file.type.startsWith("audio/");

      const msgRes = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          conversationId: selectedRoomId,
          content: isAudio ? "Voice note" : `Shared file: ${file.name}`,
          messageType: isAudio ? "AUDIO" : isImg ? "IMAGE" : "FILE",
          fileUrl: doc.fileUrl || undefined,
          attachments: [
            {
              id: doc.id,
              name: file.name,
              size: file.size,
              mimeType: file.type,
              url: doc.fileUrl,
              path: doc.filePath,
            },
          ],
        }),
      });
      const msgJson = await msgRes.json();
      if (!msgRes.ok) {
        throw new Error(msgJson.message || msgJson.error || "Failed to send attachment");
      }

      if (msgJson.data?.message) {
        const mapped = mapRawMessage(msgJson.data.message, currentRoom?.name);
        setMessages((prev) =>
          prev.some((m) => m.id === mapped.id) ? prev : [...prev, mapped]
        );
      }
      toast.success(`Shared "${file.name}" securely.`);
    } catch (err: any) {
      toast.error(err.message || "Could not upload attachment");
    } finally {
      setSendingMessage(false);
    }
  };

  const startVoiceRecording = async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecordingVoice(true);
    } catch {
      toast.error("Microphone permission denied.");
    }
  };

  const stopAndSendVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) {
      setIsRecordingVoice(false);
      return;
    }

    recorder.onstop = async () => {
      recorder.stream.getTracks().forEach((t) => t.stop());
      setIsRecordingVoice(false);
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size < 100) return;
      const audioFile = new File([blob], `voice-note-${Date.now()}.webm`, {
        type: "audio/webm",
      });
      await handleUploadAttachment(audioFile);
    };

    recorder.stop();
  };

  const cancelVoiceRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stream.getTracks().forEach((t) => t.stop());
      recorder.stop();
    }
    setIsRecordingVoice(false);
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reaction: emoji }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reaction failed");
      if (json.message?.reactions) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, reactions: json.message.reactions } : m))
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Could not react to message");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Delete failed");
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success("Message deleted.");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const handleDownloadAttachment = async (att: MessageAttachment) => {
    try {
      if (att.id) {
        const res = await fetch(`/api/documents/download?id=${encodeURIComponent(att.id)}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (res.ok && json.signedUrl) {
          window.open(json.signedUrl, "_blank", "noopener,noreferrer");
          return;
        }
      }
      if (att.url) {
        window.open(att.url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("File link unavailable.");
      }
    } catch {
      toast.error("Unable to open attachment.");
    }
  };

  const handleToggleAudio = (msgId: string, url?: string) => {
    if (playingAudioId === msgId && audioElRef.current) {
      audioElRef.current.pause();
      setPlayingAudioId(null);
      return;
    }
    if (!url) {
      toast.error("Audio stream unavailable.");
      return;
    }
    if (audioElRef.current) {
      audioElRef.current.pause();
    }
    const audio = new Audio(url);
    audio.onended = () => setPlayingAudioId(null);
    audio.play().catch(() => toast.error("Could not play voice note."));
    audioElRef.current = audio;
    setPlayingAudioId(msgId);
  };

  const handleStartConversation = async (contact: EligibleContact) => {
    try {
      setCreatingChat(true);
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          participantId: contact.id,
          title: contact.name,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not start conversation");
      setShowNewChatModal(false);
      await fetchConversations();
      if (json.conversation?.id) {
        setSelectedRoomId(json.conversation.id);
      }
      toast.success(`Conversation opened with ${contact.name}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to open conversation");
    } finally {
      setCreatingChat(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (activeTab === "direct" && r.isGroup) return false;
    if (activeTab === "groups" && !r.isGroup) return false;
    if (activeTab === "unread" && r.unreadCount === 0) return false;
    if (searchQuery.trim() && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const filteredMessages = messages.filter((m) => {
    if (!messageSearchQuery.trim()) return true;
    return m.text?.toLowerCase().includes(messageSearchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.txt,.xls,.xlsx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadAttachment(f);
          e.target.value = "";
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadAttachment(f);
          e.target.value = "";
        }}
      />

      {showEventTicker && (
        <div className="p-3 bg-[#111111] border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-white shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] shrink-0">
              Realtime Stream:
            </span>
            <div className="truncate text-gray-300">{latestEvent}</div>
          </div>
          <button
            onClick={() => setShowEventTicker(false)}
            className="text-gray-400 hover:text-white ml-4"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="min-h-[600px] lg:h-[calc(100vh-170px)] flex flex-col md:flex-row bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Left Sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0F0F0F] shrink-0 max-h-72 md:max-h-none">
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-white text-base">Messages</h2>
              </div>
              <Button
                onClick={() => setShowNewChatModal(true)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 rounded-lg"
              >
                + New Chat
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 pt-1">
              {(["all", "direct", "groups", "unread"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1 rounded-lg text-center capitalize transition-all ${
                    activeTab === tab
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab === "direct" ? "1-on-1" : tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {loadingRooms ? (
              <div className="p-6 text-center text-xs text-gray-400">
                <RefreshCw className="w-4 h-4 mx-auto mb-2 animate-spin text-emerald-400" />
                Loading channels...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 space-y-2">
                <p>No conversations yet.</p>
                <Button
                  size="sm"
                  onClick={() => setShowNewChatModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  Start a Conversation
                </Button>
              </div>
            ) : (
              filteredRooms.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-3.5 flex items-start justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 border-l-4 border-emerald-500"
                        : "hover:bg-[#141414]"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                        {room.avatar}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-white truncate">{room.name}</h4>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {room.lastMessage}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{room.roleSubtitle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-[10px] text-gray-500">{room.lastTime}</span>
                      {room.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center mt-1 ml-auto">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A] min-w-0">
          {currentRoom ? (
            <>
              <div className="p-3.5 px-6 border-b border-white/10 flex items-center justify-between bg-[#111111]/80 backdrop-blur-md gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {currentRoom.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2 truncate">
                      {currentRoom.name}
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    </h3>
                    <p className="text-[11px] text-gray-400 truncate">
                      {currentRoom.roleSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowMessageSearchBar(!showMessageSearchBar)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
                    title="Search Messages"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  <Link href={portal === "client" ? "/client/calls" : "/ca/calls"}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-white/10 text-gray-300 hover:text-white"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      <span className="hidden sm:inline">Call</span>
                    </Button>
                  </Link>
                  <Link href={portal === "client" ? "/client/calls" : "/ca/calls"}>
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Video className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Video Room</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {showMessageSearchBar && (
                <div className="p-2.5 px-6 bg-[#141414] border-b border-white/10 flex items-center gap-3 text-xs">
                  <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search in this conversation..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      setShowMessageSearchBar(false);
                      setMessageSearchQuery("");
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="flex justify-center my-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-white/10 text-[10px] text-gray-400">
                    <Lock className="w-3 h-3 text-emerald-400" /> Role-scoped encrypted TaxMate
                    channel
                  </div>
                </div>

                {loadingMessages ? (
                  <p className="text-center text-xs text-gray-400 py-8">Loading messages...</p>
                ) : filteredMessages.length === 0 ? (
                  <p className="text-center text-xs text-gray-500 py-10">
                    No messages in this conversation yet. Send a message below to begin.
                  </p>
                ) : (
                  filteredMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isSelf ? "items-end" : "items-start"} group`}
                    >
                      {m.replyTo && (
                        <div className="mb-1 p-2 rounded-lg text-[10px] border max-w-md bg-[#18181b] border-white/10 text-gray-300">
                          <span className="font-bold block">{m.replyTo.sender}:</span>
                          <span className="truncate block">{m.replyTo.text}</span>
                        </div>
                      )}

                      <div
                        className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative shadow-md ${
                          m.isSelf
                            ? "bg-emerald-600 text-white rounded-br-none"
                            : "bg-[#18181b] text-gray-100 border border-white/10 rounded-bl-none"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 font-semibold text-[10px] opacity-80">
                          <span>{m.senderName}</span>
                          <span className="text-[9px] opacity-70 font-mono">
                            {m.time} {m.isEdited ? "(edited)" : ""}
                          </span>
                        </div>

                        {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}

                        {m.attachments?.map((att, idx) =>
                          att.mimeType?.startsWith("audio/") || m.messageType === "AUDIO" ? (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3 mt-1"
                            >
                              <button
                                onClick={() => handleToggleAudio(m.id, att.url)}
                                className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0"
                              >
                                {playingAudioId === m.id ? (
                                  <Pause className="w-4 h-4 fill-black" />
                                ) : (
                                  <Play className="w-4 h-4 fill-black ml-0.5" />
                                )}
                              </button>
                              <span className="text-xs text-white truncate">{att.name}</span>
                            </div>
                          ) : (
                            <div
                              key={idx}
                              className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 mt-1"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="font-semibold text-white truncate text-xs">
                                  {att.name}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadAttachment(att)}
                                className="h-7 w-7 p-0 text-white hover:bg-white/20 shrink-0"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )
                        )}

                        {m.reactions && Object.keys(m.reactions).length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {Object.entries(m.reactions).map(([emoji, count]) => (
                              <span
                                key={emoji}
                                onClick={() => handleAddReaction(m.id, emoji)}
                                className="px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] cursor-pointer"
                              >
                                {emoji} {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-400">
                        {m.isSelf && (
                          <span className="flex items-center gap-1 font-mono">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                        <div className="hidden group-hover:flex items-center gap-1.5 bg-[#18181b] border border-white/10 rounded-full px-2 py-0.5">
                          <button onClick={() => handleAddReaction(m.id, "👍")}>👍</button>
                          <button onClick={() => handleAddReaction(m.id, "❤️")}>❤️</button>
                          <button
                            onClick={() => setReplyingTo(m)}
                            className="text-gray-400 hover:text-white"
                            title="Reply"
                          >
                            <Reply className="w-3 h-3" />
                          </button>
                          {m.isSelf && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(m);
                                  setInputMessage(m.text);
                                }}
                                className="text-gray-400 hover:text-white"
                                title="Edit"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(m.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {replyingTo && (
                <div className="px-6 py-2 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                  <div className="flex items-center gap-2 truncate">
                    <Reply className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Replying to <strong>{replyingTo.senderName}</strong>:{" "}
                      {replyingTo.text || "Attachment"}
                    </span>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {editingMessage && (
                <div className="px-6 py-2 bg-[#141414] border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Editing message</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setInputMessage("");
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-4 border-t border-white/10 bg-[#111111]">
                {isRecordingVoice ? (
                  <div className="flex items-center justify-between gap-4 p-2 px-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="font-mono text-xs">
                        Recording Audio ({recordingSeconds}s)...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelVoiceRecording}
                        className="text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={stopAndSendVoiceRecording}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg"
                      >
                        Send Voice Note
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-white/5"
                      title="Attach Document"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-white/5"
                      title="Send Image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      placeholder={`Write your message to ${currentRoom.name}...`}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 bg-[#18181b] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-white/5"
                      title="Record Voice Note"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || sendingMessage}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-5 rounded-xl font-bold"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 text-gray-400">
              <MessageSquare className="w-10 h-10 opacity-40 text-emerald-400" />
              <p className="text-sm font-semibold text-white">Select or Start a Conversation</p>
              <p className="text-xs max-w-sm">
                Choose an existing conversation on the left or open a new encrypted channel with an
                authorized contact.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Start New Conversation
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contacts.length === 0 ? (
              <p className="text-xs text-gray-400 py-4">
                No connected {portal === "client" ? "Chartered Accountants" : "clients"} found yet.
                Once an engagement is active, they will appear here automatically.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    disabled={creatingChat}
                    onClick={() => handleStartConversation(c)}
                    className="w-full text-left p-3 rounded-xl bg-[#1A1A1A] hover:bg-emerald-500/10 border border-white/5 flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-white">{c.name}</h4>
                      <p className="text-[10px] text-gray-400">{c.roleSubtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
