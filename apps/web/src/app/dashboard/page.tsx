'use client';

import React from 'react';
import { TopBar } from '@/components/shell/TopBar';
import { Sidebar } from '@/components/shell/Sidebar';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { FloatingWidgets } from '@/components/shell/FloatingWidgets';
import { LowBalanceBanner } from '@/components/shell/LowBalanceBanner';

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100/95 via-[#f8fafc] to-slate-100/80 overflow-hidden font-sans">
      {/* Top Bar (Dark Navy Header) */}
      <TopBar />

      {/* Main Content Layout: Sidebar + Dashboard */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <DashboardOverview />
      </div>

      {/* Floating Action Buttons & Modals */}
      <FloatingWidgets />

      {/* Global Low Balance Toast / Warning Banner */}
      <LowBalanceBanner />
    </div>
  );
}
