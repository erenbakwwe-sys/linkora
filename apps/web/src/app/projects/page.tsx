'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import Link from 'next/link';
import {
  FolderKanban,
  Building,
  Users,
  CheckCircle2,
  PlusCircle,
  Globe,
  BarChart2,
  ArrowLeft,
  X,
  Info,
  Check,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface ProjectTypeItem {
  id: string;
  name: string;
  isGlobal: boolean;
}

interface LeadStatItem {
  name: string;
  count: number;
  percentage: number;
}

export default function ProjectsPage() {
  const [activeCompany, setActiveCompany] = useState('Calendra');
  const [activeProjectTypes, setActiveProjectTypes] = useState<ProjectTypeItem[]>([]);
  const [availableGlobalTypes, setAvailableGlobalTypes] = useState<string[]>([]);
  const [teamDistribution, setTeamDistribution] = useState<Record<string, string[]>>({});
  const [leadStats, setLeadStats] = useState<{
    totalLeads: number;
    companyName: string;
    items: LeadStatItem[];
  }>({
    totalLeads: 469,
    companyName: 'Calendra',
    items: [
      { name: 'PV-DAA', count: 1, percentage: 0.2 },
      { name: 'Treppenlift-Aroundhome', count: 396, percentage: 84.4 },
      { name: 'Treppenlift-Leadnavigator', count: 0, percentage: 0 },
      { name: 'Treppenlift-Leadnodes', count: 3, percentage: 0.6 },
      { name: 'WP-Aroundhome', count: 1, percentage: 0.2 },
    ],
  });

  // Selected Team for Assignment
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [teamAssignedTypes, setTeamAssignedTypes] = useState<string[]>([]);

  // Add Custom Project Type Form
  const [customName, setCustomName] = useState('');
  const [customLoading, setCustomLoading] = useState(false);

  // Selected Global Types for Activation
  const [selectedGlobalToActivate, setSelectedGlobalToActivate] = useState<string[]>([]);
  const [activateLoading, setActivateLoading] = useState(false);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchManagementData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/projects/management-data');
      if (res.ok) {
        const data = await res.json();
        setActiveCompany(data.activeCompany || 'Calendra');
        setActiveProjectTypes(data.activeProjectTypes || []);
        setAvailableGlobalTypes(data.availableGlobalTypes || []);
        setTeamDistribution(data.teamDistribution || {});
        if (data.leadStats) {
          setLeadStats(data.leadStats);
        }
      }
    } catch (err) {
      console.error('Failed to load project management data:', err);
    }
  };

  useEffect(() => {
    fetchManagementData();
  }, []);

  // Update team assignment selection when team changes
  useEffect(() => {
    if (selectedTeam && teamDistribution[selectedTeam]) {
      setTeamAssignedTypes(teamDistribution[selectedTeam]);
    } else {
      setTeamAssignedTypes([]);
    }
  }, [selectedTeam, teamDistribution]);

  // Toggle project assignment for selected team
  const toggleTeamAssignment = (projId: string) => {
    setTeamAssignedTypes((prev) =>
      prev.includes(projId) ? prev.filter((id) => id !== projId) : [...prev, projId]
    );
  };

  // Save Team Assignment
  const saveTeamAssignment = async () => {
    if (!selectedTeam) return;
    try {
      const res = await fetch('http://localhost:3001/api/projects/assign-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: selectedTeam,
          projectIds: teamAssignedTypes,
        }),
      });
      if (res.ok) {
        setTeamDistribution((prev) => ({
          ...prev,
          [selectedTeam]: teamAssignedTypes,
        }));
        showToast(`Projekttypen für Team "${selectedTeam}" erfolgreich gespeichert!`);
      }
    } catch (err) {
      console.error('Failed to save team assignment:', err);
    }
  };

  // Deactivate Project Type (Remove from active list)
  const handleDeactivate = async (id: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/projects/types/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActiveProjectTypes((prev) => prev.filter((p) => p.id !== id));
        showToast(`Projekttyp "${name}" wurde deaktiviert.`);
      }
    } catch (err) {
      console.error('Failed to deactivate project type:', err);
    }
  };

  // Add Firmeneigenen Projekttyp
  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    try {
      setCustomLoading(true);
      const res = await fetch('http://localhost:3001/api/projects/add-custom-type', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customName.trim() }),
      });
      if (res.ok) {
        const added = await res.json();
        setActiveProjectTypes((prev) => [...prev, added]);
        setCustomName('');
        showToast(`Firmeneigener Projekttyp "${added.name}" hinzugefügt!`);
      }
    } catch (err) {
      console.error('Failed to add custom type:', err);
    } finally {
      setCustomLoading(false);
    }
  };

  // Toggle selection for global activation
  const toggleGlobalCheckbox = (name: string) => {
    setSelectedGlobalToActivate((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Activate selected global types
  const handleActivateGlobals = async () => {
    if (selectedGlobalToActivate.length === 0) return;

    try {
      setActivateLoading(true);
      const res = await fetch('http://localhost:3001/api/projects/activate-global-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: selectedGlobalToActivate }),
      });
      if (res.ok) {
        const addedList = await res.json();
        if (Array.isArray(addedList)) {
          setActiveProjectTypes((prev) => [...prev, ...addedList]);
        }
        showToast(`${selectedGlobalToActivate.length} globale Projekttypen wurden aktiviert!`);
        setSelectedGlobalToActivate([]);
        fetchManagementData();
      }
    } catch (err) {
      console.error('Failed to activate global types:', err);
    } finally {
      setActivateLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto select-none">
        {/* Success Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-900/95 text-white shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in-up backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-300 hover:text-white ml-2 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Header Bar matching screenshot */}
        <div className="bg-[#111827] text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-400/20">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Projektmanagement
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Verwalten Sie die Projekttypen Ihrer Firma - Ihre eigenen Projekte sind nur für Sie sichtbar
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Zurück zum Dashboard</span>
          </Link>
        </div>

        {/* 2. Aktuelle Firma Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Aktuelle Firma</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Sie verwalten aktuell: <strong className="text-slate-900">{activeCompany}</strong>
            </div>
          </div>
        </div>

        {/* 3. Top Row: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (5 cols): Projekttypen an Teams verteilen */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Projekttypen an Teams verteilen
                </h3>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Team auswählen
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                >
                  <option value="">-- Team wählen --</option>
                  <option value="MD-Team">MD-Team</option>
                  <option value="Testcalendra">Testcalendra</option>
                  <option value="Izmir Core">Izmir Core</option>
                  <option value="Solar Direkt">Solar Direkt</option>
                </select>
              </div>

              {selectedTeam ? (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Zugeordnete Projekttypen für {selectedTeam}:
                  </span>
                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {activeProjectTypes.map((p) => {
                      const isAssigned = teamAssignedTypes.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition ${
                            isAssigned
                              ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900 font-bold'
                              : 'bg-slate-50/50 border-slate-200/70 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="truncate">{p.name} {p.isGlobal ? '(global)' : '(firmeneigen)'}</span>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => toggleTeamAssignment(p.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={saveTeamAssignment}
                    className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Zuweisung für dieses Team speichern</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 text-center">
                  Wählen Sie oben ein Team aus, um aktive Projekttypen zuzuweisen.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Aktive Projekttypen + Firmeneigenen hinzufügen */}
          <div className="lg:col-span-7 space-y-5">
            {/* Card: Aktive Projekttypen für Ihre Firma */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Aktive Projekttypen für Ihre Firma
                </h3>
              </div>

              {/* Badges List matching screenshot purple badges */}
              <div className="flex flex-wrap gap-2.5">
                {activeProjectTypes.map((item) => (
                  <div
                    key={item.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-2 transition duration-200 hover:shadow-md ${
                      item.isGlobal
                        ? 'bg-[#7c3aed]'
                        : 'bg-emerald-600'
                    }`}
                  >
                    <span>
                      {item.name} {item.isGlobal ? '(global)' : '(firmeneigen)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeactivate(item.id, item.name)}
                      className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] transition active:scale-90"
                      title="Projekttyp deaktivieren"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer info note with green and blue dots */}
              <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong className="text-emerald-600">• Eigene Projekte</strong> sind nur für Ihre Firma sichtbar.{' '}
                  <strong className="text-blue-600">• Globale Projekte</strong> können von allen Firmen verwendet werden.
                </span>
              </div>
            </div>

            {/* Card: Neuen firmeneigenen Projekttyp hinzufügen */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <PlusCircle className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Neuen firmeneigenen Projekttyp hinzufügen
                </h3>
              </div>

              <form onSubmit={handleAddCustom} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Projekttyp Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Name des neuen firmeneigenen Projekttyps..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Dieser Projekttyp ist <strong className="text-slate-600">nur für Ihre Firma sichtbar</strong> und wird anderen Firmen nicht angezeigt.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={customLoading || !customName.trim()}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Firmeneigenen Projekttyp hinzufügen</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 4. Full Width Card: Globale Projekttypen aktivieren */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Globale Projekttypen aktivieren
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verfügbare globale Projekttypen auswählen
            </p>
          </div>

          {/* Multi-column checkbox grid matching screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {availableGlobalTypes.map((item) => {
              const isChecked = selectedGlobalToActivate.includes(item);
              const isAlreadyActive = activeProjectTypes.some(
                (p) => p.name.toLowerCase() === item.toLowerCase()
              );

              return (
                <label
                  key={item}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border transition cursor-pointer ${
                    isAlreadyActive
                      ? 'bg-slate-50/50 border-slate-200 text-slate-400 cursor-default'
                      : isChecked
                      ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isAlreadyActive || isChecked}
                    disabled={isAlreadyActive}
                    onChange={() => !isAlreadyActive && toggleGlobalCheckbox(item)}
                    className="rounded text-blue-600 focus:ring-blue-500 shrink-0"
                  />
                  <span className="truncate text-[11px]">
                    {item} <span className="text-[10px] text-slate-400">(global)</span>
                  </span>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleActivateGlobals}
            disabled={activateLoading || selectedGlobalToActivate.length === 0}
            className="w-full py-3 bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 active:scale-95 transition cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>✓ Ausgewählte globale Projekttypen aktivieren ({selectedGlobalToActivate.length})</span>
          </button>
        </div>

        {/* 5. Full Width Card: Verteilung der aktiven Projekttypen */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart2 className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Verteilung der aktiven Projekttypen
            </h3>
          </div>

          {/* Info Banner */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-blue-900 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <strong className="font-bold">Nur Daten Ihrer Firma:</strong> Diese Statistik zeigt ausschließlich die Leads Ihrer eigenen Firma.
            </div>
          </div>

          {/* Distribution Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">PROJEKTTYP</th>
                  <th className="py-3 px-4 text-right">ANZAHL LEADS</th>
                  <th className="py-3 px-6 w-1/2">ANTEIL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leadStats.items.map((stat) => (
                  <tr key={stat.name} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {stat.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">
                      {stat.count}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="w-full bg-slate-100 rounded-full h-5 p-0.5 overflow-hidden">
                        {stat.percentage > 0 ? (
                          <div
                            className="bg-[#2563eb] h-full rounded-full text-white text-[10px] font-bold flex items-center justify-center transition-all duration-500"
                            style={{ width: `${Math.max(stat.percentage, 10)}%` }}
                          >
                            {stat.percentage}%
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 pl-2 font-mono">
                            0%
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Total Row matching screenshot */}
                <tr className="bg-slate-50/80 font-black border-t-2 border-slate-200">
                  <td className="py-3.5 px-4 text-slate-900 text-sm">
                    Gesamt
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-900 text-sm text-right">
                    {leadStats.totalLeads}
                  </td>
                  <td className="py-3.5 px-6">
                    <div className="w-full bg-emerald-600 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      100%
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>
              Statistik basierend auf {leadStats.totalLeads} Leads Ihrer Firma &ldquo;{leadStats.companyName}&rdquo;
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
