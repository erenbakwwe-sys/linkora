'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  RotateCcw,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Euro,
  Building,
  Calendar,
  FileText,
} from 'lucide-react';

interface ReturnItem {
  id: string;
  leadSaleId: string;
  buyerId: string;
  reasonCode: string;
  reasonDetail?: string;
  status: string;
  refundAmount: number;
  createdAt: string;
}

interface CreditNoteItem {
  id: string;
  creditNoteNumber: string;
  amount: number;
  currency: string;
  issuedAt: string;
}

export default function ReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:3001/api/marketplace/returns').then((r) => r.json()),
      fetch('http://localhost:3001/api/marketplace/credit-notes').then((r) => r.json()),
    ])
      .then(([returnsData, creditNotesData]) => {
        if (Array.isArray(returnsData)) setReturns(returnsData);
        if (Array.isArray(creditNotesData)) setCreditNotes(creditNotesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load returns and credit notes:', err);
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
            <RotateCcw className="w-7 h-7 text-rose-600" />
            Rückläufer & Gutschriften (Credit Notes)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Reklamationsprüfung bei fehlerhaften Leads, automatische Gutschriftserstellung und Überwachung der
            vertraglichen Rücklaufquote (max. 15%).
          </p>
        </div>

        <div className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg border text-slate-700 font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          Rückgabefrist: <strong>7 Tage Kulanz</strong>
        </div>
      </div>

      {/* Grid: Returns on Left, Official Credit Notes on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Return Requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              Erfasste Reklamationen ({returns.length})
            </h2>
            <span className="text-xs text-slate-500">Prüfung gemäß Reklamationsordnung</span>
          </div>

          <div className="p-4 space-y-3">
            {returns.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Keine offenen oder bearbeiteten Rückläufer.
              </div>
            ) : (
              returns.map((ret) => (
                <div key={ret.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                      Grund: {ret.reasonCode}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Genehmigt & Erstattet
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{ret.reasonDetail || 'Keine Detailangabe'}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t">
                    <span>Erstattungsbetrag: <strong className="text-slate-900">€{ret.refundAmount.toFixed(2)}</strong></span>
                    <span>Transaktion: {ret.leadSaleId.slice(0, 12)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Issued Credit Notes */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Ausgestellte Gutschriften ({creditNotes.length})
            </h2>
            <span className="text-xs text-slate-500">GoBD-konforme Gutschriftsbelege</span>
          </div>

          <div className="p-4 space-y-3">
            {creditNotes.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                Bisher keine Gutschriften erzeugt.
              </div>
            ) : (
              creditNotes.map((cn) => (
                <div key={cn.id} className="p-4 rounded-lg border border-slate-200 bg-emerald-50/30 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      {cn.creditNoteNumber}
                    </div>
                    <span className="text-xs text-slate-400">
                      Ausgestellt: {new Date(cn.issuedAt).toLocaleString('de-DE')}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-extrabold text-emerald-700 font-mono">
                      €{cn.amount.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-emerald-600 font-semibold">Wallet gutgeschrieben</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
