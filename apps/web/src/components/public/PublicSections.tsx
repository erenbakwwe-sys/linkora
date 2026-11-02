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

import { useI18n } from '@/context/I18nContext';
import { publicContent } from '@/lib/publicTranslations';

export const ThreeFeatureCards: React.FC = () => {
  const { locale } = useI18n();
  const activeLocale = (locale === 'tr' || locale === 'en' ? locale : 'de') as 'de' | 'tr' | 'en';
  const tf = publicContent[activeLocale]?.threeFeatures || publicContent.de.threeFeatures;

  return (
    <section id="leistungen" className="py-20 bg-slate-50/70 border-b border-slate-200/90 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
            {tf.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4 text-slate-950">
            {tf.title}
          </h2>
          <p className="text-slate-600 text-base">
            {tf.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Teams */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">{tf.card1.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {tf.card1.desc}
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {tf.card1.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2: Leads */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-105 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">{tf.card2.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {tf.card2.desc}
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {tf.card2.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 3: Technologie */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-slate-300 shadow-md hover:shadow-xl transition duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-105 transition-transform">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-950 mb-3">{tf.card3.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {tf.card3.desc}
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                {tf.card3.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
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
    <section id="leads-verkaufen" className="py-20 bg-white text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Für Lead-Lieferanten & Partner
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4 text-slate-950">
            So monetarisieren Sie Ihre Leads in 4 einfachen Schritten
          </h2>
          <p className="text-slate-600 text-base">
            Verkaufen Sie qualifizierte B2C-Leads direkt an führende deutsche Fachbetriebe. Höchste
            Vergütungssätze und planbare Auszahlungszyklen.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div
              key={i}
              className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/90 relative flex flex-col justify-between text-slate-900 shadow-2xs hover:shadow-md hover:border-slate-300 transition"
            >
              <div>
                <span className="text-4xl font-extrabold text-amber-500 font-mono block mb-3">
                  {st.step}
                </span>
                <h3 className="font-bold text-lg text-slate-950 mb-2">{st.title}</h3>
                <p className="text-slate-600 text-xs leading-relaxed">{st.desc}</p>
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
    <section className="py-14 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-y border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 mb-1">
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
    { name: 'Photovoltaik & Solaranlagen', icon: Sun, color: 'text-amber-500', slug: '/de/photovoltaik-leads' },
    { name: 'Wärmepumpen & Heiztechnik', icon: Flame, color: 'text-rose-500', slug: '/de/waermepumpen-leads' },
    { name: 'Treppenlifte & Mobilität', icon: Accessibility, color: 'text-sky-500', slug: '#kontakt' },
    { name: 'Fenster & Sanierung', icon: Home, color: 'text-emerald-500', slug: '#kontakt' },
    { name: 'Energieberatung & iSFP', icon: Zap, color: 'text-purple-500', slug: '#kontakt' },
    { name: 'Pflegeboxen (§ 40 SGB XI)', icon: Package, color: 'text-teal-500', slug: '#kontakt' },
  ];

  return (
    <section className="py-20 bg-slate-50/70 text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Branchen & Produkte
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4 text-slate-950">
            Vorkonfigurierte Fragebögen & erprobte Vertriebs-Skripte
          </h2>
          <p className="text-slate-600 text-base">
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
                className="bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 p-5 rounded-2xl flex flex-col items-center text-center transition group shadow-2xs hover:shadow-md"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${ind.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-xs text-slate-800 group-hover:text-slate-950 transition">
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
