"use client";

import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Lock, 
  Smartphone, 
  ShieldCheck, 
  Bell, 
  CreditCard, 
  Globe, 
  Moon, 
  Database, 
  Download, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  Fingerprint, 
  KeyRound, 
  Laptop, 
  ShieldAlert,
  Save,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UnifiedSettingsWorkspace() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "account" | "security" | "privacy" | "notifications" | "chat" | "payments" | "preferences" | "data"
  >("account");

  // State options
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English (India)");
  const [selectedTheme, setSelectedTheme] = useState("Deep Dark (#0A0A0A)");
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(true);

  const activeSessions = [
    { device: "MacBook Pro 16\" (Chrome 128)", location: "Mumbai, India", ip: "103.21.244.18", current: true, time: "Active now" },
    { device: "iPhone 15 Pro Max (iOS Safari)", location: "Pune, India", ip: "49.36.128.91", current: false, time: "Yesterday, 08:30 PM" },
  ];

  const handleSave = (msg: string) => {
    toast.success(msg);
  };

  const handleLogout = () => {
    toast.info("Logging out from secure session...");
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" /> Module 17: Platform Settings & Preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Account, Security & Privacy Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Manage your credentials, 2FA hardware tokens, connected devices, and data retention policies.
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

      {/* Tabs navigation */}
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

      {/* Content Container */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {/* 1. Account Settings */}
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
                  defaultValue="Abhinav Birajdar"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Registered Email (Read-Only)</label>
                <input 
                  type="email" 
                  disabled
                  defaultValue="abhinav@example.com"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Phone Number (SMS OTP)</label>
                <input 
                  type="text" 
                  defaultValue="+91 98210 98210"
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Timezone</label>
                <select className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500">
                  <option>(GMT+05:30) Asia/Kolkata (IST)</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleSave("Account profile saved!")} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl">
                <Save className="w-3.5 h-3.5 mr-1" /> Save Account Settings
              </Button>
            </div>
          </div>
        )}

        {/* 2. Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-sm font-semibold text-white">Change Master Password</h3>
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
                    placeholder="Min 10 characters, symbols, numbers"
                    className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
              <div className="pt-3">
                <Button 
                  onClick={() => {
                    setCurrentPassword("");
                    setNewPassword("");
                    handleSave("Password updated successfully.");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1" /> Update Password
                </Button>
              </div>
            </div>

            {/* 2FA & Biometrics */}
            <div className="border-b border-white/10 pb-4 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-white">Authentication Factors</h3>
              
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Two-Factor Authentication (2FA)</div>
                    <div className="text-gray-400 text-[11px]">Require TOTP code (Google Authenticator / Authy) on every login.</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={twoFactorEnabled} 
                  onChange={(e) => {
                    setTwoFactorEnabled(e.target.checked);
                    toast.info(e.target.checked ? "2FA activated." : "2FA deactivated.");
                  }}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Biometric Login (WebAuthn / Passkeys)</div>
                    <div className="text-gray-400 text-[11px]">Sign in instantly using Touch ID, Face ID, or Windows Hello.</div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={biometricsEnabled} 
                  onChange={(e) => {
                    setBiometricsEnabled(e.target.checked);
                    toast.info(e.target.checked ? "Passkey registered." : "Passkey disabled.");
                  }}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer" 
                />
              </div>
            </div>

            {/* Connected Devices / Login Sessions */}
            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-white">Active Login Sessions</h3>
              {activeSessions.map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#181818] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Laptop className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {s.device}
                        {s.current && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Current</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-[11px]">{s.location} • IP: {s.ip} • {s.time}</div>
                    </div>
                  </div>
                  {!s.current && (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => toast.success("Session revoked.")}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Privacy Settings */}
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
                onChange={(e) => setOnlineStatusVisible(e.target.checked)}
                className="accent-emerald-500 w-4 h-4" 
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Read Receipts</div>
                <div className="text-gray-400 text-[11px]">Show double blue ticks when you have viewed messages in the portal.</div>
              </div>
              <input 
                type="checkbox" 
                checked={readReceipts} 
                onChange={(e) => setReadReceipts(e.target.checked)}
                className="accent-emerald-500 w-4 h-4" 
              />
            </label>

            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              🔒 <strong>Confidentiality Notice:</strong> All tax returns, salary slips, and bank statements are stored with client-isolated cryptographic keys adhering to Section 138 of the Income-tax Act, 1961.
            </div>
          </div>
        )}

        {/* 4. Chat Settings */}
        {activeTab === "chat" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Chat & Messaging Preferences
            </h3>
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Audio Notification for Messages</div>
                <div className="text-gray-400 text-[11px]">Play subtle chime when receiving new CA consultation messages.</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
            </label>
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-[#181818] border border-white/5 cursor-pointer">
              <div>
                <div className="font-semibold text-white">Auto-download Tax Attachments</div>
                <div className="text-gray-400 text-[11px]">Automatically cache PDFs under 5MB for instant offline viewing.</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-emerald-500 w-4 h-4" />
            </label>
          </div>
        )}

        {/* 5. Language & Theme */}
        {activeTab === "preferences" && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Interface Language & Design System
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-1">Application Language</label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>English (India)</option>
                  <option>Hindi (हिंदी)</option>
                  <option>Marathi (मराठी)</option>
                  <option>Gujarati (ગુજરાતી)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1">Theme Accent</label>
                <select 
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full bg-[#181818] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option>Deep Dark (#0A0A0A) & Emerald (Active)</option>
                  <option>High Contrast Midnight</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 6. Data & Storage */}
        {activeTab === "data" && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-semibold text-white border-b border-white/10 pb-3">
              Data Portability & Account Lifecycle
            </h3>

            <div className="p-4 rounded-xl bg-[#181818] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-white text-sm">Download My Data (GDPR / DPDP Act)</div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Export all your ITR computations, uploaded documents, chat transcripts, and audit logs as a password-protected ZIP.
                </div>
              </div>
              <Button 
                onClick={() => toast.success("Compiling complete ZIP export. Download link dispatched to email.")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl shrink-0"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Request Data Export
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-300">
              <div>
                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" /> Delete Account Permanently
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  Permanently erase your taxpayer profile, uploaded documents, and access tokens. This action is irreversible.
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
