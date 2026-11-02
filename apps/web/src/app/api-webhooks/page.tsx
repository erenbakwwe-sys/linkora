'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Webhook,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Globe,
  Clock,
  Send,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Eye,
  RefreshCw,
  Sparkles,
  Building2,
  DollarSign,
  X,
} from 'lucide-react';

interface WebhookLog {
  id: string;
  buyerId: string;
  endpoint: string;
  eventType: string;
  signature: string;
  timestamp: string;
  statusCode: number;
  status: string;
  attempts: number;
  lastAttemptAt: string;
  payload?: any;
}

export default function ApiWebhooksPage() {
  const [deliveries, setDeliveries] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'OUTBOUND' | 'INBOUND'>('ALL');
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [origin, setOrigin] = useState('https://linkora-beta.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    fetchWebhookLogs();
  }, []);

  const fetchWebhookLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/webhooks');
      if (res.ok) {
        const data = await res.json();
        if (data?.deliveries && Array.isArray(data.deliveries)) {
          setDeliveries(data.deliveries);
        }
      }
    } catch (err) {
      console.error('Failed to load webhook logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleReplay = async (id: string) => {
    try {
      const res = await fetch(`/api/marketplace/webhooks/replay/${id}`, {
        method: 'POST',
      });
      const updated = await res.json();
      setDeliveries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      showNotification('success', `Webhook ${id} erfolgreich erneut übertragen (Status: 200 OK).`);
    } catch (err: any) {
      showNotification('error', `Fehler beim erneuten Senden: ${err.message || 'Unbekannt'}`);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Quick simulation trigger for testing
  const handleSimulateInboundCallback = async (status: 'SOLD' | 'APPOINTMENT_SET' | 'REJECTED') => {
    try {
      const payload = {
        partner: 'Aroundhome GmbH',
        externalLeadId: `AH-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
        status,
        commissionEur: status === 'SOLD' ? 180 : status === 'APPOINTMENT_SET' ? 45 : 0,
        rejectionReason: status === 'REJECTED' ? 'Kein Interesse am Angebot' : undefined,
        notes: `Automatischer Test-Callback: ${status} vom Arbeitgeber übermittelt`,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch('/api/marketplace/callbacks/aroundhome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification(
          'success',
          `Inbound Status-Callback '${status}' erfolgreich verbucht! (${payload.commissionEur} € Provision)`
        );
        fetchWebhookLogs();
      }
    } catch (err: any) {
      showNotification('error', 'Fehler beim Callback-Test');
    }
  };

  const callbackUrl = `${origin}/api/marketplace/callbacks/partner`;

  const filteredDeliveries = deliveries.filter((d) => {
    if (filterType === 'OUTBOUND') {
      return d.eventType === 'lead.delivery.v1' || d.eventType === 'campaign.batch.v1';
    }
    if (filterType === 'INBOUND') {
      return d.eventType === 'lead.callback.received';
    }
    return true;
  });

  const outboundCount = deliveries.filter(
    (d) => d.eventType === 'lead.delivery.v1' || d.eventType === 'campaign.batch.v1'
  ).length;
  const inboundCount = deliveries.filter((d) => d.eventType === 'lead.callback.received').length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md">
                <Webhook className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Partner-API & Webhook-Zentralsteuerung
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Zwei-Wege B2B API: Ausgehender Lead-Push an Arbeitgeber (z.B. Aroundhome) &amp; Eingehende Status-Rückmeldungen.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchWebhookLogs}
              disabled={loading}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
            <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              HMAC-SHA256 Aktiv
            </span>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INBOUND WEBHOOK ENDPOINT BANNER FOR EMPLOYERS / BUYERS */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-700/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold border border-cyan-500/30">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Öffentlicher Webhook Callback Endpunkt (Für Arbeitgeber wie Aroundhome GmbH)
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                Status-Rückmeldungen automatisch empfangen
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hinterlegen Sie diese Webhook-URL beim Auftraggeber oder in dessen CRM. Sobald Aroundhome einen Lead auf 
                <strong> &quot;Termin vereinbart&quot;</strong>, <strong>&quot;Verkauft&quot;</strong> oder <strong>&quot;Storno&quot;</strong> setzt, wird Ihr Linkora-Konto in Echtzeit aktualisiert und die Provision gutgeschrieben.
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <div className="flex items-center bg-black/40 border border-slate-700 rounded-xl p-1.5 pl-3">
                <code className="text-xs font-mono text-cyan-300 select-all pr-3 truncate max-w-[280px] sm:max-w-[340px]">
                  {callbackUrl}
                </code>
                <button
                  onClick={() => handleCopyUrl(callbackUrl)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition ml-auto shrink-0 shadow-sm"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Kopiert!' : 'Kopieren'}</span>
                </button>
              </div>

              {/* Simulation Quick Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Test-Simulatoren:</span>
                <button
                  onClick={() => handleSimulateInboundCallback('SOLD')}
                  className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-md text-[10px] font-bold transition flex items-center gap-1"
                >
                  <DollarSign className="w-3 h-3" />
                  Abschluss (+180 €)
                </button>
                <button
                  onClick={() => handleSimulateInboundCallback('APPOINTMENT_SET')}
                  className="px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-md text-[10px] font-bold transition flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" />
                  Termin (+45 €)
                </button>
                <button
                  onClick={() => handleSimulateInboundCallback('REJECTED')}
                  className="px-2 py-1 bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 rounded-md text-[10px] font-bold transition"
                >
                  Storno
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Gesamte Ereignisse</span>
              <Webhook className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{deliveries.length}</span>
              <span className="text-xs text-slate-500">Übertragungen</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-600 uppercase">Ausgehend (Lead-Push)</span>
              <ArrowUpRight className="w-4 h-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-900">{outboundCount}</span>
              <span className="text-xs text-slate-500">an Partner übermittelt</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-600 uppercase">Eingehend (Status-Callbacks)</span>
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-900">{inboundCount}</span>
              <span className="text-xs text-slate-500">vom Partner empfangen</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-purple-600 uppercase">Erfolgsquote</span>
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-900">
                {deliveries.length > 0
                  ? `${Math.round((deliveries.filter((d) => d.statusCode >= 200 && d.statusCode < 300).length / deliveries.length) * 100)}%`
                  : '100%'}
              </span>
              <span className="text-xs text-slate-500">HTTP 200 OK</span>
            </div>
          </div>
        </div>

        {/* Deliveries Table Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Card Header & Filter Tabs */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Ereignis-Historie &amp; Übertragungsprotokoll
              </h2>
              <p className="text-xs text-slate-500">
                Lückenloses Audit aller API-Pushes und Partner-Rückmeldungen inklusive Nutzlast und Antwort.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-md transition ${
                  filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alle ({deliveries.length})
              </button>
              <button
                onClick={() => setFilterType('OUTBOUND')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                  filterType === 'OUTBOUND' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                Ausgehend ({outboundCount})
              </button>
              <button
                onClick={() => setFilterType('INBOUND')}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                  filterType === 'INBOUND' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                Eingehend ({inboundCount})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Richtung &amp; Typ</th>
                  <th className="py-3 px-4">Partner / Ziel</th>
                  <th className="py-3 px-4">Endpunkt</th>
                  <th className="py-3 px-4">HTTP Status</th>
                  <th className="py-3 px-4">Zeitpunkt</th>
                  <th className="py-3 px-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                      Keine Webhook-Zustellungen in dieser Ansicht protokolliert.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((d) => {
                    const isInbound = d.eventType === 'lead.callback.received';
                    return (
                      <tr key={d.id} className="hover:bg-sky-50/30 transition">
                        {/* Direction & Event */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {isInbound ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                                Eingehend (Callback)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <ArrowUpRight className="w-3 h-3 text-blue-600" />
                                Ausgehend (Lead-Push)
                              </span>
                            )}
                            <span className="font-mono text-slate-500 text-[11px]">{d.eventType}</span>
                          </div>
                        </td>

                        {/* Partner */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {d.buyerId === 'buyer-0005-aroundhome' || d.buyerId.includes('aroundhome')
                              ? 'Aroundhome GmbH'
                              : d.buyerId}
                          </span>
                        </td>

                        {/* Endpoint */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-slate-600 text-[11px] truncate max-w-[220px] block" title={d.endpoint}>
                            {d.endpoint}
                          </span>
                        </td>

                        {/* Status Code */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              d.statusCode >= 200 && d.statusCode < 300
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {d.statusCode} {d.statusCode === 200 ? 'OK' : 'ERROR'}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(d.timestamp).toLocaleString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLog(d)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              Payload
                            </button>
                            {!isInbound && (
                              <button
                                onClick={() => handleReplay(d.id)}
                                title="Webhook erneut ausführen"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAYLOAD INSPECTOR MODAL */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-bold">Webhook Nutzdaten &amp; Übertragungsprotokoll</h3>
                    <p className="text-[11px] text-slate-400 font-mono">ID: {selectedLog.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">Ereignis-Typ:</span>
                    <span className="font-semibold text-slate-800">{selectedLog.eventType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">Endpunkt:</span>
                    <span className="font-mono text-slate-800 break-all">{selectedLog.endpoint}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">Zeitstempel:</span>
                    <span className="text-slate-800">{new Date(selectedLog.timestamp).toLocaleString('de-DE')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-semibold block">Signatur:</span>
                    <span className="font-mono text-slate-600 truncate block">{selectedLog.signature}</span>
                  </div>
                </div>

                {/* JSON Content */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Vollständige JSON Nutzlast:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedLog.payload || selectedLog, null, 2));
                        showNotification('success', 'JSON in Zwischenablage kopiert');
                      }}
                      className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      JSON kopieren
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-cyan-300 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80 leading-relaxed border border-slate-800">
                    {JSON.stringify(selectedLog.payload || selectedLog, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition"
                >
                  Schließen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
