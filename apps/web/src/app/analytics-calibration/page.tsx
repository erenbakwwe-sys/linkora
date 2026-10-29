'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Sliders,
  Sparkles,
  Download,
  Calendar,
} from 'lucide-react';

interface CalibrationReportData {
  generatedAt: string;
  totalOutcomesAnalyzed: number;
  overallConversionRatePercent: number;
  bandStats: {
    A: { band: string; totalLeads: number; confirmedCount: number; stornoCount: number; actualConversionRatePercent: number; expectedConversionRatePercent: number; driftPercent: number; isMiscalibrated: boolean };
    B: { band: string; totalLeads: number; confirmedCount: number; stornoCount: number; actualConversionRatePercent: number; expectedConversionRatePercent: number; driftPercent: number; isMiscalibrated: boolean };
    C: { band: string; totalLeads: number; confirmedCount: number; stornoCount: number; actualConversionRatePercent: number; expectedConversionRatePercent: number; driftPercent: number; isMiscalibrated: boolean };
    D: { band: string; totalLeads: number; confirmedCount: number; stornoCount: number; actualConversionRatePercent: number; expectedConversionRatePercent: number; driftPercent: number; isMiscalibrated: boolean };
  };
  modelDriftAlerts: string[];
  coachingInsights: {
    topWinningObjectionResponses: string[];
    topLostReasons: string[];
    recommendedScoreThresholdAdjustment?: string;
  };
}

export default function AnalyticsCalibrationPage() {
  const [report, setReport] = useState<CalibrationReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/calibration-report')
      .then((res) => res.json())
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load calibration report:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Lade Kalibrierungsdaten...</div>;
  }

  const bandData = report?.bandStats ? Object.values(report.bandStats) : [];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-teal-600" />
            Analytik & Konversions-Kalibrierung (Score Bands)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Vergleich der vorhergesagten KI-Eignungsscores mit den tatsächlich realisierten Abschlüssen
            (Kalibrierungs-Schleife).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Letzte 30 Tage (Rollierend)
          </div>
          <button className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Analysierte Abschlüsse</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {report?.totalOutcomesAnalyzed ?? 0} Leads
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Rückmeldungen aus lead_outcomes</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Realisierte Konversion</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">
            {report?.overallConversionRatePercent ?? 0}%
          </div>
          <span className="text-[11px] text-teal-700 mt-1 block">Bestätigt oder an Abnehmer verkauft</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Modell-Drift Status</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1 flex items-center gap-2">
            {report?.modelDriftAlerts?.length ?? 0} Warnungen
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">Drift &gt; 15% in Band B festgestellt</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">KI Token-Verbrauch</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-purple-600" />
            14.2k
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Musterverbrauch im Abrechnungsmonat</span>
        </div>
      </div>

      {/* Drift Alert Box */}
      {report?.modelDriftAlerts && report.modelDriftAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="text-sm font-bold text-rose-900">Achtung: Modell-Drift erkannt!</div>
            {report.modelDriftAlerts.map((alert, i) => (
              <p key={i} className="text-xs text-rose-800">{alert}</p>
            ))}
            {report.coachingInsights.recommendedScoreThresholdAdjustment && (
              <div className="mt-2 text-xs font-semibold text-rose-900 bg-rose-100/70 p-2 rounded">
                💡 {report.coachingInsights.recommendedScoreThresholdAdjustment}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calibration Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">
            Kalibrierungskurve: Erwartete vs. Realisierte Konversion je Score-Band
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Definiert in SPEC.md: Band A (≥80), Band B (60–79), Band C (40–59), Band D (&lt;40).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Score-Band</th>
                <th className="py-3 px-4">Punktebereich</th>
                <th className="py-3 px-4">Analysiert</th>
                <th className="py-3 px-4">Bestätigt</th>
                <th className="py-3 px-4">Storno</th>
                <th className="py-3 px-4">Erwartet</th>
                <th className="py-3 px-4">Realisiert</th>
                <th className="py-3 px-4">Drift</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bandData.map((b) => (
                <tr key={b.band} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">Band {b.band}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {b.band === 'A' ? '≥ 80 Pkt.' : b.band === 'B' ? '60 – 79 Pkt.' : b.band === 'C' ? '40 – 59 Pkt.' : '< 40 Pkt.'}
                  </td>
                  <td className="py-3 px-4 font-semibold">{b.totalLeads}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">{b.confirmedCount}</td>
                  <td className="py-3 px-4 text-rose-600 font-semibold">{b.stornoCount}</td>
                  <td className="py-3 px-4 text-slate-600">{b.expectedConversionRatePercent}%</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{b.actualConversionRatePercent}%</td>
                  <td className="py-3 px-4 font-semibold">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        b.driftPercent < -15
                          ? 'bg-rose-100 text-rose-700'
                          : b.driftPercent > 5
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {b.driftPercent > 0 ? `+${b.driftPercent}%` : `${b.driftPercent}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {b.isMiscalibrated ? (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Rekalibrierung nötig
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Stabil kalibriert
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coaching Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Erfolgsfaktoren & Agent-Coaching (Win-Muster)
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {report?.coachingInsights?.topWinningObjectionResponses?.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-800">
            <TrendingDown className="w-4 h-4 text-rose-600" />
            Haupt-Stornogründe (Lost-Muster)
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {report?.coachingInsights?.topLostReasons?.map((l, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-rose-50/50 p-2 rounded border border-rose-100">
                <span className="text-rose-600 font-bold">✕</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
