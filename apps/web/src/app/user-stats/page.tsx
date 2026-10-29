'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  BarChart3,
  Users,
  Award,
  PhoneCall,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function UserStatsPage() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/reports/user-stats')
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setStats(d);
      })
      .catch((err) => console.error('Failed to load user stats:', err));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Benutzerstatistiken & Agenten-Scorecard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Individuelle Leistungsmetriken der Mitarbeiter: Anrufvolumen, Kontaktquoten, Terminabschlüsse und KI-geprüfte
            Gesprächsqualität.
          </p>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Mitarbeiter-Leistungsübersicht ({stats.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Mitarbeiter</th>
                <th className="py-3 px-4">Team</th>
                <th className="py-3 px-4">Gewählt</th>
                <th className="py-3 px-4">Erreicht</th>
                <th className="py-3 px-4">Kontaktquote</th>
                <th className="py-3 px-4">Abschlüsse</th>
                <th className="py-3 px-4">Konversion</th>
                <th className="py-3 px-4">Gesprächszeit</th>
                <th className="py-3 px-4 text-right">KI-Qualität</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {stats.map((s) => (
                <tr key={s.agentId} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{s.team}</td>
                  <td className="py-3.5 px-4 font-semibold">{s.callsDialed}</td>
                  <td className="py-3.5 px-4 font-semibold">{s.callsAnswered}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{s.contactRatePercent}%</td>
                  <td className="py-3.5 px-4 text-emerald-600 font-bold">{s.conversions}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {s.conversionRatePercent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{s.totalTalkTimeFormatted}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      {s.aiQualityScore} Pkt.
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
