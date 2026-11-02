'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { publicContent } from '@/lib/publicTranslations';
import { Headphones, Globe, ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';

interface HeaderNavProps {
  brandName?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ brandName = 'Linkora' }) => {
  const { user, isAuthenticated } = useAuth();
  const { locale, setLocale } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLocale = (locale === 'tr' || locale === 'en' ? locale : 'de') as 'de' | 'tr' | 'en';
  const navText = publicContent[activeLocale]?.nav || publicContent.de.nav;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
            {brandName[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-slate-950">{brandName}</span>
            <span className="text-[10px] text-sky-600 font-semibold tracking-wider uppercase -mt-1">
              {navText.leadBankTag}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-600">
          <a href="#leistungen" className="hover:text-slate-950 transition-colors">
            {navText.services}
          </a>
          <a href="#leads-verkaufen" className="hover:text-slate-950 transition-colors">
            {navText.sellLeads}
          </a>
          <a href="#dialer" className="hover:text-slate-950 transition-colors">
            {navText.dialer}
          </a>
          <a href="#preise" className="hover:text-slate-950 transition-colors">
            {navText.pricing}
          </a>
          <a href="#ablauf" className="hover:text-slate-950 transition-colors">
            {navText.process}
          </a>
          <a href="#karriere" className="hover:text-slate-950 transition-colors">
            {navText.career}
          </a>
          <a href="#faq" className="hover:text-slate-950 transition-colors">
            {navText.faq}
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Switcher with DE, TR, EN */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setLocale('de')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeLocale === 'de' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setLocale('tr')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeLocale === 'tr' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              TR
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeLocale === 'en' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              EN
            </button>
          </div>

          {/* Login Button (Always Visible) */}
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors"
          >
            {navText.login}
          </Link>

          {/* Panel Demo Link (Always Visible) */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 text-xs font-semibold text-sky-800 hover:text-sky-950 bg-sky-50 hover:bg-sky-100/90 border border-sky-200 px-3.5 py-2 rounded-xl transition shadow-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
            <span>{isAuthenticated && user ? `${navText.livePanel} (${user.firstName})` : navText.livePanel}</span>
          </Link>

          {/* Primary CTA */}
          <a
            href="#kontakt"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer"
          >
            <span>{navText.requestConsult}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle & Language Switcher */}
        <div className="flex items-center md:hidden space-x-2">
          {/* Mobile Language Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[11px] font-bold mr-1">
            <button
              onClick={() => setLocale('de')}
              className={`px-1.5 py-0.5 rounded ${activeLocale === 'de' ? 'bg-amber-400 text-slate-950' : 'text-slate-600'}`}
            >
              DE
            </button>
            <button
              onClick={() => setLocale('tr')}
              className={`px-1.5 py-0.5 rounded ${activeLocale === 'tr' ? 'bg-amber-400 text-slate-950' : 'text-slate-600'}`}
            >
              TR
            </button>
            <button
              onClick={() => setLocale('en')}
              className={`px-1.5 py-0.5 rounded ${activeLocale === 'en' ? 'bg-amber-400 text-slate-950' : 'text-slate-600'}`}
            >
              EN
            </button>
          </div>
          <Link
            href="/dashboard"
            className="p-2 text-sky-600 hover:text-sky-950"
            title="Panel"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-700">
            <a
              href="#leistungen"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.services}
            </a>
            <a
              href="#leads-verkaufen"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.sellLeads}
            </a>
            <a
              href="#dialer"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.dialer}
            </a>
            <a
              href="#preise"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.pricing}
            </a>
            <a
              href="#ablauf"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.process}
            </a>
            <a
              href="#karriere"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.career}
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-amber-600"
            >
              {navText.faq}
            </a>
          </nav>

          <div className="pt-4 border-t border-slate-200 flex flex-col space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-sm hover:bg-slate-50 transition"
            >
              {navText.login}
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-semibold text-sm flex items-center justify-center space-x-2"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-600" />
              <span>{navText.livePanel}</span>
            </Link>
            <a
              href="#kontakt"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-sm shadow-md"
            >
              {navText.requestConsult}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
