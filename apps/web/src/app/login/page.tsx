'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Building, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const { locale, setLocale } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tenantSlug, setTenantSlug] = useState('lead-kontackt');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isTr = locale === 'tr';
  const isEn = locale === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError(
        isTr
          ? 'Lütfen e-posta adresinizi veya kullanıcı adınızı girin.'
          : isEn
          ? 'Please enter your email or username.'
          : 'Bitte geben Sie Ihre E-Mail-Adresse oder Ihren Benutzernamen ein.'
      );
      return;
    }
    if (!cleanPassword) {
      setError(
        isTr
          ? 'Lütfen şifrenizi girin.'
          : isEn
          ? 'Please enter your password.'
          : 'Bitte geben Sie Ihr Passwort ein.'
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(cleanEmail, cleanPassword, tenantSlug.trim() || 'lead-kontackt');
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.message ||
          (isTr
            ? 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
            : isEn
            ? 'Login failed. Please check your credentials.'
            : 'Login fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#070c16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 overflow-hidden select-none">
      {/* Language Switcher in Top Right */}
      <div className="absolute top-6 right-6 z-50 flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-700 text-xs font-semibold shadow-lg">
        <button
          onClick={() => setLocale('de')}
          className={`px-2.5 py-1 rounded-lg transition ${
            locale === 'de' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          DE
        </button>
        <button
          onClick={() => setLocale('tr')}
          className={`px-2.5 py-1 rounded-lg transition ${
            locale === 'tr' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          TR
        </button>
        <button
          onClick={() => setLocale('en')}
          className={`px-2.5 py-1 rounded-lg transition ${
            locale === 'en' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          EN
        </button>
      </div>

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
          {isTr
            ? 'Entegre Lead Havuzu & Bulut Santral Yönetimi'
            : isEn
            ? 'Unified Lead Bank & Cloud Dialer Management'
            : 'Unified Lead Bank & Cloud Dialer Management'}
        </p>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="backdrop-blur-2xl bg-[#0b1220]/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-slate-700/60 shadow-navy-950/80 transition-all duration-300">
          {isAuthenticated && user && (
            <div className="mb-5 bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl text-xs flex items-center justify-between shadow-xs">
              <div>
                <span className="font-bold text-emerald-400">{isTr ? 'Aktif Oturum:' : isEn ? 'Active Session:' : 'Aktive Sitzung:'}</span> {user.firstName} ({user.email})
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
            <div className="mb-5 bg-rose-950/80 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5 shadow-md animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTr ? 'E-Posta veya Kullanıcı Adı' : isEn ? 'Email or Username' : 'E-Mail oder Benutzername'}
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-sky-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isTr ? 'Örn. Murat2 veya murat2@lead-kontackt.de' : 'z.B. Murat2 oder murat2@lead-kontackt.de'}
                  className="w-full bg-[#11192e] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTr ? 'Şifre' : isEn ? 'Password' : 'Passwort'}
              </label>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-sky-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#11192e] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  title={showPassword ? (isTr ? 'Şifreyi gizle' : 'Passwort verbergen') : (isTr ? 'Şifreyi göster' : 'Passwort anzeigen')}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isTr ? 'Şirket Kodu / Mandant' : isEn ? 'Company / Tenant Slug' : 'Mandant / Firma'}
              </label>
              <div className="relative group">
                <Building className="w-4 h-4 text-slate-400 group-focus-within:text-sky-400 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="lead-kontackt"
                  className="w-full bg-[#11192e] border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400 transition-all duration-200 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 active:scale-[0.99] text-navy-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 cursor-pointer animate-shimmer"
            >
              <span>{loading ? (isTr ? 'Giriş Yapılıyor...' : isEn ? 'Signing in...' : 'Anmelden...') : (isTr ? 'Güvenli Giriş Yap' : isEn ? 'Secure Sign In' : 'Sicher Anmelden')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security & Compliance Footer */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 text-center space-y-2 select-none">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isTr ? '256-Bit SSL Şifreleme · %100 KVKK & GDPR Uyumlu' : 'Verifizierte 256-Bit SSL-Verschlüsselung · DSGVO-konform'}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Linkora Platform &middot; Mandant: Lead-Kontackt &middot; {isTr ? 'Sunucu Konumu: Almanya' : 'Serverstandort Deutschland'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
