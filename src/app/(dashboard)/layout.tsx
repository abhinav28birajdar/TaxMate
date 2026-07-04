'use client';

import React from 'react';
import { Sidebar, Header, MobileNav } from '@/components/layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-60 md:ml-0">
        {/* Mobile Header with Menu */}
        <div className="md:hidden flex items-center justify-between h-16 border-b border-slate-200 px-4 bg-white">
          <MobileNav />
          <div className="font-bold text-slate-900">TaxMate</div>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0 px-4 md:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
