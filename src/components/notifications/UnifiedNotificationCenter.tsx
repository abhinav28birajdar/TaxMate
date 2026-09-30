"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Check, 
  Trash2, 
  FileText, 
  CreditCard, 
  AlertTriangle, 
  MessageSquare, 
  Calendar, 
  ShieldCheck, 
  Settings, 
  Sparkles, 
  ExternalLink, 
  Filter, 
  X,
  Clock,
  Layers,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export type NotificationCategory = 
  | "all" 
  | "tax" 
  | "document" 
  | "message" 
  | "payment" 
  | "appointment" 
  | "deadline" 
  | "system";

interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
  linkText?: string;
  priority?: "urgent" | "normal" | "info";
}

export function UnifiedNotificationCenter() {
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<NotificationItem | null>(null);

  const [settings, setSettings] = useState({
    taxAlerts: true,
    documentRequests: true,
    chatMessages: true,
    paymentReceipts: true,
    appointmentReminders: true,
    systemNotices: false,
    channelEmail: true,
    channelWhatsApp: true,
    channelPush: true,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n1",
      category: "document",
      title: "Document Request from CA Rajesh Sharma",
      description: "Please upload HDFC Bank Statement Q2 for GSTR-3B input tax credit audit.",
      timestamp: "10 mins ago",
      read: false,
      link: "/client/documents",
      linkText: "Upload Document",
      priority: "urgent"
    },
    {
      id: "n2",
      category: "tax",
      title: "ITR-2 Computation Draft Ready for Review",
      description: "CA Vikramaditya Rao has finished computing capital gains and Chapter VI-A deductions.",
      timestamp: "45 mins ago",
      read: false,
      link: "/client/tax-returns",
      linkText: "Review ITR Computation",
      priority: "normal"
    },
    {
      id: "n3",
      category: "message",
      title: "New Message from CA Ananya Deshmukh",
      description: "“I noticed an unclaimed TDS credit of ₹18,400 in your Form 26AS. Let's claim it.”",
      timestamp: "1 hour ago",
      read: false,
      link: "/client/chat",
      linkText: "Open Chat",
      priority: "normal"
    },
    {
      id: "n4",
      category: "payment",
      title: "Payment Receipt Issued #INV-TM-2026-0042",
      description: "Receipt issued for ₹1,50,000 CA retainer fee via Razorpay UPI.",
      timestamp: "3 hours ago",
      read: true,
      link: "/client/payments",
      linkText: "Download Receipt",
      priority: "info"
    },
    {
      id: "n5",
      category: "appointment",
      title: "Upcoming Video Consultation in 2 Hours",
      description: "Tax Planning & Sec 115BAC review session with CA Rajesh Sharma starts at 04:00 PM.",
      timestamp: "5 hours ago",
      read: true,
      link: "/client/calls",
      linkText: "Join Consultation Room",
      priority: "urgent"
    },
    {
      id: "n6",
      category: "deadline",
      title: "CBDT Statutory Deadline: Advance Tax Q2",
      description: "Quarterly Advance tax installment due in 4 days. Avoid 234C interest penalty.",
      timestamp: "1 day ago",
      read: true,
      link: "/client/tax-returns",
      linkText: "Pay Advance Tax",
      priority: "urgent"
    },
    {
      id: "n7",
      category: "system",
      title: "TaxMate 2.0 Engine Upgraded",
      description: "CBDT AY 2026-27 schema updates and instant Form 26AS AIS parser are now active.",
      timestamp: "2 days ago",
      read: true,
      link: "/modules",
      linkText: "View Changelog",
      priority: "info"
    }
  ]);

  const categories: { id: NotificationCategory; label: string; count: number }[] = [
    { id: "all", label: "All Notifications", count: notifications.length },
    { id: "tax", label: "Tax Filings", count: notifications.filter(n => n.category === "tax").length },
    { id: "document", label: "Documents", count: notifications.filter(n => n.category === "document").length },
    { id: "message", label: "Messages", count: notifications.filter(n => n.category === "message").length },
    { id: "payment", label: "Payments", count: notifications.filter(n => n.category === "payment").length },
    { id: "appointment", label: "Appointments", count: notifications.filter(n => n.category === "appointment").length },
    { id: "deadline", label: "Deadlines", count: notifications.filter(n => n.category === "deadline").length },
    { id: "system", label: "System", count: notifications.filter(n => n.category === "system").length },
  ];

  const filtered = selectedCategory === "all" 
    ? notifications 
    : notifications.filter(n => n.category === selectedCategory);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read.");
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.info("Cleared all notifications.");
  };

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case "tax": return <FileText className="w-4 h-4 text-emerald-400" />;
      case "document": return <FileText className="w-4 h-4 text-cyan-400" />;
      case "message": return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "payment": return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "appointment": return <Calendar className="w-4 h-4 text-amber-400" />;
      case "deadline": return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "system": return <Sparkles className="w-4 h-4 text-purple-400" />;
      default: return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Module 13: Notification Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Notification Center & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time multi-channel compliance alerts, CA document requests, and statutory deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              variant="outline" 
              className="text-xs border-white/10 text-gray-300 hover:bg-white/5 rounded-xl"
            >
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Mark All as Read
            </Button>
          )}
          <Button 
            onClick={() => setShowSettingsModal(true)} 
            variant="outline" 
            className="text-xs border-white/10 text-gray-300 hover:bg-white/5 rounded-xl"
          >
            <Settings className="w-3.5 h-3.5 mr-1" /> Settings
          </Button>
        </div>
      </div>

      {/* Horizontal Category Badges */}
      <div className="border-b border-white/10 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              selectedCategory === cat.id
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold"
                : "text-gray-400 hover:text-white bg-[#111111] border border-white/5"
            }`}
          >
            {getCategoryIcon(cat.id)}
            {cat.label}
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ml-1 ${
              selectedCategory === cat.id ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-400"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-12 text-center">
            <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No notifications in this category</h3>
            <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
          </div>
        ) : (
          filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !item.read 
                  ? "bg-[#141414] border-emerald-500/30 shadow-lg shadow-emerald-950/20" 
                  : "bg-[#111111] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-sm text-white">{item.title}</h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    )}
                    {item.priority === "urgent" && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center gap-4 pt-1 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> {item.timestamp}
                    </span>

                    {item.link && (
                      <Link 
                        href={item.link} 
                        className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 hover:underline"
                      >
                        {item.linkText} <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setNotifications(notifications.map(n => n.id === item.id ? { ...n, read: !n.read } : n));
                  }}
                  className="text-xs text-gray-400 hover:text-white h-8 px-2"
                  title={item.read ? "Mark unread" : "Mark read"}
                >
                  <Check className="w-3.5 h-3.5" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setNotifications(notifications.filter(n => n.id !== item.id));
                    toast.success("Notification dismissed.");
                  }}
                  className="text-xs text-gray-400 hover:text-rose-400 h-8 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-400" /> Notification Channels & Topics
            </h3>

            <div className="space-y-4 text-xs">
              <div className="border-b border-white/10 pb-3 space-y-2">
                <span className="font-semibold text-gray-300 block">Delivery Channels</span>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">WhatsApp Alerts (+91 ••••• 8912)</span>
                  <input 
                    type="checkbox" 
                    checked={settings.channelWhatsApp}
                    onChange={(e) => setSettings({ ...settings, channelWhatsApp: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">Email Digest (Daily Compliance)</span>
                  <input 
                    type="checkbox" 
                    checked={settings.channelEmail}
                    onChange={(e) => setSettings({ ...settings, channelEmail: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">Browser In-App Push</span>
                  <input 
                    type="checkbox" 
                    checked={settings.channelPush}
                    onChange={(e) => setSettings({ ...settings, channelPush: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-gray-300 block">Event Categories</span>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">CBDT Deadlines & Statutory Reminders</span>
                  <input 
                    type="checkbox" 
                    checked={settings.taxAlerts}
                    onChange={(e) => setSettings({ ...settings, taxAlerts: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">CA Document Requests & Approvals</span>
                  <input 
                    type="checkbox" 
                    checked={settings.documentRequests}
                    onChange={(e) => setSettings({ ...settings, documentRequests: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">Instant Chat Messages</span>
                  <input 
                    type="checkbox" 
                    checked={settings.chatMessages}
                    onChange={(e) => setSettings({ ...settings, chatMessages: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-gray-400">Payment Confirmations & Invoices</span>
                  <input 
                    type="checkbox" 
                    checked={settings.paymentReceipts}
                    onChange={(e) => setSettings({ ...settings, paymentReceipts: e.target.checked })}
                    className="accent-emerald-500 rounded" 
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button 
                onClick={() => {
                  toast.success("Notification preferences saved successfully.");
                  setShowSettingsModal(false);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
