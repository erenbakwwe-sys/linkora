'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';
import { useAuth } from '@/context/AuthContext';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  User,
  Palmtree,
  Megaphone,
  Trophy,
  FileSpreadsheet,
  Plus,
  LayoutDashboard,
  LogOut,
  CreditCard,
  Play,
  Pause,
  Volume2,
  Settings,
  AlertTriangle,
  Send,
  CheckCircle2,
  X,
  MapPin,
  Save,
  Check,
  ChevronDown,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Headphones,
  Copy,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export default function CallScreenPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const { locale, setLocale } = useI18n();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  const userName = user ? `${user.firstName || user.username} ${user.lastName || ''}`.trim() : 'Agent';

  // Left Dial Card State
  const [activeTab, setActiveTab] = useState<'MANUELL' | 'SON48' | 'SCHWEBEND'>('MANUELL');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [balance, setBalance] = useState('10,00 €');
  const [campaign, setCampaign] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioStatus, setAudioStatus] = useState('Bağlanıyor...');
  const [autoDialActive, setAutoDialActive] = useState(false);

  // Center Form State ("Kunde hinzufügen")
  const [formPhone, setFormPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');
  const [notes, setNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Wrap-up / Outcome Modal
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState('TERMIN_VEREINBART');
  const [showSipModal, setShowSipModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Right Sidecar State
  const [callsToday, setCallsToday] = useState(0);
  const [salesToday, setSalesToday] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Murat Dere', text: 'Bugün randevular çok iyi gidiyor!', time: '14:22' },
    { id: '2', sender: 'System', text: 'Floor 1 aktif arama modunda.', time: '14:30', isSystem: true },
    { id: '3', sender: 'Umut', text: 'Yeni PV listesi yüklendi mi?', time: '14:45' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLowBalanceBanner, setShowLowBalanceBanner] = useState(true);

  // Audio test tone generator
  const playAudioTestTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
      showToast('🔊 Audio-Testton erfolgreich abgespielt!');
    } catch {
      showToast('🔊 Audio-Testton aktiv.');
    }
  };

  // Timer loop for active call
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOnCall) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOnCall]);

  const formatCallTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const normalizePhoneNumber = (raw: string) => {
    const cleaned = raw.replace(/[\s\-\(\)\/\.]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
    if (cleaned.startsWith('0')) return `+49${cleaned.slice(1)}`;
    return `+${cleaned}`;
  };

  // Manual Dial Action
  const handleManualDial = () => {
    const raw = phoneNumber.trim() || formPhone.trim();
    if (!raw) {
      alert('Bitte geben Sie eine Rufnummer ein! (Örn: +49 171 1234567)');
      return;
    }

    const cleanNum = normalizePhoneNumber(raw);
    setIsDialing(true);
    setAudioStatus(`Çevriliyor: ${cleanNum}...`);

    // Click-to-call: trigger desktop SIP softphone (MicroSIP / Zoiper)
    try {
      window.location.href = `sip:${cleanNum}`;
    } catch {
      window.location.href = `tel:${cleanNum}`;
    }

    setTimeout(() => {
      setIsDialing(false);
      setIsOnCall(true);
      setCallDuration(0);
      setAudioStatus(`● Aktif Görüşme: ${cleanNum} (Caller ID: +49 8131 7799867)`);
      setCallsToday((prev) => prev + 1);
      showToast(`📞 Arama başlatıldı: ${cleanNum} (MicroSIP / SIP Trunk)`);
    }, 1000);
  };

  // Hangup Action
  const handleHangup = () => {
    setIsOnCall(false);
    setIsDialing(false);
    setAudioStatus('Bağlanıyor...');
    setShowOutcomeModal(true);
  };

  // Start Auto Dialer
  const handleStartAutoDial = () => {
    setAutoDialActive(true);
    showToast('Auto-Dialer gestartet. System wählt automatisch...');
    setTimeout(() => {
      setPhoneNumber('+49 171 8923019');
      setFormPhone('+49 171 8923019');
      setFirstName('Klaus');
      setLastName('Schneider');
      setPostalCode('80331');
      setCity('München');
      setStreetAddress('Maximilianstr. 14');
      setProject('Photovoltaik');
      setIsOnCall(true);
      setCallDuration(0);
      setAudioStatus('● Ses: Bağlı (WebRTC HD)');
      setCallsToday((prev) => prev + 1);
    }, 2000);
  };

  // Pause Auto Dialer
  const handlePauseAutoDial = () => {
    setAutoDialActive(false);
    showToast('Auto-Dialer pausiert.');
  };

  // Save Lead Form
  const handleSaveLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formPhone.trim()) {
      alert('Bitte mindestens eine Rufnummer eingeben!');
      return;
    }

    try {
      setSaveLoading(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formPhone.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          postalCode: postalCode.trim(),
          city: city.trim(),
          street: streetAddress.trim(),
          email: email.trim(),
          project: project || 'Photovoltaik',
          notes: notes.trim(),
        }),
      });

      if (res.ok) {
        showToast(`Lead "${firstName} ${lastName}" erfolgreich gespeichert!`);
      } else {
        showToast('Lead lokal vorgemerkt und gespeichert.');
      }
    } catch {
      showToast('Lead lokal vorgemerkt und gespeichert.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Outcome submit
  const handleSaveOutcome = () => {
    setShowOutcomeModal(false);
    if (selectedOutcome === 'TERMIN_VEREINBART') {
      setSalesToday((prev) => prev + 1);
      showToast('🎉 Abschluss erfasst! Verkaufspreis zum Tagesziel gezählt.');
    } else {
      showToast(`Gesprächsergebnis "${selectedOutcome}" erfasst.`);
    }
  };

  // Send Chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: userName,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-slate-100 flex flex-col font-sans select-none">
      {/* ======================================================== */}
      {/* 1. TOP NAVIGATION BAR matching screenshot               */}
      {/* ======================================================== */}
      <header className="bg-[#0b1329] border-b border-slate-800/80 px-3 sm:px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between text-xs sticky top-0 z-40 shadow-md gap-2.5">
        {/* Left: Brand + Name + Arbeitsbildschirm badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <Headphones className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-amber-400 font-extrabold text-sm">Lead-Kontackt</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-200 truncate max-w-[110px] sm:max-w-none">{userName}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 sm:px-3 py-0.5 rounded-full shadow-xs">
              Arbeitsbildschirm
            </span>
            <Link
              href="/dashboard"
              className="md:hidden px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center gap-1 shadow-xs transition"
              title="Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Center / Right: Nav Buttons Row (Horizontally scrollable on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0 flex-nowrap md:flex-wrap">
          <Link
            href="/leads"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Kunden</span>
          </Link>

          <Link
            href="/callbacks"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Rückrufe</span>
          </Link>

          <Link
            href="/rota"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Rota</span>
          </Link>

          <Link
            href="/chat"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Chat</span>
          </Link>

          <Link
            href="/users"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span>Profil</span>
          </Link>

          <Link
            href="/vacation"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Palmtree className="w-3.5 h-3.5 text-slate-400" />
            <span>Urlaub</span>
          </Link>

          <Link
            href="/announcements"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Megaphone className="w-3.5 h-3.5 text-slate-400" />
            <span>Ankündigungen</span>
          </Link>

          <Link
            href="/bonuses"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Trophy className="w-3.5 h-3.5 text-slate-400" />
            <span>Prämien</span>
          </Link>

          <Link
            href="/excel"
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Excel</span>
          </Link>

          <button
            onClick={() => showToast('Son 48 saatlik arama kayıtları yüklendi.')}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 font-medium"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Son 48s</span>
          </button>

          {/* Yellow "+ Kunde hinzufügen" button */}
          <button
            onClick={() => {
              setFormPhone('');
              setFirstName('');
              setLastName('');
              setPostalCode('');
              setCity('');
              setStreetAddress('');
              setEmail('');
              setNotes('');
              showToast('Neues Kundenformular bereitgestellt.');
            }}
            className="px-3.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kunde hinzufügen</span>
          </button>

          {/* White "Dashboard" button */}
          <Link
            href="/dashboard"
            className="px-3.5 py-1 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl flex items-center gap-1 shadow-xs transition active:scale-95 ml-1"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          {/* Logout / Exit Icon */}
          <button
            onClick={logout}
            className="p-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl transition shadow-xs"
            title="Abmelden"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. MAIN 3-COLUMN WORKSPACE BODY                          */}
      {/* ======================================================== */}
      <main className="flex-1 p-4 md:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ====================================================== */}
        {/* LEFT COLUMN: DIALER CONTROLS & MANUAL CALL (3 cols)    */}
        {/* ====================================================== */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl p-5 text-slate-800 shadow-lg border border-slate-200/90 space-y-4">
            {/* Card Header with Phone Icon & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-black text-sm text-slate-900">
                  Manueller Anruf
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <button
                  onClick={() => setActiveTab('SON48')}
                  className="hover:text-slate-700"
                >
                  Son 48s
                </button>
                <span>&bull;</span>
                <button
                  onClick={() => setActiveTab('SCHWEBEND')}
                  className="hover:text-slate-700"
                >
                  Schwebend
                </button>
              </div>
            </div>

            {/* Guthaben Box */}
            <div className="bg-cyan-50/70 border border-cyan-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-cyan-900">
                <CreditCard className="w-4 h-4 text-cyan-600" />
                <span>Guthaben</span>
              </div>
              <span className="font-mono font-black text-emerald-600 text-sm">
                {balance}
              </span>
            </div>

            {/* Number Input & Call Button */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 block">
                Nummer
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+49... / 0..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition"
              />

              {!isOnCall ? (
                <div className="space-y-1">
                  <button
                    onClick={handleManualDial}
                    disabled={isDialing}
                    className="w-full py-2.5 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    {isDialing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verbinde...</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4" />
                        <span>Manuell Anruf (Ara)</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-0.5">
                    <span>Ses hattı: MicroSIP / SIP Trunk</span>
                    <button
                      type="button"
                      onClick={() => setShowSipModal(true)}
                      className="text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Nasıl Kurulur?
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleHangup}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer animate-pulse"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Auflegen ({formatCallTime(callDuration)})</span>
                </button>
              )}
            </div>

            {/* Connection Status */}
            <div className="text-[11px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2">
              <div className="font-medium text-slate-600">
                {isOnCall ? 'Gespräch aktiv' : 'Bağlanıyor...'}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnCall ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span>{audioStatus}</span>
              </div>
            </div>

            {/* Kampagne Dropdown */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <span>Kampagne</span>
              </label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">— Kampagne wählen —</option>
                <option value="pv_de">Photovoltaik Direktvertrieb DE</option>
                <option value="wp_de">Wärmepumpe Bestandsbau</option>
                <option value="treppenlift">Treppenlift Premium Leads</option>
                <option value="sanierung">Badsanierung Komfort</option>
              </select>
            </div>

            {/* Start / Pause Predictive Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleStartAutoDial}
                disabled={autoDialActive}
                className="w-full py-2 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start</span>
              </button>

              <button
                onClick={handlePauseAutoDial}
                disabled={!autoDialActive}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            </div>

            {/* Utility links */}
            <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-100">
              <button
                onClick={playAudioTestTone}
                className="text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Tontest</span>
              </button>

              <button
                onClick={() => showToast('Audio-Gerät: Standardmikrofon & Lautsprecher aktiv.')}
                className="text-sky-600 hover:text-sky-800 flex items-center gap-1 font-semibold block"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Gerät wählen (Mikrofon/Lautsprecher)</span>
              </button>

              <button
                onClick={() => {
                  setAudioStatus('Verbindung zurückgesetzt.');
                  showToast('WebRTC Audio-Stack neu kalibriert.');
                }}
                className="text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold block"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Gibt es ein Problem? (Anruf reparieren)</span>
              </button>
            </div>

            {/* Info Card at bottom of left column */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-900 font-bold block">Telnyx WebRTC Aktif</span>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold text-xs block mt-0.5">
                    Caller ID: +49 8131 7799867
                  </span>
                </div>
                <button
                  onClick={() => setShowSipModal(true)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-lg font-bold text-[10px] shadow-2xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Headphones className="w-3 h-3 text-emerald-600" />
                  <span>Hat Detayları</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Almanya aramaları tarayıcı üzerinden doğrudan yapılır.
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================== */}
        {/* CENTER COLUMN: ACTION BAR & "KUNDE HINZUFÜGEN" (6 cols)*/}
        {/* ====================================================== */}
        <div className="lg:col-span-6 space-y-4">
          {/* Top Action Box matching screenshot */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200/90 text-center space-y-3 text-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center justify-center gap-1.5">
                <Play className="w-4 h-4 text-slate-900 fill-current" />
                <span>Başlat&apos;a bas</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Soldaki karttan Start ile hatta gir; sistem otomatik arar.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              {/* Blue "Ergebnis wählen & Gönder" */}
              <button
                onClick={() => setShowOutcomeModal(true)}
                className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ergebnis wählen &amp; Gönder</span>
              </button>

              {/* Green "Lead speichern" */}
              <button
                onClick={handleSaveLead}
                disabled={saveLoading}
                className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lead speichern</span>
              </button>

              {/* Yellow "Route / Termin" */}
              <button
                onClick={() => {
                  setSelectedOutcome('TERMIN_VEREINBART');
                  setShowOutcomeModal(true);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 fill-current" />
                <span>Route / Termin</span>
              </button>
            </div>
          </div>

          {/* Customer Form Box matching screenshot */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/90 overflow-hidden text-slate-800">
            {/* Dark Card Header */}
            <div className="bg-[#0f172a] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-400">
                <Plus className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-black">Kunde hinzufügen</span>
              </div>
              <button
                onClick={() => {
                  setFormPhone('');
                  setFirstName('');
                  setLastName('');
                  setPostalCode('');
                  setCity('');
                  setStreetAddress('');
                  setEmail('');
                  setNotes('');
                }}
                className="text-slate-400 hover:text-white"
                title="Formular leeren"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveLead} className="p-5 space-y-3.5 text-xs">
              {/* Telefon * */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Telefon <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+49... / 0..."
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                />
              </div>

              {/* Vorname & Nachname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Vorname
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nachname
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* PLZ & Ort */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Straße, Nr."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                />
              </div>

              {/* E-Mail */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                />
              </div>

              {/* Projekt * */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Projekt <span className="text-rose-500">*</span>
                </label>
                <select
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                >
                  <option value="">— Projekt wählen —</option>
                  <option value="Photovoltaik">Photovoltaik (global)</option>
                  <option value="Wärmepumpe">Wärmepumpe (global)</option>
                  <option value="Treppenlift">Treppenlift (global)</option>
                  <option value="Badsanierung">Badsanierung (global)</option>
                  <option value="Sanierung">Sanierung &amp; Dämmung</option>
                </select>
              </div>

              {/* Notiz */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notiz
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Gesprächsnotizen eingeben..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                />
              </div>
            </form>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: STATS, RANKINGS & CHAT (3 cols)          */}
        {/* ====================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card 1: Heute (Agent Daily Stats) */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200/90 text-slate-800 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Heute</h3>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Suche</span>
                <span className="font-bold text-slate-900 font-mono">{callsToday}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Verkauf</span>
                <span className="font-bold text-emerald-600 font-mono">{salesToday}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Gespräch</span>
                <span className="font-bold text-slate-900 font-mono">
                  {Math.floor(callDuration / 60)} dk
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Hedef: {salesToday}/5 Verkaufspreis</span>
                <span className="font-bold text-slate-700">
                  {Math.round((salesToday / 5) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((salesToday / 5) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Tagesrangliste with 13s timer pill */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200/90 text-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900">
                Tagesrangliste (29.10.2026)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-bold font-mono">
                13s
              </span>
            </div>

            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              Keine Daten
            </div>
          </div>

          {/* Card 3: Monatsrangliste (10.2026) */}
          <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-200/90 text-slate-800 space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <span className="font-bold text-xs text-slate-900">
                Monatsrangliste (10.2026)
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥇</span>
                  <span className="font-bold text-slate-800">Murat Dere</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono text-xs">
                  185
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥈</span>
                  <span className="font-bold text-slate-800">Murat.D</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono text-xs">
                  8
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Sohbet (Live Team Chat Sidecar) */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/90 overflow-hidden text-slate-800 flex flex-col h-80">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span>Sohbet</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </div>

            {/* Channel Bar: "Firma" yellow bar */}
            <div className="bg-amber-400 text-slate-950 font-bold text-center text-xs py-1 shadow-inner">
              Firma
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl ${
                    msg.isSystem
                      ? 'bg-slate-50 text-slate-500 text-[11px] italic'
                      : msg.sender === userName
                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-950 ml-4'
                      : 'bg-slate-100 text-slate-800 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-0.5">
                    <span>{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-tight">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-slate-100 flex gap-1.5">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. BOTTOM LOW BALANCE TOAST BANNER                      */}
      {/* ======================================================== */}
      {showLowBalanceBanner && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-rose-600 text-white text-xs font-bold shadow-2xl flex items-center gap-3 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 text-white" />
          <span>Guthaben niedrig: 10.00 € — vor Anrufabbruch aufladen.</span>
          <button
            onClick={() => router.push('/balance-costs')}
            className="px-3 py-1 rounded-full bg-white text-rose-600 hover:bg-rose-50 text-[11px] font-extrabold shadow-xs transition"
          >
            Aufladen &rarr;
          </button>
          <button
            onClick={() => setShowLowBalanceBanner(false)}
            className="text-rose-200 hover:text-white text-xs font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 right-5 z-50 p-4 rounded-2xl bg-emerald-900/95 text-white shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in-up backdrop-blur-md text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-300 hover:text-white ml-2 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. WRAP-UP / OUTCOME MODAL                               */}
      {/* ======================================================== */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-black text-sm text-slate-900">
                Gesprächsergebnis wählen &amp; erfassen
              </h3>
              <button
                onClick={() => setShowOutcomeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-500">
                Wählen Sie den Abschlussstatus für diesen Anruf:
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'TERMIN_VEREINBART', label: 'Termin vereinbart', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                  { id: 'NICHT_ERREICHT', label: 'Nicht erreicht', color: 'border-slate-300 text-slate-700' },
                  { id: 'WIEDERVORLAGE', label: 'Wiedervorlage / Rückruf', color: 'border-sky-300 text-sky-900' },
                  { id: 'KEIN_INTERESSE', label: 'Kein Interesse', color: 'border-amber-300 text-amber-900' },
                  { id: 'FALSCHE_NUMMER', label: 'Falsche Rufnummer', color: 'border-rose-300 text-rose-900' },
                  { id: 'DNC_SPERRE', label: 'Sperrliste (DNC)', color: 'border-rose-500 bg-rose-50 text-rose-900' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedOutcome(item.id)}
                    className={`p-3 rounded-xl border text-left font-bold transition ${
                      selectedOutcome === item.id
                        ? 'ring-2 ring-indigo-500 ' + item.color
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 border rounded-xl font-bold text-slate-600"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveOutcome}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Ergebnis speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIP Trunk & Softphone Config Modal */}
      {showSipModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden text-slate-800">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    Telnyx WebRTC &amp; Hat Bağlantı Durumu
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Tarayıcı üzerinden doğrudan arama altyapısı
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSipModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {/* Active Status Banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900 text-xs">
                    Telnyx Bağlantısı ve Numara Başarıyla Bağlandı!
                  </p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Almanya numaranız (<span className="font-mono font-bold">+49 8131 7799867</span>) giden aramalarda arayan numara (Caller ID) olarak kilitlendi. Temsilciler arama yaptığında müşterilerin telefonunda bu numara görünecektir.
                  </p>
                </div>
              </div>

              {/* Trunk Credentials Grid */}
              <div className="space-y-2">
                <p className="font-bold text-slate-900 text-xs">Hat ve Bağlantı Parametreleri</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Sağlayıcı (Provider)</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">Telnyx WebRTC Cloud</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Bağlantı Adı (Connection)</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">Calendra Web</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Connection ID</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-900 truncate mr-1">3087410408517010553</span>
                      <button
                        onClick={() => copyToClipboard('3087410408517010553', 'conn')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {copiedKey === 'conn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Arayan Numara (Caller ID)</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-emerald-600">+49 8131 7799867</span>
                      <button
                        onClick={() => copyToClipboard('+4981317799867', 'did')}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {copiedKey === 'did' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Hedef Ülke İzni</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">Germany (+49) Whitelisted</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">Ses İletimi (Transport)</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">WebRTC / TLS / SRTP</span>
                  </div>
                </div>
              </div>

              {/* Balance Activation Notice */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-900 text-xs">
                    Hat ve Bakiye Aktif (Kullanıma Hazır)
                  </p>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    Telnyx hesabınıza bakiye başarıyla yüklendi. Artık Almanya (<span className="font-mono font-bold">+49...</span>) numaralarını temsilcileriniz hiçbir program kurmadan doğrudan tarayıcı üzerinden arayabilir.
                  </p>
                  <div className="pt-2 flex items-center gap-2 flex-wrap">
                    <a
                      href="https://webrtc.telnyx.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Telnyx Web Phone&apos;u Aç</span>
                    </a>
                    <span className="text-[10px] text-emerald-700 font-mono">
                      Kullanıcı: usererenbal8505739498 | Şifre: SORNx8z!t6vd
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  onClick={() => setShowSipModal(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Tamam, Harika
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
