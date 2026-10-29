'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Timer,
  Clock,
  Coffee,
  CheckCircle2,
  FileSpreadsheet,
  Award,
} from 'lucide-react';

export default function TalkTimeReportPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports/talk-time')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load talk time report:', err));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Timer className="w-7 h-7 text-cyan-600" />
            Gesprächszeit-Bericht & Arbeitszeit-Verteilung
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Detaillierte Auswertung der Netto-Sprechzeit (Talk), Nachbearbeitungszeit (ACW) und Pausenzeiten
            aller aktiven Agenten.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Reine Sprechzeit</span>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.summary?.totalTalkTimeHours || 6.58} Std.
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-700">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Nachbearbeitung (ACW)</span>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.summary?.totalWrapTimeHours || 1.45} Std.
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
            <Coffee className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase">Pausenzeiten</span>
            <div className="text-2xl font-extrabold text-slate-900">
              {data?.summary?.totalPauseTimeHours || 1.2} Std.
            </div>
          </div>
        </div>
      </div>

      {/* Agents Scorecard Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Mitarbeiter-Scorecards</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Mitarbeiter</th>
                <th className="py-3 px-4">Sprechzeit (Min.)</th>
                <th className="py-3 px-4">ACW (Min.)</th>
                <th className="py-3 px-4">Pause (Min.)</th>
                <th className="py-3 px-4">Anrufe</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4 text-right">Scorecard-Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {data?.agents?.map((a: any) => (
                <tr key={a.name} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{a.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">{a.talkTimeMinutes} Min.</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{a.wrapTimeMinutes} Min.</td>
                  <td className="py-3.5 px-4 font-medium text-amber-600">{a.pauseTimeMinutes} Min.</td>
                  <td className="py-3.5 px-4 font-bold">{a.callsHandled}</td>
                  <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">{a.complianceScorePercent}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      Note {a.scorecardGrade}
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
