'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Zap,
  TrendingUp,
  MapPin,
  Clock,
  KeyRound,
  Sliders,
  AlertTriangle,
  Plus,
  Copy,
  Check,
  Send,
  ExternalLink,
  RefreshCw,
  X,
  Code2,
} from 'lucide-react';

interface Buyer {
  id: string;
  name: string;
  companyIdentifier: string;
  pingEnabled: boolean;
  postEndpoint?: string;
  pingEndpoint?: string;
  signingSecret?: string;
  dailyCap: number;
  monthlyCap: number;
  deliveredToday: number;
  deliveredThisMonth: number;
  returnWindowDays: number;
  maxReturnRatePercent: number;
  totalDelivered: number;
  totalReturned: number;
  isActive: boolean;
}

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJsonSample, setShowJsonSample] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Buyer Form
  const [newName, setNewName] = useState('');
  const [newEndpoint, setNewEndpoint] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newDailyCap, setNewDailyCap] = useState(50);
  const [newMonthlyCap, setNewMonthlyCap] = useState(1500);
  const [newProjects, setNewProjects] = useState<string[]>(['Photovoltaik', 'Wärmepumpe', 'Treppenlift']);

  const callbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/marketplace/callbacks/partner`
    : 'https://linkora-erenbakwwe-4622s-projects.vercel.app/api/marketplace/callbacks/partner';

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/marketplace/buyers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setBuyers(data);
      }
    } catch (err) {
      console.error('Failed to load buyers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setActionLoading('add');
      const res = await fetch('/api/marketplace/buyers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          postEndpoint: newEndpoint.trim() || 'https://api.aroundhome.de/v1/leads',
          signingSecret: newSecret.trim() || undefined,
          dailyCap: Number(newDailyCap) || 50,
          monthlyCap: Number(newMonthlyCap) || 1500,
          projects: newProjects,
        }),
      });

      if (res.ok) {
        setActionToast({ type: 'success', message: `Partner '${newName}' erfolgreich hinzugefügt!` });
        setShowAddModal(false);
        setNewName('');
        setNewEndpoint('');
        setNewSecret('');
        fetchBuyers();
      } else {
        setActionToast({ type: 'error', message: 'Fehler beim Erstellen des Partners.' });
      }
    } catch (err: any) {
      setActionToast({ type: 'error', message: err?.message || 'Netzwerkfehler' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionToast(null), 4000);
    }
  };

  const handleTestDeliver = async (buyer: Buyer) => {
    try {
      setActionLoading(`deliver-${buyer.id}`);
      const res = await fetch('/api/marketplace/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: `lead-${Date.now()}`,
          buyerId: buyer.id,
          customPayload: {
            firstName: 'Johann',
            lastName: 'Schmidt',
            phone: '+491701234567',
            email: 'johann.schmidt@beispiel-solar.de',
            street: 'Sonnenallee 42',
            postalCode: '12045',
            city: 'Berlin',
            project: 'Photovoltaik',
            answers: {
              dachform: 'Satteldach',
              dachalter: '8 Jahre',
              stromverbrauch: '4.500 kWh/Jahr',
              eigentuemer: 'Ja',
            },
            notes: 'Kunde wünscht 10kWp PV-Anlage mit 10kWh Speicher.',
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionToast({
          type: 'success',
          message: `Test-Lead erfolgreich an '${buyer.name}' zugestellt! Status: ${data.statusCode} OK.`,
        });
        fetchBuyers();
      } else {
        setActionToast({ type: 'error', message: data?.message || 'Zustellung fehlgeschlagen' });
      }
    } catch (err: any) {
      setActionToast({ type: 'error', message: err?.message || 'Fehler beim Senden' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionToast(null), 5000);
    }
  };

  const handleSimulateCallback = async (buyer: Buyer, status: 'SOLD' | 'REJECTED') => {
    try {
      setActionLoading(`cb-${buyer.id}-${status}`);
      const res = await fetch('/api/marketplace/callbacks/partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: `lead-${Date.now()}`,
          partnerLeadId: `AH-${Math.floor(100000 + Math.random() * 900000)}`,
          partnerName: buyer.name,
          status,
          reason:
            status === 'SOLD'
              ? 'Kunde hat PV-Anlage erfolgreich gekauft. Abschluss bestätigt.'
              : 'Kunde ist Mieter, kein Eigentümer (Reklamation).',
          commissionEur: status === 'SOLD' ? 180.0 : 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionToast({
          type: 'success',
          message:
            status === 'SOLD'
              ? `Partner meldet: VERKAUF BESTÄTIGT (+180 € Provision verbucht)!`
              : `Partner meldet: REKLAMATION / STORNO erfasst.`,
        });
      } else {
        setActionToast({ type: 'error', message: 'Callback-Verarbeitung fehlgeschlagen' });
      }
    } catch (err: any) {
      setActionToast({ type: 'error', message: err?.message || 'Fehler beim Callback' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionToast(null), 5000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Toast Alert */}
        {actionToast && (
          <div
            className={`p-4 rounded-xl shadow-lg border flex items-center justify-between transition-all ${
              actionToast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5 font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionToast.message}</span>
            </div>
            <button onClick={() => setActionToast(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-sky-600" />
              Abnehmer-Verwaltung & Partnerfirmen (API & Webhooks)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verwalten Sie externe Arbeitgeber und Fachpartner (z.B. Aroundhome GmbH, Solar Direkt) für automatische Lead-Zustellung und Status-Rückmeldungen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Neuen Partner hinzufügen
            </button>
          </div>
        </div>

        {/* Callback URL Callout Banner */}
        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-sky-800/80">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-sky-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                Ihre Inbound Callback Webhook URL
              </div>
              <h2 className="text-lg font-bold text-white">
                Geben Sie diesen Endpunkt an Ihre Partner (z.B. Aroundhome GmbH), damit diese den Status zurückmelden:
              </h2>
              <div className="flex items-center gap-2 bg-slate-950/80 border border-sky-500/30 rounded-xl px-4 py-2.5 font-mono text-xs text-sky-300 break-all select-all">
                <span>{callbackUrl}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={handleCopyUrl}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-900" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? 'URL Kopiert!' : 'Webhook-URL Kopieren'}</span>
              </button>

              <button
                onClick={() => setShowJsonSample(!showJsonSample)}
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl border border-white/20 transition cursor-pointer font-semibold"
              >
                <Code2 className="w-3.5 h-3.5 text-sky-400" />
                <span>{showJsonSample ? 'JSON-Format verbergen' : 'JSON-Format ansehen'}</span>
              </button>
            </div>
          </div>

          {/* JSON Documentation Expand */}
          {showJsonSample && (
            <div className="mt-5 pt-4 border-t border-sky-800/60 text-xs font-mono bg-slate-950/90 rounded-xl p-4 border border-slate-800 text-slate-300">
              <p className="text-slate-400 font-sans text-xs mb-2">
                💡 <strong>Aroundhome oder andere Partner senden diesen JSON-Body an Ihre URL, wenn ein Lead abgeschlossen oder abgelehnt wird:</strong>
              </p>
              <pre className="text-emerald-400 overflow-x-auto">
{`POST ${callbackUrl}
Content-Type: application/json

{
  "leadId": "77777777-0000-0000-0000-000000000001",
  "partnerLeadId": "AH-98214",
  "partnerName": "Aroundhome GmbH",
  "status": "SOLD",            // Optionen: "SOLD", "ACCEPTED", "REJECTED", "APPOINTMENT_SET"
  "reason": "Kunde hat PV-Anlage 12kWp gekauft. Abschluss bestätigt.",
  "commissionEur": 180.00
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Buyer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-sky-600" />
              <span>Partnerfirmen werden geladen...</span>
            </div>
          ) : (
            buyers.map((buyer) => {
              const returnRate =
                buyer.totalDelivered > 0 ? (buyer.totalReturned / buyer.totalDelivered) * 100 : 0;
              const capPercent = Math.min(100, (buyer.deliveredToday / buyer.dailyCap) * 100);
              const isAroundhome = buyer.id.includes('aroundhome') || buyer.name.toLowerCase().includes('aroundhome');

              return (
                <div
                  key={buyer.id}
                  className={`bg-white rounded-2xl border shadow-xs p-6 space-y-5 transition-all ${
                    isAroundhome
                      ? 'border-sky-300 ring-2 ring-sky-500/10 hover:border-sky-400'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{buyer.name}</h2>
                        {isAroundhome && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                            Hauptpartner
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                        Kennung: {buyer.companyIdentifier} • {buyer.id}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                        buyer.pingEnabled
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {buyer.pingEnabled ? 'Ping-Post & Push' : 'Direkt-Push'}
                    </span>
                  </div>

                  {/* Endpoints preview */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Post-API (Wohin wir senden):</span>
                      <span className="font-mono text-slate-700 truncate max-w-[240px] text-[11px]">
                        {buyer.postEndpoint || 'https://api.aroundhome.de/v1/leads'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Auth / Signatur:</span>
                      <span className="text-slate-700 text-[11px] font-mono">HMAC-SHA256 & Bearer Token</span>
                    </div>
                  </div>

                  {/* Daily Cap Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Tageskontingent (Daily Cap)</span>
                      <span className="font-bold text-slate-900">
                        {buyer.deliveredToday} / {buyer.dailyCap} Leads ({capPercent.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          capPercent >= 90 ? 'bg-amber-500' : 'bg-sky-600'
                        }`}
                        style={{ width: `${capPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Metric Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Monatlich zugestellt</span>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {buyer.deliveredThisMonth} <span className="text-xs text-slate-400 font-normal">/ {buyer.monthlyCap}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-[11px] text-slate-500 uppercase font-semibold block">Rücklaufquote</span>
                      <div className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                        {returnRate.toFixed(1)}%
                        <span className="text-xs text-slate-400 font-normal">/ max {buyer.maxReturnRatePercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => handleTestDeliver(buyer)}
                      disabled={actionLoading === `deliver-${buyer.id}`}
                      className="inline-flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-lg font-bold transition disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-600" />
                      <span>{actionLoading === `deliver-${buyer.id}` ? 'Sendet...' : 'Test-Lead senden'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSimulateCallback(buyer, 'SOLD')}
                        disabled={actionLoading === `cb-${buyer.id}-SOLD`}
                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-lg font-bold transition disabled:opacity-50"
                        title="Simuliert eine positive Verkaufsmeldung des Partners"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Abschluss simulieren (+180 €)</span>
                      </button>

                      <button
                        onClick={() => handleSimulateCallback(buyer, 'REJECTED')}
                        disabled={actionLoading === `cb-${buyer.id}-REJECTED`}
                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2.5 py-1.5 rounded-lg font-semibold transition disabled:opacity-50"
                        title="Simuliert eine Storno/Reklamations-Rückmeldung"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Storno</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Neuen Partner / Abnehmer hinzufügen</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBuyer} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Partner Firmenname *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Aroundhome GmbH, Thermondo, Enpal..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Partner Post-API Endpunkt (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://api.partner.de/v1/leads"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Wohin Linkora die Kundendaten per HTTP POST schicken soll.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Partner API-Token / Signing Secret</label>
                <input
                  type="text"
                  placeholder="sec_aroundhome_token_xyz"
                  value={newSecret}
                  onChange={(e) => setNewSecret(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tageskontingent (Daily Cap)</label>
                  <input
                    type="number"
                    min="1"
                    value={newDailyCap}
                    onChange={(e) => setNewDailyCap(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monatskontingent</label>
                  <input
                    type="number"
                    min="1"
                    value={newMonthlyCap}
                    onChange={(e) => setNewMonthlyCap(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'add'}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-xs transition disabled:opacity-50"
                >
                  {actionLoading === 'add' ? 'Speichert...' : 'Partner Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
