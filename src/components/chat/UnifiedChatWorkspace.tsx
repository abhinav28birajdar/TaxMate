"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  FileText, 
  Search, 
  MoreVertical, 
  Check, 
  CheckCheck, 
  Smile, 
  Phone, 
  Video, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Play, 
  Pause, 
  Reply, 
  Forward, 
  Trash2, 
  Edit3, 
  X, 
  AlertCircle, 
  Download, 
  Sparkles,
  BellRing,
  Volume2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Message {
  id: string;
  sender: string;
  senderRole: "ca" | "client" | "system";
  text?: string;
  time: string;
  isSelf: boolean;
  status: "sent" | "delivered" | "read";
  replyTo?: { id: string; sender: string; text: string };
  reactions?: { [emoji: string]: number };
  attachment?: {
    type: "document" | "image" | "voice";
    name?: string;
    size?: string;
    url?: string;
    duration?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  roleSubtitle: string;
  avatar: string;
  isGroup: boolean;
  online: boolean;
  lastSeen?: string;
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  membersCount?: number;
}

export function UnifiedChatWorkspace({ portal = "client" }: { portal: "client" | "ca" }) {
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("room-1");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [showEventTicker, setShowEventTicker] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showMessageSearchBar, setShowMessageSearchBar] = useState(false);
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([
    "CA Rajesh Sharma verified Form 26AS TDS Credits (₹2,23,000)",
    "Payment of ₹1,50,000 settled for Annual Retainer Fee",
    "ITR-2 draft sent to Client for digital approval",
    "GSTR-3B filed & acknowledged with ARN #AA070926019208B"
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const rooms: ChatRoom[] = [
    {
      id: "room-1",
      name: portal === "client" ? "CA Rajesh Sharma, FCA" : "TechNova Solutions Pvt Ltd",
      roleSubtitle: portal === "client" ? "Apex Tax Advisory • Senior Partner" : "Corporate Client • GST & Tax Audit",
      avatar: portal === "client" ? "RS" : "TN",
      isGroup: false,
      online: true,
      lastSeen: "Online now",
      unreadCount: 0,
      lastMessage: "I have prepared the draft ITR-2 with Capital Gains indexation.",
      lastTime: "10:34 AM"
    },
    {
      id: "room-2",
      name: "AY 2026-27 Corporate Tax Audit Team",
      roleSubtitle: "4 members: CA Rajesh, Senior Associate, Taxpayer, CFO",
      avatar: "AT",
      isGroup: true,
      membersCount: 4,
      online: true,
      unreadCount: 2,
      lastMessage: "Depreciation schedule uploaded under Section 32.",
      lastTime: "09:15 AM"
    },
    {
      id: "room-3",
      name: portal === "client" ? "CA Ananya Deshmukh" : "Dr. Vikramaditya Rao",
      roleSubtitle: portal === "client" ? "GST Litigation Specialist" : "Medical Practitioner • ITR-3",
      avatar: portal === "client" ? "AD" : "VR",
      isGroup: false,
      online: false,
      lastSeen: "Last seen 25m ago",
      unreadCount: 0,
      lastMessage: "Please verify the Form 10IEA regime selection acknowledgement.",
      lastTime: "Yesterday"
    },
    {
      id: "room-4",
      name: portal === "client" ? "TaxMate Compliance Concierge" : "Apex Logistics India",
      roleSubtitle: portal === "client" ? "System Support & Escalation Bot" : "Logistics Retainer • TDS Audit",
      avatar: portal === "client" ? "TM" : "AL",
      isGroup: false,
      online: true,
      unreadCount: 0,
      lastMessage: "Quarter 2 TDS deposit challan confirmed.",
      lastTime: "24 Oct"
    }
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions",
      senderRole: portal === "client" ? "ca" : "client",
      text: "Hello! We have thoroughly reviewed your Form 16 and Capital Gains transactions for AY 2026-27. Everything looks solid under Section 112A.",
      time: "10:28 AM",
      isSelf: false,
      status: "read",
      reactions: { "👍": 1 }
    },
    {
      id: "m-2",
      sender: portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions",
      senderRole: portal === "client" ? "ca" : "client",
      text: "Here is your detailed Computation of Income summary draft for review before e-filing.",
      time: "10:30 AM",
      isSelf: false,
      status: "read",
      attachment: {
        type: "document",
        name: "ITR2_Draft_Computation_AY2026-27.pdf",
        size: "2.8 MB",
        url: "#"
      }
    },
    {
      id: "m-3",
      sender: "You",
      senderRole: portal === "client" ? "client" : "ca",
      text: "Thank you! I am reviewing the draft now. Does this include the foreign equity dividend deduction under Section 80M?",
      time: "10:32 AM",
      isSelf: true,
      status: "read"
    },
    {
      id: "m-4",
      sender: portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions",
      senderRole: portal === "client" ? "ca" : "client",
      time: "10:33 AM",
      isSelf: false,
      status: "read",
      attachment: {
        type: "voice",
        name: "Voice Note: Sec 80M Dividend Clarification",
        duration: "0:42",
        url: "#"
      }
    },
    {
      id: "m-5",
      sender: portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions",
      senderRole: portal === "client" ? "ca" : "client",
      text: "Yes, I have factored the exact dividend offset in Schedule OS. Please verify line item 4(b).",
      time: "10:34 AM",
      isSelf: false,
      status: "delivered",
      reactions: { "❤️": 1, "🚀": 1 }
    }
  ]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Typing simulator
  useEffect(() => {
    const timer = setTimeout(() => {
      setOtherUserTyping(true);
      setTimeout(() => setOtherUserTyping(false), 3500);
    }, 5000);
    return () => clearTimeout(timer);
  }, [selectedRoomId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    if (editingMessage) {
      setMessages(messages.map((m) => m.id === editingMessage.id ? { ...m, text: inputMessage } : m));
      setEditingMessage(null);
      setInputMessage("");
      toast.success("Message edited successfully.");
      return;
    }

    const newMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "You",
      senderRole: portal === "client" ? "client" : "ca",
      text: inputMessage,
      time: "Just now",
      isSelf: true,
      status: "delivered",
      replyTo: replyingTo ? { id: replyingTo.id, sender: replyingTo.sender, text: replyingTo.text || "Attachment" } : undefined
    };

    setMessages([...messages, newMsg]);
    setInputMessage("");
    setReplyingTo(null);

    // Simulate reply & real-time event
    setTimeout(() => {
      const ackMsg: Message = {
        id: `m-ack-${Date.now()}`,
        sender: portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions",
        senderRole: portal === "client" ? "ca" : "client",
        text: "Acknowledged! Updating the compliance ledger and status tracker right now.",
        time: "Just now",
        isSelf: false,
        status: "read",
        reactions: { "👍": 1 }
      };
      setMessages((prev) => [...prev, ackMsg]);
      toast.success("New message received from " + (portal === "client" ? "CA Rajesh Sharma" : "TechNova Solutions"));
      setRealtimeEvents((prev) => [`Message acknowledged by ${portal === "client" ? "CA Rajesh" : "Client"} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, ...prev]);
    }, 2000);
  };

  const handleSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const voiceMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "You",
      senderRole: portal === "client" ? "client" : "ca",
      time: "Just now",
      isSelf: true,
      status: "delivered",
      attachment: {
        type: "voice",
        name: `Voice note (${recordingSeconds}s)`,
        duration: `0:${recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}`
      }
    };
    setMessages([...messages, voiceMsg]);
    toast.success("Voice message sent!");
  };

  const handleSendDocumentSim = () => {
    const docMsg: Message = {
      id: `m-${Date.now()}`,
      sender: "You",
      senderRole: portal === "client" ? "client" : "ca",
      text: "Uploaded revised Form 26AS interest statement.",
      time: "Just now",
      isSelf: true,
      status: "delivered",
      attachment: {
        type: "document",
        name: "Form26AS_Bank_Interest_Certificate.pdf",
        size: "1.4 MB"
      }
    };
    setMessages([...messages, docMsg]);
    toast.success("Document attached & shared securely with CA!");
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map((m) => {
      if (m.id === messageId) {
        const curReactions = m.reactions || {};
        return {
          ...m,
          reactions: {
            ...curReactions,
            [emoji]: (curReactions[emoji] || 0) + 1
          }
        };
      }
      return m;
    }));
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter((m) => m.id !== id));
    toast.success("Message deleted");
  };

  const currentRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const filteredRooms = rooms.filter((r) => {
    if (activeTab === "direct" && r.isGroup) return false;
    if (activeTab === "groups" && !r.isGroup) return false;
    if (activeTab === "unread" && r.unreadCount === 0) return false;
    if (searchQuery.trim() && !r.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredMessages = messages.filter((m) => {
    if (!messageSearchQuery.trim()) return true;
    return m.text?.toLowerCase().includes(messageSearchQuery.toLowerCase());
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner: Real-Time Event Stream Ticker */}
      {showEventTicker && (
        <div className="p-3 bg-[#111111] border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] shrink-0">
              Live Real-Time Stream:
            </span>
            <div className="truncate text-gray-300">
              {realtimeEvents[0]}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="text-[10px] text-gray-400 hidden sm:inline">Encrypted Socket Active</span>
            <button onClick={() => setShowEventTicker(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Real-Time Messaging Container */}
      <div className="h-[calc(100vh-160px)] min-h-[600px] flex bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
        
        {/* Left Sidebar: Conversations List */}
        <div className="w-80 md:w-96 border-r border-white/10 flex flex-col bg-[#0F0F0F] shrink-0">
          
          {/* Header & New Chat button */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                <h2 className="font-bold text-white text-base">Real-Time Messages</h2>
              </div>
              <Button
                onClick={() => setShowNewChatModal(true)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 rounded-lg shadow-[0_0_12px_rgba(5,150,105,0.3)]"
              >
                + New Chat
              </Button>
            </div>

            {/* Conversation Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations, clients, CAs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 pt-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  activeTab === "all" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "hover:text-white hover:bg-white/5"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("direct")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  activeTab === "direct" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "hover:text-white hover:bg-white/5"
                }`}
              >
                1-on-1
              </button>
              <button
                onClick={() => setActiveTab("groups")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  activeTab === "groups" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "hover:text-white hover:bg-white/5"
                }`}
              >
                Groups
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-1 rounded-lg text-center transition-all ${
                  activeTab === "unread" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "hover:text-white hover:bg-white/5"
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* Room List Feed */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredRooms.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-3.5 flex items-start justify-between cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-500/10 border-l-4 border-emerald-500 shadow-inner"
                      : "hover:bg-[#141414]"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
                        {room.avatar}
                      </div>
                      {room.online && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0F0F0F]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white truncate">{room.name}</h4>
                        {room.isGroup && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-bold">
                            Group
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{room.lastMessage}</p>
                      <p className="text-[10px] text-gray-500 mt-1">{room.roleSubtitle}</p>
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
            })}
          </div>
        </div>

        {/* Right Main Area: Active Chat Conversation */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A]">
          
          {/* Active Conversation Top Bar */}
          <div className="p-3.5 px-6 border-b border-white/10 flex items-center justify-between bg-[#111111]/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-bold flex items-center justify-center text-sm">
                {currentRoom.avatar}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  {currentRoom.name}
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </h3>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {currentRoom.online ? "Online & Available" : currentRoom.lastSeen}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">{currentRoom.roleSubtitle}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMessageSearchBar(!showMessageSearchBar)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                title="Search Messages"
              >
                <Search className="w-4 h-4" />
              </button>

              <Link href={portal === "client" ? "/client/calls" : "/ca/calls"}>
                <Button variant="outline" size="sm" className="h-8 text-xs border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                  <Phone className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Voice Call
                </Button>
              </Link>

              <Link href={portal === "client" ? "/client/calls" : "/ca/calls"}>
                <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(5,150,105,0.3)]">
                  <Video className="w-3.5 h-3.5 mr-1" /> Video Room
                </Button>
              </Link>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* In-Message Search Bar Drawer */}
          {showMessageSearchBar && (
            <div className="p-2.5 px-6 bg-[#141414] border-b border-white/10 flex items-center justify-between gap-3 text-xs">
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                placeholder="Search in this conversation..."
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
              />
              <button onClick={() => { setShowMessageSearchBar(false); setMessageSearchQuery(""); }} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Messages Stream Container */}
          <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
            
            {/* Encryption & Security Guarantee Banner */}
            <div className="flex justify-center my-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] border border-white/10 text-[10px] text-gray-400">
                <Lock className="w-3 h-3 text-emerald-400" /> Messages are end-to-end encrypted under Indian CA Client Privilege.
              </div>
            </div>

            {filteredMessages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.isSelf ? "items-end" : "items-start"} group relative`}
              >
                {/* Quoted Reply Snippet */}
                {m.replyTo && (
                  <div className={`mb-1 p-2 rounded-lg text-[10px] border max-w-md ${
                    m.isSelf ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200" : "bg-[#18181b] border-white/10 text-gray-400"
                  }`}>
                    <span className="font-bold block">{m.replyTo.sender}:</span>
                    <span className="truncate block">{m.replyTo.text}</span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-md rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative shadow-md ${
                    m.isSelf
                      ? "bg-emerald-600 text-white rounded-br-none shadow-[0_0_20px_rgba(5,150,105,0.2)]"
                      : "bg-[#18181b] text-gray-100 border border-white/10 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 font-semibold text-[10px] opacity-80 pb-0.5">
                    <span>{m.sender}</span>
                    <span className="text-[9px] opacity-70 font-mono">{m.time}</span>
                  </div>

                  {m.text && <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>}

                  {/* Document Attachment Render */}
                  {m.attachment && m.attachment.type === "document" && (
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-3 mt-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate text-xs">{m.attachment.name}</p>
                          <span className="text-[10px] text-gray-300 font-mono">{m.attachment.size} • PDF Document</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white hover:bg-white/20">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* Voice Note Attachment Render */}
                  {m.attachment && m.attachment.type === "voice" && (
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-3 mt-2 w-64">
                      <button
                        onClick={() => setActiveAudioPlaying(activeAudioPlaying === m.id ? null : m.id)}
                        className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                      >
                        {activeAudioPlaying === m.id ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
                      </button>
                      <div className="flex-1 space-y-1">
                        {/* Audio Waveform visualization */}
                        <div className="flex items-center gap-0.5 h-5">
                          {[40, 75, 90, 50, 60, 100, 70, 85, 45, 95, 60, 80, 50, 30].map((h, idx) => (
                            <div
                              key={idx}
                              style={{ height: `${h}%` }}
                              className={`w-1 rounded-full ${
                                activeAudioPlaying === m.id ? "bg-emerald-400 animate-pulse" : "bg-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-300">
                          <span>Voice Note</span>
                          <span>{m.attachment.duration}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Reactions display */}
                  {m.reactions && Object.keys(m.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {Object.entries(m.reactions).map(([emoji, count]) => (
                        <span
                          key={emoji}
                          onClick={() => handleAddReaction(m.id, emoji)}
                          className="px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[10px] cursor-pointer hover:scale-110 transition-transform"
                        >
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Indicator & Hover Actions */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-gray-400">
                  {m.isSelf && (
                    <span className="flex items-center gap-1 font-mono">
                      {m.status === "read" ? (
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-gray-400" />
                      )}
                      <span>{m.status}</span>
                    </span>
                  )}

                  {/* Message Action Pills on Hover */}
                  <div className="hidden group-hover:flex items-center gap-1.5 bg-[#18181b] border border-white/10 rounded-full px-2 py-0.5">
                    <button onClick={() => handleAddReaction(m.id, "👍")} className="hover:scale-125 transition-transform">👍</button>
                    <button onClick={() => handleAddReaction(m.id, "❤️")} className="hover:scale-125 transition-transform">❤️</button>
                    <button onClick={() => handleAddReaction(m.id, "🚀")} className="hover:scale-125 transition-transform">🚀</button>
                    <button onClick={() => setReplyingTo(m)} className="text-gray-400 hover:text-white" title="Reply">
                      <Reply className="w-3 h-3" />
                    </button>
                    {m.isSelf && (
                      <>
                        <button onClick={() => { setEditingMessage(m); setInputMessage(m.text || ""); }} className="text-gray-400 hover:text-white" title="Edit">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteMessage(m.id)} className="text-red-400 hover:text-red-300" title="Delete">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Simulated Live Typing Indicator */}
            {otherUserTyping && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 italic py-2">
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
                <span>{currentRoom.name} is typing response...</span>
              </div>
            )}
          </div>

          {/* Replying banner */}
          {replyingTo && (
            <div className="px-6 py-2 bg-[#141414] border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-2 truncate">
                <Reply className="w-3.5 h-3.5 text-emerald-400" />
                <span>Replying to <strong>{replyingTo.sender}</strong>: &quot;{replyingTo.text || "Attachment"}&quot;</span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Editing banner */}
          {editingMessage && (
            <div className="px-6 py-2 bg-[#141414] border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Editing your message</span>
              </div>
              <button onClick={() => { setEditingMessage(null); setInputMessage(""); }} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Message Input Bar */}
          <div className="p-4 border-t border-white/10 bg-[#111111]">
            {isRecordingVoice ? (
              <div className="flex items-center justify-between gap-4 p-2 px-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono text-xs">Recording Audio Note ({recordingSeconds}s)...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setIsRecordingVoice(false)} className="text-xs text-gray-400 hover:text-white">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSendVoiceNote} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg">
                    Send Voice Note
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendDocumentSim}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-all"
                  title="Attach Document from Vault"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleSendDocumentSim}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-all"
                  title="Send Image / Receipt"
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
                  onClick={() => setIsRecordingVoice(true)}
                  className="p-2.5 rounded-xl text-gray-400 hover:text-emerald-400 hover:bg-white/5 transition-all"
                  title="Record Voice Note"
                >
                  <Mic className="w-5 h-5" />
                </button>

                <Button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-5 rounded-xl font-bold shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            )}
          </div>
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
              <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Select an authorized CA advisor or firm client to start an encrypted channel.
            </p>
            <div className="space-y-2">
              {[
                { name: "CA Rajesh Sharma, FCA", role: "Direct Tax & Audit Partner" },
                { name: "CA Ananya Deshmukh", role: "GST Litigation & Appeal Specialist" },
                { name: "CA Vikramaditya Iyer", role: "International Transfer Pricing" },
              ].map((c, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setShowNewChatModal(false);
                    toast.success(`Connected to conversation with ${c.name}`);
                  }}
                  className="p-3 rounded-xl bg-[#1A1A1A] hover:bg-emerald-500/10 hover:border-emerald-500/30 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white">{c.name}</h4>
                    <p className="text-[10px] text-gray-400">{c.role}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" /> Conversation Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A]">
                <div>
                  <p className="font-semibold text-white">Mute Channel Notifications</p>
                  <p className="text-[10px] text-gray-400">Silence push alerts for 8 hours</p>
                </div>
                <input type="checkbox" className="accent-emerald-500 h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A1A]">
                <div>
                  <p className="font-semibold text-white">Auto-Export to Tax Audit Trail</p>
                  <p className="text-[10px] text-gray-400">Save attachments to Compliance Vault</p>
                </div>
                <input type="checkbox" defaultChecked className="accent-emerald-500 h-4 w-4" />
              </div>

              <div
                onClick={() => {
                  setShowSettingsModal(false);
                  setShowBlockModal(true);
                }}
                className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 font-semibold cursor-pointer hover:bg-red-950/40 text-center"
              >
                Block / Report Participant
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block / Report Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111111] border border-red-500/30 rounded-2xl p-6 space-y-4 text-white shadow-2xl">
            <h3 className="font-bold text-base text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Report & Block Participant
            </h3>
            <p className="text-xs text-gray-300">
              Are you sure you want to block {currentRoom.name}? They will not be able to message you or view your tax vault files.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowBlockModal(false)} className="border-white/10 text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={() => { setShowBlockModal(false); toast.error("User reported and blocked."); }} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold">
                Block User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
