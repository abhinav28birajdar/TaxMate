'use client';

import React from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-black text-foreground selection:bg-primary selection:text-black font-sans">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Subtle radial glow in background */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[100px]" />
                </div>

                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10 custom-scrollbar">
                    {children}
                </main>
            </div>
        </div>
    );
}
