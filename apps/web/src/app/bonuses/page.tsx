'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Trophy,
  Award,
  Euro,
  User,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface BonusAwardItem {
  id: string;
  userName: string;
  ruleName: string;
  amount: number;
  awardedAt: string;
}

export default function BonusesPage() {
  const [bonuses, setBonuses] = useState<BonusAwardItem[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/operations/bonuses')
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setBonuses(d);
      })
      .catch((err) => console.error('Failed to load bonuses:', err));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Prämien, Boni & Mitarbeiter-Incentives
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Konfigurierbare Provisionsregeln je bestätigtem Lead oder erreichtem Kampagnenziel mit automatischer
            Prämienausschüttung.
          </p>
        </div>
      </div>

      {/* Active Rules Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-700">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Termin-Erfolgsprämie (PV Deutschland)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatische Prämie bei Status `TERM_VEREINBART` nach erfolgreicher QC-Freigabe.
            </p>
            <span className="text-base font-extrabold text-emerald-700 mt-2 block font-mono">
              + €25,00 je Lead
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
          <div className="p-3 bg-purple-100 rounded-lg text-purple-700">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Wochenziel Übererfüllung (120%)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bonus bei mehr als 20 qualifizierten Terminen in einer Kalenderwoche.
            </p>
            <span className="text-base font-extrabold text-purple-700 mt-2 block font-mono">
              + €75,00 Einmalprämie
            </span>
          </div>
        </div>
      </div>

      {/* Awards Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">Ausgeschüttete Prämien ({bonuses.length})</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {bonuses.map((b) => (
            <div key={b.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{b.userName}</div>
                  <div className="text-xs text-slate-500">{b.ruleName}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-base font-extrabold text-emerald-700 font-mono">+€{b.amount.toFixed(2)}</div>
                <span className="text-xs text-slate-400">
                  {new Date(b.awardedAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </AppShell>
  );
}
