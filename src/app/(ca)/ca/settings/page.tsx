'use client';

import { useState } from 'react';
import { Settings, User, Building2, Lock, Bell, Globe, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function CASettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'firm' | 'security' | 'notifications'>('profile');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Firm settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-lime-600" /> CA Practice Settings & Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-1">Configure ICAI credentials, team roles, custom domain branding, and security policies.</p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {[
          { key: 'profile', label: 'CA Profile & ICAI Reg', icon: User },
          { key: 'firm', label: 'Firm White-label & Branding', icon: Building2 },
          { key: 'security', label: '2FA & Active Sessions', icon: Lock },
          { key: 'notifications', label: 'Email & SMS Channels', icon: Bell },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === tab.key
                ? 'border-lime-600 text-lime-600 dark:text-lime-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              ICAI Membership & Personal Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <Input defaultValue="CA Rajesh Sharma" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ICAI Membership #</label>
                <Input defaultValue="ICAI-409182" className="text-xs font-mono uppercase" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <Input defaultValue="rajesh@apextax.in" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                <Input defaultValue="+91 98765 43210" className="text-xs" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'firm' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              CA Firm Branding & Custom Domain
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Firm Legal Name</label>
                <Input defaultValue="Apex Tax & Audit Services Pvt Ltd" className="text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Portal Domain</label>
                <Input defaultValue="tax.apextax.in" className="text-xs font-mono" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
              Authentication Security & 2FA
            </h3>
            <div className="p-4 bg-lime-600/10 border border-lime-600/20 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Two-Factor Authentication (TOTP)</h4>
                <p className="text-[11px] text-slate-500">Require Google Authenticator code for all CA firm logins.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-lime-600/20 text-lime-600 border border-lime-500/30">
                Enabled
              </span>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end border-t border-slate-100 dark:border-slate-800">
          <Button type="submit" className="bg-lime-600 hover:bg-lime-500 text-white font-semibold shadow-md shadow-lime-600/20 text-xs">
            <Save className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
