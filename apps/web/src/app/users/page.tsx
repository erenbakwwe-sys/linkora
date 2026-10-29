'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Pencil,
  Phone,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Building,
  Plus,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  X,
  AlertCircle,
} from 'lucide-react';

interface UserItem {
  id: string;
  userNumber: string;
  username: string;
  name: string;
  email: string;
  role: 'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer';
  team: string;
  isActive: boolean;
  callerIdNumber: string | null;
  lastLogin: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [freeNumbers, setFreeNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState<'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer'>('Firmen-Admin');
  const [editTeam, setEditTeam] = useState('—');
  const [editCallerId, setEditCallerId] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editNewPassword, setEditNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // New User Modal State
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Firmen-Admin' | 'Teamleiter' | 'Agent' | 'QC-Prüfer'>('Agent');
  const [newTeam, setNewTeam] = useState('—');
  const [newCallerId, setNewCallerId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Team Modal State
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamsList, setTeamsList] = useState<string[]>(['MD-Team', 'Testcalendra', 'Izmir Core', 'Solar Direkt']);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, numbersRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/users/free-numbers'),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
      }

      if (numbersRes.ok) {
        const nums = await numbersRes.json();
        if (Array.isArray(nums)) {
          setFreeNumbers(nums);
        }
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditUsername(user.username || user.name);
    setEditRole(user.role);
    setEditTeam(user.team || '—');
    setEditCallerId(user.callerIdNumber || '');
    setEditIsActive(user.isActive);
    setEditNewPassword('');
    setShowPassword(false);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSaveLoading(true);
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUsername,
          role: editRole,
          team: editTeam,
          callerIdNumber: editCallerId === '' ? null : editCallerId,
          isActive: editIsActive,
          newPassword: editNewPassword.trim() ? editNewPassword.trim() : undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setSaveSuccessToast(`Benutzer "${updated.username}" erfolgreich aktualisiert!`);
        setTimeout(() => setSaveSuccessToast(null), 4000);
        setEditingUser(null);
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.message || 'Fehler beim Speichern');
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle user active status directly from row switch
  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: 'POST',
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        if (!updated.isActive && user.callerIdNumber) {
          setSaveSuccessToast(`Benutzer "${user.username}" deaktiviert. Nummer wurde freigegeben.`);
          setTimeout(() => setSaveSuccessToast(null), 4000);
        }
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newEmail.trim()) return;

    try {
      setSaveLoading(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          role: newRole,
          team: newTeam,
          callerIdNumber: newCallerId === '' ? null : newCallerId,
          password: newPassword,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setUsers((prev) => [created, ...prev]);
        setShowNewUserModal(false);
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setSaveSuccessToast(`Benutzer "${created.username}" erfolgreich angelegt!`);
        setTimeout(() => setSaveSuccessToast(null), 4000);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to create user:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Create Team
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setTeamsList((prev) => [...prev, newTeamName.trim()]);
    setSaveSuccessToast(`Team "${newTeamName.trim()}" wurde hinzugefügt!`);
    setTimeout(() => setSaveSuccessToast(null), 4000);
    setNewTeamName('');
    setShowTeamModal(false);
  };

  // KPI Calculations
  const totalCount = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;
  const firmenAdminCount = users.filter((u) => u.role === 'Firmen-Admin').length;
  const teamleiterCount = users.filter((u) => u.role === 'Teamleiter').length;
  const agentCount = users.filter((u) => u.role === 'Agent').length;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.team.toLowerCase().includes(q) ||
        u.userNumber.toLowerCase().includes(q);

      // Role filter
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'AKTIV' && u.isActive) ||
        (statusFilter === 'DEAKTIVIERT' && !u.isActive);

      // Team filter
      const matchesTeam = teamFilter === 'ALL' || u.team.toLowerCase() === teamFilter.toLowerCase();

      return matchesSearch && matchesRole && matchesStatus && matchesTeam;
    });
  }, [users, searchQuery, roleFilter, statusFilter, teamFilter]);

  // Avatar helper
  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1400px] mx-auto select-none">
        {/* Success Toast Notification */}
        {saveSuccessToast && (
          <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-900/90 text-white shadow-2xl border border-emerald-500/50 flex items-center gap-3 animate-fade-in-up backdrop-blur-md">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold">{saveSuccessToast}</span>
            <button
              onClick={() => setSaveSuccessToast(null)}
              className="text-emerald-300 hover:text-white ml-2 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Benutzerverwaltung
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Benutzer Ihrer Firma (inkl. Unterfirmen)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowTeamModal(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Team hinzufügen</span>
            </button>

            <button
              onClick={() => setShowNewUserModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/25 transition active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Neuer Benutzer</span>
            </button>
          </div>
        </div>

        {/* Summary Metric KPI Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {/* 1: Total */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="text-3xl font-black text-slate-900 font-mono">{totalCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">Benutzer</div>
          </div>

          {/* 2: Aktiv */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="text-3xl font-black text-emerald-500 font-mono">{activeCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">Aktiv</div>
          </div>

          {/* 3: Deaktiviert */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="text-3xl font-black text-slate-400 font-mono">{inactiveCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">Deaktiviert</div>
          </div>

          {/* 4: Firmen-Admin */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="text-3xl font-black text-indigo-600 font-mono">{firmenAdminCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">Firmen-Admin</div>
          </div>

          {/* 5: Teamleiter */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="text-3xl font-black text-cyan-600 font-mono">{teamleiterCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">Teamleiter</div>
          </div>

          {/* 6: Agent */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="text-3xl font-black text-orange-500 font-mono">{agentCount}</div>
            <div className="text-xs font-bold text-slate-400 mt-1">Agent</div>
          </div>
        </div>

        {/* Filter Toolbar Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name, Firma oder Team suchen..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50/90 border border-slate-200/90 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
            />
          </div>

          {/* Middle: Role & Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Role Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setRoleFilter('Firmen-Admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'Firmen-Admin'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Firmen-Admin {firmenAdminCount}
              </button>
              <button
                onClick={() => setRoleFilter('Teamleiter')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'Teamleiter'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Teamleiter {teamleiterCount}
              </button>
              <button
                onClick={() => setRoleFilter('Agent')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  roleFilter === 'Agent'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agent {agentCount}
              </button>
            </div>

            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alle Status
              </button>
              <button
                onClick={() => setStatusFilter('AKTIV')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'AKTIV'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Aktiv
              </button>
              <button
                onClick={() => setStatusFilter('DEAKTIVIERT')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  statusFilter === 'DEAKTIVIERT'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deaktiviert
              </button>
            </div>

            {/* Right: Team Dropdown */}
            <div className="relative">
              <select
                value={teamFilter}
                onChange={(e) => setTeamFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Alle Teams</option>
                {teamsList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">BENUTZER</th>
                  <th className="py-3.5 px-4">ROLLE</th>
                  <th className="py-3.5 px-4">TEAM</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 px-4">LETZTER LOGIN</th>
                  <th className="py-3.5 px-4">ERSTELLT</th>
                  <th className="py-3.5 px-6 text-right">AKTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  >
                    {/* User info */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs ${
                            user.userNumber === '#156'
                              ? 'bg-gradient-to-br from-amber-600 via-yellow-700 to-black text-amber-300 border border-amber-500/40'
                              : user.role === 'Teamleiter'
                              ? 'bg-gradient-to-br from-cyan-500 to-teal-600'
                              : user.role === 'Agent'
                              ? 'bg-gradient-to-br from-orange-400 to-amber-600'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          }`}
                        >
                          {getAvatarInitials(user.username)}
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {user.username}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {user.userNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      {user.role === 'Agent' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200">
                          Agent
                        </span>
                      )}
                      {user.role === 'Teamleiter' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                          Teamleiter
                        </span>
                      )}
                      {user.role === 'Firmen-Admin' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Firmen-Admin
                        </span>
                      )}
                      {user.role === 'QC-Prüfer' && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          QC-Prüfer
                        </span>
                      )}
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {user.team || '—'}
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                            user.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title={
                            user.isActive
                              ? 'Klicken zum Deaktivieren (Nummer wird frei)'
                              : 'Klicken zum Aktivieren'
                          }
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              user.isActive ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                        <span
                          className={`text-xs font-semibold ${
                            user.isActive ? 'text-slate-800' : 'text-slate-400'
                          }`}
                        >
                          {user.isActive ? 'Aktiv' : 'Deaktiviert'}
                        </span>
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {user.lastLogin}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {user.createdAt}
                    </td>

                    {/* Action: Pencil Edit Button */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-2 rounded-xl text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100 hover:border-indigo-200 transition shadow-2xs group-hover:scale-105 cursor-pointer"
                        title="Benutzer bearbeiten"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* EDIT USER MODAL ("Benutzer bearbeiten")                 */}
        {/* ======================================================== */}
        {editingUser && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">Benutzer bearbeiten</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {editingUser.role}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Benutzerdaten bearbeiten
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                {/* 1. Benutzername */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Benutzername
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>

                {/* 2. Rolle */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rolle</label>
                  <select
                    value={editRole}
                    onChange={(e: any) => setEditRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  >
                    <option value="Firmen-Admin">Firmen-Admin</option>
                    <option value="Teamleiter">Teamleiter</option>
                    <option value="Agent">Agent</option>
                    <option value="QC-Prüfer">QC-Prüfer</option>
                  </select>
                </div>

                {/* 3. Team */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Team</label>
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  >
                    <option value="—">— Kein Team —</option>
                    {teamsList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Anrufer-Nummer (aus freien System-Nummern wählen; wird beim Deaktivieren frei) */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Anrufer-Nummer{' '}
                    <span className="text-[11px] font-normal text-slate-500">
                      (aus freien System-Nummern wählen; wird beim Deaktivieren frei)
                    </span>
                  </label>
                  <select
                    value={editCallerId}
                    onChange={(e) => setEditCallerId(e.target.value)}
                    disabled={!editIsActive}
                    className={`w-full px-3.5 py-2.5 text-xs border rounded-xl font-mono transition ${
                      !editIsActive
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white'
                    }`}
                  >
                    <option value="">— Keine Nummer / leeren —</option>
                    {editingUser.callerIdNumber && (
                      <option value={editingUser.callerIdNumber}>
                        {editingUser.callerIdNumber} (Aktuell zugewiesen)
                      </option>
                    )}
                    {freeNumbers.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Wählen Sie eine freie Nummer — manuelle Eingabe nicht nötig.
                  </p>
                </div>

                {/* 5. Aktuelles Passwort (Hash Anzeige) */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Aktuelles Passwort</span>
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-semibold">
                      •••••••• (hash'li — görünmez)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Şifre güvenli saklanıyor (hash) — görüntülenemez, aşağıdan sıfırlayın.
                  </p>
                </div>

                {/* 6. Neues Passwort */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Neues Passwort{' '}
                    <span className="text-[11px] font-normal text-slate-400">
                      (leer lassen um aktuelles zu behalten)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={editNewPassword}
                      onChange={(e) => setEditNewPassword(e.target.value)}
                      placeholder="Neues Passwort eingeben..."
                      className="w-full px-3.5 py-2.5 pr-10 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mindestens 8 Zeichen. Das Passwort wird sicher per Scrypt verschlüsselt gespeichert.
                  </p>
                </div>

                {/* 7. Status Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700 block">Benutzer-Status</span>
                    <span className="text-[11px] text-slate-400">
                      Beim Deaktivieren wird die Anrufer-Nummer sofort freigegeben
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !editIsActive;
                      setEditIsActive(next);
                      if (!next) setEditCallerId('');
                    }}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      editIsActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        editIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center gap-2"
                  >
                    {saveLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Änderungen speichern</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* NEW USER MODAL                                          */}
        {/* ======================================================== */}
        {showNewUserModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-black text-slate-900">Neuen Benutzer anlegen</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vollständiger Name</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="z.B. Ali Yilmaz"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">E-Mail-Adresse</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ali@lead-kontackt.de"
                    required
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Rolle</label>
                    <select
                      value={newRole}
                      onChange={(e: any) => setNewRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="Firmen-Admin">Firmen-Admin</option>
                      <option value="Teamleiter">Teamleiter</option>
                      <option value="Agent">Agent</option>
                      <option value="QC-Prüfer">QC-Prüfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Team</label>
                    <select
                      value={newTeam}
                      onChange={(e) => setNewTeam(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="—">— Kein Team —</option>
                      {teamsList.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Freie Anrufer-Nummer zuweisen (optional)
                  </label>
                  <select
                    value={newCallerId}
                    onChange={(e) => setNewCallerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  >
                    <option value="">— Keine Nummer zuweisen —</option>
                    {freeNumbers.map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Initiales Passwort</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mindestens 8 Zeichen..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNewUserModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
                  >
                    Benutzer anlegen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* ADD TEAM MODAL                                          */}
        {/* ======================================================== */}
        {showTeamModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-black text-slate-900">Neues Team anlegen</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTeam} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teamname</label>
                  <input
                    type="text"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="z.B. Izmir VIP Closer"
                    required
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setShowTeamModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs"
                  >
                    Team speichern
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
