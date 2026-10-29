'use client';

import React from 'react';
import { TopBar } from '@/components/shell/TopBar';
import { Sidebar } from '@/components/shell/Sidebar';
import { FloatingWidgets } from '@/components/shell/FloatingWidgets';
import { LowBalanceBanner } from '@/components/shell/LowBalanceBanner';

interface AppShellProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, noPadding = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100/95 via-[#f8fafc] to-slate-100/80 overflow-hidden selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Bar (Dark Navy Header) */}
      <TopBar />

      {/* Main Content Layout: Sidebar + Page Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main
          className={`flex-1 overflow-y-auto animate-fade-in-up transition-all ${
            noPadding ? 'p-0' : 'p-4 md:p-6 lg:p-7'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Floating Action Buttons & Modals */}
      <FloatingWidgets />

      {/* Global Low Balance Toast / Warning Banner */}
      <LowBalanceBanner />
    </div>
  );
};
