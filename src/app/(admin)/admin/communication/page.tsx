"use client";

import React, { useState } from "react";
import { 
  Megaphone, 
  Send, 
  Bell, 
  MessageSquare, 
  AlertTriangle, 
  UserX, 
  CheckCircle2, 
  Filter, 
  Mail, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminCommunicationPage() {
  const [announcementText, setAnnouncementText] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");

  const reports = [
    { id: "rep-1", reportedUser: "Spam Profile (Fake CA)", reportedBy: "Dr. Vikramaditya Rao", reason: "Unsolicited promotional WhatsApp messages for crypto", date: "Yesterday", status: "Account Suspended" },
    { id: "rep-2", reportedUser: "Client User #4910", reportedBy: "CA Rajesh Sharma, FCA", reason: "Abusive language in consultation chat", date: "3 days ago", status: "Warning Issued" }
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    toast.success(`Platform announcement broadcasted to ${broadcastTarget.toUpperCase()} users!`);
    setAnnouncementText("");
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-emerald-400" /> Platform Communication & Moderation Suite
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Broadcast emergency compliance bulletins, manage multichannel notification templates, and resolve reported chats.
          </p>
        </div>
      </div>

      {/* Broadcast Form */}
      <div className="p-6 bg-[#111111] rounded-2xl border border-white/10 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" /> Broadcast System Announcement
        </h3>

        <form onSubmit={handleBroadcast} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 mb-1">Target Audience</label>
              <select
                value={broadcastTarget}
                onChange={(e) => setBroadcastTarget(e.target.value)}
                className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Registered Users (CAs + Taxpayers)</option>
                <option value="ca">Verified Chartered Accountants Only</option>
                <option value="taxpayer">Individual Taxpayers Only</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 mb-1">Delivery Channel</label>
              <select className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500">
                <option value="in_app">In-App Banner + Notification Center</option>
                <option value="email">Email Blast + In-App</option>
                <option value="all">Multichannel (Email, SMS & In-App)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-1">Announcement Message *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Income Tax Department has extended the ITR-2 filing deadline to 15 August 2026..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-[#18181b] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
              <Megaphone className="w-3.5 h-3.5 mr-1.5" /> Broadcast Now
            </Button>
          </div>
        </form>
      </div>

      {/* Reported Users & Moderation */}
      <div className="bg-[#111111] rounded-2xl border border-white/10 overflow-hidden shadow-xl p-6 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Reported Users & Chat Flagged Moderation
        </h3>

        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 bg-[#18181b] rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{r.reportedUser}</span>
                  <span className="text-gray-400">reported by <strong className="text-emerald-400">{r.reportedBy}</strong></span>
                  <span className="text-gray-500">• {r.date}</span>
                </div>
                <p className="text-gray-300">{r.reason}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {r.status}
                </span>
                <Button size="sm" variant="outline" onClick={() => toast.info("Opening audit investigation logs")} className="border-white/10 text-xs">
                  Review Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
