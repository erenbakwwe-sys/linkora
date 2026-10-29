'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Radio,
  FileQuestion,
  UserCheck,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Save,
  Activity,
  Headphones,
  Signal,
} from 'lucide-react';

interface ActiveLead {
  id: string;
  firstName: string;
  lastName: string;
  phoneE164: string;
  city: string;
  postalCode: string;
  projectName: string;
  consentVerified: boolean;
  dncFlag: boolean;
}

export default function CallScreenPage() {
  const { locale } = useI18n();

  // Agent State
  const [agentStatus, setAgentStatus] = useState<'READY' | 'PAUSE' | 'DIALING' | 'ON_CALL' | 'WRAP_UP'>('READY');
  const [pauseReason, setPauseReason] = useState('Mittagspause');

  // Active Call State
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);

  // Line Quality Metrics
  const [mosScore, setMosScore] = useState(4.35);
  const [jitterMs, setJitterMs] = useState(12);
  const [packetLoss, setPacketLoss] = useState(0.18);
  const [reportedBadLine, setReportedBadLine] = useState(false);

  // Current Lead Info
  const [currentLead, setCurrentLead] = useState<ActiveLead>({
    id: '77777777-0000-0000-0000-000000000001',
    firstName: 'Maximilian',
    lastName: 'Weber',
    phoneE164: '+491714567890',
    city: 'München',
    postalCode: '80331',
    projectName: 'Photovoltaik',
    consentVerified: true,
    dncFlag: false,
  });

  // Questionnaire Answers
  const [roofType, setRoofType] = useState('Satteldach');
  const [annualKwh, setAnnualKwh] = useState('5200');
  const [batteryStorage, setBatteryStorage] = useState('Ja, gewünscht');
  const [notes, setNotes] = useState('');

  // Wrap-up modal (Mandatory ACW)
  const [showWrapupModal, setShowWrapupModal] = useState(false);
  const [selectedWrapup, setSelectedWrapup] = useState('TERM_VEREINBART');
  const [wrapupNotes, setWrapupNotes] = useState('');

  // Timer loop when ON_CALL
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (agentStatus === 'ON_CALL') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [agentStatus]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartDial = async () => {
    try {
      setAgentStatus('DIALING');
      const res = await fetch('http://localhost:3001/api/dialer/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: currentLead.id,
          callerNumber: '+498912345678',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setActiveCallId(json.callId);
        setAgentStatus('ON_CALL');
        setIsCalling(true);
        setCallDuration(0);
      } else {
        const err = await res.json();
        alert(err.message || 'Anruf konnte nicht gestartet werden.');
        setAgentStatus('READY');
      }
    } catch {
      // Offline fallback
      setActiveCallId('mock-call-1');
      setAgentStatus('ON_CALL');
      setIsCalling(true);
      setCallDuration(0);
    }
  };

  const handleHangup = async () => {
    if (activeCallId) {
      try {
        await fetch('http://localhost:3001/api/dialer/hangup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: activeCallId }),
        });
      } catch {}
    }
    setIsCalling(false);
    setAgentStatus('WRAP_UP');
    setShowWrapupModal(true);
  };

  const handleWrapupSubmit = async () => {
    try {
      await fetch('http://localhost:3001/api/dialer/wrapup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: activeCallId || 'mock-call-1',
          leadId: currentLead.id,
          wrapupCode: selectedWrapup,
          notes: wrapupNotes,
          countsAsConversion: selectedWrapup === 'TERM_VEREINBART',
        }),
      });
    } catch {}

    setShowWrapupModal(false);
    setAgentStatus('READY');
    setCallDuration(0);
    setActiveCallId(null);
  };

  const handleReportBadLine = async () => {
    try {
      await fetch('http://localhost:3001/api/dialer/report-bad-line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: activeCallId || 'current-call',
          notes: 'Leichte Tonverzögerung / Echo bemerkt',
        }),
      });
      setReportedBadLine(true);
      setTimeout(() => setReportedBadLine(false), 4000);
    } catch {
      setReportedBadLine(true);
    }
  };

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Softphone Master Header Bar */}
        <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Agent Status & Toggle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Agent Workspace: Umut Kaya</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    agentStatus === 'ON_CALL'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : agentStatus === 'READY'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                      : agentStatus === 'WRAP_UP'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  ● {agentStatus === 'ON_CALL' ? 'Am Telefon' : agentStatus === 'READY' ? 'Bereit' : agentStatus === 'WRAP_UP' ? 'ACW (Nachbearbeitung)' : 'Pause'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kampagne: <strong className="text-slate-200">PV Deutschland Outbound Q4</strong> (Power Tempo 5)
              </div>
            </div>
          </div>

          {/* Center: Call Timer & Status Indicator */}
          <div className="flex items-center justify-center gap-3 bg-slate-950/60 px-5 py-2 rounded-xl border border-slate-800/80">
            <Radio className={`w-4 h-4 ${agentStatus === 'ON_CALL' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">Gesprächszeit</span>
              <span className="font-mono text-lg font-bold text-slate-100 tracking-wider">
                {formatTimer(callDuration)}
              </span>
            </div>
          </div>

          {/* Right: Softphone Quick Controls */}
          <div className="flex items-center gap-2">
            {agentStatus !== 'ON_CALL' && (
              <button
                onClick={handleStartDial}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Anruf starten</span>
              </button>
            )}

            {agentStatus === 'ON_CALL' && (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-2 rounded-xl border transition ${
                    isMuted
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title={isMuted ? 'Stummschaltung aufheben' : 'Mikrofon stummschalten'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsOnHold(!isOnHold)}
                  className={`p-2 rounded-xl border transition ${
                    isOnHold
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title={isOnHold ? 'Halten beenden' : 'Anruf halten'}
                >
                  {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleHangup}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Auflegen</span>
                </button>
              </>
            )}

            {/* Pause / Ready Switcher */}
            {agentStatus !== 'ON_CALL' && (
              <button
                onClick={() => setAgentStatus(agentStatus === 'READY' ? 'PAUSE' : 'READY')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
              >
                {agentStatus === 'READY' ? 'Pause' : 'Bereit'}
              </button>
            )}
          </div>
        </div>

        {/* Live WebRTC Line Quality Banner */}
        <div className="bg-white rounded-xl px-4 py-2 border border-slate-200/80 shadow-xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Signal className="w-3.5 h-3.5 text-emerald-600" />
              <span>WebRTC Leitungsqualität:</span>
            </span>
            <span>MOS: <strong className="text-emerald-700">{mosScore}</strong> / 5.0 (Exzellent)</span>
            <span>Jitter: <strong className="text-slate-800">{jitterMs} ms</strong></span>
            <span>Paketverlust: <strong className="text-slate-800">{packetLoss}%</strong></span>
          </div>

          <button
            onClick={handleReportBadLine}
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition ${
              reportedBadLine
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {reportedBadLine ? '✓ Gemeldet' : 'Schlechte Leitung melden'}
          </button>
        </div>

        {/* Workspace 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Column 1: Lead Card & Script (3 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Customer Details Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Aktueller Kontakt
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>UWG § 7 Verifiziert</span>
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {currentLead.firstName} {currentLead.lastName}
                </h2>
                <div className="font-mono text-sm font-semibold text-sky-700 mt-0.5">
                  {currentLead.phoneE164}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {currentLead.postalCode} {currentLead.city}
                </div>
              </div>

              {/* Call History preview */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <div>Versuche bisher: <strong className="text-slate-700">1 von 5</strong></div>
                <div>Letzter Status: <strong className="text-slate-700">Neu eingegangen</strong></div>
              </div>
            </div>

            {/* Conversation Script Guide */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Gesprächsleitfaden (Script)
              </span>
              <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed space-y-2">
                <p>
                  <strong>1. Begrüßung:</strong> &quot;Guten Tag Herr/Frau Weber, mein Name ist Umut Kaya von der Fachberatung Solarenergie. Sie haben online ein unverbindliches Angebot für eine Photovoltaikanlage angefordert.&quot;
                </p>
                <p>
                  <strong>2. Einleitung:</strong> &quot;Ich möchte mit Ihnen kurz die technischen Rahmendaten Ihres Daches abgleichen, damit unsere Techniker die optimale Anlagengröße berechnen können. Haben Sie kurz 2 Minuten Zeit?&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Interactive Questionnaire (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileQuestion className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Produktfragebogen: {currentLead.projectName}
                  </h3>
                </div>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-semibold">
                  v1.0 PUBLISHED
                </span>
              </div>

              {/* Dynamic Questions */}
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    1. Sind Sie Eigentümer der Immobilie? *
                  </label>
                  <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium">
                    <option>Ja, Alleineigentümer</option>
                    <option>Ja, Miteigentümer</option>
                    <option>Nein, Mieter</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    2. Welche Dachform hat das Gebäude? *
                  </label>
                  <select
                    value={roofType}
                    onChange={(e) => setRoofType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="Satteldach">Satteldach</option>
                    <option value="Flachdach">Flachdach</option>
                    <option value="Pultdach">Pultdach</option>
                    <option value="Walmdach">Walmdach</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    3. Jährlicher Stromverbrauch in kWh? *
                  </label>
                  <input
                    type="number"
                    value={annualKwh}
                    onChange={(e) => setAnnualKwh(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    4. Batteriespeicher gewünscht?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Ja, gewünscht', 'Erstmal ohne'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setBatteryStorage(opt)}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition ${
                          batteryStorage === opt
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agent Notepad */}
                <div className="pt-2">
                  <label className="text-slate-700 font-semibold block mb-1">
                    Notizen zum Gespräch:
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Wichtige Hinweise für den Techniker oder Rückrufzeit..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: AI Assistant & Matched Buyer (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* AI Call Assistant */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-sm p-4 text-white space-y-3 border border-indigo-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>KI-Assistent (Live)</span>
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">
                  88% Eignung (Band A)
                </span>
              </div>

              {/* Matched Buyer Info */}
              <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                  Bester Abnehmer (Match):
                </span>
                <div className="font-bold text-xs text-white">Solar Direkt GmbH</div>
                <div className="text-[11px] text-emerald-400 font-medium">Gebot / Richtpreis: 48.00 €</div>
              </div>

              {/* Objection Handling */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Einwandbehandlung:
                </span>
                <div className="bg-white/5 p-2 rounded-lg text-[11px] text-slate-300 leading-snug">
                  &quot;Falls Kunde Bedenken wegen Anschaffungskosten äußert: Auf 0-Euro-Anzahlung und KfW 442 Förderung verweisen.&quot;
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Nächste Empfohlene Frage:
                </span>
                <p className="text-[11px] text-sky-200 italic">
                  &quot;Haben Sie bereits einen Zählerkasten aus den letzten 10 Jahren?&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory ACW Wrap-Up Modal */}
      {showWrapupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div>
              <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">
                Nachbearbeitung (ACW)
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Gesprächsergebnis auswählen (Pflicht)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Wählen Sie den zutreffenden Code aus, um den Lead abzuschließen und wieder auf &quot;Bereit&quot; zu wechseln.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { code: 'TERM_VEREINBART', label: 'Termin vereinbart (Konversion)', bg: 'hover:border-emerald-400 hover:bg-emerald-50/50' },
                { code: 'RUECKRUF_GEWUENSCHT', label: 'Rückruf gewünscht', bg: 'hover:border-sky-400 hover:bg-sky-50/50' },
                { code: 'NICHT_ERREICHT', label: 'Nicht erreicht / Mailbox', bg: 'hover:border-amber-400 hover:bg-amber-50/50' },
                { code: 'KEIN_INTERESSE', label: 'Kein Interesse', bg: 'hover:border-slate-400 hover:bg-slate-50' },
                { code: 'SPERRE_DNC', label: 'Keine Anrufe mehr erwünscht (DNC)', bg: 'hover:border-rose-400 hover:bg-rose-50/50' },
              ].map((item) => (
                <label
                  key={item.code}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedWrapup === item.code
                      ? 'border-sky-600 bg-sky-50/70 text-sky-950 font-semibold'
                      : `border-slate-200 text-slate-700 ${item.bg}`
                  }`}
                >
                  <input
                    type="radio"
                    name="wrapup"
                    value={item.code}
                    checked={selectedWrapup === item.code}
                    onChange={(e) => setSelectedWrapup(e.target.value)}
                    className="text-sky-600 focus:ring-sky-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-[11px] text-slate-500 font-medium block mb-1">
                Abschlussnotiz (optional):
              </label>
              <textarea
                rows={2}
                value={wrapupNotes}
                onChange={(e) => setWrapupNotes(e.target.value)}
                placeholder="Details zum Ergebnis..."
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleWrapupSubmit}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
              >
                Ergebnis speichern & Bereit schalten
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
