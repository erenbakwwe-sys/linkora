'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  PhoneCall,
  Clock,
} from 'lucide-react';

export default function BalanceCostsPage() {
  const [balanceData, setBalanceData] = useState<any>(null);
  const [topupAmount, setTopupAmount] = useState<number>(250);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBalance = () => {
    fetch('http://localhost:3001/api/finances/balance')
      .then((res) => res.json())
      .then((d) => setBalanceData(d))
      .catch((err) => console.error('Failed to load balance:', err));
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleTopup = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/finances/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: topupAmount }),
      });
      const data = await res.json();
      setBalanceData(data);
      setSuccessMsg(`Guthaben erfolgreich um €${topupAmount.toFixed(2)} aufgeladen!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed topup:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-7 h-7 text-emerald-600" />
            Guthaben, Kosten & Minutenabrechnung
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Prepaid-Guthabenstand, Kreditlinie, konfigurierbare Telefonie-Minutentarife und automatischer Wählstopp.
          </p>
        </div>

        <button
          onClick={handleTopup}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <CreditCard className="w-3.5 h-3.5" />
          + €{topupAmount} Sofort aufladen
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Main Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Aktuelles Wallet-Guthaben</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            €{balanceData?.balanceEur?.toFixed(2) || '1.450,50'}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t">
            <span>Kreditlinie (Dispo):</span>
            <strong className="text-slate-800">€{balanceData?.creditLimitEur?.toFixed(2) || '500,00'}</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Minutentarif (Dialer)</span>
          <div className="text-3xl font-extrabold text-blue-600 font-mono">
            0.04 € <span className="text-sm font-normal text-slate-500">/ Min. netto</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t">
            <span>Abrechnungstakt:</span>
            <strong className="text-slate-800">Sekundengenau</strong>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase">Verbrauch heute</span>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            €{balanceData?.usageStats?.costTodayEur?.toFixed(2) || '7.36'}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t">
            <span>Gewählte Minuten heute:</span>
            <strong className="text-slate-800">{balanceData?.usageStats?.dialedMinutesToday || 184} Min.</strong>
          </div>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-2 text-xs text-slate-600">
        <div className="font-bold text-slate-800 uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Automatische Wählschutz-Richtlinie (SPEC.md)
        </div>
        <p>
          Unterschreitet das Guthaben die Schwelle von <strong>10,00 €</strong>, wird im gesamten Panel eine rote
          Warnung eingeblendet. Bei Erreichen des Kreditlimits (&le; 0 € verfügbares Saldo) wird der Cloud-Dialer zum
          Schutz vor ungedeckten Carrier-Kosten automatisch gestoppt.
        </p>
      </div>
      </div>
    </AppShell>
  );
}
