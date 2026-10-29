'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Webhook,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Globe,
  Clock,
  Send,
  ShieldCheck,
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
}

export default function ApiWebhooksPage() {
  const [deliveries, setDeliveries] = useState<WebhookLog[]>([]);
  const [replaySuccess, setReplaySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/marketplace/webhooks')
      .then((res) => res.json())
      .then((data) => {
        if (data?.deliveries && Array.isArray(data.deliveries)) {
          setDeliveries(data.deliveries);
        }
      })
      .catch((err) => console.error('Failed to load webhook logs:', err));
  }, []);

  const handleReplay = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/marketplace/webhooks/replay/${id}`, {
        method: 'POST',
      });
      const updated = await res.json();
      setDeliveries((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setReplaySuccess(`Webhook ${id} erfolgreich erneut übertragen (Status: 200 OK).`);
      setTimeout(() => setReplaySuccess(null), 3000);
    } catch (err: any) {
      console.error('Error replaying webhook:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Webhook className="w-7 h-7 text-cyan-600" />
            Partner-API & Webhook-Zustellungen
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Überwachung der beiden Region-Connectors (<strong>connector-de</strong> für deutsche Handwerkspartner &amp;{' '}
            <strong>connector-tr</strong> für türkische Callcenter) mit kryptografischer HMAC-SHA256 Signaturprüfung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Replay-Schutz Aktiv (&lt; 300s Skew)
          </span>
        </div>
      </div>

      {replaySuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {replaySuccess}
        </div>
      )}

      {/* Region Connectors Overview Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600" />
              Region Connector: DEUTSCHLAND (connector-de)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Ping-Post & REST
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Zustellung qualifizierter Leads und Terminbestätigungen direkt an CRM-Endpunkte deutscher Installationspartner.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-600" />
              Region Connector: TÜRKEI (connector-tr)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
              Batch & KI-Briefings
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Übergabe priorisierter Anruflisten und synchronisierter KI-Briefings an Partner-Callcenter in Izmir und Istanbul.
          </p>
        </div>
      </div>

      {/* Webhook Delivery Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Ausgehende Webhook-Ereignisse & Übertragungen ({deliveries.length})
          </h2>
          <span className="text-xs text-slate-500">Signiert mit X-Linkora-Signature</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Event-ID</th>
                <th className="py-3 px-4">Typ</th>
                <th className="py-3 px-4">Ziel-Endpunkt</th>
                <th className="py-3 px-4">HTTP Status</th>
                <th className="py-3 px-4">HMAC Signatur</th>
                <th className="py-3 px-4">Versuche</th>
                <th className="py-3 px-4 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans text-sm">
                    Keine Webhook-Zustellungen protokolliert.
                  </td>
                </tr>
              ) : (
                deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 font-sans">
                    <td className="py-3 px-4 font-mono text-xs text-slate-700">{d.id.slice(0, 16)}...</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{d.eventType}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{d.endpoint}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                        {d.statusCode} OK
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-400">
                      {d.signature.slice(0, 12)}...
                    </td>
                    <td className="py-3 px-4 font-semibold">{d.attempts}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleReplay(d.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Replay
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
