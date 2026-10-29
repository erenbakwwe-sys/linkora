'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  KeyRound,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

interface Buyer {
  id: string;
  name: string;
  companyIdentifier: string;
  pingEnabled: boolean;
  dailyCap: number;
  monthlyCap: number;
  deliveredToday: number;
  deliveredThisMonth: number;
  returnWindowDays: number;
  maxReturnRatePercent: number;
  totalDelivered: number;
  totalReturned: number;
  isActive: boolean;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/marketplace/buyers')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBuyers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load buyers:', err);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Abnehmer-Verwaltung & Partnerfirmen
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deutsche Arbeitgeber- & Handwerkspartner (Photovoltaik, Wärmepumpen, Sanierung) mit Kontingenten, Ping-Post
            Endpunkten und maximalen Rücklaufquoten.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {buyers.length} Aktive Partnerfirmen
          </span>
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
            Lade Partnerfirmen...
          </div>
        ) : (
          buyers.map((buyer) => {
            const returnRate =
              buyer.totalDelivered > 0 ? (buyer.totalReturned / buyer.totalDelivered) * 100 : 0;
            const capPercent = Math.min(100, (buyer.deliveredToday / buyer.dailyCap) * 100);

            return (
              <div
                key={buyer.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 hover:border-slate-300 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{buyer.name}</h2>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                      ID: {buyer.companyIdentifier} • {buyer.id}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                      buyer.pingEnabled
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    {buyer.pingEnabled ? 'Ping-Post Aktiv' : 'Direkt-Post'}
                  </span>
                </div>

                {/* Daily Cap Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Tageskontingent (Daily Cap)</span>
                    <span className="font-bold text-slate-900">
                      {buyer.deliveredToday} / {buyer.dailyCap} Leads ({capPercent.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capPercent >= 90 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${capPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">Rücklaufquote</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      {returnRate.toFixed(1)}%
                      <span className="text-xs text-slate-400 font-normal">/ max {buyer.maxReturnRatePercent}%</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">Rückgabefrist</span>
                    <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                      {buyer.returnWindowDays} Tage
                      <span className="text-xs text-slate-400 font-normal">(Kulanz)</span>
                    </div>
                  </div>
                </div>

                {/* Footer specs */}
                <div className="pt-3 border-t flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    HMAC-SHA256 Signatur
                  </span>
                  <span>Geliefert gesamt: <strong>{buyer.totalDelivered} Leads</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </AppShell>
  );
}
