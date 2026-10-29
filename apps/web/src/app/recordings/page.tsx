'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  CircleDot,
  Play,
  Pause,
  Download,
  Volume2,
  FileText,
  Sparkles,
  ShieldCheck,
  Clock,
  User,
  Phone,
  RefreshCw,
  Search,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface CallRecording {
  id: string;
  callId: string;
  customerName: string;
  calleeNumber: string;
  agentName: string;
  projectName: string;
  durationSeconds: number;
  durationFormatted: string;
  channelsCount: number;
  recordedAt: string;
  audioUrl: string;
  qualityScore: number;
  diarizedTranscript: Array<{
    speaker: 'AGENT' | 'CUSTOMER';
    text: string;
    timestamp: string;
  }>;
}

export default function RecordingsPage() {
  const { locale } = useI18n();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecording, setSelectedRecording] = useState<CallRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(25); // percentage for demo waveform

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const json = await res.json();
        setRecordings(json || []);
        if (json.length > 0 && !selectedRecording) {
          setSelectedRecording(json[0]);
        }
      }
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CircleDot className="w-6 h-6 text-rose-600" />
              <span>{locale === 'tr' ? 'Çağrı Ses Kayıtları & Transkript' : 'Anrufaufzeichnungen & Transkripte'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'tr'
                ? 'Çift kanallı (dual-channel) ses oynatıcı, konuşmacı ayrımı (diarization) ve yapay zeka kalite skoru'
                : 'Dual-Channel Audio-Player mit Waveform, DE/TR Diarisierung und automatischer KI-Qualitätsprüfung'}
            </p>
          </div>

          <button
            onClick={fetchRecordings}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-600' : ''}`} />
            <span>Aktualisieren</span>
          </button>
        </div>

        {/* 2-Column Layout: List + Player/Transcript */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Recordings List (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Aufzeichnungen ({recordings.length})
                </span>
                <span className="text-[11px] text-slate-400">DSGVO-Aufbewahrung: 90 Tage</span>
              </div>

              <div className="divide-y divide-slate-100">
                {recordings.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      setSelectedRecording(rec);
                      setIsPlaying(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between group ${
                      selectedRecording?.id === rec.id ? 'bg-rose-50/40 border-l-4 border-rose-600' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-rose-600 transition">
                          {rec.customerName}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          {rec.projectName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{new Date(rec.recordedAt).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span>•</span>
                        <span className="font-mono font-medium text-slate-600">{rec.durationFormatted}</span>
                        <span>•</span>
                        <span>Agent: {rec.agentName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rec.qualityScore}% QC
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition" />
                    </div>
                  </div>
                ))}

                {recordings.length === 0 && !loading && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Keine Aufzeichnungen vorhanden.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Waveform Player & Diarized Transcript (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedRecording ? (
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-5">
                {/* Top Info & Download */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold uppercase tracking-widest block">
                      Zwei-Kanal Aufzeichnung (Stereo)
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      {selectedRecording.customerName} · {selectedRecording.projectName}
                    </h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Telefon: <strong className="font-mono text-slate-700">{selectedRecording.calleeNumber}</strong> · Agent:{' '}
                      <strong className="text-slate-700">{selectedRecording.agentName}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => alert('Download der Aufzeichnung (DSGVO-Berechtigung erforderlich)')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Audio (.wav)</span>
                  </button>
                </div>

                {/* Dual-Channel Waveform Mock Visualizer */}
                <div className="bg-slate-900 rounded-xl p-4 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-rose-400" />
                      <span>Kanal 1: Agent (Links) · Kanal 2: Kunde (Rechts)</span>
                    </span>
                    <span className="font-mono text-slate-200 font-bold">
                      {selectedRecording.durationFormatted}
                    </span>
                  </div>

                  {/* Waveform graphic */}
                  <div className="space-y-1.5 py-1">
                    <div className="h-5 flex items-center gap-0.5 opacity-90">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div
                          key={`ch1-${i}`}
                          className="flex-1 bg-sky-400 rounded-full transition-all"
                          style={{
                            height: `${Math.max(15, ((Math.sin(i * 0.4) + 1) / 2) * 100)}%`,
                          }}
                        />
                      ))}
                    </div>
                    <div className="h-5 flex items-center gap-0.5 opacity-90">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div
                          key={`ch2-${i}`}
                          className="flex-1 bg-rose-400 rounded-full transition-all"
                          style={{
                            height: `${Math.max(15, ((Math.cos(i * 0.3) + 1) / 2) * 100)}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition cursor-pointer shadow-xs"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    <div className="flex-1 mx-4">
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
                        <div className="h-full bg-rose-500 transition-all" style={{ width: `${playProgress}%` }}></div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      00:36 / {selectedRecording.durationFormatted}
                    </span>
                  </div>
                </div>

                {/* Diarized Transcript (Speaker Separation) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <span>Sprecher-Transkript (Diarisierung)</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Sprache: Deutsch (DE)</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {selectedRecording.diarizedTranscript.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start gap-3 ${
                          entry.speaker === 'AGENT'
                            ? 'bg-sky-50/40 border-sky-100'
                            : 'bg-slate-50 border-slate-200/70'
                        }`}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                            entry.speaker === 'AGENT'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {entry.speaker === 'AGENT' ? 'AGENT' : 'KUNDE'}
                        </span>
                        <div className="flex-1">
                          <p className="text-slate-800 leading-relaxed">{entry.text}</p>
                          <span className="text-[10px] font-mono text-slate-400 block mt-1">
                            {entry.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
                Wählen Sie links eine Anrufaufzeichnung aus.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
