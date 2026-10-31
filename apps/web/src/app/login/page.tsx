'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Building, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('lead-kontackt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password, tenantSlug);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070c16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 overflow-hidden select-none">
      {/* Ambient Radial Glowing Orbs for Luxury Look */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[36rem] h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Brand Header */}
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 rounded-2xl mx-auto flex items-center justify-center text-navy-950 font-black text-2xl shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform duration-300">
          L
        </div>
        <h2 className="mt-5 text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>Linkora Portal</span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full">
            v2.0
          </span>
        </h2>
        <p className="mt-1.5 text-xs text-slate-400 font-medium">
          Unified Lead Bank & Cloud Dialer Management
        </p>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="backdrop-blur-2xl bg-[#0b1220]/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/60 shadow-navy-950/80 transition-all duration-300">
          {isAuthenticated && user && (
            <div className="mb-5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs">
              <div>
                <span className="font-bold text-emerald-400">Aktive Sitzung:</span> {user.firstName} ({user.email})
              </div>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-transform active:scale-95 shadow cursor-pointer"
              >
                Dashboard &rarr;
              </button>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-rose-950/80 border border-rose-500/40 text-rose-200 px-4 py-3 rounded-2xl text-xs shadow-xs animate-in fade-in duration-200">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-Mail oder Benutzername
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-sky-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="z.B. Murat2 oder murat2@lead-kontackt.de"
                  className="w-full bg-[#11192e] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Passwort</label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-sky-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#11192e] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mandant / Firma</label>
              <div className="relative group">
                <Building className="w-4 h-4 text-slate-400 group-focus-within:text-sky-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="z.B. lead-kontackt"
                  className="w-full bg-[#11192e] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 active:scale-[0.99] text-navy-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer animate-shimmer"
            >
              <span>{loading ? 'Anmelden...' : 'Sicher Anmelden'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Compliance Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 text-center space-y-2 select-none">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verifizierte 256-Bit SSL-Verschlüsselung &middot; DSGVO-konform</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Linkora Platform &middot; Mandant: Lead-Kontackt &middot; Serverstandort Deutschland
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
