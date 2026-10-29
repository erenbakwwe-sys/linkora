'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Clock,
  Play,
  Square,
  CheckCircle2,
  Calendar,
  User,
  Coffee,
} from 'lucide-react';

interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  clockIn: string;
  clockOut?: string;
  breakMinutes: number;
  totalMinutes?: number;
  status: string;
  approvedBy?: string;
}

export default function HrTimePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

  const fetchEntries = () => {
    fetch('http://localhost:3001/api/operations/hr-time')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEntries(data);
          const active = data.find((d) => d.status === 'ACTIVE' && d.userName === 'Umut');
          setIsClockedIn(!!active);
          setActiveEntry(active || null);
        }
      })
      .catch((err) => console.error('Failed to load HR times:', err));
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleClockIn = async () => {
    try {
      await fetch('http://localhost:3001/api/operations/hr-time/clock-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '99999999-0000-0000-0000-000000000005', userName: 'Umut' }),
      });
      fetchEntries();
    } catch (err: any) {
      console.error('Error clock in:', err);
    }
  };

  const handleClockOut = async () => {
    try {
      await fetch('http://localhost:3001/api/operations/hr-time/clock-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '99999999-0000-0000-0000-000000000005', breakMinutes: 30 }),
      });
      fetchEntries();
    } catch (err: any) {
      console.error('Error clock out:', err);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/operations/hr-time/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      fetchEntries();
    } catch (err: any) {
      console.error('Error approve:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-cyan-500" />
            HR-Zeit (Arbeitszeiterfassung & Stempeluhr)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rechtskonforme Erfassung von Beginn, Ende und Pausenzeiten, verknüpft mit Telefondienst und
            Vorgesetztenfreigabe.
          </p>
        </div>

        {/* Big Clock In / Clock Out Action Button */}
        <div>
          {isClockedIn ? (
            <button
              onClick={handleClockOut}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              Jetzt Ausstempeln (Pause 30m)
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              Jetzt Einstempeln
            </button>
          )}
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Zeiterfassungen ({entries.length})</h2>
          <span className="text-xs text-slate-500">Automatische Verknüpfung mit Telefonie</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Mitarbeiter</th>
                <th className="py-3 px-4">Kommen</th>
                <th className="py-3 px-4">Gehen</th>
                <th className="py-3 px-4">Pause</th>
                <th className="py-3 px-4">Arbeitszeit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Freigabe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{entry.userName}</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    {new Date(entry.clockIn).toLocaleTimeString('de-DE')}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('de-DE') : '— (Aktiv)'}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{entry.breakMinutes} Min.</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {entry.totalMinutes
                      ? `${Math.floor(entry.totalMinutes / 60)}h ${entry.totalMinutes % 60}m`
                      : 'Wird erfasst...'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        entry.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {entry.status === 'APPROVED' ? 'Genehmigt' : entry.status === 'ACTIVE' ? 'Aktiv am Telefon' : 'Offen'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {entry.status === 'PENDING' ? (
                      <button
                        onClick={() => handleApprove(entry.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                      >
                        Freigeben
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {entry.approvedBy ? `Freigegeben von ${entry.approvedBy}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
