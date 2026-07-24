"use client";

import React from 'react';
import { Sun, Moon, Laptop, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CAAppearanceSettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Palette className="w-6 h-6 text-lime-500" /> Appearance & Interface Customization
        </h1>
        <p className="text-sm text-slate-400">Configure theme, font scale, and brand color highlights</p>
      </div>

      <Card className="bg-slate-900 border-slate-800 p-6 space-y-6">
        <h3 className="text-base font-semibold text-slate-100">Theme Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border-2 border-lime-500 text-center space-y-2 cursor-pointer">
            <Moon className="w-8 h-8 text-lime-400 mx-auto" />
            <span className="font-semibold text-slate-100 block">Dark Slate (Default)</span>
            <span className="text-xs text-slate-400">Neutral slate-900 background with lime accents</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2 cursor-pointer opacity-70">
            <Sun className="w-8 h-8 text-slate-400 mx-auto" />
            <span className="font-semibold text-slate-200 block">Light Mode</span>
            <span className="text-xs text-slate-400">Slate-50 light theme</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2 cursor-pointer opacity-70">
            <Laptop className="w-8 h-8 text-slate-400 mx-auto" />
            <span className="font-semibold text-slate-200 block">System Preferences</span>
            <span className="text-xs text-slate-400">Auto match OS preference</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
