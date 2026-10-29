'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  Inbox,
  Sliders,
  Play,
  Pause,
  Square,
  Users,
  PhoneCall,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert,
  RefreshCw,
  Plus,
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  projectName: string;
  dialingMode: 'PREVIEW' | 'PROGRESSIVE' | 'POWER' | 'PREDICTIVE';
  pacingTempo: number; // 1 to 10
  maxAbandonRate: number;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  totalLeads: number;
  contactedLeads: number;
  freeAgents: number;
  pacing: {
    linesToDial: number;
    multiplier: number;
    isCappedByAbandonRate: boolean;
    expectedAnswers: number;
    reason: string;
  };
}

export default function CampaignsPage() {
  const { locale } = useI18n();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        const json = await res.json();
        setCampaigns(json || []);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleTempoChange = async (campaignId: string, newTempo: number) => {
    setUpdatingId(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/tempo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempo: newTempo }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? updated : c))
        );
      }
    } catch {}
    finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (campaignId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? updated : c))
        );
      }
    } catch {}
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Inbox className="w-6 h-6 text-purple-600" />
              <span>{locale === 'tr' ? 'Kampanya Yönetimi & Canlı Tempo' : 'Kampagnen & Live-Pacing'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'tr'
                ? 'Tempo 1–10 kaydırıcısı, otomatik hat tahsisi ve %3 çağrı bırakma (abandon rate) sınırı'
                : 'Kampagnensteuerung mit Live-Pacing-Slider (Tempo 1–10), Anrufmodi und 3%-Abbruchquoten-Schutz'}
            </p>
          </div>

          <button
            onClick={fetchCampaigns}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* Campaigns Grid */}
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4 hover:border-slate-300 transition"
            >
              {/* Campaign Top Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-base text-slate-900">{camp.name}</span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {camp.projectName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        camp.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      ● {camp.status === 'ACTIVE' ? 'Aktiv (Wählt)' : 'Pausiert'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>Modus: <strong className="text-slate-800">{camp.dialingMode}</strong></span>
                    <span>•</span>
                    <span>Kontaktiert: <strong className="text-slate-800">{camp.contactedLeads} / {camp.totalLeads}</strong></span>
                    <span>•</span>
                    <span>Freie Agenten: <strong className="text-emerald-700">{camp.freeAgents}</strong></span>
                  </div>
                </div>

                {/* Status Toggle Action */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStatusToggle(camp.id, camp.status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      camp.status === 'ACTIVE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {camp.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{camp.status === 'ACTIVE' ? 'Kampagne pausieren' : 'Kampagne starten'}</span>
                  </button>
                </div>
              </div>

              {/* Live Tempo Slider & Pacing Output Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                {/* Slider (7 cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-sky-600" />
                      <span>Live-Pacing &quot;Tempo&quot; Schieberegler:</span>
                    </span>
                    <span className="font-mono text-sm font-bold text-sky-700 bg-sky-100/70 px-2.5 py-0.5 rounded-md">
                      Tempo {camp.pacingTempo} / 10
                    </span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={camp.pacingTempo}
                    onChange={(e) => handleTempoChange(camp.id, parseInt(e.target.value, 10))}
                    className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Tempo 1 (1:1 Konservativ)</span>
                    <span>Tempo 5 (Standard Power)</span>
                    <span>Tempo 10 (Maximal)</span>
                  </div>
                </div>

                {/* Real-Time Pacing Calculation Tiles (5 cols) */}
                <div className="lg:col-span-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-base font-mono font-bold text-sky-700">
                      {camp.pacing.linesToDial}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Aktive Leitungen</div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-base font-mono font-bold text-purple-700">
                      {camp.pacing.multiplier}x
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Multiplikator</div>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                    <div className="text-base font-mono font-bold text-emerald-700">
                      {camp.pacing.expectedAnswers}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Erw. Treffer</div>
                  </div>
                </div>
              </div>

              {/* Pacing reason explanation & abandon notice */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="italic">
                  Algorithmus-Status: <strong>{camp.pacing.reason}</strong>
                </span>
                <span className="text-slate-400 font-medium">
                  Max. Abbruchquote (Abandon Rate): <strong className="text-slate-700">{camp.maxAbandonRate}%</strong>
                </span>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && !loading && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Keine aktiven Kampagnen gefunden.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
