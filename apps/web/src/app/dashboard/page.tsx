'use client';

import React from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { AgentDashboard } from '@/components/dashboard/AgentDashboard';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const isAgent = user?.mode === 'AGENT' || user?.role === 'Agent' || user?.role === 'AGENT';

  return (
    <AppShell noPadding={!isAgent} isAgentView={isAgent}>
      {isAgent ? <AgentDashboard /> : <DashboardOverview />}
    </AppShell>
  );
}
