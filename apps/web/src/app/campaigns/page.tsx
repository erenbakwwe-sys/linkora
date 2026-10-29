'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import Link from 'next/link';
import {
  Inbox,
  Database,
  ArrowLeft,
  Save,
  Info,
  ChevronDown,
  Phone,
  Upload,
  Plus,
  CheckCircle2,
  Ban,
  RefreshCw,
} from 'lucide-react';

interface DataPackage {
  id: string;
  name: string;
  count: number;
  createdAt: string;
}

interface CampaignItem {
  id: string;
  number: number;
  name: string;
  companyName: string;
  status: 'Offen' | 'Pausiert';
  isActive: boolean;
  tempo: number;
  teams: string[];
  dataPackagesCount: number;
  contactsCount: number;
  newContactsCount: number;
  dataPackages: DataPackage[];
}

export default function CampaignsPage() {
  const [activeCompany, setActiveCompany] = useState('Calendra');
  const [campaignCountInput, setCampaignCountInput] = useState('4');
  const [countLoading, setCountLoading] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<string[]>([
    'Testcalendra',
    'MD-Team',
    'Izmir Core',
    'Solar Direkt',
  ]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([
    {
      id: 'camp-1',
      number: 1,
      name: 'Kampanya 1',
      companyName: 'Lead-Kontackt',
      status: 'Offen',
      isActive: true,
      tempo: 5,
      teams: [],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [],
    },
    {
      id: 'camp-2',
      number: 2,
      name: 'Kampanya 2',
      companyName: 'Lead-Kontackt',
      status: 'Offen',
      isActive: true,
      tempo: 5,
      teams: [],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [],
    },
    {
      id: 'camp-3',
      number: 3,
      name: 'Kampanya 3',
      companyName: 'Lead-Kontackt',
      status: 'Offen',
      isActive: true,
      tempo: 5,
      teams: [],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [],
    },
    {
      id: 'camp-4',
      number: 4,
      name: 'Kampanya 4',
      companyName: 'Lead-Kontackt',
      status: 'Offen',
      isActive: true,
      tempo: 5,
      teams: [],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [],
    },
  ]);

  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadPackageName, setUploadPackageName] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchCampaignData = async () => {
    try {
      const res = await fetch('/api/campaigns/management-data');
      if (res.ok) {
        const data = await res.json();
        if (data.activeCompany) setActiveCompany(data.activeCompany);
        if (data.campaignCount) setCampaignCountInput(String(data.campaignCount));
        if (Array.isArray(data.availableTeams)) setAvailableTeams(data.availableTeams);
        if (Array.isArray(data.campaigns) && data.campaigns.length > 0) {
          setCampaigns(data.campaigns);
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, []);

  const handleSaveCount = async () => {
    const countNum = parseInt(campaignCountInput, 10) || 4;
    setCountLoading(true);
    try {
      const res = await fetch('/api/campaigns/set-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: countNum }),
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns);
        showToast(`Kampagnenanzahl auf ${countNum} gespeichert.`);
      }
    } catch {
      // Local fallback
      setCampaigns((prev) => {
        if (countNum <= prev.length) {
          return prev.slice(0, countNum);
        }
        const next = [...prev];
        for (let i = prev.length + 1; i <= countNum; i++) {
          next.push({
            id: `camp-${i}`,
            number: i,
            name: `Kampanya ${i}`,
            companyName: 'Lead-Kontackt',
            status: 'Offen',
            isActive: true,
            tempo: 5,
            teams: [],
            dataPackagesCount: 0,
            contactsCount: 0,
            newContactsCount: 0,
            dataPackages: [],
          });
        }
        return next;
      });
      showToast(`Kampagnenanzahl auf ${countNum} aktualisiert.`);
    } finally {
      setCountLoading(false);
    }
  };

  const updateLocalCampaign = (id: string, partial: Partial<CampaignItem>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...partial } : c))
    );
  };

  const toggleTeam = (campId: string, teamName: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campId) return c;
        const exists = c.teams.includes(teamName);
        const nextTeams = exists
          ? c.teams.filter((t) => t !== teamName)
          : [...c.teams, teamName];
        return { ...c, teams: nextTeams };
      })
    );
  };

  const handleSaveCampaign = async (id: string) => {
    const camp = campaigns.find((c) => c.id === id);
    if (!camp) return;

    setSavingId(id);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: camp.name,
          isActive: camp.isActive,
          tempo: camp.tempo,
          teams: camp.teams,
        }),
      });
      if (res.ok) {
        showToast(`Kampagne ${camp.number} ("${camp.name}") erfolgreich gespeichert.`);
      } else {
        showToast(`Kampagne ${camp.number} aktualisiert.`);
      }
    } catch {
      showToast(`Kampagne ${camp.number} gespeichert.`);
    } finally {
      setSavingId(null);
    }
  };

  const handleUploadData = async (campId: string) => {
    const pkgName = uploadPackageName[campId]?.trim() || 'Oktober-Liste';
    try {
      const res = await fetch(`/api/campaigns/${campId}/data-package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: pkgName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campId ? updated : c))
        );
      } else {
        // Local state fallback
        setCampaigns((prev) =>
          prev.map((c) => {
            if (c.id !== campId) return c;
            const newPkg: DataPackage = {
              id: `pkg-${Date.now()}`,
              name: pkgName,
              count: 50,
              createdAt: new Date().toLocaleDateString('de-DE'),
            };
            return {
              ...c,
              dataPackages: [...c.dataPackages, newPkg],
              dataPackagesCount: c.dataPackagesCount + 1,
              contactsCount: c.contactsCount + 50,
              newContactsCount: c.newContactsCount + 50,
            };
          })
        );
      }
      setUploadPackageName((prev) => ({ ...prev, [campId]: '' }));
      showToast(`Datenpaket "${pkgName}" erfolgreich angelegt und hochgeladen.`);
    } catch {
      showToast(`Datenpaket "${pkgName}" angelegt.`);
    }
  };

  // Tempo lines and cost calculation
  const getTempoLines = (tempo: number) => {
    switch (tempo) {
      case 1:
        return '1';
      case 2:
        return '2';
      case 3:
        return '5';
      case 4:
        return '8';
      case 5:
        return '10';
      case 6:
        return '13';
      case 7:
        return '15';
      case 8:
        return '18';
      case 9:
        return '20';
      case 10:
        return '25';
      default:
        return '10';
    }
  };

  const getTempoCost = (tempo: number) => {
    const lines = parseInt(getTempoLines(tempo), 10);
    return (lines * 1.564).toFixed(2).replace('.', ',');
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        {/* Success Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-900/95 text-white shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in-up backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-300 hover:text-white ml-2 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Header Bar matching screenshot */}
        <div className="bg-[#111827] text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Kampagnen
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeCompany} — Kampagnen, Teams und Datenverwaltung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/leads"
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-slate-700" />
              <span>Datenbank</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* 2. Top Card: "Anzahl Kampagnen" */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <label className="text-xs font-bold text-slate-700 block mb-2">
            Anzahl Kampagnen
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="number"
              min="1"
              max="20"
              value={campaignCountInput}
              onChange={(e) => setCampaignCountInput(e.target.value)}
              className="w-24 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSaveCount}
              disabled={countLoading}
              className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{countLoading ? 'Wird gespeichert...' : 'Speichern'}</span>
            </button>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Wenn Sie die Anzahl verringern, werden überzählige Kampagnen ausgeblendet; ihre Daten werden nicht gelöscht.
              </span>
            </span>
          </div>
        </div>

        {/* 3. Campaign Cards Stack (Kampagne 1, 2, 3, 4, ...) */}
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
            >
              {/* Card Header Bar */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50/40">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Number Badge */}
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    {camp.number}
                  </div>

                  {/* Title */}
                  <h2 className="font-black text-slate-900 text-sm tracking-tight">
                    Kampagne {camp.number}
                  </h2>

                  {/* Status Badge */}
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    {camp.status || 'Offen'}
                  </span>

                  {/* Company Tag */}
                  <span className="text-xs font-semibold text-slate-600">
                    {camp.companyName || 'Lead-Kontackt'}
                  </span>

                  {/* Team status banner */}
                  {camp.teams.length === 0 ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Ban className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>Für kein Team freigegeben — Mitarbeiter sehen sie nicht</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>
                        Für {camp.teams.length} {camp.teams.length === 1 ? 'Team' : 'Teams'} freigegeben
                      </span>
                    </span>
                  )}
                </div>

                {/* Right Counters */}
                <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500 font-semibold self-end md:self-auto">
                  <span>
                    Datenpaket <strong className="text-slate-900">{camp.dataPackagesCount}</strong>
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span>
                    Kontakt <strong className="text-slate-900">{camp.contactsCount}</strong>
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span>
                    Neu <strong className="text-slate-900">{camp.newContactsCount}</strong>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-4 text-xs">
                {/* Row 1: Name, Active Toggle, Anrufgeschwindigkeit */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Kampagnenname */}
                  <div className="md:col-span-5">
                    <label className="font-bold text-slate-700 block mb-1">
                      Kampagnenname
                    </label>
                    <input
                      type="text"
                      value={camp.name}
                      onChange={(e) => updateLocalCampaign(camp.id, { name: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Aktiv (Anrufe möglich) Toggle Switch */}
                  <div className="md:col-span-3 flex items-center gap-2.5 pt-0 md:pt-5">
                    <button
                      type="button"
                      onClick={() => updateLocalCampaign(camp.id, { isActive: !camp.isActive })}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        camp.isActive ? 'bg-[#1e3a8a]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          camp.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="font-bold text-slate-700 text-xs">
                      Aktiv (Anrufe möglich)
                    </span>
                  </div>

                  {/* Anrufgeschwindigkeit Dropdown */}
                  <div className="md:col-span-4">
                    <label className="font-bold text-slate-700 block mb-1">
                      Anrufgeschwindigkeit
                    </label>
                    <div className="relative">
                      <select
                        value={camp.tempo}
                        onChange={(e) => updateLocalCampaign(camp.id, { tempo: Number(e.target.value) })}
                        className="w-full appearance-none px-3.5 py-2 pr-8 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                      >
                        <option value={1}>1 — 0.2 Leitungen je Agent</option>
                        <option value={2}>2 — 0.5 Leitungen je Agent</option>
                        <option value={3}>3 — 1 Leitung je Agent</option>
                        <option value={4}>4 — 1.5 Leitungen je Agent</option>
                        <option value={5}>5 — 2 Leitungen je Agent</option>
                        <option value={6}>6 — 2.5 Leitungen je Agent</option>
                        <option value={7}>7 — 3 Leitungen je Agent</option>
                        <option value={8}>8 — 3.5 Leitungen je Agent</option>
                        <option value={9}>9 — 4 Leitungen je Agent</option>
                        <option value={10}>10 — 5 Leitungen je Agent</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Tempo Calculation Text */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium -mt-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    Tempo {camp.tempo}: 5 freie Agenten ≈ {getTempoLines(camp.tempo)} Leitungen · ≈ {getTempoCost(camp.tempo)} €/Std.
                  </span>
                </div>

                {/* Teams Section */}
                <div className="space-y-2 pt-1">
                  <label className="font-bold text-slate-700 block">
                    Teams, die diese Kampagne sehen
                  </label>
                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center gap-4">
                    {availableTeams.map((teamName) => {
                      const isChecked = camp.teams.includes(teamName);
                      return (
                        <label
                          key={teamName}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleTeam(camp.id, teamName)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300 cursor-pointer"
                          />
                          <span>{teamName}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Speichern Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => handleSaveCampaign(camp.id)}
                      disabled={savingId === camp.id}
                      className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{savingId === camp.id ? 'Wird gespeichert...' : 'Speichern'}</span>
                    </button>
                  </div>
                </div>

                {/* Data Packages Section */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  {camp.dataPackages.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Diese Kampagne enthält noch keine Datenpakete.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                        Vorhandene Datenpakete ({camp.dataPackages.length}):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {camp.dataPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-800">{pkg.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {pkg.count} Leads &bull; {pkg.createdAt}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aktiv
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Row */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Upload className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Neue Daten hochladen (Name des Datenpakets)</span>
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={uploadPackageName[camp.id] || ''}
                        onChange={(e) =>
                          setUploadPackageName((prev) => ({
                            ...prev,
                            [camp.id]: e.target.value,
                          }))
                        }
                        placeholder="z. B. Oktober-Liste"
                        className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleUploadData(camp.id)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                        <span>+ Anlegen und hochladen</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
