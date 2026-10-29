'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Sparkles,
  PhoneCall,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  User,
  MapPin,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface TrLead {
  leadId: string;
  customerName: string;
  phone: string;
  city: string;
  product: string;
  priorityScore: number;
  scoreBand: 'A' | 'B' | 'C' | 'D';
  bestCallingWindow: string;
  briefTr: string;
  openingHookDe: string;
  riskWarningTr?: string;
  isFlaggedUnqualified: boolean;
}

export default function TrAssistPage() {
  const [leads, setLeads] = useState<TrLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<TrLead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/tr-call-list')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeads(data);
          if (data.length > 0) setSelectedLead(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load TR call list:', err);
        setLoading(false);
      });
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              TR KI-Assist — Öncelikli Çağrı Listesi & Briefing
            </h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              AI Powered
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Türkiye çağrı merkezleri için yapay zeka ile sıralanmış potansiyel müşteri listesi, en uygun arama saatleri ve
            Almanca/Türkçe taktiksel itiraz karşılama kılavuzu.
          </p>
        </div>

        <div className="text-xs bg-slate-100 px-3 py-2 rounded-lg border text-slate-600 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          Aktif Bölge: <strong>DACH / Almanya</strong>
        </div>
      </div>

      {/* Main Grid: Priority List on Left, Active Tactical Brief on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Lead Call Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Öncelikli Arama Sırası ({leads.length} Aday)
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              Aday listesi yükleniyor...
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.leadId}
                onClick={() => setSelectedLead(lead)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedLead?.leadId === lead.leadId
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{lead.customerName}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        lead.scoreBand === 'A'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.scoreBand === 'B'
                          ? 'bg-teal-100 text-teal-800'
                          : lead.scoreBand === 'C'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Band {lead.scoreBand} ({lead.priorityScore} Pkt.)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.city}</span>
                  <span>•</span>
                  <span>{lead.product}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    En İyi Saat: <strong className="text-slate-700">{lead.bestCallingWindow}</strong>
                  </span>
                  {lead.isFlaggedUnqualified && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Düşük Kalite
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Lead Tactical Brief */}
        <div className="lg:col-span-7">
          {selectedLead ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedLead.customerName}</h2>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Öncelik Skoru: {selectedLead.priorityScore} / 100
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>Telefon: {selectedLead.phone}</span>
                    <span>Şehir: {selectedLead.city}</span>
                    <span>Proje: {selectedLead.product}</span>
                  </div>
                </div>

                <a
                  href="/call-screen"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Çağrıyı Başlat
                </a>
              </div>

              {/* Risk Warning if Unqualified */}
              {selectedLead.riskWarningTr && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>DİKKAT / UYARI:</strong> {selectedLead.riskWarningTr}
                  </div>
                </div>
              )}

              {/* Turkish Context Brief */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Türkçe Temsilci Özeti (Aramadan Önce Oku)
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {selectedLead.briefTr}
                </p>
              </div>

              {/* Recommended Opening Hook in German */}
              <div className="border border-indigo-100 bg-indigo-50/50 rounded-lg p-4 space-y-2">
                <div className="text-xs font-bold text-indigo-900 uppercase">
                  Önerilen Almanca Giriş Cümlesi (Opening Hook)
                </div>
                <p className="text-sm text-indigo-950 font-serif italic bg-white p-3 rounded border border-indigo-100">
                  "{selectedLead.openingHookDe}"
                </p>
              </div>

              {/* Objection Handling Guide */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  En Sık Karşılaşılan İtirazlar & Hazır Yanıtlar
                </div>

                <div className="space-y-2 text-xs">
                  <div className="border rounded-lg p-3 bg-slate-50/70 space-y-1">
                    <span className="font-bold text-slate-900">İtiraz: "Şu an vaktim yok / Ich habe keine Zeit."</span>
                    <p className="text-slate-600">
                      <strong>Cevap (DE):</strong> "Vollkommen verständlich! Es geht nur um 60 Sekunden für die Eckdaten,
                      damit Ihnen der Fachberater ein fertiges Konzept zusenden kann."
                    </p>
                  </div>

                  <div className="border rounded-lg p-3 bg-slate-50/70 space-y-1">
                    <span className="font-bold text-slate-900">İtiraz: "Fiyatlar çok yüksek / Zu teuer."</span>
                    <p className="text-slate-600">
                      <strong>Cevap (DE):</strong> "Genau deshalb nutzen 85% unserer Kunden die aktuelle 0% Mehrwertsteuer-Regelung
                      und KfW-Kredite ohne Eigenkapital."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
              Listeden bir müşteri seçin.
            </div>
          )}
        </div>
      </div>
      </div>
    </AppShell>
  );
}
