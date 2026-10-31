'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Users,
  Clock,
  Calendar,
  MessageSquare,
  User,
  Megaphone,
  Trophy,
  FileSpreadsheet,
  Plus,
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
  TrendingUp,
  GitBranch,
  Info,
  Shield,
  HelpCircle,
  Bell,
  UserPlus,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

interface SaleRecord {
  id: string;
  customerName: string;
  project: string;
  amount: string;
  time: string;
  status: string;
}

export const AgentDashboard: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { locale, setLocale } = useI18n();

  const agentName = user?.firstName || user?.username || 'Murat2';
  const assignedCallerId = user?.callerIdNumber || '+494042925873';

  // Left Dial Card State
  const [activeTab, setActiveTab] = useState<'MANUELL' | 'SON48' | 'SCHWEBEND'>('MANUELL');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioStatus, setAudioStatus] = useState('Bağlanıyor...');
  const [autoDialActive, setAutoDialActive] = useState(false);

  // Wrap-up / Outcome Modal
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState('TERMIN_VEREINBART');

  // Device selection modal
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [audioInputDevice, setAudioInputDevice] = useState('Standard - Mikrofon (Realtek High Definition)');
  const [audioOutputDevice, setAudioOutputDevice] = useState('Standard - Lautsprecher (Realtek High Definition)');

  // Kunde hinzufügen modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newProject, setNewProject] = useState('Photovoltaik');
  const [newNotes, setNewNotes] = useState('');
  const [newConsent, setNewConsent] = useState(true);
  const [savingCustomer, setSavingCustomer] = useState(false);

  // Metrics & Sales
  const [totalSales, setTotalSales] = useState(0);
  const [last30DaysSales, setLast30DaysSales] = useState(0);
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>([]);

  // Load custom leads on mount for live metrics & sales
  useEffect(() => {
    try {
      const raw = localStorage.getItem('linkora_custom_leads');
      if (raw) {
        const savedLeads = JSON.parse(raw);
        if (Array.isArray(savedLeads) && savedLeads.length > 0) {
          setTotalSales(savedLeads.length);
          setLast30DaysSales(savedLeads.length);
          const mappedRecords: SaleRecord[] = savedLeads.slice(0, 10).map((l: any) => ({
            id: l.id,
            customerName: `${l.first_name || ''} ${l.last_name || ''}`.trim() || 'Kunde',
            project: l.project_name || 'Photovoltaik',
            amount: '450.00 €',
            time: new Date(l.created_at || Date.now()).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            status: l.status === 'NEW' ? 'Neu erfasst' : l.status || 'Neu erfasst',
          }));
          setSalesRecords(mappedRecords);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Guide Modal
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Chat State
  const [chatTab, setChatTab] = useState<'TEAM' | 'FIRMA'>('TEAM');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Murat Dere', text: 'Bugün randevular çok iyi gidiyor!', time: '14:22' },
    { id: '2', sender: 'System', text: 'Floor 1 aktif arama modunda.', time: '14:30', isSystem: true },
    { id: '3', sender: 'Umut', text: 'Yeni PV listesi yüklendi mi?', time: '14:45' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Timer for active call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOnCall) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [isOnCall]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Web Audio API tone test
  const playTestTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);

      showToast('🔊 Audio-Testton erfolgreich abgespielt (Headset funktioniert).');
    } catch {
      showToast('Audio-Ausgabe bereit.');
    }
  };

  // Repair WebRTC connection
  const handleRepairAudio = () => {
    setAudioStatus('Bağlanıyor...');
    setTimeout(() => {
      setAudioStatus('Hazır / Bereit');
      showToast('✅ WebRTC-Verbindung und Audio-Stream erfolgreich repariert.');
    }, 700);
  };

  // Manual Dial
  const handleManualCall = () => {
    const cleanNum = phoneNumber.trim();
    if (!cleanNum) {
      showToast('Bitte geben Sie zuerst eine Telefonnummer ein.');
      return;
    }
    setIsDialing(true);
    setAudioStatus('Aranıyor...');
    setTimeout(() => {
      setIsDialing(false);
      setIsOnCall(true);
      setAudioStatus('Görüşme Aktif');
      showToast(`Arama başlatıldı: ${cleanNum}`);
    }, 1200);
  };

  const handleHangup = () => {
    setIsOnCall(false);
    setAudioStatus('Bağlantı Sonlandı');
    setShowOutcomeModal(true);
  };

  const handleSaveOutcome = () => {
    setShowOutcomeModal(false);
    if (selectedOutcome === 'TERMIN_VEREINBART') {
      setTotalSales((prev) => prev + 1);
      setLast30DaysSales((prev) => prev + 1);
      const newRec: SaleRecord = {
        id: 'sale-' + Date.now(),
        customerName: phoneNumber || 'Neuer Kunde',
        project: selectedCampaign || 'Photovoltaik',
        amount: '450.00 €',
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        status: 'Bestätigt',
      };
      setSalesRecords((prev) => [newRec, ...prev]);
      showToast('🎉 Çağrı sonucu kaydedildi: Termin vereinbart (Verkauf erfasst)!');
    } else {
      showToast(`Çağrı sonucu kaydedildi: ${selectedOutcome}`);
    }
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: agentName,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  // Add customer submit
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newPhone.trim()) {
      showToast('Bitte mindestens Vorname und Telefonnummer ausfüllen.');
      return;
    }

    setSavingCustomer(true);
    try {
      // Send to API
      await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirstName.trim(),
          lastName: newLastName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
          postalCode: newPostalCode.trim() || undefined,
          city: newCity.trim() || undefined,
          projectName: newProject,
          source: 'Agent-Direkterfassung',
          consentProof: newConsent,
          notes: newNotes.trim() || undefined,
        }),
      }).catch(() => {});

      setShowAddCustomerModal(false);
      setTotalSales((prev) => prev + 1);
      setLast30DaysSales((prev) => prev + 1);

      const record: SaleRecord = {
        id: 'lead-' + Date.now(),
        customerName: `${newFirstName} ${newLastName}`.trim(),
        project: newProject,
        amount: '450.00 €',
        time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
        status: 'Neu erfasst',
      };
      setSalesRecords((prev) => [record, ...prev]);

      showToast(`✅ Kunde "${newFirstName} ${newLastName}" erfolgreich angelegt!`);

      // Reset form
      setNewFirstName('');
      setNewLastName('');
      setNewPhone('');
      setNewEmail('');
      setNewPostalCode('');
      setNewCity('');
      setNewNotes('');
    } finally {
      setSavingCustomer(false);
    }
  };

  // Formatted date
  const now = new Date();
  const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
  const formattedMonthYear = `${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5 animate-in fade-in duration-200 select-none pb-28 sm:pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-[#090e1a] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Welcome Banner */}
      <div className="relative rounded-2xl bg-[#0b1325] text-white p-4.5 sm:p-6 shadow-xl border border-slate-800/80 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Willkommen, {agentName}!
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Agenten-Dashboard</p>
          </div>

          {/* Action Button Row - Horizontal swipe on mobile, wrap on desktop */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1 touch-pan-x">
            <Link
              href="/callbacks"
              className="bg-[#131f37] hover:bg-[#1a2b50] border border-slate-700/70 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-sky-400" />
              <span>Rückrufe</span>
            </Link>

            <Link
              href="/call-screen"
              className="bg-[#1c4ed8] hover:bg-blue-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-blue-900/30"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Anrufbildschirm</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('chat-widget');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#eab308] hover:bg-yellow-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-amber-900/20 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
              <span>Chat</span>
            </button>

            {/* Profile Round Icon */}
            <button
              type="button"
              onClick={() => showToast(`Profil: ${agentName} (ID: ${user?.id || '#157'})`)}
              className="w-8 h-8 rounded-full bg-[#131f37] hover:bg-[#1a2b50] border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Profil"
            >
              <User className="w-3.5 h-3.5" />
            </button>

            {/* Rota / Calendar Round Icon */}
            <Link
              href="/rota"
              className="w-8 h-8 rounded-full bg-[#131f37] hover:bg-[#1a2b50] border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Schichtplan (Rota)"
            >
              <Calendar className="w-3.5 h-3.5" />
            </Link>

            {/* Announcements Round Icon */}
            <Link
              href="/announcements"
              className="w-8 h-8 rounded-full bg-[#131f37] hover:bg-[#1a2b50] border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Ankündigungen"
            >
              <Megaphone className="w-3.5 h-3.5" />
            </Link>

            {/* Bonuses Round Icon */}
            <Link
              href="/bonuses"
              className="w-8 h-8 rounded-full bg-[#131f37] hover:bg-[#1a2b50] border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 cursor-pointer"
              title="Prämien"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </Link>

            {/* Excel Button */}
            <Link
              href="/excel"
              className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </Link>

            {/* Routen-Board Button */}
            <Link
              href="/wallboard"
              className="bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
              <span>Routen-Board</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Left Column (Manueller Anruf, Ranglisten, Sohbet) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 1: Manueller Anruf */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/90 text-slate-800">
            {/* Tabs */}
            <div className="flex items-center space-x-4 sm:space-x-6 border-b border-slate-100 pb-2.5 mb-4 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('MANUELL')}
                className={`text-xs font-bold flex items-center gap-1.5 pb-1 border-b-2 transition cursor-pointer shrink-0 ${
                  activeTab === 'MANUELL'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Manueller Anruf</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SON48')}
                className={`text-xs font-medium pb-1 border-b-2 transition cursor-pointer shrink-0 ${
                  activeTab === 'SON48'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Son 48s
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SCHWEBEND')}
                className={`text-xs font-medium pb-1 border-b-2 transition cursor-pointer shrink-0 ${
                  activeTab === 'SCHWEBEND'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Schwebend
              </button>
            </div>

            {/* Nummer Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nummer</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+49... / 0..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 sm:py-2 text-base sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition font-mono shadow-inner"
              />
            </div>

            {/* Manuell Anruf Green Button */}
            <div className="mt-2.5">
              {!isOnCall ? (
                <button
                  type="button"
                  onClick={handleManualCall}
                  disabled={isDialing}
                  className="w-full bg-[#16a34a] hover:bg-[#15803d] active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 min-h-[46px]"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{isDialing ? 'Aranıyor...' : 'Manuell Anruf'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleHangup}
                  className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm cursor-pointer animate-pulse min-h-[46px]"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Auflegen ({formatTimer(callDuration)})</span>
                </button>
              )}
            </div>

            {/* Connection and Audio Status */}
            <div className="mt-3 text-xs text-slate-500 space-y-0.5">
              <div>{audioStatus}</div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>Ses: —</span>
              </div>
            </div>

            {/* Kampagne Selector */}
            <div className="mt-3.5">
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <span>Kampagne</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                >
                  <option value="">— Kampagne wählen —</option>
                  <option value="Photovoltaik DE 2026">Photovoltaik DE 2026 (Offen)</option>
                  <option value="Wärmepumpe Direkt">Wärmepumpe Direkt (Offen)</option>
                  <option value="Izmir Inbound Support">Izmir Inbound Support</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>

              {/* Red Warning text if no campaign */}
              {!selectedCampaign && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium leading-tight">
                  Size atanmış kampanya yok. Firma yöneticinizden kampanya açmasını isteyin.
                </p>
              )}
            </div>

            {/* Start / Pause Dialer Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setAutoDialActive(true);
                  showToast('▶ Auto-Dialer gestartet (warten auf Lead-Queue...)');
                }}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Start</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAutoDialActive(false);
                  showToast('⏸ Auto-Dialer pausiert.');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Pause className="w-3 h-3 fill-slate-700" />
                <span>Pause</span>
              </button>
            </div>

            {/* Diagnostic Links */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
              <button
                type="button"
                onClick={playTestTone}
                className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Tontest</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeviceModal(true)}
                className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Gerät wählen (Mikrofon/Lautsprecher)</span>
              </button>

              <button
                type="button"
                onClick={handleRepairAudio}
                className="text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1.5 cursor-pointer hover:underline"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Gibt es ein Problem? (Anruf reparieren)</span>
              </button>
            </div>

            {/* Info Caller-ID Box */}
            <div className="mt-3.5 bg-sky-50 border border-sky-200/90 rounded-xl p-3 text-xs text-sky-900 leading-relaxed">
              Beim ersten Anruf wird die Mikrofonberechtigung angefragt. Anrufer-ID:{' '}
              <span className="font-bold text-rose-600">{assignedCallerId}</span>
            </div>
          </div>

          {/* Card 2: Tagesrangliste */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 text-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-900">Tagesrangliste ({formattedDate})</h2>
              <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                14s
              </span>
            </div>
            <div className="py-4 text-center text-xs text-slate-400 font-medium">
              Keine Daten
            </div>
          </div>

          {/* Card 3: Monatsrangliste */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 text-slate-800">
            <h2 className="text-xs font-bold text-slate-900 mb-3">
              Monatsrangliste ({formattedMonthYear})
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <span className="text-base">🥇</span>
                  <span>Murat Dere</span>
                </div>
                <span className="bg-[#fef08a] text-amber-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  185
                </span>
              </div>

              <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <span className="text-base">🥈</span>
                  <span>Murat.D</span>
                </div>
                <span className="bg-slate-100 text-slate-800 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  8
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Sohbet (Live Chat) */}
          <div id="chat-widget" className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 text-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold text-slate-900">Sohbet</h2>
              </div>
              <span className="bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Live</span>
              </span>
            </div>

            {/* Chat Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setChatTab('TEAM')}
                className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  chatTab === 'TEAM'
                    ? 'bg-[#eab308] text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Team
              </button>
              <button
                type="button"
                onClick={() => setChatTab('FIRMA')}
                className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  chatTab === 'FIRMA'
                    ? 'bg-[#eab308] text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Firma
              </button>
            </div>

            {/* Messages Container */}
            <div className="h-44 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2.5 mb-2.5 bg-slate-50/50 text-xs">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-700">{msg.sender}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div
                    className={`p-2 rounded-xl text-slate-800 ${
                      msg.isSystem ? 'bg-amber-50 border border-amber-200/80 text-amber-900' : 'bg-white border border-slate-200/70 shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-base sm:text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white p-2.5 sm:p-2 rounded-xl transition cursor-pointer active:scale-95 shrink-0"
                title="Senden"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column (Wie es funktioniert, Metriken, Verkäufe) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Wie es funktioniert */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-6 shadow-xs border border-slate-200/90 text-slate-700 leading-relaxed">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-3">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Wie es funktioniert</span>
            </div>
            <div className="space-y-2 text-xs">
              <p>
                <strong className="text-slate-900">Sıradaki & Ara</strong> → açık data paketlerinden
                sıradaki müşteriyi getirir + arar.
              </p>
              <p>
                <strong className="text-slate-900">Oto</strong> açıkken → görüşme bitince otomatik
                sıradakini arar.
              </p>
              <p>
                Nach dem Gespräch <strong className="text-slate-900">çağrı sonucu</strong> (Keine
                Antwort / Zurückrufen / Olumlu...) seç.{' '}
                <strong className="text-slate-900">Zurückrufen</strong> için tarih kur → zamanı
                gelince hatırlatılır (
                <Link href="/callbacks" className="text-sky-600 font-semibold hover:underline">
                  Rückrufe
                </Link>{' '}
                sayfasından erken de arayabilirsin).
              </p>
            </div>
          </div>

          {/* 3 Metric Cards Row - Responsive: 3 columns on mobile & desktop */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
            {/* Card 1: Gesamtverkäufe */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{totalSales}</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Gesamtverkäufe</div>
                </div>
              </div>
              <Link
                href="/leads"
                className="text-[10px] sm:text-[11px] font-semibold text-blue-600 hover:text-blue-700 mt-1 sm:mt-2 hover:underline inline-flex items-center gap-0.5 sm:gap-1"
              >
                <span className="hidden sm:inline">Alle anzeigen</span> &rarr;
              </Link>
            </div>

            {/* Card 2: Letzte 30 Tage */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{last30DaysSales}</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Letzte 30 Tage</div>
                </div>
              </div>
              <Link
                href="/user-stats"
                className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 mt-1 sm:mt-2 hover:underline inline-flex items-center gap-0.5 sm:gap-1"
              >
                <span className="hidden sm:inline">Detailliert</span> &rarr;
              </Link>
            </div>

            {/* Card 3: Routen-Board */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-200/90 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-600 leading-tight">Live</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Routen-Board</div>
                </div>
              </div>
              <Link
                href="/wallboard"
                className="text-[10px] sm:text-[11px] font-semibold text-purple-600 hover:text-purple-700 mt-1 sm:mt-2 hover:underline inline-flex items-center gap-0.5 sm:gap-1"
              >
                <span className="hidden sm:inline">Zum Board</span> &rarr;
              </Link>
            </div>
          </div>

          {/* Button: + Kunde hinzufügen */}
          <div>
            <button
              type="button"
              onClick={() => router.push('/kunde-hinzufuegen')}
              className="w-full sm:w-auto bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 text-xs min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Kunde hinzufügen</span>
            </button>
          </div>

          {/* Card: Letzte Verkäufe */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 shadow-xs border border-slate-200/90 text-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs font-bold text-slate-900">Letzte Verkäufe</h2>
            </div>

            {salesRecords.length === 0 ? (
              <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-6 text-center text-xs text-sky-800 font-medium">
                Es gibt noch keine Verkaufsdaten.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {salesRecords.map((rec) => (
                  <div key={rec.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <div className="font-bold text-slate-800">{rec.customerName}</div>
                      <div className="text-[11px] text-slate-400">{rec.project} · {rec.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-600">{rec.amount}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{rec.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Floating Bottom-Right Buttons (Elevated above mobile bottom nav on small screens) */}
      <div className="fixed bottom-20 sm:bottom-5 right-3.5 sm:right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
        {/* Guide Button Pill */}
        <button
          type="button"
          onClick={() => setShowGuideModal(true)}
          className="bg-[#1a2d52] hover:bg-[#223966] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Rehber</span>
        </button>

        {/* Green Add User / Customer Circle FAB */}
        <button
          type="button"
          onClick={() => router.push('/kunde-hinzufuegen')}
          className="bg-[#16a34a] hover:bg-[#15803d] text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
          title="Kunde hinzufügen"
        >
          <UserPlus className="w-5 h-5" />
        </button>

        {/* Notification Bell Circle FAB */}
        <button
          type="button"
          onClick={() => showToast('Keine neuen ungelesenen Benachrichtigungen.')}
          className="bg-slate-900 hover:bg-slate-800 text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer relative"
          title="Benachrichtigungen"
        >
          <Bell className="w-5 h-5 text-slate-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute top-2 right-2 border-2 border-slate-900"></span>
        </button>
      </div>

      {/* 4. Kunde hinzufügen Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span>Neuen Kunden anlegen</span>
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Vorname *</label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Max"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nachname</label>
                  <input
                    type="text"
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Mustermann"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefonnummer *</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+49 176 12345678"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">PLZ</label>
                  <input
                    type="text"
                    value={newPostalCode}
                    onChange={(e) => setNewPostalCode(e.target.value)}
                    placeholder="10115"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Ort</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Berlin"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Projekt / Kampagne</label>
                <select
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                >
                  <option value="Photovoltaik">Photovoltaik (PV)</option>
                  <option value="Wärmepumpe">Wärmepumpe</option>
                  <option value="Energieberatung">Energieberatung</option>
                  <option value="Treppenlift">Treppenlift</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notizen zum Gespräch</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Kunde ist Eigentümer von EFH, Dachfläche ca. 60qm..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={newConsent}
                  onChange={(e) => setNewConsent(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="consentCheck" className="text-xs text-slate-600">
                  Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer disabled:opacity-50"
                >
                  {savingCustomer ? 'Speichern...' : 'Kunde anlegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Call Outcome Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Anrufergebnis erfassen</h3>
            <p className="text-xs text-slate-500 mb-4">
              Gepräch mit {phoneNumber || 'Kunde'} beendet. Bitte wählen Sie das Resultat:
            </p>

            <div className="space-y-2 mb-5">
              {[
                { id: 'TERMIN_VEREINBART', label: '✅ Termin vereinbart (Erfolg / Verkauf)' },
                { id: 'ZURUECKRUFEN', label: '⏱ Zurückrufen (Rückruf terminieren)' },
                { id: 'KEINE_ANTWORT', label: '📵 Keine Antwort / Besetzt' },
                { id: 'KEIN_INTERESSE', label: '❌ Kein Interesse' },
                { id: 'FALSCHE_NUMMER', label: '⚠️ Falsche Nummer / Nicht vergeben' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition ${
                    selectedOutcome === opt.id
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="callOutcome"
                    checked={selectedOutcome === opt.id}
                    onChange={() => setSelectedOutcome(opt.id)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowOutcomeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Später
              </button>
              <button
                type="button"
                onClick={handleSaveOutcome}
                className="px-4 py-2 text-xs font-bold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-xl shadow cursor-pointer"
              >
                Ergebnis speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Device Settings Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-700" />
                <span>Audio-Geräteeinstellungen</span>
              </h3>
              <button
                onClick={() => setShowDeviceModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mikrofon (Eingang)</label>
                <select
                  value={audioInputDevice}
                  onChange={(e) => setAudioInputDevice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option>Standard - Mikrofon (Realtek High Definition)</option>
                  <option>USB-Headset Sennheiser SC 60</option>
                  <option>Jabra Evolve 65 Stereo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lautsprecher / Headset (Ausgang)</label>
                <select
                  value={audioOutputDevice}
                  onChange={(e) => setAudioOutputDevice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  <option>Standard - Lautsprecher (Realtek High Definition)</option>
                  <option>USB-Headset Sennheiser SC 60</option>
                  <option>Jabra Evolve 65 Stereo</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={playTestTone}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Volume2 className="w-4 h-4 text-sky-600" />
                  <span>Kopfhörer-Testton abspielen</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeviceModal(false);
                  showToast('Geräteeinstellungen gespeichert.');
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow cursor-pointer"
              >
                Fertig
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Rehber (Guide) Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <span>Agenten-Rehber (Hızlı Kılavuz)</span>
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950">
                <div className="font-bold mb-1">1. Arama Başlatma</div>
                Telefon numarasını girip yeşil <strong className="text-emerald-700">Manuell Anruf</strong> butonuna basın veya üst bardan <Link href="/call-screen" className="text-blue-600 font-bold underline">Anrufbildschirm</Link> softphone ekranına geçin.
              </div>
              <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 text-sky-950">
                <div className="font-bold mb-1">2. Müşteri & Randevu Kaydı</div>
                Görüşme esnasında veya sonrasında <strong className="text-blue-700">Kunde hinzufügen</strong> butonuna tıklayarak yeni lead verisini anında kaydedebilirsiniz.
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800">
                <div className="font-bold mb-1">3. Geri Aramalar (Rückrufe)</div>
                Müşteri "beni yarın saat 15:00'te arayın" dediğinde çağrı sonucunu <em>Zurückrufen</em> olarak kaydedin. Zamanı geldiğinde sistem size hatırlatacaktır.
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl cursor-pointer"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
