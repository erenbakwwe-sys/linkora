'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  Sliders,
  Clock,
  RotateCcw,
  Bot,
  ShieldCheck,
  Disc,
  PhoneForwarded,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';

interface AutoDialSettings {
  ringTimeoutSeconds: number;
  retryRules: {
    maxAttempts: number;
    intervalsMin: number[];
  };
  amdActive: boolean;
  amdAction: 'HANGUP' | 'VOICEMAIL_DROP' | 'AGENT';
  maxAbandonRatePercent: number;
  minFreeAgents: number;
  lineCapMultiplier: number;
  recordingActive: boolean;
  callerIdRotation: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
}

export default function AutoDialSettingsPage() {
  const { locale } = useI18n();
  const [settings, setSettings] = useState<AutoDialSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/auto-dial/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch('http://localhost:3001/api/auto-dial/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {}
    finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sliders className="w-6 h-6 text-indigo-600" />
              <span>{locale === 'tr' ? 'Otomatik Arama & Uyumluluk Ayarları' : 'Auto-Anruf-Einstellungen'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'tr'
                ? 'Çalma zaman aşımı, AMD (sekreter filtresi), %3 terk oranı sınırı ve numara rotasyonu'
                : 'Klingeldauer, Answering Machine Detection (AMD), gesetzliche Abbruchquoten und Rufnummern-Rotation'}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !settings}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs self-start"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Wird gespeichert...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Gespeichert!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Einstellungen speichern</span>
              </>
            )}
          </button>
        </div>

        {settings && (
          <div className="space-y-4">
            {/* Group 1: AMD & Answering Machine Rules */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-sky-600" />
                  <span>Anrufbeantworter-Erkennung (AMD)</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.amdActive}
                    onChange={(e) => setSettings({ ...settings, amdActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Aktion bei erkanntem Anrufbeantworter:
                  </label>
                  <select
                    value={settings.amdAction}
                    onChange={(e) => setSettings({ ...settings, amdAction: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="HANGUP">Sofort auflegen (Keine Minutenkosten)</option>
                    <option value="VOICEMAIL_DROP">Automatische Nachricht hinterlassen (Audio Drop)</option>
                    <option value="AGENT">Trotzdem an Agenten durchstellen</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Klingeldauer bis Timeout (Sekunden):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="15"
                      max="60"
                      value={settings.ringTimeoutSeconds}
                      onChange={(e) => setSettings({ ...settings, ringTimeoutSeconds: parseInt(e.target.value, 10) })}
                      className="flex-1 accent-sky-600"
                    />
                    <span className="font-mono text-xs font-bold text-slate-800 w-12 text-right">
                      {settings.ringTimeoutSeconds}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2: Abandon Rate Cap & Compliance */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Gesetzlicher Verbraucherschutz & Abbruchquote</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Maximale Abbruchquote (Anrufe ohne freien Agenten) gemäß Telekommunikationsgesetz (TKG / UWG).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Max. erlaubte Abbruchquote (Abandon Rate):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1.0"
                      max="5.0"
                      step="0.1"
                      value={settings.maxAbandonRatePercent}
                      onChange={(e) => setSettings({ ...settings, maxAbandonRatePercent: parseFloat(e.target.value) })}
                      className="flex-1 accent-emerald-600"
                    />
                    <span className="font-mono text-xs font-bold text-emerald-700 w-16 text-right bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {settings.maxAbandonRatePercent.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Empfohlen: 3.0% (Standard-Schutzgrenze)
                  </span>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Min. freie Agenten vor Pacing-Start:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.minFreeAgents}
                    onChange={(e) => setSettings({ ...settings, minFreeAgents: parseInt(e.target.value, 10) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: CLI Reputation & Number Rotation */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                  <span>Rufnummern-Pool & Automatische Rotation (CLI Reputation)</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Schutz vor Spam-Markierungen durch regelmäßige Rotation der ausgehenden DE-Rufnummern.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Rotationsintervall:
                  </label>
                  <select
                    value={settings.callerIdRotation}
                    onChange={(e) => setSettings({ ...settings, callerIdRotation: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="WEEKLY">Wöchentlich (Empfohlen)</option>
                    <option value="BI_WEEKLY">Alle 2 Wochen</option>
                    <option value="MONTHLY">Monatlich</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="font-semibold text-slate-800 block">Zwei-Kanal Anrufaufzeichnung:</span>
                    <span className="text-[11px] text-slate-400">Trennt Agent und Kunde auf separate Audiospuren</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.recordingActive}
                    onChange={(e) => setSettings({ ...settings, recordingActive: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
