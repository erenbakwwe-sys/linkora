'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Layers,
  Cpu,
  ArrowRight,
  CheckCircle2,
  PhoneForwarded,
  Sun,
  Flame,
  Accessibility,
  Home,
  Zap,
  Package,
  TrendingUp,
  Award,
  Sparkles,
  Shield,
  Briefcase,
  Headphones,
} from 'lucide-react';

export const ThreeFeatureCards: React.FC = () => {
  return (
    <section id="leistungen" className="py-20 bg-[#0b1220] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
            Drei Säulen für Ihren Erfolg
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
            Eine Plattform. Alle Werkzeuge für maximale Abschlüsse.
          </h2>
          <p className="text-slate-400 text-base">
            Schluss mit isolierten Silos. Verknüpfen Sie Ihre Lead-Generierung nahtlos mit
            schlagkräftigen Telefonieteams und intelligenter Konvertierungs-KI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Teams */}
          <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/60 hover:border-slate-500 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Teams & Multi-Tenancy</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Verwalten Sie unbegrenzt viele eigene Call-Center und Sub-Unternehmen mit individueller
                Rechteverwaltung (RBAC), Echtzeit-Wallboards, Supervisor-Mithören und Zeiterfassung.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mandantenbaum (Mutter- & Sub-Firmen)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>TV-Wallboard mit Live-Agentenstatus</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Supervisor Listen, Whisper & Barge-in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2: Leads */}
          <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/60 hover:border-slate-500 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-105 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Leads & Marktplatz</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Zentraler Lead-Pool mit automatischer E.164-Normalisierung, Deduplizierung,
                KI-Gütebewertung (0–100) und automatisiertem Ping-Post Matching an deutsche Fachpartner.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Anonymisiertes Ping & Post Waterfall</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Qualitätspool für Mehrfach-Vermarktung</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lückenlose DSGVO-Einwilligungsprüfung</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3: Technologie */}
          <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/60 hover:border-slate-500 transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-105 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Technologie & KI</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                WebRTC Softphone im Browser ohne Installation. Automatisierte Transkription, KI-gestützte
                Gesprächszusammenfassungen und zweisprachiges Coaching für TR- und DE-Teams.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Post-Call QC mit Konformitätsprüfung</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PII-Maskierung & Hash-Audit-Chain</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Carrier-Redundanz & Rufnummern-Rotation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LeadPartnersProcess: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Lead-Einlieferung & Upload',
      desc: 'Manuell, per CSV/Excel oder über die Provider Push API mit garantiertem Werbeeinwilligungs-Nachweis.',
    },
    {
      step: '02',
      title: 'Validierung & KI-Scoring',
      desc: 'E.164 Nummernprüfung, Dubletten-Bereinigung und objektive Konversions-Bewertung von 0 bis 100 Punkten.',
    },
    {
      step: '03',
      title: 'Intelligentes Matching',
      desc: 'Anonyme Ping-Anfrage an zertifizierte deutsche Arbeitgeber & Partner. Zuschlag nach Preis, Region & Kapazität.',
    },
    {
      step: '04',
      title: 'Auszahlung & Reporting',
      desc: 'Sofortige Gutschrift im Wallet, transparente Kasa-Übersicht und automatisiertes Reklamations-Handling.',
    },
  ];

  return (
    <section id="leads-verkaufen" className="py-20 bg-[#090e17] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Für Lead-Lieferanten & Partner
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
            So monetarisieren Sie Ihre Leads in 4 einfachen Schritten
          </h2>
          <p className="text-slate-400 text-base">
            Verkaufen Sie qualifizierte B2C-Leads direkt an führende deutsche Fachbetriebe. Höchste
            Vergütungssätze und planbare Auszahlungszyklen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div
              key={i}
              className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60 relative flex flex-col justify-between"
            >
              <div>
                <span className="text-4xl font-extrabold text-amber-500/30 font-mono block mb-3">
                  {st.step}
                </span>
                <h3 className="font-bold text-lg text-white mb-2">{st.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ProofStatsGrid: React.FC = () => {
  const stats = [
    { num: '1.250.000+', label: 'Verifizierte Leads verarbeitet' },
    { num: '99,85 %', label: 'Plattform- & Dialer-Verfügbarkeit' },
    { num: '< 2,1 %', label: 'Reglementierte Abbruchquote' },
    { num: '4,35 MOS', label: 'Glasklare WebRTC Audioqualität' },
  ];

  return (
    <section className="py-14 bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border-y border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-300 mb-1">
                {s.num}
              </div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const IndustriesGrid: React.FC = () => {
  const industries = [
    { name: 'Photovoltaik & Solaranlagen', icon: Sun, color: 'text-amber-400', slug: '/de/photovoltaik-leads' },
    { name: 'Wärmepumpen & Heiztechnik', icon: Flame, color: 'text-rose-400', slug: '/de/waermepumpen-leads' },
    { name: 'Treppenlifte & Mobilität', icon: Accessibility, color: 'text-sky-400', slug: '#kontakt' },
    { name: 'Fenster & Sanierung', icon: Home, color: 'text-emerald-400', slug: '#kontakt' },
    { name: 'Energieberatung & iSFP', icon: Zap, color: 'text-purple-400', slug: '#kontakt' },
    { name: 'Pflegeboxen (§ 40 SGB XI)', icon: Package, color: 'text-teal-400', slug: '#kontakt' },
  ];

  return (
    <section className="py-20 bg-[#0e172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            Branchen & Produkte
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
            Vorkonfigurierte Fragebögen & erprobte Vertriebs-Skripte
          </h2>
          <p className="text-slate-400 text-base">
            Starten Sie sofort mit markterprobten Fragebögen und dynamischer Einwandbehandlung für
            die umsatzstärksten Branchen in Deutschland.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industries.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <Link
                key={i}
                href={ind.slug}
                className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl flex flex-col items-center text-center transition group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${ind.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-xs text-slate-200 group-hover:text-white transition">
                  {ind.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
