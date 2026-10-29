'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ChevronDown, Radio, Sparkles, Building2, LogOut } from 'lucide-react';

export const TopBar: React.FC = () => {
  const { user, tenant, accessibleTenants, switchMode, switchTenant, logout } = useAuth();
  const { locale, setLocale, t } = useI18n();
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);

  return (
    <header className="h-14 bg-[#090e1a]/95 backdrop-blur-md border-b border-slate-800/80 text-white px-6 flex items-center justify-between select-none z-50 shadow-xs">
      {/* Left: User Welcome & Mode Switcher */}
      <div className="flex items-center space-x-3 text-sm">
        <div className="flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1 rounded-xl text-xs font-semibold text-slate-200 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{t('common.welcome', { user: user?.firstName || 'Erensamsun' })}</span>
        </div>
        <span className="text-slate-600">·</span>
        <button
          onClick={switchMode}
          className="text-sky-400 hover:text-sky-300 text-xs font-semibold transition-colors cursor-pointer hover:underline flex items-center gap-1 active:scale-95"
          title={`Active view: ${user?.mode || 'MANAGER'}`}
        >
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>{t('common.switch_mode')}</span>
        </button>
        <span className="text-[11px] font-extrabold tracking-wider bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/30 shadow-xs">
          {user?.mode || 'MANAGER'}
        </span>
      </div>

      {/* Right: Company Switcher, Language Toggle, Live Indicator */}
      <div className="flex items-center space-x-3.5">
        {/* Company Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
            className="flex items-center space-x-2 bg-[#121c33]/90 hover:bg-[#182645] text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700/80 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{tenant?.name || 'Lead-Kontackt'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 transition-transform" />
          </button>

          {isCompanyMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                  <span>{tItem.name}</span>
                  {tenant?.id === tItem.id && <span className="w-2 h-2 rounded-full bg-sky-600"></span>}
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

        {/* Language Switcher Toggle DE | TR | EN */}
        <div className="flex items-center bg-[#121c33] rounded-xl p-0.5 border border-slate-700/80 text-[11px] font-bold">
          <button
            onClick={() => setLocale('de')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              locale === 'de'
                ? 'bg-amber-400 text-navy-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            DE
          </button>
          <button
            onClick={() => setLocale('tr')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              locale === 'tr'
                ? 'bg-amber-400 text-navy-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            TR
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-2 py-0.5 rounded-lg transition-all ${
              locale === 'en'
                ? 'bg-amber-400 text-navy-950 font-black shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Green Live Radar Beacon */}
        <div className="flex items-center space-x-2 bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-beacon-pulse"></span>
          <span>{t('common.live')}</span>
        </div>
      </div>
    </header>
  );
};
