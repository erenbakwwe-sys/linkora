'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import Link from 'next/link';
import {
  Network,
  Building,
  PlusCircle,
  Check,
  ArrowLeft,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  Users,
  Percent,
} from 'lucide-react';

interface SubCompany {
  id: string;
  name: string;
  revenueSharePercent: number;
  adminUsername: string;
  userCount: number;
  status: 'Aktiv' | 'Deaktiviert';
  createdAt: string;
}

export default function CompanyManagementPage() {
  const [subCompanies, setSubCompanies] = useState<SubCompany[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for "Unterfirma hinzufügen"
  const [name, setName] = useState('');
  const [revenueShare, setRevenueShare] = useState('70');
  const [adminUsername, setAdminUsername] = useState('');
  const [password, setPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal State
  const [editingSub, setEditingSub] = useState<SubCompany | null>(null);
  const [editName, setEditName] = useState('');
  const [editRevenueShare, setEditRevenueShare] = useState('70');
  const [editAdmin, setEditAdmin] = useState('');
  const [editStatus, setEditStatus] = useState<'Aktiv' | 'Deaktiviert'>('Aktiv');
  const [editLoading, setEditLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tenants/sub-companies');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setSubCompanies(data);
        }
      }
    } catch (err) {
      console.error('Failed to load sub-companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubCompanies();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Create Sub-company
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !adminUsername.trim()) return;

    try {
      setCreateLoading(true);
      const res = await fetch('/api/tenants/sub-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          revenueSharePercent: Number(revenueShare) || 70,
          adminUsername: adminUsername.trim(),
          password: password.trim() || undefined,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setSubCompanies((prev) => [created, ...prev]);
        setName('');
        setRevenueShare('70');
        setAdminUsername('');
        setPassword('');
        showToast(`Unterfirma "${created.name}" erfolgreich erstellt!`);
      }
    } catch (err) {
      console.error('Failed to create subcompany:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (sub: SubCompany) => {
    setEditingSub(sub);
    setEditName(sub.name);
    setEditRevenueShare(String(sub.revenueSharePercent));
    setEditAdmin(sub.adminUsername);
    setEditStatus(sub.status);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    try {
      setEditLoading(true);
      const res = await fetch(`/api/tenants/sub-companies/${editingSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          revenueSharePercent: Number(editRevenueShare) || 70,
          adminUsername: editAdmin.trim(),
          status: editStatus,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSubCompanies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        setEditingSub(null);
        showToast(`Unterfirma "${updated.name}" aktualisiert!`);
      }
    } catch (err) {
      console.error('Failed to update subcompany:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Subcompany
  const handleDelete = async (id: string, subName: string) => {
    if (!confirm(`Möchten Sie die Unterfirma "${subName}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/tenants/sub-companies/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubCompanies((prev) => prev.filter((s) => s.id !== id));
        setEditingSub(null);
        showToast(`Unterfirma "${subName}" wurde gelöscht.`);
      }
    } catch (err) {
      console.error('Failed to delete subcompany:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-5 max-w-7xl mx-auto select-none">
        {/* Toast Alert */}
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
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <Network className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-white tracking-tight">
                  Firmenverwaltung
                </h1>
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                  Hauptfirma
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Calendra — von Ihnen hinzugefügte Unterfirmen (arbeiten mit eigenen Agenten/Teams/Kassen)
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 self-start sm:self-auto relative z-10 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* 2. Blue Info Banner */}
        <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-blue-900 leading-relaxed shadow-xs">
          Alt-firmanın getirdiği müşterilerden <strong className="font-bold text-blue-950">size düşen pay</strong> automatisch hesaplanır ve <strong className="font-bold text-blue-950">Kasse</strong> sayfanızda görünür. Alt-firmanın kendi gelir yüzdesini aşağıdan belirlersiniz.
        </div>

        {/* 3. Card: Unterfirma hinzufügen */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <PlusCircle className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Unterfirma hinzufügen
            </h3>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Firmenname */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Firmenname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Umsatz % */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Umsatz %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={revenueShare}
                  onChange={(e) => setRevenueShare(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Admin-Benutzername */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Admin-Benutzername
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder=""
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* Passwort */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Passwort
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={createLoading || !name.trim() || !adminUsername.trim()}
              className="px-5 py-2.5 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Unterfirma erstellen</span>
            </button>
          </form>
        </div>

        {/* 4. Card: Meine Unterfirmen (X) */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Meine Unterfirmen ({subCompanies.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">FIRMA</th>
                  <th className="py-3 px-4">UMSATZ %</th>
                  <th className="py-3 px-4">ADMINISTRATOR</th>
                  <th className="py-3 px-4">BENUTZER</th>
                  <th className="py-3 px-4 text-right">BEARBEITEN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {subCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate-400 font-medium">
                      Noch keine Unterfirmen.
                    </td>
                  </tr>
                ) : (
                  subCompanies.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-amber-500" />
                          <span>{sub.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {sub.revenueSharePercent}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {sub.adminUsername}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {sub.userCount} Benutzer
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                          title="Unterfirma bearbeiten"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EDIT SUBCOMPANY MODAL                                    */}
        {/* ======================================================== */}
        {editingSub && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-black text-slate-900">
                    Unterfirma bearbeiten
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Firmenname
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Umsatz %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editRevenueShare}
                    onChange={(e) => setEditRevenueShare(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Administrator Benutzername
                  </label>
                  <input
                    type="text"
                    value={editAdmin}
                    onChange={(e) => setEditAdmin(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Aktiv">Aktiv</option>
                    <option value="Deaktiviert">Deaktiviert</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDelete(editingSub.id, editingSub.name)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Löschen</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingSub(null)}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition"
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
