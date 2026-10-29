'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  PhoneCall,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Globe,
  RefreshCw,
  PhoneOutgoing,
} from 'lucide-react';

interface CallbackItem {
  id: string;
  leadId: string;
  customerName: string;
  phoneE164: string;
  projectName: string;
  scheduledAt: string;
  timezone: string;
  notes: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  assignedUserName?: string;
  isOverdue: boolean;
  dueLabelDe: string;
  dueLabelTr: string;
}

export default function CallbacksPage() {
  const { locale } = useI18n();
  const [callbacks, setCallbacks] = useState<CallbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OVERDUE' | 'UPCOMING'>('ALL');

  const fetchCallbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/v1/callbacks');
      if (res.ok) {
        const json = await res.json();
        setCallbacks(json || []);
      }
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCallbacks();
  }, []);

  const completeCallback = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/v1/callbacks/${id}/complete`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setCallbacks((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      //
    }
  };

  const filteredCallbacks = callbacks.filter((c) => {
    if (filter === 'OVERDUE') return c.isOverdue;
    if (filter === 'UPCOMING') return !c.isOverdue;
    return true;
  });

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <PhoneCall className="w-6 h-6 text-sky-600" />
              <span>{locale === 'tr' ? 'Geri Aramalar (Rückrufe)' : 'Rückrufe & Wiedervorlagen'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'tr'
                ? 'Zaman dilimine duyarlı arama pencereleri, gecikmiş aramalar ve tek tıkla arama'
                : 'Fällige und überfällige Kundentermine mit Timezone-Fenster und 1-Klick-Direktwahl'}
            </p>
          </div>

          <button
            onClick={fetchCallbacks}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs">
          {[
            { id: 'ALL', label: 'Alle Termine' },
            { id: 'OVERDUE', label: 'Überfällig (Dringend)' },
            { id: 'UPCOMING', label: 'Bevorstehend' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Callbacks List */}
        <div className="space-y-3">
          {filteredCallbacks.map((cb) => (
            <div
              key={cb.id}
              className={`bg-white rounded-xl shadow-xs border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:shadow-md ${
                cb.isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200/80'
              }`}
            >
              {/* Customer & Time Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-sm">{cb.customerName}</span>
                  <span className="font-mono text-xs text-slate-600 font-medium">{cb.phoneE164}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {cb.projectName}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-medium text-slate-700">
                      {new Date(cb.scheduledAt).toLocaleString('de-DE', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Globe className="w-3 h-3" />
                    <span>{cb.timezone}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-600">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Agent: <strong>{cb.assignedUserName}</strong></span>
                  </div>

                  {/* Due badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      cb.isOverdue
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {locale === 'tr' ? cb.dueLabelTr : cb.dueLabelDe}
                  </span>
                </div>

                {cb.notes && (
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                    &quot;{cb.notes}&quot;
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center">
                <button
                  onClick={() => alert(`Direktwahl wird gestartet: ${cb.phoneE164}`)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <PhoneOutgoing className="w-3.5 h-3.5" />
                  <span>Jetzt anrufen</span>
                </button>

                <button
                  onClick={() => completeCallback(cb.id)}
                  title="Als erledigt markieren"
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Erledigt</span>
                </button>
              </div>
            </div>
          ))}

          {filteredCallbacks.length === 0 && !loading && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
              Keine fälligen Rückrufe in dieser Kategorie vorhanden.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
