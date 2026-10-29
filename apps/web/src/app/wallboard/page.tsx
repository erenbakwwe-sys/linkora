'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  Tv,
  PhoneCall,
  Clock,
  Trophy,
  Activity,
  Maximize2,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  Radio,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';

interface ActiveAgent {
  agentId: string;
  name: string;
  companyName: string;
  status: string;
  statusLabelDe: string;
  durationFormatted: string;
  durationCategory: 'light' | 'medium' | 'dark';
}

const defaultFloorAgents: ActiveAgent[] = [
  {
    agentId: '1',
    name: 'Umut Kaya',
    companyName: 'Call-Center Izmir',
    status: 'ON_CALL',
    statusLabelDe: 'Am Telefon',
    durationFormatted: '03:42',
    durationCategory: 'light',
  },
  {
    agentId: '2',
    name: 'Erensamsun Aydin',
    companyName: 'Call-Center Izmir',
    status: 'WAITING',
    statusLabelDe: 'Wartend',
    durationFormatted: '00:39',
    durationCategory: 'light',
  },
  {
    agentId: '3',
    name: 'Birgit Schneider',
    companyName: 'Lead-Kontackt Berlin',
    status: 'ON_CALL',
    statusLabelDe: 'Am Telefon',
    durationFormatted: '07:15',
    durationCategory: 'medium',
  },
  {
    agentId: '4',
    name: 'Kemal Yilmaz',
    companyName: 'Call-Center Izmir',
    status: 'WRAP_UP',
    statusLabelDe: 'Nachbearbeitung',
    durationFormatted: '01:05',
    durationCategory: 'light',
  },
  {
    agentId: '5',
    name: 'Sophie Weber',
    companyName: 'Solar Direkt',
    status: 'ON_CALL',
    statusLabelDe: 'Am Telefon',
    durationFormatted: '02:18',
    durationCategory: 'light',
  },
  {
    agentId: '6',
    name: 'Jan Becker',
    companyName: 'Solar Direkt',
    status: 'WAITING',
    statusLabelDe: 'Wartend',
    durationFormatted: '00:15',
    durationCategory: 'light',
  },
];

export default function WallboardPage() {
  const { locale } = useI18n();
  const [agents, setAgents] = useState<ActiveAgent[]>(defaultFloorAgents);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_CALL' | 'WAITING' | 'WRAP_UP'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState(false);

  const fetchAgents = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/dialer/active-agents');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setAgents(json);
        } else {
          setAgents(defaultFloorAgents);
        }
      }
    } catch {
      setAgents(defaultFloorAgents);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 4000);
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('de-DE'));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(clockInterval);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const filteredAgents = agents.filter((ag) => {
    if (statusFilter === 'ALL') return true;
    return ag.status === statusFilter;
  });

  return (
    <AppShell noPadding>
      <div className="min-h-full bg-slate-950 text-white p-5 md:p-8 flex flex-col justify-between select-none relative overflow-hidden">
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top TV Bar */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm group flex items-center gap-2"
              title="Zurück zum Dashboard"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-sky-400" />
              <span className="text-xs font-semibold hidden sm:inline">Dashboard</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/30 to-indigo-500/30 text-sky-400 border border-sky-500/40 flex items-center justify-center font-bold shadow-lg shadow-sky-500/10">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black tracking-tight text-white">TEAM-WALLBOARD</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" /> LIVE FLOOR
                  </span>
                </div>
                <span className="text-xs text-slate-400">Call-Center Multi-Tenant Floor Monitor & Leaderboard</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white transition"
              title={soundEnabled ? 'Floor-Sounds stummschalten' : 'Floor-Sounds aktivieren'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="font-mono text-base md:text-lg font-bold text-sky-400 tracking-wider">
                {currentTime || '16:40:00'}
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white transition active:scale-95"
              title="Vollbildmodus (TV)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Impact TV KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-800/80 hover:border-sky-500/40 transition-all duration-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <span>Anrufe Heute</span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">248</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              ▲ +18% <span className="text-slate-500 font-normal">vs. gestern</span>
            </div>
          </div>

          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Abschlüsse (Termine)</span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-emerald-400 font-mono tracking-tight">38</div>
            <div className="text-xs text-slate-400 mt-1">Konversionsrate: 15.3%</div>
          </div>

          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span>Gesprächszeit Gesamt</span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">14h 22m</div>
            <div className="text-xs text-slate-400 mt-1">Ø 03:28 min pro Anruf</div>
          </div>

          <div className="glass-panel-dark rounded-2xl p-5 border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span>Erreichbarkeit</span>
            </div>
            <div className="text-3xl md:text-4xl font-black text-amber-400 font-mono tracking-tight">32.4%</div>
            <div className="text-xs text-slate-400 mt-1">Abbruchquote: 1.8% (&le; 3% Cap)</div>
          </div>
        </div>

        {/* Main Floor Grid: Agents & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 relative z-10">
          {/* Left: Active Floor Agents (8 cols) */}
          <div className="lg:col-span-8 glass-panel-dark rounded-3xl p-6 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white uppercase tracking-wider block">
                      Aktive Floor-Agenten ({filteredAgents.length} von {agents.length} Online)
                    </span>
                    <span className="text-[11px] text-slate-400">Echtzeit-Status via WebRTC Telephony Gateway</span>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1 rounded-xl font-bold transition ${
                      statusFilter === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    onClick={() => setStatusFilter('ON_CALL')}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
                      statusFilter === 'ON_CALL' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Am Telefon
                  </button>
                  <button
                    onClick={() => setStatusFilter('WAITING')}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
                      statusFilter === 'WAITING' ? 'bg-sky-500/30 text-sky-300 border border-sky-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Wartend
                  </button>
                  <button
                    onClick={() => setStatusFilter('WRAP_UP')}
                    className={`px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition ${
                      statusFilter === 'WRAP_UP' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Wrap-Up
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {filteredAgents.map((ag) => (
                  <div
                    key={ag.agentId}
                    className={`p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${
                      ag.status === 'ON_CALL'
                        ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                        : ag.status === 'WRAP_UP'
                        ? 'bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                          ag.status === 'ON_CALL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {ag.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-white truncate max-w-[120px]">{ag.name}</span>
                      </div>

                      <span
                        className={`w-3 h-3 rounded-full flex items-center justify-center ${
                          ag.status === 'ON_CALL'
                            ? 'bg-emerald-400 shadow-md shadow-emerald-400/50'
                            : ag.status === 'WRAP_UP'
                            ? 'bg-amber-400'
                            : 'bg-sky-400'
                        }`}
                      >
                        {ag.status === 'ON_CALL' && (
                          <span className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />
                        )}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mb-3 truncate">
                      {ag.companyName}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                      <span className={`font-semibold ${
                        ag.status === 'ON_CALL' ? 'text-emerald-400' : ag.status === 'WRAP_UP' ? 'text-amber-400' : 'text-sky-400'
                      }`}>
                        {ag.statusLabelDe}
                      </span>
                      <span className="font-mono font-bold text-slate-200 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-800">
                        {ag.durationFormatted}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Leaderboard (4 cols) */}
          <div className="lg:col-span-4 glass-panel-dark rounded-3xl p-6 border border-slate-800/80 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm text-white uppercase tracking-wider">Tages-Rangliste</span>
                </div>
                <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-bounce" /> Top Performer
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Umut Kaya', score: 14, time: '04:12h', medal: '🥇', tag: 'High-Closer' },
                  { rank: 2, name: 'Erensamsun Aydin', score: 11, time: '03:45h', medal: '🥈', tag: 'Fast-Paced' },
                  { rank: 3, name: 'Birgit Schneider', score: 8, time: '02:50h', medal: '🥉', tag: 'Top-Quality' },
                  { rank: 4, name: 'Kemal Yilmaz', score: 5, time: '02:10h', medal: '4', tag: 'Consistent' },
                ].map((lead) => (
                  <div
                    key={lead.rank}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold w-7 text-center">{lead.medal}</span>
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
                            {lead.tag}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Gesprächszeit: {lead.time}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-emerald-400 block">
                        {lead.score} Abschlüsse
                      </span>
                      <span className="text-[10px] text-slate-500">Termine</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 text-[11px] text-slate-400 text-center">
              Floor-Tagesziel: <span className="font-bold text-white">50 Abschlüsse</span> &bull; Noch <span className="font-bold text-amber-400">12</span> offen
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
