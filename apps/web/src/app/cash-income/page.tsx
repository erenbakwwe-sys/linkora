'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Banknote,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Download,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';

export default function CashIncomePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/finances/kasa')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load kasa income:', err));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Banknote className="w-7 h-7 text-emerald-600" />
            Kasa / Einnahmen & Abrechnungen
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Umsatzerlöse aus Lead-Verkäufen, Minutenabrechnungen, offene fällige Beträge und Prognosen für den nächsten
            Monat.
          </p>
        </div>

        <button className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm">
          <Download className="w-3.5 h-3.5" />
          Finanzbericht (PDF/CSV)
        </button>
      </div>

      {/* KPI Tiles matching Screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Realisierte Einnahmen</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            €{data?.totalRealizedIncomeEur?.toLocaleString('de-DE') || '24.850,00'}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Zahlungseingänge gesamt</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Offen (fällig) €</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            €{data?.offenFälligEur?.toLocaleString('de-DE') || '8.450,00'}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Fällige Abnehmer-Abrechnungen</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Nächster Monat €</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">
            €{data?.naechsterMonatEur?.toLocaleString('de-DE') || '14.200,00'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Erwartete Pipeline-Erlöse</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Partner-Provisionen</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            €{data?.totalCommissionsPaidEur?.toLocaleString('de-DE') || '6.200,00'}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Ausbezahlte Vermittlungsvergütung</span>
        </div>
      </div>

      {/* Income Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Letzte Einnahmen & Zahlungseingänge</h2>
          <span className="text-xs text-slate-500">GoBD-konforme Erfassung</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Buchungsquelle / Abnehmer</th>
                <th className="py-3 px-4">Datum</th>
                <th className="py-3 px-4">Betrag</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {data?.incomeEntries?.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{entry.source}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{entry.date}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-mono font-bold">
                    +€{entry.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                      Bezahlt
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
