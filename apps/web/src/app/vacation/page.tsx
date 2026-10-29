'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  User,
  Clock,
} from 'lucide-react';

interface LeaveItem {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason?: string;
  status: string;
}

export default function VacationPage() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-18');
  const [leaveType, setLeaveType] = useState('URLAUB');
  const [reason, setReason] = useState('Erholungsurlaub');

  const fetchLeaves = () => {
    fetch('/api/operations/vacation')
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setLeaves(d);
      })
      .catch((err) => console.error('Failed to load leaves:', err));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/operations/vacation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '99999999-0000-0000-0000-000000000006',
          userName: 'Erensamsun',
          startDate,
          endDate,
          leaveType,
          reason,
        }),
      });
      fetchLeaves();
    } catch (err: any) {
      console.error('Failed submit leave:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await fetch(`/api/operations/vacation/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchLeaves();
    } catch (err: any) {
      console.error('Failed update leave:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Calendar className="w-7 h-7 text-amber-500" />
            Urlaubsverwaltung & Abwesenheiten
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Urlaubsanträge erfassen und freigeben. Genehmigte Abwesenheiten sperren Schichtzuweisungen in der Rota-Tafel.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Form */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Urlaubsantrag stellen</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mitarbeiter</label>
              <input
                type="text"
                disabled
                value="Erensamsun (Agent)"
                className="w-full border rounded-lg p-2 bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Art der Abwesenheit</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="URLAUB">Erholungsurlaub</option>
                <option value="SONDERURLAUB">Sonderurlaub</option>
                <option value="KRANK">Krankmeldung</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Von</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bis</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Bemerkung</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
            >
              Antrag einreichen
            </button>
          </form>
        </div>

        {/* Right: Vacation Requests List */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Eingereichte Anträge ({leaves.length})</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {leaves.map((leave) => (
              <div key={leave.id} className="p-4 flex items-center justify-between hover:bg-slate-50/70">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{leave.userName}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 font-semibold">{leave.leaveType}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        leave.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : leave.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {leave.status === 'APPROVED' ? 'Genehmigt' : leave.status === 'REJECTED' ? 'Abgelehnt' : 'Ausstehend'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>
                      {leave.startDate} bis {leave.endDate}
                    </span>
                    {leave.reason && <span>• "{leave.reason}"</span>}
                  </div>
                </div>

                {leave.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                      className="px-2.5 py-1 text-xs border border-rose-300 text-rose-700 hover:bg-rose-50 rounded font-semibold"
                    >
                      Ablehnen
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                      className="px-3 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold"
                    >
                      Genehmigen
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
