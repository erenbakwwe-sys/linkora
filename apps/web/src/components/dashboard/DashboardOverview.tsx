'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';
import {
  Calendar,
  Hourglass,
  CheckCircle2,
  XCircle,
  Banknote,
  CalendarCheck,
  Pause,
  Play,
  Zap,
  Radio,
  ChevronDown,
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: string;
  statusLabelDe: string;
  statusLabelTr: string;
  seconds: number;
}

export const DashboardOverview: React.FC = () => {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [isFrozen, setIsFrozen] = useState(false);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [totalLeadsCount, setTotalLeadsCount] = useState(190);
  const [qcPendingCount, setQcPendingCount] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(38);
  const [stornoCount, setStornoCount] = useState(103);

  // Sync counts with custom saved leads
  useEffect(() => {
    try {
      const customRaw = typeof window !== 'undefined' ? localStorage.getItem('linkora_custom_leads') : null;
      const customLeads = customRaw ? JSON.parse(customRaw) : [];
      const customTotal = customLeads.length;
      const customQc = customLeads.filter((l: any) => l.status === 'NEW' || l.status === 'QC_PENDING').length;
      const customConfirmed = customLeads.filter((l: any) => l.status === 'CONFIRMED' || l.status === 'SOLD').length;
      const customStorno = customLeads.filter((l: any) => l.status === 'STORNO' || l.status === 'REJECTED').length;

      setTotalLeadsCount(190 + customTotal);
      setQcPendingCount(customQc);
      setConfirmedCount(38 + customConfirmed);
      setStornoCount(103 + customStorno);
    } catch {
      //
    }
  }, []);

  // Live agents state matching screenshot:
  // Umut (165 min 18 sec = 9918 sec), Erensamsun (39 sec)
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Umut',
      status: 'WAITING',
      statusLabelDe: 'Wartend',
      statusLabelTr: 'Bekliyor',
      seconds: 9918,
    },
    {
      id: '2',
      name: 'Erensamsun',
      status: 'WAITING',
      statusLabelDe: 'Wartend',
      statusLabelTr: 'Bekliyor',
      seconds: 39,
    },
  ]);

  // Live tick effect (unless frozen)
  useEffect(() => {
    if (isFrozen) return;

    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          seconds: a.seconds + 1,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isFrozen]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Duration category: hell (0-5m), mittel (5-10m), dunkel (10+m)
  const getDurationClass = (totalSeconds: number) => {
    const mins = totalSeconds / 60;
    if (mins < 5) {
      // hell: light warm peach / light orange
      return 'bg-amber-100/70 border-amber-200 text-amber-900';
    } else if (mins < 10) {
      // mittel: medium orange
      return 'bg-orange-200/80 border-orange-300 text-orange-950';
    } else {
      // dunkel: dark warm terracotta / brownish orange (matching screenshot Umut row)
      return 'bg-[#f4be9b] border-[#e8a880] text-amber-950 font-medium';
    }
  };

  return (
    <div className="flex-1 p-2 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 animate-in fade-in duration-300">
      {/* 1. KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {/* Leads diesen Monat */}
        <div
          onClick={() => router.push('/leads')}
          className="card-elegant rounded-2xl p-3 sm:p-4.5 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{totalLeadsCount}</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">{t('dashboard.kpi.leads_this_month')}</div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* In QC-Prüfung */}
        <div
          onClick={() => router.push('/qc')}
          className="card-elegant rounded-2xl p-3 sm:p-4.5 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{qcPendingCount}</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">{t('dashboard.kpi.in_qc')}</div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
            <Hourglass className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Bestätigt (Monat) */}
        <div
          onClick={() => router.push('/leads')}
          className="card-elegant rounded-2xl p-3 sm:p-4.5 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{confirmedCount}</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">{t('dashboard.kpi.confirmed_month')}</div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Storno (Monat) */}
        <div
          onClick={() => router.push('/returns')}
          className="card-elegant rounded-2xl p-3 sm:p-4.5 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stornoCount}</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">{t('dashboard.kpi.storno_month')}</div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Offen (fällig) */}
        <div
          onClick={() => router.push('/balance-costs')}
          className="card-elegant rounded-2xl p-3 sm:p-4.5 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">0,00 €</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">{t('dashboard.kpi.open_due')}</div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
            <Banknote className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Nächster Monat */}
        <div
          onClick={() => router.push('/cash-income')}
          className="card-elegant rounded-2xl p-3 sm:p-4.5 flex items-center justify-between cursor-pointer group"
        >
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">5.188,94 €</div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5">{t('dashboard.kpi.next_month')}</div>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-200">
            <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* 2. Main Live Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sub-Panel: Live Dialer State (4 columns) */}
        <div className="lg:col-span-4 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          {/* Badge Row */}
          <div className="flex items-center space-x-2">
            <div
              onClick={() => router.push('/call-screen')}
              title="Zum Call-Screen / Dialer"
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-xs cursor-pointer transition-all hover:scale-105 active:scale-95 animate-shimmer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t('dashboard.live_panel.ready_to_call', { count: 5 })}</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 live-beacon-pulse"></span>
              <span>live</span>
            </div>
          </div>

          {/* Stat Tile 1 */}
          <div className="pt-2">
            <div className="text-4xl font-black text-amber-600 tracking-tight">0</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">
              {t('dashboard.live_panel.customers_being_called')}
            </div>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          {/* Stat Tile 2 */}
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">2</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">
              {t('dashboard.live_panel.agents_online')}
            </div>
          </div>

          <div className="border-t border-slate-100 my-2"></div>

          {/* Stat Tile 3 */}
          <div>
            <div className="text-4xl font-black text-teal-600 tracking-tight">0</div>
            <div className="text-xs text-slate-500 mt-1 font-semibold">
              {t('dashboard.live_panel.agents_joining_line')}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{t('dashboard.live_panel.dialing_manually', { count: 0 })}</span>
          </div>
        </div>

        {/* Right Sub-Panel: Aktive Mitarbeiter (8 columns) */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            {/* Header Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h2 className="font-extrabold text-slate-900 text-sm">
                  {t('dashboard.active_agents.title')}
                </h2>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                {/* View Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => router.push('/wallboard')}
                    title="Große TV Wallboard-Ansicht öffnen"
                    className="flex items-center space-x-1 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <span>{t('dashboard.active_agents.view_list')}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Freeze Button */}
                <button
                  onClick={() => setIsFrozen(!isFrozen)}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg border font-medium transition cursor-pointer ${
                    isFrozen
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {isFrozen ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('common.unfreeze')}</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{t('common.freeze')}</span>
                    </>
                  )}
                </button>

                {/* Counter */}
                <span className="text-slate-500 font-medium">
                  {t('dashboard.active_agents.counter', { online: 2, waiting: 2 })}
                </span>
              </div>
            </div>

            {/* Company Filter Dropdown */}
            <div className="pt-3 pb-2">
              <button className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition">
                <span>{t('common.all_companies')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Agent Rows with Duration Color-Coding */}
            <div className="space-y-2 mt-2">
              {agents.map((agent) => {
                const durationClass = getDurationClass(agent.seconds);
                return (
                  <div
                    key={agent.id}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs shadow-xs transition-colors ${durationClass}`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      <span className="font-bold text-slate-900">{agent.name}</span>
                    </div>

                    <div className="font-semibold text-slate-800">
                      {locale === 'tr' ? agent.statusLabelTr : agent.statusLabelDe}
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                      {formatTimer(agent.seconds)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Legends */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{t('dashboard.active_agents.status_legend.on_call')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{t('dashboard.active_agents.status_legend.wrap_up')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>{t('dashboard.active_agents.status_legend.dialing')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                <span>{t('dashboard.active_agents.status_legend.joining')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>{t('dashboard.active_agents.status_legend.ready')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{t('dashboard.active_agents.status_legend.waiting')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>{t('dashboard.active_agents.status_legend.pause')}</span>
              </span>
            </div>

            {/* Durations Legend */}
            <div className="flex items-center space-x-3 text-slate-500">
              <span className="font-bold text-slate-700">
                {t('dashboard.active_agents.durations.label')}
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                <span>{t('dashboard.active_agents.durations.light')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>{t('dashboard.active_agents.durations.medium')}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-800"></span>
                <span>{t('dashboard.active_agents.durations.dark')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
