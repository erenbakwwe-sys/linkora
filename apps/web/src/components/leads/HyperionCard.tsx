'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Send } from 'lucide-react';

const FIELD_LABELS: Record<string, string> = {
  anrede: 'Anrede',
  vorname: 'Vorname',
  nachname: 'Nachname',
  telefon: 'Telefon',
  email: 'E-Mail',
  strasse: 'Straße',
  hausnummer: 'Hausnummer',
  plz: 'PLZ',
  ort: 'Ort',
  pflegegrad: 'Pflegegrad',
  kontaktWunsch: 'Kontaktwunsch',
  datenschutzOk: 'Einwilligung',
  liftTyp: 'Lift-Typ',
  treppenform: 'Treppenform',
  innenAussen: 'Innen/Außen',
  etagen: 'Etagen',
  nutzer: 'Nutzer',
  eigentuemer: 'Eigentum/Miete',
  zeitrahmen: 'Zeitrahmen',
  rueckrufVon: 'Rückruf von',
  rueckrufBis: 'Rückruf bis',
  kategorie: 'Kategorie',
  externalId: 'Lead-ID',
};

interface Delivery {
  hyperionId: string;
  hyperionStatus: string;
  created: boolean;
  possibleDuplicate: boolean;
  sentAt: string;
}

interface Preview {
  eligible: boolean;
  ready: boolean;
  fieldErrors: Record<string, string>;
  lastDelivery: Delivery | null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isTreppenliftLead(lead: any): boolean {
  const name = String(lead?.project_name || lead?.projectName || '').toLowerCase();
  return lead?.project_id === 'cccccccc-0000-0000-0000-000000000003' || name.includes('treppenlift');
}

export function HyperionCard({ leadId }: { leadId: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [remoteErrors, setRemoteErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const isServerLead = UUID_RE.test(leadId);

  const load = useCallback(async () => {
    if (!isServerLead) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/integrations/hyperion/leads/${leadId}/preview`);
      if (res.status === 403) {
        setLoadError('Keine Berechtigung für den Hyperion-Versand.');
      } else if (!res.ok) {
        setLoadError('Hyperion-Status konnte nicht geladen werden.');
      } else {
        setPreview(await res.json());
      }
    } catch {
      setLoadError('Server nicht erreichbar.');
    } finally {
      setLoading(false);
    }
  }, [leadId, isServerLead]);

  useEffect(() => {
    setPreview(null);
    setMessage(null);
    setRemoteErrors({});
    load();
  }, [load]);

  const send = async () => {
    setSending(true);
    setMessage(null);
    setRemoteErrors({});
    try {
      const res = await fetch(`/api/integrations/hyperion/leads/${leadId}/send`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        setMessage({ type: 'error', text: data?.message || `Fehler (HTTP ${res.status})` });
      } else if (data.ok) {
        setMessage({
          type: 'success',
          text: data.created
            ? `An Hyperion übermittelt (Status: ${data.hyperionStatus}).`
            : `War bei Hyperion bereits vorhanden – kein neuer Lead angelegt (Status: ${data.hyperionStatus}).`,
        });
        await load();
      } else {
        setMessage({ type: 'error', text: data.message });
        if (data.fieldErrors) setRemoteErrors(data.fieldErrors);
      }
    } catch {
      setMessage({ type: 'error', text: 'Server nicht erreichbar.' });
    } finally {
      setSending(false);
    }
  };

  const errors = { ...(preview?.fieldErrors || {}), ...remoteErrors };
  const delivery = preview?.lastDelivery;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Hyperion Leads Panel</span>
        {delivery && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            {delivery.hyperionStatus || 'Übermittelt'}
          </span>
        )}
      </div>

      {!isServerLead ? (
        <p className="text-xs text-slate-500">
          Dieser Lead ist nur lokal im Browser gespeichert und kann nicht an Hyperion gesendet werden.
        </p>
      ) : loading && !preview ? (
        <p className="text-xs text-slate-500">Prüfe Vollständigkeit…</p>
      ) : loadError ? (
        <p className="text-xs text-rose-600">{loadError}</p>
      ) : (
        <>
          {delivery && (
            <div className="text-xs text-slate-600 space-y-0.5">
              <div>
                Gesendet am {new Date(delivery.sentAt).toLocaleString('de-DE')} · Hyperion-ID{' '}
                <span className="font-mono">{delivery.hyperionId}</span>
              </div>
              {delivery.possibleDuplicate && (
                <div className="text-amber-700">
                  Hyperion meldet einen möglichen Dubletten-Lead (gleiche Telefonnummer oder Name + PLZ).
                </div>
              )}
            </div>
          )}

          {Object.keys(errors).length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Vor dem Versand ergänzen:</span>
              </div>
              <ul className="list-disc pl-5">
                {Object.entries(errors).map(([field, msg]) => (
                  <li key={field}>
                    <strong>{FIELD_LABELS[field] || field}:</strong> {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message && (
            <div
              className={`flex items-start gap-1.5 text-xs rounded-lg p-2.5 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={send}
              disabled={sending || !preview?.ready}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sende…' : delivery ? 'Erneut an Hyperion senden' : 'An Hyperion senden'}</span>
            </button>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              title="Status neu laden"
              className="px-2.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {delivery && (
            <p className="text-[11px] text-slate-500">
              Erneutes Senden legt bei Hyperion keinen zweiten Lead an (gleiche externalId).
            </p>
          )}
        </>
      )}
    </div>
  );
}
