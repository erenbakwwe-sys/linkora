'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useSidebar } from '@/context/SidebarContext';
import {
  ChevronDown,
  Sparkles,
  Building2,
  LogOut,
  Menu,
  Home,
  Headphones,
  Users,
  UserPlus,
  FileSpreadsheet,
  Sun,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user, tenant, accessibleTenants, switchMode, switchTenant, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const { toggle } = useSidebar();
  const pathname = usePathname();
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);

  const isAgent = user?.mode === 'AGENT' || user?.role === 'Agent' || user?.role === 'AGENT';
  const displayName = user?.firstName || user?.username || 'Murat2';

  if (isAgent) {
    return (
      <>
        <header className="h-14 bg-white border-b border-slate-200/90 text-slate-800 px-3 sm:px-6 flex items-center justify-between select-none z-40 shadow-xs">
          {/* Left: Brand Logo + Desktop Agent Navigation Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 group mr-1 sm:mr-2 shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-[#0b1220] font-black text-xs shadow-xs">
                L
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight hidden lg:inline">
                {tenant?.name || 'Lead-Kontackt'}
              </span>
            </Link>

            {/* Company selector black pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
                className="bg-[#0b1325] text-white hover:bg-slate-800 text-[11px] font-semibold px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="truncate max-w-[80px] sm:max-w-[120px]">
                  Firma: {tenant?.name || 'Lead-Kontackt'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCompanyMenuOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Firma wechseln
                  </div>
                  {accessibleTenants.map((tItem) => (
                    <button
                      key={tItem.id}
                      onClick={() => {
                        switchTenant(tItem.id);
                        setIsCompanyMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                        tenant?.id === tItem.id ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{tItem.name}</span>
                      {tenant?.id === tItem.id && (
                        <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-1.5 text-xs">
              {/* Startseite */}
              <Link
                href="/dashboard"
                className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition ${
                  pathname === '/dashboard' || pathname === '/'
                    ? 'bg-[#1c4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Startseite</span>
              </Link>

              {/* Anrufbildschirm */}
              <Link
                href="/call-screen"
                className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/call-screen'
                    ? 'bg-[#1c4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Anrufbildschirm</span>
              </Link>

              {/* Kunden */}
              <Link
                href="/leads"
                className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/leads'
                    ? 'bg-[#1c4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Kunden</span>
              </Link>

              {/* Kunde hinzufügen */}
              <Link
                href="/kunde-hinzufuegen"
                className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition ${
                  pathname === '/kunde-hinzufuegen'
                    ? 'bg-[#1c4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                <span>Kunde hinzufügen</span>
              </Link>

              {/* Excel */}
              <Link
                href="/excel"
                className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition hidden lg:flex ${
                  pathname === '/excel'
                    ? 'bg-[#1c4ed8] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>Excel</span>
              </Link>
            </nav>
          </div>

          {/* Right: User name pill, Logout, Language, Live Beacon, Sun */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* User Badge */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-100 border border-slate-200/90 px-2 sm:px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-xs">
              <UserIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate max-w-[70px] sm:max-w-none">{displayName}</span>
            </div>

            {/* Logout Red Button */}
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition cursor-pointer"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Language Switcher DE | TR */}
            <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200 text-[11px] font-bold">
              <button
                onClick={() => setLocale('de')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg transition-all ${
                  locale === 'de'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                DE
              </button>
              <button
                onClick={() => setLocale('tr')}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg transition-all ${
                  locale === 'tr'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                TR
              </button>
            </div>

            {/* Green Live Radar Beacon */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Live</span>
            </div>

            {/* Sun / Mode Switcher */}
            <button
              type="button"
              onClick={switchMode}
              className="p-1.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
              title="Modus wechseln (Manager / Agent)"
            >
              <Sun className="w-4 h-4 fill-amber-400 text-amber-500" />
            </button>
          </div>
        </header>

        {/* Mobile Bottom Navigation Bar for Agents */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around select-none">
          {/* 1. Startseite */}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname === '/dashboard' || pathname === '/'
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Startseite</span>
          </Link>

          {/* 2. Anrufbildschirm */}
          <Link
            href="/call-screen"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname === '/call-screen'
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Anruf</span>
          </Link>

          {/* 3. + Kunde (Prominent Raised Center Action Button) */}
          <Link
            href="/kunde-hinzufuegen"
            className="flex flex-col items-center justify-center -mt-5 group"
            title="Kunde hinzufügen"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                pathname === '/kunde-hinzufuegen'
                  ? 'bg-blue-700 text-white ring-4 ring-blue-100'
                  : 'bg-[#1c4ed8] text-white hover:bg-blue-700 shadow-blue-500/30 ring-4 ring-white'
              }`}
            >
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-700 mt-1">
              + Kunde
            </span>
          </Link>

          {/* 4. Kunden */}
          <Link
            href="/leads"
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              pathname === '/leads'
                ? 'text-blue-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Kunden</span>
          </Link>

          {/* 5. Chat */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('chat-widget');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = '/dashboard#chat-widget';
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-tight">Chat</span>
          </button>
        </nav>
      </>
    );
  }

  // Manager View TopBar
  return (
    <header className="h-14 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80 text-white px-3 sm:px-6 flex items-center justify-between select-none z-40 shadow-xs">
      {/* Left: Hamburger menu (mobile) + User Welcome & Mode Switcher */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-sm">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="p-2 -ml-1.5 text-slate-200 hover:text-white hover:bg-slate-800 active:bg-slate-700 rounded-xl transition md:hidden cursor-pointer touch-manipulation flex items-center justify-center shrink-0"
          aria-label="Menü öffnen"
          title="Menü öffnen"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>

        <div className="flex items-center space-x-1.5 sm:space-x-2 bg-slate-800/60 border border-slate-700/60 px-2 sm:px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"></span>
          <span className="truncate max-w-[85px] sm:max-w-none">{user?.firstName || 'Erensamsun'}</span>
        </div>

        <span className="text-slate-600 hidden sm:inline">·</span>

        <button
          onClick={switchMode}
          className="text-sky-400 hover:text-sky-300 text-xs font-semibold transition-colors cursor-pointer hover:underline hidden sm:flex items-center gap-1 active:scale-95"
          title={`Active view: ${user?.mode || 'MANAGER'}`}
        >
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>{t('common.switch_mode')}</span>
        </button>

        <button
          onClick={switchMode}
          className="text-[10px] sm:text-[11px] font-extrabold tracking-wider bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 px-2 sm:px-2.5 py-0.5 rounded-full border border-sky-500/30 shadow-xs cursor-pointer active:scale-95 hover:border-sky-400/50"
          title="Modus wechseln (Klicken zum Umschalten)"
        >
          {user?.mode || 'MANAGER'}
        </button>
      </div>

      {/* Right: Company Switcher, Language Toggle, Live Indicator */}
      <div className="flex items-center space-x-1.5 sm:space-x-3">
        {/* Company Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
            className="flex items-center space-x-1.5 sm:space-x-2 bg-[#121c33]/90 hover:bg-[#182645] text-slate-200 text-xs font-semibold px-2 sm:px-3 py-1.5 rounded-xl border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate max-w-[90px] sm:max-w-[130px]">{tenant?.name || 'Lead-Kontackt'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 transition-transform flex-shrink-0" />
          </button>

          {isCompanyMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Unternehmen wählen
              </div>
              {accessibleTenants.map((tItem) => (
                <button
                  key={tItem.id}
                  onClick={() => {
                    switchTenant(tItem.id);
                    setIsCompanyMenuOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                    tenant?.id === tItem.id ? 'bg-sky-50 text-sky-800 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span className="truncate">{tItem.name}</span>
                  {tenant?.id === tItem.id && <span className="w-2 h-2 rounded-full bg-sky-600 flex-shrink-0"></span>}
                </button>
              ))}
              <div className="border-t border-slate-100 my-1.5"></div>
              <button
                onClick={logout}
                className="w-full text-left px-3.5 py-2 text-xs text-rose-600 font-semibold hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('common.logout')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Language Switcher Toggle DE | TR */}
        <div className="flex items-center bg-[#121c33] rounded-xl p-0.5 border border-slate-700/80 text-[11px] font-bold">
          <button
            onClick={() => setLocale('de')}
            className={`px-1.5 sm:px-2 py-0.5 rounded-lg transition-all ${
              locale === 'de'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            DE
          </button>
          <button
            onClick={() => setLocale('tr')}
            className={`px-1.5 sm:px-2 py-0.5 rounded-lg transition-all ${
              locale === 'tr'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            TR
          </button>
        </div>

        {/* Green Live Radar Beacon */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 px-2 sm:px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon-pulse"></span>
          <span className="hidden sm:inline">{t('common.live')}</span>
        </div>
      </div>
    </header>
  );
};
