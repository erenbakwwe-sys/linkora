'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  PhoneOutgoing,
  Clock,
  Euro,
  Volume2,
  Download,
  Filter,
  User,
  Calendar,
} from 'lucide-react';

interface CdrItem {
  id: string;
  agentName: string;
  calleeNumber: string;
  durationSeconds: number;
  durationFormatted: string;
  costEur: number;
  outcome: string;
  recordingUrl: string;
  timestamp: string;
}

export default function CallOverviewPage() {
  const [cdrs, setCdrs] = useState<CdrItem[]>([]);

  useEffect(() => {
    fetch('/api/finances/cdr')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCdrs(data);
      })
      .catch((err) => console.error('Failed to load CDRs:', err));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <PhoneOutgoing className="w-7 h-7 text-amber-600" />
            Anrufübersicht & Einzelverbindungsnachweis (CDR)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Detaillierte Protokollierung aller ein- und ausgehenden Verbindungen inklusive Verbindungsdauer,
            Minutenkosten und Aufzeichnungsreferenzen.
          </p>
        </div>

        <button className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
          <Download className="w-3.5 h-3.5" />
          CSV Export
        </button>
      </div>

      {/* CDR Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Verbindungsdatensätze ({cdrs.length})</h2>
          <span className="text-xs text-slate-500">Live aus Telephony-Provider synchronisiert</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Zeitpunkt</th>
                <th className="py-3 px-4">Mitarbeiter</th>
                <th className="py-3 px-4">Zielrufnummer</th>
                <th className="py-3 px-4">Gesprächsdauer</th>
                <th className="py-3 px-4">Kosten</th>
                <th className="py-3 px-4">Ergebnis (ACW)</th>
                <th className="py-3 px-4 text-right">Aufnahme</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {cdrs.map((cdr) => (
                <tr key={cdr.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {new Date(cdr.timestamp).toLocaleString('de-DE')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{cdr.agentName}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{cdr.calleeNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{cdr.durationFormatted}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700">€{cdr.costEur.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {cdr.outcome}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href="/recordings"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Anhören
                    </a>
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
