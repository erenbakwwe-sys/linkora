'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  FileText,
  User,
  Phone,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface QcItem {
  id: string;
  leadId: string;
  customerName: string;
  phone: string;
  city: string;
  product: string;
  reason: 'LOW_CONFIDENCE' | 'COMPLIANCE_WARNING' | 'DATA_MISMATCH';
  confidence: number;
  score: number;
  scoreBand: string;
  explanation: {
    summary: string;
    positives?: string[];
    risks?: string[];
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RE_CALL_REQUESTED';
  createdAt: string;
}

export default function QcQueuePage() {
  const [items, setItems] = useState<QcItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<QcItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ai/qc-queue')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
          if (data.length > 0) setSelectedItem(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load QC queue:', err));
  }, []);

  const handleReview = async (action: 'APPROVE' | 'REJECT' | 'RE_CALL') => {
    if (!selectedItem) return;

    try {
      const res = await fetch(`/api/ai/qc-review/${selectedItem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const updated = await res.json();

      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedItem(updated);
      setActionSuccess(`Status erfolgreich aktualisiert: ${action}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error submitting QC review:', err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-purple-600" />
            QC-Prüfung & Compliance-Prüfstand
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Menschliche Überprüfung von KI-Bewertungen mit geringer Konfidenz (&lt; 0.65) und Anruf-Transkripten mit
            Compliance-Warnungen.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'RE_CALL_REQUESTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                filterStatus === st
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              }`}
            >
              {st === 'ALL'
                ? 'Alle'
                : st === 'PENDING'
                ? 'Ausstehend'
                : st === 'APPROVED'
                ? 'Genehmigt'
                : st === 'REJECTED'
                ? 'Abgelehnt'
                : 'Wiedervorlage'}
            </button>
          ))}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {/* Main Grid: Queue on Left, Inspection Drawer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Prüfwarteschlange ({filteredItems.length})
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
              Keine Einträge für den gewählten Filter vorhanden.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedItem?.id === item.id
                    ? 'bg-purple-50/60 border-purple-300 ring-2 ring-purple-100 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-900 text-sm">{item.customerName}</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : item.status === 'RE_CALL_REQUESTED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                  <span>{item.city}</span>
                  <span>•</span>
                  <span>{item.product}</span>
                  <span>•</span>
                  <span className="font-semibold text-slate-700">Band {item.scoreBand} ({item.score} Pkt.)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                      item.reason === 'LOW_CONFIDENCE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {item.reason === 'LOW_CONFIDENCE' ? 'Geringe Konfidenz' : 'Compliance-Warnung'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Konfidenz: {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Detailed Inspection Card */}
        <div className="lg:col-span-7">
          {selectedItem ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Inspection Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">{selectedItem.customerName}</h2>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                      Band {selectedItem.scoreBand} • {selectedItem.score} Pkt.
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {selectedItem.phone}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {selectedItem.city}</span>
                    <span>Produkt: {selectedItem.product}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  Status: {selectedItem.status}
                </span>
              </div>

              {/* AI Diagnostic Explanation */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  KI-Befund & Begründung
                </div>
                <p className="text-sm text-slate-700">{selectedItem.explanation?.summary}</p>
                {selectedItem.explanation?.risks && selectedItem.explanation.risks.length > 0 && (
                  <div className="text-xs text-rose-700 font-medium">
                    ⚠️ Identifizierte Risikofaktoren: {selectedItem.explanation.risks.join(', ')}
                  </div>
                )}
              </div>

              {/* Dual-Channel Audio & Waveform Mock Player */}
              <div className="bg-slate-900 text-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    Aufzeichnung: Kanal 1 (Agent) & Kanal 2 (Kunde)
                  </span>
                  <span>02:15 / 02:45</span>
                </div>

                {/* Simulated Audio Waveform */}
                <div className="h-10 flex items-center gap-1 px-2 bg-slate-800/80 rounded border border-slate-700">
                  {[40, 65, 30, 85, 95, 45, 20, 60, 75, 90, 100, 70, 50, 30, 80, 90, 40, 20, 65, 80, 55, 30].map(
                    (height, i) => (
                      <div
                        key={i}
                        className={`flex-1 rounded-full transition-all ${
                          i < 14 ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    )
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1.5"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlayingAudio ? 'Pause' : 'Anhören'}
                  </button>
                  <span className="text-[11px] text-slate-400">Aufnahmezeitpunkt: Vor 35 Minuten</span>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Rechtliche Compliance-Prüfpunkte (DSGVO & UWG)
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-700">1. Aufzeichnungseinverständnis ausdrücklich eingeholt</span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Erfüllt
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-700">2. Hinweis "Kostenlos und unverbindlich" genannt</span>
                    <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Undeutlich / Manuell prüfen
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="text-slate-700">3. Eigentümerstatus & Einverständnis zur Weiterleitung</span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Erfüllt
                    </span>
                  </div>
                </div>
              </div>

              {/* Reviewer Action Buttons */}
              <div className="pt-2 border-t flex items-center justify-end gap-3">
                <button
                  onClick={() => handleReview('RE_CALL')}
                  className="px-4 py-2 border border-amber-300 text-amber-800 hover:bg-amber-50 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Rückruf anfordern
                </button>
                <button
                  onClick={() => handleReview('REJECT')}
                  className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Ablehnen
                </button>
                <button
                  onClick={() => handleReview('APPROVE')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Freigeben & Bestätigen
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400 text-sm">
              Wählen Sie einen Datensatz aus der Warteschlange zur Überprüfung.
            </div>
          )}
        </div>
      </div>
      </div>
    </AppShell>
  );
}
