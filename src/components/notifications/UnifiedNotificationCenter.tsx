"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Check,
  Trash2,
  FileText,
  CreditCard,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Settings,
  Sparkles,
  ExternalLink,
  X,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/UnifiedAuthContext";
import { useRealtimeNotifications } from "@/hooks/use-realtime";

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

function mapTypeToCategory(rawType?: string): NotificationCategory {
  const t = String(rawType || "").toUpperCase();
  if (t.includes("DOCUMENT")) return "document";
  if (t.includes("FILING") || t.includes("ITR") || t.includes("GST")) return "tax";
  if (t.includes("MESSAGE") || t.includes("CHAT")) return "message";
  if (t.includes("PAYMENT") || t.includes("INVOICE") || t.includes("BILLING")) return "payment";
  if (t.includes("APPOINTMENT") || t.includes("MEETING") || t.includes("CALL")) return "appointment";
  if (t.includes("DEADLINE")) return "deadline";
  return "system";
}

function defaultLinkForCategory(cat: NotificationCategory, isCa: boolean): { link: string; text: string } {
  const prefix = isCa ? "/ca" : "/client";
  switch (cat) {
    case "document":
      return { link: `${prefix}/documents`, text: "Open Document Vault" };
    case "tax":
      return { link: isCa ? "/ca/income-tax/itr" : "/client/tax-returns", text: "View Returns" };
    case "message":
      return { link: `${prefix}/chat`, text: "Open Chat" };
    case "payment":
      return { link: `${prefix}/payments`, text: "View Billing" };
    case "appointment":
      return { link: `${prefix}/appointments`, text: "View Appointments" };
    case "deadline":
      return { link: `${prefix}/compliance`, text: "Check Deadlines" };
    default:
      return { link: `${prefix}/dashboard`, text: "Open Workspace" };
  }
}

export function UnifiedNotificationCenter() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const isCaPortal = pathname?.startsWith("/ca") || role === "CA" || role === "STAFF";

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>("all");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
  });

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [notifRes, settingsRes] = await Promise.all([
        fetch("/api/v1/notifications?limit=50"),
        fetch("/api/v1/settings"),
      ]);

      if (notifRes.ok) {
        const json = await notifRes.json().catch(() => ({}));
        const rows = json.data?.notifications || json.notifications || [];
        setNotifications(
          rows.map((n: any) => {
            const category = mapTypeToCategory(n.type);
            const fallbackRoute = defaultLinkForCategory(category, isCaPortal);
            const priority: "urgent" | "normal" | "info" =
              category === "deadline" || category === "document"
                ? "urgent"
                : category === "payment" || category === "system"
                ? "info"
                : "normal";

            return {
              id: n.id,
              category,
              title: n.title || "Notification",
              description: n.message || n.body || "",
              timestamp: n.created_at
                ? new Date(n.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now",
              read: Boolean(n.read ?? n.is_read),
              link: n.metadata?.link || fallbackRoute.link,
              linkText: n.metadata?.linkText || fallbackRoute.text,
              priority,
            };
          })
        );
      }

      if (settingsRes.ok) {
        const sJson = await settingsRes.json().catch(() => ({}));
        const s = sJson.data?.settings || sJson.settings;
        if (s) {
          setSettings({
            emailNotifications: s.emailNotifications ?? true,
            pushNotifications: s.pushNotifications ?? true,
            smsNotifications: s.smsNotifications ?? false,
            marketingEmails: s.marketingEmails ?? true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user, isCaPortal]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  useRealtimeNotifications(user?.id || "", () => {
    void loadNotifications();
  });

  const categories: { id: NotificationCategory; label: string; count: number }[] = [
    { id: "all", label: "All Notifications", count: notifications.length },
    { id: "tax", label: "Tax Filings", count: notifications.filter((n) => n.category === "tax").length },
    { id: "document", label: "Documents", count: notifications.filter((n) => n.category === "document").length },
    { id: "message", label: "Messages", count: notifications.filter((n) => n.category === "message").length },
    { id: "payment", label: "Payments", count: notifications.filter((n) => n.category === "payment").length },
    { id: "appointment", label: "Appointments", count: notifications.filter((n) => n.category === "appointment").length },
    { id: "deadline", label: "Deadlines", count: notifications.filter((n) => n.category === "deadline").length },
    { id: "system", label: "System", count: notifications.filter((n) => n.category === "system").length },
  ];

  const filtered =
    selectedCategory === "all"
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (!res.ok) throw new Error("Failed to mark read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Could not update notifications.");
    }
  };

  const markOneRead = async (id: string) => {
    try {
      const res = await fetch("/api/v1/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      toast.error("Could not mark notification as read.");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification dismissed.");
    } catch {
      toast.error("Could not dismiss notification.");
    }
  };

  const clearAllNotifications = async () => {
    try {
      const res = await fetch("/api/v1/notifications?all=true", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setNotifications([]);
      toast.info("Cleared all notifications.");
    } catch {
      toast.error("Could not clear notifications.");
    }
  };

  const savePreferences = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save notification settings");
      toast.success("Notification preferences saved.");
      setShowSettingsModal(false);
    } catch (err: any) {
      toast.error(err.message || "Could not save preferences.");
    } finally {
      setSavingSettings(false);
    }
  };

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case "tax":
        return <FileText className="w-4 h-4 text-emerald-400" />;
      case "document":
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case "deadline":
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case "system":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" /> Module 13: Notification Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Notification Center & Alerts
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time compliance alerts, CA document requests, and statutory deadlines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={loadNotifications}
            variant="outline"
            disabled={loading}
            className="text-xs border-white/10 text-gray-300 hover:bg-white/5 rounded-xl"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="text-xs border-white/10 text-gray-300 hover:bg-white/5 rounded-xl"
            >
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              onClick={clearAllNotifications}
              variant="outline"
              className="text-xs border-white/10 text-rose-400 hover:bg-rose-500/10 rounded-xl"
            >
              Clear All
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
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ml-1 ${
                selectedCategory === cat.id ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-gray-400"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-12 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
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
                    {!item.read && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
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
                {!item.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => markOneRead(item.id)}
                    className="text-xs text-gray-400 hover:text-white h-8 px-2"
                    title="Mark read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteNotification(item.id)}
                  className="text-xs text-gray-400 hover:text-rose-400 h-8 px-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

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
              <Settings className="w-4 h-4 text-emerald-400" /> Notification Channels
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Email Compliance & Filing Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Browser In-App Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">SMS / Urgent Deadline Reminders</span>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-300">Platform Tax & Compliance Digest</span>
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                onClick={savePreferences}
                disabled={savingSettings}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                {savingSettings ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
