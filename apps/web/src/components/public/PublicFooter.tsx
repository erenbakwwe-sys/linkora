'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart } from 'lucide-react';

interface PublicFooterProps {
  brandName?: string;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ brandName = 'Linkora' }) => {
  return (
    <footer className="bg-[#060a12] text-slate-400 text-xs border-t border-slate-900 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                {brandName[0]}
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">{brandName}</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm mb-4">
              Die einheitliche Lead-Bank und KI-gestützte Cloud-Dialer Plattform für höchste
              Konvertierung im deutschsprachigen Vertrieb.
            </p>
            <div className="flex items-center space-x-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% DSGVO & ISO 27001 Konform · DE-Hosting</span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Lösungen
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#leistungen" className="hover:text-white transition">
                  Lead-Marktplatz
                </a>
              </li>
              <li>
                <a href="#dialer" className="hover:text-white transition">
                  Cloud-Dialer & Softphone
                </a>
              </li>
              <li>
                <Link href="/de/photovoltaik-leads" className="hover:text-white transition">
                  Photovoltaik Leads
                </Link>
              </li>
              <li>
                <Link href="/de/waermepumpen-leads" className="hover:text-white transition">
                  Wärmepumpen Leads
                </Link>
              </li>
              <li>
                <Link href="/de/deutschsprachiges-callcenter" className="hover:text-white transition">
                  TR Call-Center Assist
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Plattform
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#preise" className="hover:text-white transition">
                  Preise & Minutenpakete
                </a>
              </li>
              <li>
                <Link href="/de/leads-verkaufen-deutschland" className="hover:text-white transition">
                  Leads verkaufen
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Live-Dashboard Panel
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Mitarbeiter Login
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  Häufige Fragen (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Rechtliches
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/de/impressum" className="hover:text-white transition">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/de/datenschutz" className="hover:text-white transition">
                  Datenschutzerklärung
                </Link>
              </li>
              <li>
                <span className="text-slate-500">AGB (Allgemeine Bedingungen)</span>
              </li>
              <li>
                <span className="text-slate-500">Auftragsverarbeitung (AVV)</span>
              </li>
              <li>
                <div className="flex items-center space-x-1.5 text-emerald-400 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Alle Systeme betriebsbereit</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} {brandName} Platform. Alle Rechte vorbehalten.
          </div>
          <div className="mt-2 sm:mt-0">
            White-Label Lead-Management & Call-Center Suite.
          </div>
        </div>
      </div>
    </footer>
  );
};
