'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, PhoneCall, CheckCircle2, ShieldCheck, Zap, Activity, Users, Radio, PhoneForwarded } from 'lucide-react';

export const LiveCampaignPreview: React.FC = () => {
  const [tempo, setTempo] = useState<number>(6);
  const [activeCallRows, setActiveCallRows] = useState([
    { id: 1, phone: '+49 171 ••• 4821', status: 'VERBUNDEN', duration: '02:41', agent: 'Can Yilmaz', score: 89, badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 2, phone: '+49 89 ••• 1902', status: 'WÄHLT...', duration: '00:11', agent: 'Leitung #4', score: 76, badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 3, phone: '+49 30 ••• 8820', status: 'AMD DROP', duration: '< 1.2s', agent: 'Mailbox gefiltert', score: 45, badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: 4, phone: '+49 69 ••• 7311', status: 'NACHBEARBEITUNG', duration: '00:28', agent: 'Sarah Krause', score: 92, badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  ]);

  // Derived metrics based on interactive Tempo slider
  const freeAgents = 8;
  const activeLines = Math.round(freeAgents * (tempo * 0.35 + 0.8));
  const callsPerMinute = Math.round(activeLines * 2.8);
  const answerRate = '41.8%';
  const abandonRate = (Math.min(2.8, 1.1 + tempo * 0.15)).toFixed(1) + '%'; // Regulatory capped < 3.0%

  return (
    <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-7 text-slate-900 backdrop-blur-xl overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and "Beispielansicht" Badge */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base text-slate-900">Photovoltaik D-A-CH Outbound</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                LIVE AKTIV
              </span>
            </div>
            <p className="text-xs text-slate-500">Predictive & Power-Dialing Kampagne</p>
          </div>
        </div>

        {/* Mandatory Label from SPEC */}
        <div className="flex items-center space-x-1.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-xs">
          <span>Beispielansicht</span>
        </div>
      </div>

      {/* Interactive Tempo 1-10 Slider */}
      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Kampagnen-Tempo (Pacing-Engine)
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500">Stufe:</span>
            <span className="text-sm font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
              {tempo} / 10
            </span>
          </div>
        </div>

        <input
          type="range"
          min="1"
          max="10"
          value={tempo}
          onChange={(e) => setTempo(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />

        <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
          <span>1 (Preview / Schonend)</span>
          <span>5 (Ausgewogen)</span>
          <span>10 (Maximaler Durchsatz)</span>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mb-1">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            <span>Freie Agenten</span>
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono">{freeAgents}</div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mb-1">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aktive Leitungen</span>
          </div>
          <div className="text-xl font-bold text-emerald-600 font-mono">{activeLines}</div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Antwortrate</span>
          </div>
          <div className="text-xl font-bold text-amber-600 font-mono">{answerRate}</div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Abbruchquote</span>
          </div>
          <div className="text-xl font-bold text-purple-700 font-mono">
            {abandonRate}
            <span className="text-[10px] text-slate-400 font-normal ml-1">(&le; 3%)</span>
          </div>
        </div>
      </div>

      {/* Realtime Call Stream Rows */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Live Verbindungen</span>
          <span className="text-[11px] text-sky-600 font-normal">~{callsPerMinute} Anrufe/Min</span>
        </div>

        {activeCallRows.map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between bg-slate-50/70 hover:bg-white rounded-xl p-2.5 px-3 border border-slate-200 text-xs transition shadow-2xs"
          >
            <div className="flex items-center space-x-3">
              <span className="font-mono text-slate-800 font-medium">{call.phone}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${call.badgeColor}`}
              >
                {call.status}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-slate-500 font-mono">{call.duration}</span>
              <span className="text-slate-600 font-medium hidden sm:inline">{call.agent}</span>
              <span className="bg-slate-100 border border-slate-300 text-amber-700 font-bold px-1.5 py-0.5 rounded text-[11px]">
                {call.score} Pkt
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Notice */}
      <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>WebRTC Carrier Latenz: 22ms (MOS: 4.35)</span>
        </span>
        <span className="text-slate-500">DSGVO Dual-Channel verschlüsselt</span>
      </div>
    </div>
  );
};
