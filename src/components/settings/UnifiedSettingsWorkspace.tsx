"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  User,
  Lock,
  ShieldCheck,
  Bell,
  CreditCard,
  Globe,
  Database,
  Download,
  Trash2,
  LogOut,
  Fingerprint,
  KeyRound,
  Laptop,
  Save,
  MessageSquare,
  Loader2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/UnifiedAuthContext";

interface SessionItem {
  id: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  expires_at?: string;
}

interface PaymentMethodItem {
  id: string;
  method_type: string;
  label: string;
  upi_id?: string | null;
  card_last4?: string | null;
  is_default?: boolean;
}

export function UnifiedSettingsWorkspace() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<
    "account" | "security" | "privacy" | "notifications" | "chat" | "payments" | "preferences" | "data"
  >("account");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Account fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Password & Security fields
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  // Privacy / Notifications / Chat / Preferences fields
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [chatAudioAlerts, setChatAudioAlerts] = useState(true);
  const [autoDownloadAttachments, setAutoDownloadAttachments] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("English (India)");
  const [selectedTheme, setSelectedTheme] = useState<"dark" | "light" | "system">("dark");

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [newUpi, setNewUpi] = useState("");
  const [newMethodLabel, setNewMethodLabel] = useState("");
  const [exportingData, setExportingData] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    setDisplayName(user.name || "");

    const loadAllSettings = async () => {
      setLoading(true);
      try {
        const [profRes, setRes, sessRes, pmRes] = await Promise.all([
          fetch("/api/v1/profile"),
          fetch("/api/v1/settings"),
          fetch("/api/v1/auth/sessions"),
          fetch("/api/payments/methods"),
        ]);

        if (profRes.ok) {
          const pJson = await profRes.json().catch(() => ({}));
          const u = pJson.data?.user || {};
          const p = pJson.data?.profile || {};
          setDisplayName(p.fullName || u.name || user.name || "");
          setEmail(u.email || user.email || "");
          setPhone(u.phone || p.phone || "");
          setTwoFactorEnabled(Boolean(u.two_factor_enabled ?? p.users?.two_factor_enabled));
        }

        if (setRes.ok) {
          const sJson = await setRes.json().catch(() => ({}));
          const s = sJson.data?.settings || {};
          if (s.timezone) setTimezone(s.timezone);
          if (s.language) setSelectedLanguage(s.language);
          if (s.theme) setSelectedTheme(s.theme);
          if (s.emailNotifications !== undefined) setEmailNotifications(Boolean(s.emailNotifications));
          if (s.pushNotifications !== undefined) setPushNotifications(Boolean(s.pushNotifications));
          if (s.marketingEmails !== undefined) setMarketingEmails(Boolean(s.marketingEmails));
          if (s.onlineStatusVisible !== undefined) setOnlineStatusVisible(Boolean(s.onlineStatusVisible));
          if (s.readReceipts !== undefined) setReadReceipts(Boolean(s.readReceipts));
          if (s.chatAudioAlerts !== undefined) setChatAudioAlerts(Boolean(s.chatAudioAlerts));
          if (s.autoDownloadAttachments !== undefined) setAutoDownloadAttachments(Boolean(s.autoDownloadAttachments));
          if (s.biometricsEnabled !== undefined) setBiometricsEnabled(Boolean(s.biometricsEnabled));
        }

        if (sessRes.ok) {
          const sessJson = await sessRes.json().catch(() => ({}));
          setSessions(sessJson.data?.sessions || []);
        }

        if (pmRes.ok) {
          const pmJson = await pmRes.json().catch(() => ({}));
          setPaymentMethods(pmJson.methods || []);
        }
      } catch (err) {
        console.error("Failed loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllSettings();
  }, [user]);

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const [profRes, setRes] = await Promise.all([
        fetch("/api/v1/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: displayName.trim(),
            phone: phone.trim() || null,
          }),
        }),
        fetch("/api/v1/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone }),
        }),
      ]);

      if (!profRes.ok || !setRes.ok) {
        throw new Error("Failed to save account settings");
      }
      toast.success("Account profile & timezone saved.");
    } catch (err: any) {
      toast.error(err.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const persistSettings = async (patch: Record<string, any>, successMsg: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to save settings");
      }
      toast.success(successMsg);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Please enter both your current password and a new password.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || "Password update failed");
      }
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Password updated securely.");
    } catch (err: any) {
      toast.error(err.message || "Password update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const res = await fetch("/api/v1/auth/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Failed to revoke session");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked.");
    } catch (err: any) {
      toast.error(err.message || "Could not revoke session");
    }
  };

  const handleAddUpiMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpi.includes("@") || !newMethodLabel.trim()) {
      toast.error("Enter a valid UPI VPA (e.g. name@bank) and label.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/payments/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          methodType: "upi",
          label: newMethodLabel.trim(),
          upiId: newUpi.trim(),
          isDefault: paymentMethods.length === 0,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to add payment method");
      setPaymentMethods((prev) => [json.method, ...prev]);
      setNewUpi("");
      setNewMethodLabel("");
      toast.success("Payment method saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save payment method");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const res = await fetch(`/api/payments/methods?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove method");
      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success("Payment method removed.");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove payment method");
    }
  };

  const handleExportMyData = async () => {
    setExportingData(true);
    try {
      const [pRes, sRes, dRes, iRes] = await Promise.all([
        fetch("/api/v1/profile"),
        fetch("/api/v1/settings"),
        fetch("/api/documents?take=100"),
        fetch("/api/itr"),
      ]);
      const exportBundle = {
        exportedAt: new Date().toISOString(),
        profile: pRes.ok ? await pRes.json().catch(() => null) : null,
        settings: sRes.ok ? await sRes.json().catch(() => null) : null,
        documents: dRes.ok ? await dRes.json().catch(() => null) : null,
        itrFilings: iRes.ok ? await iRes.json().catch(() => null) : null,
      };
      const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `taxmate_data_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Account data export downloaded.");
    } catch {
      toast.error("Failed to generate data export.");
    } finally {
      setExportingData(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-xs text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" /> Loading your account preferences...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> Platform Settings & Preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Account, Security & Privacy Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage your credentials, 2FA, active sessions, notifications, and stored preferences.
          </p>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs rounded-xl"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" /> Logout of TaxMate
        </Button>
      </div>

      <div className="border-b border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {[
          { id: "account", label: "Account & Profile", icon: User },
          { id: "security", label: "Security & 2FA", icon: Lock },
          { id: "privacy", label: "Privacy & Visibility", icon: ShieldCheck },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "chat", label: "Chat & Messaging", icon: MessageSquare },
          { id: "payments", label: "Payment Methods", icon: CreditCard },
          { id: "preferences", label: "Language & Theme", icon: Globe },
          { id: "data", label: "Data & Storage", icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap px-3.5 py-2.5 rounded-t-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? "bg-[#111111] text-emerald-400 border-t-2 border-emerald-500 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {activeTab === "account" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Account Information & Master Email
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Registered Email (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98210 98210"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Asia/Kolkata">(GMT+05:30) Asia/Kolkata (IST)</option>
                  <option value="UTC">(GMT+00:00) UTC</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button disabled={saving} onClick={handleSaveAccount} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save Account Settings"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-sm font-semibold text-white">Change Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                <div>
                  <label className="block text-gray-300 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-1">New Strong Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div className="pt-3">
                <Button disabled={saving} onClick={handleChangePassword} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                  <KeyRound className="w-3.5 h-3.5 mr-1" /> {saving ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>

            <div className="border-b border-white/10 pb-4 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-white">Authentication Factors</h3>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Two-Factor Authentication (2FA)</div>
                    <div className="text-gray-400 text-[11px]">
                      Status: {twoFactorEnabled ? "Enabled" : "Not enrolled"} — configure TOTP setup cleanly.
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => router.push("/2fa-setup")} className="text-xs border-emerald-500/30 text-emerald-400">
                  {twoFactorEnabled ? "Manage 2FA" : "Configure 2FA"}
                </Button>
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Biometric Login Preference</div>
                    <div className="text-gray-400 text-[11px]">Prefer Touch ID, Face ID, or Windows Hello where supported.</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricsEnabled}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setBiometricsEnabled(next);
                    persistSettings({ biometricsEnabled: next }, next ? "Biometric preference enabled." : "Biometric preference disabled.");
                  }}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-white">Active Login Sessions ({sessions.length})</h3>
              {sessions.length === 0 ? (
                <p className="text-gray-400 text-[11px]">No secondary active sessions recorded.</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-white truncate max-w-md">
                          {s.user_agent || "Browser Session"}
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          IP: {s.ip_address || "Unknown"} • Started {new Date(s.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRevokeSession(s.id)} className="text-xs text-rose-400 hover:text-rose-300">
                      Revoke
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Privacy, Visibility & Encrypted Storage
            </h3>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Online Presence Status</div>
                <div className="text-gray-400 text-[11px]">Allow your assigned CA and firm members to see when you are online.</div>
              </div>
              <input
                type="checkbox"
                checked={onlineStatusVisible}
                onChange={(e) => {
                  const next = e.target.checked;
                  setOnlineStatusVisible(next);
                  persistSettings({ onlineStatusVisible: next }, "Online presence preference saved.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Read Receipts</div>
                <div className="text-gray-400 text-[11px]">Send read acknowledgements when viewing messages.</div>
              </div>
              <input
                type="checkbox"
                checked={readReceipts}
                onChange={(e) => {
                  const next = e.target.checked;
                  setReadReceipts(next);
                  persistSettings({ readReceipts: next }, "Read receipts preference saved.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              All tax returns, salary slips, and financial proofs are protected via private Supabase storage buckets and row-level isolation.
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Alert & Notification Preferences
            </h3>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Email Alerts (Deadlines, Filings & Invoices)</div>
                <div className="text-gray-400 text-[11px]">Receive compliance updates and payment receipts via email.</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => {
                  const next = e.target.checked;
                  setEmailNotifications(next);
                  persistSettings({ emailNotifications: next }, "Email alert preferences updated.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">In-App & Push Notifications</div>
                <div className="text-gray-400 text-[11px]">Show alerts for CA messages and document review status changes.</div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => {
                  const next = e.target.checked;
                  setPushNotifications(next);
                  persistSettings({ pushNotifications: next }, "Push notification preference saved.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Product & Tax Circular Digest</div>
                <div className="text-gray-400 text-[11px]">Monthly CBDT & GSTN compliance digest emails.</div>
              </div>
              <input
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => {
                  const next = e.target.checked;
                  setMarketingEmails(next);
                  persistSettings({ marketingEmails: next }, "Digest preference updated.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Chat & Messaging Preferences
            </h3>
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Audio Notification for Messages</div>
                <div className="text-gray-400 text-[11px]">Play chime when receiving new consultation messages.</div>
              </div>
              <input
                type="checkbox"
                checked={chatAudioAlerts}
                onChange={(e) => {
                  const next = e.target.checked;
                  setChatAudioAlerts(next);
                  persistSettings({ chatAudioAlerts: next }, "Chat audio preference saved.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Pre-fetch Small Tax Attachments</div>
                <div className="text-gray-400 text-[11px]">Preload signed metadata links inside chat threads.</div>
              </div>
              <input
                type="checkbox"
                checked={autoDownloadAttachments}
                onChange={(e) => {
                  const next = e.target.checked;
                  setAutoDownloadAttachments(next);
                  persistSettings({ autoDownloadAttachments: next }, "Attachment preference saved.");
                }}
                className="accent-emerald-500 w-4 h-4"
              />
            </label>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Saved Payment Methods
            </h3>
            {paymentMethods.length === 0 ? (
              <p className="text-gray-400">No saved UPI or bank methods yet.</p>
            ) : (
              <div className="space-y-2">
                {paymentMethods.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{m.label}</p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {m.method_type.toUpperCase()} {m.upi_id ? `• ${m.upi_id}` : m.card_last4 ? `•••• ${m.card_last4}` : ""}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDeletePaymentMethod(m.id)} className="text-rose-400 hover:text-rose-300 text-xs">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddUpiMethod} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <input
                type="text"
                placeholder="UPI ID (e.g. name@okhdfcbank)"
                value={newUpi}
                onChange={(e) => setNewUpi(e.target.value)}
                className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Label (e.g. Business UPI)"
                value={newMethodLabel}
                onChange={(e) => setNewMethodLabel(e.target.value)}
                className="bg-[#181818] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                <Plus className="w-3.5 h-3.5 mr-1" /> Save UPI Method
              </Button>
            </form>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Interface Language & Theme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Application Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="English (India)">English (India)</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Marathi">Marathi (मराठी)</option>
                  <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Theme Mode</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value as any)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="dark">Deep Dark (#0A0A0A) & Emerald</option>
                  <option value="light">Light High Contrast</option>
                  <option value="system">System Default</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                disabled={saving}
                onClick={() => persistSettings({ language: selectedLanguage, theme: selectedTheme }, "Language & theme saved.")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
              >
                <Save className="w-3.5 h-3.5 mr-1" /> Save Display Preferences
              </Button>
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Data Portability & Account Lifecycle
            </h3>

            <div className="p-4 rounded-xl bg-[#181818] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-white text-sm">Download My Data (DPDP / GDPR Export)</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Export your taxpayer profile, settings, document index, and ITR records as a JSON archive.
                </div>
              </div>
              <Button
                disabled={exportingData}
                onClick={handleExportMyData}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> {exportingData ? "Compiling..." : "Download Data Export"}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-300">
              <div>
                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" /> Delete Account Permanently
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Permanently erase your profile, uploaded documents, and access tokens. This action is irreversible.
                </div>
              </div>
              <Button
                onClick={() => router.push("/system/delete-confirmation")}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs rounded-xl shrink-0"
              >
                Delete Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
