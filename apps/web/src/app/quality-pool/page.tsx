'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Gem,
  Sparkles,
  Repeat,
  CheckCircle2,
  Euro,
  MapPin,
  Building,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface QualityLead {
  leadId: string;
  customerName: string;
  city: string;
  product: string;
  scoreBand: string;
  score0100: number;
  initialSalePrice: number;
  resalePriceRecommended: number;
  salesCount: number;
  eligibleForResale: boolean;
}

export default function QualityPoolPage() {
  const [leads, setLeads] = useState<QualityLead[]>([]);
  const [resaleSuccess, setResaleSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/marketplace/quality-pool')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setLeads(data);
      })
      .catch((err) => console.error('Failed to load quality pool:', err));
  }, []);

  const handleResell = async (leadId: string) => {
    try {
      const res = await fetch('http://localhost:3001/api/marketplace/secondary-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          secondaryBuyerId: 'buyer-0004-vitalis-care',
          discountFactor: 0.75,
        }),
      });
      const sale = await res.json();

      setLeads((prev) =>
        prev.map((l) => (l.leadId === leadId ? { ...l, salesCount: l.salesCount + 1 } : l))
      );
      setResaleSuccess(
        `Zweitvermarktung erfolgreich! Neuer Verkauf an '${sale.buyerName}' für €${sale.salePrice} in lead_sales erfasst.`
      );
      setTimeout(() => setResaleSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error executing secondary sale:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Gem className="w-7 h-7 text-teal-600" />
            Qualitätspool & Resale (Zweitvermarktung)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gefilterter Pool hochqualifizierter Leads (Band A & B) für die semi-exklusive Mehrfachvermarktung gemäß
            Datenschutz- und Exklusivitätsregeln.
          </p>
        </div>

        <div className="text-xs bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
          <Repeat className="w-4 h-4 text-teal-600" />
          Multi-Sale ohne Schema-Änderung (lead_sales)
        </div>
      </div>

      {resaleSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {resaleSuccess}
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-900">
            Verfügbare High-Quality Leads im Resale-Pool ({leads.length})
          </div>
          <span className="text-xs text-slate-500">25% Rabatt auf Zweitplatzierung</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Kunde</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Produkt</th>
                <th className="py-3 px-4">KI-Score</th>
                <th className="py-3 px-4">Erstverkauf</th>
                <th className="py-3 px-4">Resale-Preis</th>
                <th className="py-3 px-4">Verkäufe (lead_sales)</th>
                <th className="py-3 px-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((lead) => (
                <tr key={lead.leadId} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{lead.customerName}</td>
                  <td className="py-3 px-4 text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.city}
                  </td>
                  <td className="py-3 px-4 font-medium">{lead.product}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Band {lead.scoreBand} ({lead.score0100} Pkt.)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">€{lead.initialSalePrice.toFixed(2)}</td>
                  <td className="py-3 px-4 text-teal-700 font-bold font-mono">
                    €{lead.resalePriceRecommended.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {lead.salesCount}x verkauft
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleResell(lead.leadId)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm ml-auto transition-colors"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      Semi-exklusiv verkaufen
                    </button>
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
