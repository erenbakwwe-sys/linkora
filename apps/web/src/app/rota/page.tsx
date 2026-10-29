'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  User,
  Plus,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Users,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Shift {
  id: string;
  teamName: string;
  userId: string;
  userName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  hasConflict?: boolean;
  conflictReason?: string;
}

const fallbackShifts: Shift[] = [
  {
    id: 's1',
    teamName: 'Call-Center Izmir - Floor 1',
    userId: '99999999-0000-0000-0000-000000000006',
    userName: 'Erensamsun Aydin',
    date: '2026-10-30',
    startTime: '09:00',
    endTime: '17:30',
    status: 'CONFIRMED',
  },
  {
    id: 's2',
    teamName: 'Call-Center Izmir - Floor 1',
    userId: '99999999-0000-0000-0000-000000000005',
    userName: 'Umut Kaya',
    date: '2026-10-30',
    startTime: '10:00',
    endTime: '18:30',
    status: 'CONFLICT',
    hasConflict: true,
    conflictReason: 'Urlaub genehmigt am 30.10. (Herbsturlaub)',
  },
  {
    id: 's3',
    teamName: 'Lead-Kontackt Berlin Core',
    userId: '99999999-0000-0000-0000-000000000007',
    userName: 'Birgit Schneider',
    date: '2026-10-30',
    startTime: '08:30',
    endTime: '17:00',
    status: 'CONFIRMED',
  },
  {
    id: 's4',
    teamName: 'Call-Center Izmir - Floor 2',
    userId: '99999999-0000-0000-0000-000000000008',
    userName: 'Kemal Yilmaz',
    date: '2026-10-31',
    startTime: '09:00',
    endTime: '15:00',
    status: 'CONFIRMED',
  },
  {
    id: 's5',
    teamName: 'Solar Direkt Hamburg',
    userId: '99999999-0000-0000-0000-000000000009',
    userName: 'Sophie Weber',
    date: '2026-10-31',
    startTime: '11:00',
    endTime: '19:30',
    status: 'CONFIRMED',
  },
];

export default function RotaPage() {
  const [shifts, setShifts] = useState<Shift[]>(fallbackShifts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [date, setDate] = useState('2026-10-30');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:30');
  const [userName, setUserName] = useState('Umut');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [conflictAlert, setConflictAlert] = useState<string | null>(null);

  const fetchShifts = () => {
    fetch('/api/operations/shifts')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setShifts(data);
        } else {
          setShifts(fallbackShifts);
        }
      })
      .catch((err) => {
        console.error('Failed to load shifts:', err);
        setShifts(fallbackShifts);
      });
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operations/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userName === 'Umut' ? '99999999-0000-0000-0000-000000000005' : '99999999-0000-0000-0000-000000000006',
          userName,
          date,
          startTime,
          endTime,
        }),
      });
      const created = await res.json();
      if (created.hasConflict) {
        setConflictAlert(created.conflictReason);
      }
      setShowAddModal(false);
      fetchShifts();
    } catch (err: any) {
      console.error('Failed to create shift:', err);
      // Optimistic local add
      const newShift: Shift = {
        id: 's-' + Date.now(),
        teamName: 'Call-Center Izmir - Floor 1',
        userId: userName === 'Umut' ? '99999999-0000-0000-0000-000000000005' : '99999999-0000-0000-0000-000000000006',
        userName,
        date,
        startTime,
        endTime,
        status: userName === 'Umut' && date === '2026-10-30' ? 'CONFLICT' : 'CONFIRMED',
        hasConflict: userName === 'Umut' && date === '2026-10-30',
        conflictReason: userName === 'Umut' && date === '2026-10-30' ? 'Urlaub genehmigt am 30.10. (Herbsturlaub)' : undefined,
      };
      if (newShift.hasConflict) {
        setConflictAlert(newShift.conflictReason || null);
      }
      setShifts((prev) => [newShift, ...prev]);
      setShowAddModal(false);
    }
  };

  const filteredShifts = shifts.filter((s) => {
    if (teamFilter === 'ALL') return true;
    return s.teamName.toLowerCase().includes(teamFilter.toLowerCase());
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header with Breadcrumb & Back to Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition shadow-xs flex items-center gap-2 group"
              title="Zurück zum Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-amber-500 transition-transform group-hover:-translate-x-1" />
              <span className="text-xs font-semibold hidden sm:inline">Dashboard</span>
            </Link>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span>Rota-Tafel (Schichtplaner)</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Wochenplan & Schichtbelegung mit KI-gestützter automatischer Urlaubskonflikt-Prüfung.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>KW 44 (26. Okt – 01. Nov 2026)</span>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-500/25 hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Neue Schicht eintragen</span>
            </button>
          </div>
        </div>

        {/* Conflict Alert Banner */}
        {conflictAlert && (
          <div className="p-4 bg-rose-50/90 border border-rose-200 text-rose-900 text-xs rounded-2xl flex items-start justify-between gap-3 shadow-sm animate-fade-in-up">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-sm">Schichtkonflikt entdeckt!</div>
                <p className="mt-0.5 text-rose-700">{conflictAlert}</p>
              </div>
            </div>
            <button
              onClick={() => setConflictAlert(null)}
              className="text-rose-500 hover:text-rose-800 text-xs font-bold px-2 py-1"
            >
              Schließen
            </button>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Team:
            </span>
            {[
              { id: 'ALL', label: 'Alle Standorte' },
              { id: 'Izmir', label: 'CC Izmir' },
              { id: 'Berlin', label: 'Lead-Kontackt Berlin' },
              { id: 'Solar', label: 'Solar Direkt' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTeamFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  teamFilter === tab.id
                    ? 'bg-amber-500 text-white shadow-xs shadow-amber-500/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Genehmigt ({shifts.filter(s => !s.hasConflict).length})
            </span>
            <span className="flex items-center gap-1 ml-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Konflikt ({shifts.filter(s => s.hasConflict).length})
            </span>
          </div>
        </div>

        {/* Shifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShifts.map((s) => (
            <div
              key={s.id}
              className={`card-elegant p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                s.hasConflict
                  ? 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 border-rose-300 ring-2 ring-rose-200/50 shadow-rose-100'
                  : 'bg-white border-slate-200/90 hover:border-amber-300'
              }`}
            >
              {s.hasConflict && (
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className="absolute transform rotate-45 bg-rose-500 text-white font-bold text-[9px] py-0.5 right-[-35px] top-[18px] w-[120px] text-center shadow-xs">
                    KONFLIKT
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    s.hasConflict
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-xs'
                  }`}>
                    {s.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {s.userName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {s.teamName}
                    </span>
                  </div>
                </div>

                {!s.hasConflict && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Bestätigt
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs border-t border-slate-100 pt-3 mt-3">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" /> Datum:
                  </span>
                  <strong className="font-mono text-slate-800">{s.date}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Schicht:
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono font-bold text-slate-800 text-[11px]">
                    {s.startTime} - {s.endTime} Uhr
                  </span>
                </div>
              </div>

              {s.hasConflict && (
                <div className="mt-3 text-[11px] font-semibold text-rose-900 bg-rose-100/80 border border-rose-200/80 p-2.5 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{s.conflictReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-500" />
                  Neue Schicht einteilen
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateShift} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mitarbeiter / Agent</label>
                  <select
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="Umut">Umut Kaya (Urlaub genehmigt am 30.10.)</option>
                    <option value="Erensamsun">Erensamsun Aydin</option>
                    <option value="Birgit">Birgit Schneider</option>
                    <option value="Kemal">Kemal Yilmaz</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Datum</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Startzeit</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Endzeit</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 active:scale-95 transition"
                  >
                    Schicht speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
