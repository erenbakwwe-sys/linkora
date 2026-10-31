'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  History,
  FileQuestion,
  ChevronRight,
  UserCheck,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  PhoneCall,
  Check,
  X,
  RefreshCw,
  Sun,
  Flame,
  MoveUp,
  FileCheck,
  Grid,
  Zap,
  Wind,
  HeartHandshake,
  Volume2,
  FileText,
} from 'lucide-react';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone_raw: string;
  phone_e164: string;
  line_type: string;
  email: string | null;
  postal_code: string | null;
  city: string | null;
  street: string | null;
  house_number: string | null;
  status: 'NEW' | 'QC_PENDING' | 'CONFIRMED' | 'STORNO' | 'ROUTED' | 'SOLD' | 'RETURNED';
  consent_verified: boolean;
  dnc_flag: boolean;
  created_at: string;
  project_id: string;
  project_name: string;
  project_slug: string;
  project_icon: string;
  source?: string;
  notiz?: string;
  notes?: string;
  audioFileName?: string;
}

interface LeadDetailData {
  lead: Lead;
  provenance: Array<{
    id: string;
    source: string;
    campaign_name?: string;
    opt_in_timestamp: string;
    ip_address?: string;
    landing_page_url?: string;
    consent_text: string;
    consent_version: string;
    consent_channel: string;
  }>;
  answers: Array<{
    question_code: string;
    question_label: string;
    value_raw: string;
  }>;
  events: Array<{
    id: string;
    event_type: string;
    created_at: string;
    payload: any;
  }>;
  canDial: {
    allowed: boolean;
    reason?: string;
    message: string;
  };
}

const QUESTION_LABELS: Record<string, string> = {
  // PV
  pvInstallLocation: 'Wo möchten Sie die Photovoltaik installieren?',
  pvRoofAge: 'Wie alt ist Ihr Dach?',
  pvRoofArea: 'Wie groß ist Ihre nutzbare Dachfläche?',
  pvRoofShape: 'Welche Dachform hat Ihr Haus?',
  pvRoofCover: 'Womit ist ihr Dach gedeckt? (Dachdeckungstyp)',
  pvIsOwner: 'Handelt es sich bei dem Interessenten um den Eigentümer/Entscheider?',
  pvInstallTime: 'Wann soll die Photovoltaik installiert werden?',
  pvFinancing: 'Welche Finanzierung kommt für Sie in Frage?',
  pvRoofOrientation: 'Wie ist Ihr Dach ausgerichtet?',
  pvPowerConsumption: 'Stromverbrauch in kWh/Jahr',
  pvBatteryStorage: 'Stromspeicher gewünscht?',
  pvAvailability: 'Erreichbarkeit?',
  // Treppenlift
  tlLiftType: 'Was für einen Lift suchen Sie?',
  tlBuildingType: 'Um welchen Gebäudetyp handelt es sich?',
  tlUserWeight: 'Welches Nutzergewicht soll der Lift befördern?',
  tlTimeFrame: 'Wann wird der Lift benötigt?',
  tlIsOwner: 'Sind Sie Eigentümer/Entscheider',
  tlFloors: 'Wie viele Etagen müssen überwunden werden?',
  tlCareLevel: 'Liegt ein Pflegegrad vor?',
  tlStairCourse: 'Wie verläuft die Treppe?',
  tlMobility: 'Mobilität des Nutzers',
  tlStairWidth: 'Treppenbreite (in cm)',
  tlStepCount: 'Anzahl der Stufen',
  tlHeightDiff: 'Höhenunterschied (in cm)',
  tlOutdoor: 'Wird der Lift im Außenbereich benötigt?',
  tlAvailability: 'Treppenlift · Erreichbarkeit',
  // WP
  wpCurrentSystem: 'Aktuelles Heizsystem?',
  wpHeatingAge: 'Alter der Heizung?',
  wpLivingSpace: 'Wohnfläche (in m²)?',
  wpInstallTime: 'Wann soll die Wärmepumpe installiert werden?',
  // Badsanierung
  badProjectType: 'Welches Badprojekt möchten Sie angehen?',
  badSize: 'Wie groß ist das Badezimmer?',
  badBarrierFree: 'Soll das Bad barrierefrei sein?',
  badFeatures: 'Welche Ausstattung wünschen Sie?',
  badBudget: 'Was darf der Badumbau kosten?',
  badTimeFrame: 'Wann wird der Badumbau benötigt?',
  badIsOwner: 'Sind Sie Eigentümer/Entscheider?',
  // Elektromobil / Elektrorollstuhl
  emModelType: 'Für welches Modell interessieren Sie sich?',
  emUsageArea: 'Wo soll die überwiegende Nutzung stattfinden?',
  emUserWeight: 'Für welches Gewicht muss das Modell geeignet sein?',
  emTargetPerson: 'Für wen ist das Elektromobil / der Elektrorollstuhl gedacht?',
  emHealthInsurance: 'Sind Sie gesetzlich krankenversichert?',
  emBudgetLimit: 'Wo liegt die Budgetgrenze für das Modell?',
  emWheelchairSpeed: 'Wie hoch soll die maximale Geschwindigkeit beim Elektrorollstuhl sein?',
  emWheelchairRange: 'Welche Reichweite soll der Elektrorollstuhl haben?',
  emScooterSpeed: 'Wie hoch soll die maximale Geschwindigkeit beim Elektromobil sein?',
  emScooterRange: 'Welche Reichweite soll das Elektromobil haben?',
  emTimeFrame: 'Wann wird das Elektromobil / der Elektrorollstuhl benötigt?',
};

export default function LeadsPage() {
  const { t, locale } = useI18n();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadDetail, setLeadDetail] = useState<LeadDetailData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // QC modal state
  const [qcAction, setQcAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_RECALL' | null>(null);
  const [qcReason, setQcReason] = useState('');
  const [submittingQc, setSubmittingQc] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      let apiLeads: Lead[] = [];
      try {
        const res = await fetch(`/api/v1/leads?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          apiLeads = json.data || [];
        }
      } catch {
        // API offline fallback
      }

      // Check localStorage for newly registered customers
      const customRaw = typeof window !== 'undefined' ? localStorage.getItem('linkora_custom_leads') : null;
      const customLeads: Lead[] = customRaw ? JSON.parse(customRaw) : [];

      // Deduplicate by ID
      const existingIds = new Set(apiLeads.map((l) => l.id));
      let merged = [...customLeads.filter((l) => !existingIds.has(l.id)), ...apiLeads];

      // Filter by status if set
      if (statusFilter !== 'ALL') {
        merged = merged.filter((l) => l.status === statusFilter);
      }
      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        merged = merged.filter(
          (l) =>
            l.first_name.toLowerCase().includes(q) ||
            l.last_name.toLowerCase().includes(q) ||
            (l.email && l.email.toLowerCase().includes(q)) ||
            (l.city && l.city.toLowerCase().includes(q)) ||
            l.phone_e164.includes(q)
        );
      }

      setLeads(merged);
    } catch {
      const customRaw = typeof window !== 'undefined' ? localStorage.getItem('linkora_custom_leads') : null;
      setLeads(customRaw ? JSON.parse(customRaw) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const openDrawer = async (leadId: string) => {
    setSelectedLeadId(leadId);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/leads/${leadId}`);
      if (res.ok) {
        const json = await res.json();
        setLeadDetail(json);
        return;
      }
    } catch {
      //
    } finally {
      setDetailLoading(false);
    }

    // Check custom leads in localStorage
    const customRaw = typeof window !== 'undefined' ? localStorage.getItem('linkora_custom_leads') : null;
    const customLeads = customRaw ? JSON.parse(customRaw) : [];
    const found = customLeads.find((l: any) => l.id === leadId);
    if (found) {
      setLeadDetail({
        lead: found,
        provenance: found.provenance || [
          {
            id: 'prov-' + found.id,
            source: found.source || 'Agent-Direkterfassung',
            campaign_name: found.project_name,
            opt_in_timestamp: found.created_at,
            consent_text: 'Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7).',
            consent_version: 'v2.1',
            consent_channel: 'PHONE',
          },
        ],
        answers: Array.isArray(found.formattedAnswers) && found.formattedAnswers.length > 0
          ? found.formattedAnswers
          : Array.isArray(found.answers) && found.answers.length > 0
          ? found.answers
          : typeof found.answers === 'object' && found.answers !== null
          ? Object.entries(found.answers).map(([k, v]) => ({
              question_code: k,
              question_label: QUESTION_LABELS[k] || k,
              value_raw: String(v),
            }))
          : [],
        events: [
          {
            id: 'ev-1',
            event_type: 'LEAD_INGESTED',
            created_at: found.created_at,
            payload: { channel: 'Agent-Erfassung' },
          },
        ],
        canDial: {
          allowed: true,
          message: 'Lead ist zur Anwahl im Dialer freigegeben.',
        },
      });
    }
  };

  const handleQcSubmit = async () => {
    if (!qcAction || !selectedLeadId || !qcReason.trim()) return;
    setSubmittingQc(true);
    const newStatus = qcAction === 'APPROVE' ? 'CONFIRMED' : (qcAction === 'REJECT' ? 'STORNO' : 'QC_PENDING');

    // Update in localStorage if present
    const customRaw = typeof window !== 'undefined' ? localStorage.getItem('linkora_custom_leads') : null;
    if (customRaw) {
      const customLeads = JSON.parse(customRaw);
      const updated = customLeads.map((l: any) => l.id === selectedLeadId ? { ...l, status: newStatus } : l);
      localStorage.setItem('linkora_custom_leads', JSON.stringify(updated));
    }

    try {
      await fetch(`/api/v1/leads/${selectedLeadId}/qc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: qcAction,
          reason: qcReason.trim(),
        }),
      });
    } catch {
      //
    } finally {
      setQcAction(null);
      setQcReason('');
      setSubmittingQc(false);
      await openDrawer(selectedLeadId);
      await fetchLeads();
    }
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    NEW: { label: locale === 'tr' ? 'Yeni' : 'Neu', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    QC_PENDING: { label: locale === 'tr' ? 'QC Bekliyor' : 'In QC-Prüfung', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    CONFIRMED: { label: locale === 'tr' ? 'Onaylandı' : 'Bestätigt', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    STORNO: { label: locale === 'tr' ? 'İptal / Storno' : 'Storno', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    ROUTED: { label: locale === 'tr' ? 'Yönlendirildi' : 'Geroutet', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    SOLD: { label: locale === 'tr' ? 'Satıldı' : 'Verkauft', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700' },
    RETURNED: { label: locale === 'tr' ? 'İade Edildi' : 'Rückläufer', bg: 'bg-slate-100 border-slate-300', text: 'text-slate-700' },
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-sky-600" />
              <span>{locale === 'tr' ? 'Lead Müşterileri' : 'Lead-Kunden'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'tr'
                ? 'Gelen talepler, Werbeeinwilligung (UWG § 7) kontrolü, soru yanıtları ve QC onayı'
                : 'Verifizierte Leads, Einwilligungsnachweise, Projektfragebögen und QC-Freigabeprozess'}
            </p>
          </div>

          <button
            onClick={fetchLeads}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition shadow-xs self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            <span>{locale === 'tr' ? 'Yenile' : 'Aktualisieren'}</span>
          </button>
        </div>

        {/* Pipeline Filter Tabs & Search Bar */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 space-y-3">
          {/* Status Pipeline Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5">
            {[
              { id: 'ALL', label: locale === 'tr' ? 'Tümü' : 'Alle' },
              { id: 'NEW', label: locale === 'tr' ? 'Neu' : 'Neu' },
              { id: 'QC_PENDING', label: locale === 'tr' ? 'In QC-Prüfung' : 'In QC-Prüfung' },
              { id: 'CONFIRMED', label: locale === 'tr' ? 'Bestätigt' : 'Bestätigt' },
              { id: 'STORNO', label: locale === 'tr' ? 'Storno' : 'Storno' },
              { id: 'ROUTED', label: locale === 'tr' ? 'Geroutet' : 'Geroutet' },
              { id: 'SOLD', label: locale === 'tr' ? 'Verkauft' : 'Verkauft' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  statusFilter === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'tr' ? 'İsim, telefon, e-posta veya şehir ara...' : 'Name, Rufnummer, E-Mail oder Stadt suchen...'}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition shadow-xs"
            >
              {locale === 'tr' ? 'Ara' : 'Suchen'}
            </button>
          </form>
        </div>

        {/* Leads Data Table */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Kunde</th>
                  <th className="py-3 px-4">Projekt</th>
                  <th className="py-3 px-4">Telefon & Typ</th>
                  <th className="py-3 px-4">Standort</th>
                  <th className="py-3 px-4">Einwilligung (UWG)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => {
                  const badge = statusBadges[lead.status] || statusBadges.NEW;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => openDrawer(lead.id)}
                      className="hover:bg-sky-50/40 transition cursor-pointer group"
                    >
                      {/* Name & Mail */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 group-hover:text-sky-600 transition">
                          {lead.first_name} {lead.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                          {lead.email || 'Keine E-Mail angegeben'}
                        </div>
                      </td>

                      {/* Project Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                          {lead.project_name || 'Allgemein'}
                        </span>
                      </td>

                      {/* Phone & Line Type */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-700 font-medium">{lead.phone_e164}</div>
                        <span className="inline-block text-[10px] text-slate-400 uppercase tracking-wider">
                          {lead.line_type || 'UNKNOWN'}
                        </span>
                      </td>

                      {/* City / PLZ */}
                      <td className="py-3 px-4 text-slate-600">
                        {lead.postal_code || lead.city ? `${lead.postal_code || ''} ${lead.city || ''}` : '—'}
                      </td>

                      {/* Consent & DNC */}
                      <td className="py-3 px-4">
                        {lead.consent_verified ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>Verifiziert</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>Kein Nachweis</span>
                          </span>
                        )}
                        {lead.dnc_flag && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white">
                            DNC
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button className="text-slate-400 group-hover:text-sky-600 p-1 rounded hover:bg-white transition">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {leads.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Keine Leads gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      {selectedLeadId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="w-full max-w-xl bg-white shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[11px] text-sky-400 font-semibold uppercase tracking-wider">
                  Lead-Akte
                </span>
                <h2 className="text-lg font-bold">
                  {leadDetail ? `${leadDetail.lead.first_name} ${leadDetail.lead.last_name}` : 'Laden...'}
                </h2>
              </div>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
              {detailLoading || !leadDetail ? (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-sky-600" />
                  <span>Lead-Details werden geladen...</span>
                </div>
              ) : (
                <>
                  {/* Dialing Eligibility Hard Check Banner */}
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      leadDetail.canDial.allowed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {leadDetail.canDial.allowed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider">
                        {leadDetail.canDial.allowed ? 'Wählbereit (Compliance OK)' : 'Wahl-Sperre Aktiv (Hard Stop)'}
                      </div>
                      <p className="text-[11px] mt-0.5">{leadDetail.canDial.message}</p>
                    </div>
                  </div>

                  {/* Customer Contact Block */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kontaktdaten
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-medium">{leadDetail.lead.phone_e164}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{leadDetail.lead.email || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {leadDetail.lead.street} {leadDetail.lead.house_number},{' '}
                          {leadDetail.lead.postal_code} {leadDetail.lead.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Provenance & Consent Proof Card (Mandatory UWG § 7) */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Einwilligungsnachweis (DSGVO / UWG)</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          leadDetail.lead.consent_verified
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {leadDetail.lead.consent_verified ? 'Gültig' : 'Ungültig / Fehlt'}
                      </span>
                    </div>

                    {leadDetail.provenance.length > 0 ? (
                      leadDetail.provenance.map((p) => (
                        <div key={p.id} className="text-[11px] space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex justify-between text-slate-500">
                            <span>Quelle: <strong className="text-slate-700">{p.source}</strong></span>
                            <span>Kanal: <strong className="text-slate-700">{p.consent_channel}</strong></span>
                          </div>
                          <div className="text-slate-500">
                            Opt-In Zeitpunkt:{' '}
                            <strong className="text-slate-700">
                              {new Date(p.opt_in_timestamp).toLocaleString('de-DE')}
                            </strong>
                          </div>
                          {p.ip_address && (
                            <div className="text-slate-500">IP-Adresse: <span className="font-mono">{p.ip_address}</span></div>
                          )}
                          <div className="mt-2 text-slate-700 italic bg-white p-2 rounded border border-slate-200/60">
                            &quot;{p.consent_text}&quot;
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic text-[11px]">
                        Kein dokumentierter Werbeeinwilligungs-Nachweis hinterlegt. Lead darf weder gewählt noch verkauft werden.
                      </div>
                    )}
                  </div>

                  {/* Questionnaire Answers */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileQuestion className="w-4 h-4 text-purple-600" />
                      <span>Fragebogen-Antworten ({leadDetail.lead.project_name})</span>
                    </div>

                    <div className="space-y-1.5">
                      {leadDetail.answers.map((a, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-50 text-xs">
                          <span className="text-slate-500">{a.question_label}</span>
                          <span className="font-semibold text-slate-800">{a.value_raw}</span>
                        </div>
                      ))}
                      {leadDetail.answers.length === 0 && (
                        <div className="text-slate-400 italic text-[11px]">Noch keine Antworten erfasst.</div>
                      )}
                    </div>
                  </div>

                  {/* Agent Notes & Voice Recording */}
                  {(leadDetail.lead.audioFileName || leadDetail.lead.notiz || leadDetail.lead.notes) && (
                    <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Erfassungs-Details & Sprachaufnahme</span>
                      </div>

                      {leadDetail.lead.audioFileName && (
                        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Volume2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{leadDetail.lead.audioFileName}</div>
                              <div className="text-[10px] text-blue-700">Audio-Aufzeichnung hinterlegt (MP3/WAV)</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            MP3 · max 50MB
                          </span>
                        </div>
                      )}

                      {(leadDetail.lead.notiz || leadDetail.lead.notes) && (
                        <div className="space-y-1">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">Agenten-Notiz</div>
                          <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                            {leadDetail.lead.notiz || leadDetail.lead.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* QC Reviewer Action Panel */}
                  <div className="bg-slate-900 rounded-xl p-4 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                        QC-Prüfung & Freigabe
                      </span>
                      <span className="text-[10px] text-slate-400">Aktueller Status: {leadDetail.lead.status}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setQcAction('APPROVE')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          qcAction === 'APPROVE'
                            ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                            : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Bestätigen</span>
                      </button>

                      <button
                        onClick={() => setQcAction('REJECT')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          qcAction === 'REJECT'
                            ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                            : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Storno</span>
                      </button>

                      <button
                        onClick={() => setQcAction('REQUEST_RECALL')}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          qcAction === 'REQUEST_RECALL'
                            ? 'bg-sky-600 text-white ring-2 ring-sky-300'
                            : 'bg-slate-800 text-sky-400 hover:bg-slate-700'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Rückruf</span>
                      </button>
                    </div>

                    {/* Reason input when action selected */}
                    {qcAction && (
                      <div className="space-y-2 pt-2 border-t border-slate-800 animate-in fade-in">
                        <label className="text-[10px] text-slate-300 uppercase tracking-wider block">
                          Begründung (Pflichtfeld für Audit):
                        </label>
                        <textarea
                          rows={2}
                          value={qcReason}
                          onChange={(e) => setQcReason(e.target.value)}
                          placeholder="z.B. Eigentümernachweis erbracht, Gesprächsaufzeichnung positiv geprüft..."
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          onClick={handleQcSubmit}
                          disabled={submittingQc || !qcReason.trim()}
                          className="w-full py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition"
                        >
                          {submittingQc ? 'Wird gespeichert...' : 'QC-Entscheidung verbindlich speichern'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Audit Timeline Events */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Ereignis-Historie (Audit)</span>
                    </span>
                    <div className="space-y-1.5">
                      {leadDetail.events.map((ev) => (
                        <div key={ev.id} className="text-[11px] p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">{ev.event_type}</span>
                            <div className="text-slate-500 mt-0.5">{JSON.stringify(ev.payload)}</div>
                          </div>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {new Date(ev.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
