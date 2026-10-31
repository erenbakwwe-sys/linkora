'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/shell/TopBar';
import { Sidebar } from '@/components/shell/Sidebar';
import { FloatingWidgets } from '@/components/shell/FloatingWidgets';
import { LowBalanceBanner } from '@/components/shell/LowBalanceBanner';
import { useAuth } from '@/context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
  noPadding?: boolean;
  isAgentView?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, noPadding = false, isAgentView }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070c16] text-white">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAgent =
    isAgentView !== undefined
      ? isAgentView
      : user?.mode === 'AGENT' || user?.role === 'Agent' || user?.role === 'AGENT';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100/95 via-[#f8fafc] to-slate-100/80 overflow-x-hidden selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Bar (Adapts to Agent Navigation Bar or Manager Header) */}
      <TopBar />

      {/* Main Content Layout: Sidebar + Page Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {!isAgent && <Sidebar />}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden animate-fade-in-up transition-all ${
            noPadding ? 'p-0' : isAgent ? 'p-3 sm:p-5 lg:p-6' : 'p-3 sm:p-4 md:p-6 lg:p-7'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Floating Action Buttons & Modals for manager */}
      {!isAgent && <FloatingWidgets />}

      {/* Global Low Balance Toast / Warning Banner */}
      <LowBalanceBanner />
    </div>
  );
};
