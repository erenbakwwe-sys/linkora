'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import { useI18n } from '@/context/I18nContext';
import {
  FileSpreadsheet,
  Upload,
  AlertOctagon,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Table,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Edit,
  Save,
  Check,
  X,
  Database,
  Layers,
} from 'lucide-react';

interface QuarantineItem {
  id: string;
  batch_id: string | null;
  raw_data: any;
  error_reasons: string[];
  status: string;
  created_at: string;
}

export default function ExcelCenterPage() {
  const { t, locale } = useI18n();
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'QUARANTINE'>('IMPORT');

  // Import State
  const [projectId, setProjectId] = useState('cccccccc-0000-0000-0000-000000000001'); // PV
  const [csvContent, setCsvContent] = useState('');
  const [fileName, setFileName] = useState('leads_import.csv');
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    sampleRows: any[];
    totalRows: number;
    suggestedMapping: any;
  } | null>(null);
  const [mapping, setMapping] = useState<any>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);

  // Quarantine State
  const [quarantineItems, setQuarantineItems] = useState<QuarantineItem[]>([]);
  const [loadingQuarantine, setLoadingQuarantine] = useState(false);
  const [editingItem, setEditingItem] = useState<QuarantineItem | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editConsentText, setEditConsentText] = useState('');
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Sample CSV presets for 1-click testing
  const sampleValidCsv = `Vorname,Nachname,Telefon,Email,PLZ,Ort,Quelle,Werbeeinwilligung,OptIn
Tobias,Renner,0176 11223344,t.renner@energie.de,80333,München,Google Ads,"Ich willige ein, von Partnern bezüglich PV angerufen zu werden.",2026-10-28T10:00:00Z
Martina,Kraus,089 99887766,m.kraus@web.de,81675,München,Facebook Ads,"Ausdrückliche Werbeeinwilligung telefonisch erteilt.",2026-10-28T10:30:00Z`;

  const sampleMalformedCsv = `Vorname,Nachname,Telefon,Email,PLZ,Ort,Quelle,Werbeeinwilligung,OptIn
,Becker,0170 5544332,b@test.de,70173,Stuttgart,Ads,"Einwilligung erteilt",2026-10-28T09:00:00Z
Stefan,Mueller,INVALID_PHONE_123,s@test.de,10115,Berlin,Ads,"Einwilligung erteilt",2026-10-28T09:15:00Z
Laura,Schmidt,0152 77665544,l@test.de,20095,Hamburg,Ads,"",2026-10-28T09:30:00Z`;

  const handleLoadSample = (type: 'valid' | 'malformed') => {
    const text = type === 'valid' ? sampleValidCsv : sampleMalformedCsv;
    setCsvContent(text);
    setFileName(type === 'valid' ? 'leads_valide.csv' : 'leads_quarantaene_test.csv');
    parseCsv(text);
  };

  const parseCsv = async (contentToParse?: string) => {
    const raw = contentToParse || csvContent;
    if (!raw.trim()) return;

    setIsParsing(true);
    try {
      const res = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: raw }),
      });
      if (res.ok) {
        const json = await res.json();
        setPreviewData(json);
        setMapping(json.suggestedMapping || {});
      }
    } catch {
      //
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvContent(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const executeImport = async () => {
    if (!previewData) return;
    setIsExecuting(true);
    setBatchResult(null);

    // Compute real SHA-256 file hash in browser
    const msgUint8 = new TextEncoder().encode(csvContent);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const fileHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    try {
      // Re-parse all rows from csvContent
      const lines = csvContent.trim().split('\n').map((l) => l.trim()).filter(Boolean);
      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
      const rows = lines.slice(1).map((line) => {
        const parts = line.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = parts[idx] || '';
        });
        return rowObj;
      });

      const res = await fetch('/api/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          fileName,
          fileHash,
          mapping,
          rows,
          defaultSource: 'CSV_IMPORT',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setBatchResult(json);
        fetchQuarantine();
      }
    } catch {
      //
    } finally {
      setIsExecuting(false);
    }
  };

  const fetchQuarantine = async () => {
    setLoadingQuarantine(true);
    try {
      const res = await fetch('/api/import/quarantine');
      if (res.ok) {
        const json = await res.json();
        setQuarantineItems(json || []);
      }
    } catch {
      //
    } finally {
      setLoadingQuarantine(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'QUARANTINE') {
      fetchQuarantine();
    }
  }, [activeTab]);

  const openEditModal = (item: QuarantineItem) => {
    setEditingItem(item);
    setEditFirstName(item.raw_data?.Vorname || item.raw_data?.firstName || '');
    setEditLastName(item.raw_data?.Nachname || item.raw_data?.lastName || '');
    setEditPhone(item.raw_data?.Telefon || item.raw_data?.phone || '');
    setEditConsentText(item.raw_data?.Werbeeinwilligung || item.raw_data?.consentText || '');
  };

  const handleReprocessSubmit = async () => {
    if (!editingItem) return;
    setIsReprocessing(true);
    try {
      const res = await fetch(`/api/import/quarantine/${editingItem.id}/reprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          firstName: editFirstName,
          lastName: editLastName,
          phone: editPhone,
          phoneCountry: 'DE',
          provenance: editConsentText
            ? {
                source: 'QUARANTINE_CORRECTION',
                optInTimestamp: new Date().toISOString(),
                consentText: editConsentText,
                consentVersion: 'v1.0',
                consentChannel: 'ONLINE_FORM',
              }
            : undefined,
        }),
      });
      if (res.ok) {
        setEditingItem(null);
        await fetchQuarantine();
      }
    } catch {
      //
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              <span>{locale === 'tr' ? 'Excel / CSV İçe Aktarma Merkezi' : 'Excel-Zentrum & Import-Assistent'}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {locale === 'tr'
                ? 'CSV/XLSX içe aktarma, otomatik sütun eşleme, E.164 normalizasyonu, tekilleştirme ve karantina yönetimi'
                : 'Bulk-Import mit E.164-Normalisierung, Idempotenzprüfung, Dedup und lückenloser Quarantänesicherung'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setActiveTab('IMPORT')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'IMPORT' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import-Assistent</span>
            </button>
            <button
              onClick={() => setActiveTab('QUARANTINE')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'QUARANTINE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Quarantäne</span>
              {quarantineItems.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
                  {quarantineItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === 'IMPORT' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Column: Upload & Configuration */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-600" />
                  <span>1. Zielprojekt wählen</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">
                    Produkt / Kampagne:
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="cccccccc-0000-0000-0000-000000000001">Photovoltaik</option>
                    <option value="cccccccc-0000-0000-0000-000000000002">Wärmepumpe</option>
                    <option value="cccccccc-0000-0000-0000-000000000003">Treppenlift</option>
                    <option value="cccccccc-0000-0000-0000-000000000004">Energieberatung</option>
                    <option value="cccccccc-0000-0000-0000-000000000005">Fenster & Sanierung</option>
                    <option value="cccccccc-0000-0000-0000-000000000006">Strom</option>
                    <option value="cccccccc-0000-0000-0000-000000000007">Gas</option>
                    <option value="cccccccc-0000-0000-0000-000000000008">Pflegebox</option>
                  </select>
                </div>

                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>2. Datei bereitstellen</span>
                </div>

                {/* Dropzone */}
                <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-5 text-center transition bg-slate-50/50 cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">CSV-Datei hier ablegen</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">oder Datei vom Computer wählen</p>
                </div>

                {/* Preset Testing Buttons */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Schnelltests (1-Klick Demo):
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleLoadSample('valid')}
                      className="px-2 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-semibold hover:bg-emerald-100 transition text-center"
                    >
                      Valide Testdaten
                    </button>
                    <button
                      onClick={() => handleLoadSample('malformed')}
                      className="px-2 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-semibold hover:bg-rose-100 transition text-center"
                    >
                      Quarantäne-Testdaten
                    </button>
                  </div>
                </div>
              </div>

              {/* Execution Summary Report Card */}
              {batchResult && (
                <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Import-Ergebnis
                    </span>
                    {batchResult.isDuplicateBatch ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Idempotent (No-Op)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Erfolgreich
                      </span>
                    )}
                  </div>

                  {batchResult.isDuplicateBatch && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Idempotenz-Schutz:</strong> Exakt diese Datei wurde bereits importiert. Es wurden keine doppelten Leads erzeugt.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                      <div className="text-base font-bold text-emerald-700">{batchResult.acceptedRows}</div>
                      <div className="text-[10px] text-emerald-600">Akzeptiert</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                      <div className="text-base font-bold text-amber-700">{batchResult.duplicateRows}</div>
                      <div className="text-[10px] text-amber-600">Duplikate</div>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                      <div className="text-base font-bold text-rose-700">{batchResult.quarantinedRows}</div>
                      <div className="text-[10px] text-rose-600">Quarantäne</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Mapping & Preview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>3. Feldzuordnung (Spalten-Mapping)</span>
                  </div>
                  {previewData && (
                    <span className="text-xs text-slate-500 font-medium">
                      {previewData.totalRows} Zeilen erkannt
                    </span>
                  )}
                </div>

                {previewData ? (
                  <div className="space-y-4">
                    {/* Mapping grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {[
                        { key: 'firstName', label: 'Vorname * (Pflicht)' },
                        { key: 'lastName', label: 'Nachname * (Pflicht)' },
                        { key: 'phone', label: 'Telefonnummer * (Pflicht E.164)' },
                        { key: 'email', label: 'E-Mail' },
                        { key: 'postalCode', label: 'Postleitzahl' },
                        { key: 'city', label: 'Stadt / Ort' },
                        { key: 'source', label: 'Lead-Quelle (Kampagne)' },
                        { key: 'consentText', label: 'Werbeeinwilligung Text (UWG § 7)' },
                      ].map((field) => (
                        <div key={field.key} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200/60">
                          <span className="text-slate-600 font-medium">{field.label}:</span>
                          <select
                            value={mapping[field.key] || ''}
                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                            className="text-xs p-1 bg-white border border-slate-200 rounded font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 max-w-[150px]"
                          >
                            <option value="">-- Nicht zugeordnet --</option>
                            {previewData.headers.map((h) => (
                              <option key={h} value={h}>
                                {h}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Preview Table */}
                    <div className="pt-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Vorschau (Erste 5 Zeilen):
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                              {previewData.headers.map((h) => (
                                <th key={h} className="py-2 px-3 whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {previewData.sampleRows.map((r, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50">
                                {previewData.headers.map((h) => (
                                  <td key={h} className="py-2 px-3 whitespace-nowrap text-slate-700">
                                    {r[h] || '—'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Execute Import Action */}
                    <button
                      onClick={executeImport}
                      disabled={isExecuting || !mapping.firstName || !mapping.lastName || !mapping.phone}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      {isExecuting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Importiere und prüfe Leads...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Import jetzt verbindlich ausführen</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    Laden Sie links eine CSV-Datei hoch oder wählen Sie ein Test-Preset, um die Vorschau anzuzeigen.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Quarantine Tab */
          <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Quarantäne-Speicher (Unvollständige / Fehlerhafte Datensätze)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  SPEC.md Vorgabe: Fehlerhafte Zeilen werden niemals gelöscht, sondern bleiben prüf- und re-importierbar.
                </p>
              </div>

              <button
                onClick={fetchQuarantine}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQuarantine ? 'animate-spin' : ''}`} />
                <span>Aktualisieren</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Zeitpunkt</th>
                    <th className="py-2.5 px-3">Fehlergrund</th>
                    <th className="py-2.5 px-3">Rohdaten</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aktion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quarantineItems.map((item) => (
                    <tr key={item.id} className="hover:bg-rose-50/20">
                      <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                        {new Date(item.created_at).toLocaleString('de-DE')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {item.error_reasons.map((err, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              {err}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 truncate max-w-[280px]">
                        {JSON.stringify(item.raw_data)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded text-xs font-semibold transition"
                        >
                          Korrigieren
                        </button>
                      </td>
                    </tr>
                  ))}

                  {quarantineItems.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Keine Datensätze in Quarantäne. Alle Daten sind sauber!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quarantine Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit className="w-4 h-4 text-sky-600" />
                <span>Quarantäne-Datensatz korrigieren</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Vorname:</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Nachname:</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Telefonnummer:</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="z.B. 0176 1234567"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Einwilligungstext:</label>
                <textarea
                  rows={2}
                  value={editConsentText}
                  onChange={(e) => setEditConsentText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Abbrechen
              </button>
              <button
                onClick={handleReprocessSubmit}
                disabled={isReprocessing || !editFirstName.trim() || !editLastName.trim() || !editPhone.trim()}
                className="px-4 py-1.5 text-xs font-bold bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-50 transition"
              >
                {isReprocessing ? 'Validierung läuft...' : 'Neu validieren & importieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
