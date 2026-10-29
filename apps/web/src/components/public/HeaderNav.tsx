'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Headphones, Globe, ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';

interface HeaderNavProps {
  brandName?: string;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ brandName = 'Linkora' }) => {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'DE' | 'EN'>('DE');

  return (
    <header className="sticky top-0 z-50 bg-[#0b1220]/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
            {brandName[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight text-white">{brandName}</span>
            <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase -mt-1">
              Lead-Bank & Dialer
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-300">
          <a href="#leistungen" className="hover:text-white transition-colors">
            Leistungen
          </a>
          <a href="#leads-verkaufen" className="hover:text-white transition-colors">
            Leads verkaufen
          </a>
          <a href="#dialer" className="hover:text-white transition-colors">
            Cloud-Dialer
          </a>
          <a href="#preise" className="hover:text-white transition-colors">
            Preise
          </a>
          <a href="#ablauf" className="hover:text-white transition-colors">
            Ablauf
          </a>
          <a href="#karriere" className="hover:text-white transition-colors">
            Karriere
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setCurrentLang('DE')}
              className={`px-2.5 py-1 rounded transition ${
                currentLang === 'DE' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              DE
            </button>
            <button
              onClick={() => setCurrentLang('EN')}
              className={`px-2.5 py-1 rounded transition ${
                currentLang === 'EN' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Login Button (Always Visible) */}
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
          >
            Login
          </Link>

          {/* Panel Demo Link (Always Visible) */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-1.5 text-xs font-semibold text-sky-300 hover:text-white bg-sky-950/70 hover:bg-sky-900/80 border border-sky-700/80 px-3 py-2 rounded-lg transition shadow-xs"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAuthenticated && user ? `Live-Panel (${user.firstName})` : 'Live-Panel'}</span>
          </Link>

          {/* Primary CTA */}
          <a
            href="#kontakt"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all cursor-pointer"
          >
            <span>Beratung anfragen</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center md:hidden space-x-2">
          <Link
            href="/dashboard"
            className="p-2 text-sky-400 hover:text-white"
            title="Panel"
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white focus:outline-hidden"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0e172a] border-b border-slate-800 px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-base font-medium text-slate-200">
            <a
              href="#leistungen"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sky-400"
            >
              Leistungen
            </a>
            <a
              href="#leads-verkaufen"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sky-400"
            >
              Leads verkaufen
            </a>
            <a
              href="#dialer"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sky-400"
            >
              Cloud-Dialer
            </a>
            <a
              href="#preise"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sky-400"
            >
              Preise
            </a>
            <a
              href="#ablauf"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sky-400"
            >
              Ablauf
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-sky-400"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition"
            >
              Mitarbeiter Login
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl bg-sky-950/80 border border-sky-800 text-sky-300 font-semibold text-sm flex items-center justify-center space-x-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Live-Panel / Dashboard</span>
            </Link>
            <a
              href="#kontakt"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm"
            >
              Jetzt Beratung anfragen
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
