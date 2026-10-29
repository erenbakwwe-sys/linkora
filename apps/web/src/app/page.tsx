'use client';

import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/public/HeaderNav';
import { LiveCampaignPreview } from '@/components/public/LiveCampaignPreview';
import { TrustMarquee } from '@/components/public/TrustMarquee';
import {
  ThreeFeatureCards,
  LeadPartnersProcess,
  ProofStatsGrid,
  IndustriesGrid,
} from '@/components/public/PublicSections';
import { DialerFeaturesGrid } from '@/components/public/DialerFeaturesGrid';
import { PricingSection } from '@/components/public/PricingSection';
import { FaqAccordion } from '@/components/public/FaqAccordion';
import { ContactFormSection } from '@/components/public/ContactFormSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  PhoneCall,
  Headphones,
  Check,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* 1. Header Navigation */}
      <HeaderNav brandName="Linkora" />

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#0b1220] via-[#090e18] to-[#070b13]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs px-3.5 py-1.5 rounded-full font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Unified Lead-Bank & AI Call-Center Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                Qualitäts-Leads &amp; intelligenter Cloud-Dialer{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-sky-400">
                  unter einem Dach
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Verkaufen, vermitteln und telefonieren Sie verifizierte B2C-Kontakte in Rekordzeit.
                Mit objektivem KI-Scoring, automatisiertem Kampagnen-Tempo (1–10) und garantierter
                DSGVO-Rechtssicherheit.
              </p>

              {/* 2 CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#kontakt"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-amber-500/25 transition cursor-pointer"
                >
                  <span>Kostenlos testen &amp; anfragen</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-sm px-6 py-3.5 rounded-xl transition"
                >
                  <span>Live-Demo ansehen</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* 3 Trust Ticks */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% DSGVO-konform (DE-Hosting)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Keine Mindestvertragslaufzeit</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>In 10 Minuten einsatzbereit</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Live Campaign Preview Card */}
            <div className="lg:col-span-6">
              <LiveCampaignPreview />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Feature Cards (Teams · Leads · Technologie) */}
      <ThreeFeatureCards />

      {/* 4. Trust-Logo Marquee (Placeholders only) */}
      <TrustMarquee />

      {/* 5. Lead Partners Section (4 Steps) */}
      <LeadPartnersProcess />

      {/* 6. Proof Stats Grid */}
      <ProofStatsGrid />

      {/* 7. Three Building Blocks & Checklist */}
      <section className="py-20 bg-[#090e18] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              Rundum-Sorglos Paket
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
              Wir kümmern uns um die gesamte Infrastruktur
            </h2>
            <p className="text-slate-400 text-sm">
              Konzentrieren Sie sich voll auf das Telefonieren und Abschließen — den Rest erledigt
              unsere automatisierte Plattform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="font-bold text-base text-amber-400 mb-3">1. Vorkonfigurierte Projekte</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PV, Wärmepumpen, Sanierung &amp; Pflegebox</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dynamische Verzweigungen nach Kundenantworten</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Versionierte Fragebögen mit Live-Aktualisierung</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="font-bold text-base text-sky-400 mb-3">2. Dialer &amp; Telefonie-Backbone</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WebRTC Softphone mit integriertem Mikrofon-Check</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AMD Mailbox-Erkennung in unter 1,2 Sekunden</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Wöchentliche Rufnummern-Rotation gegen Spam-Flags</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/60">
              <h3 className="font-bold text-base text-emerald-400 mb-3">3. Abrechnung &amp; Compliance</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Transparente Kasa mit fällig &amp; nächster Monat</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Revisionssichere SHA-256 Audit-Hash-Chain</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatisierte Reklamations- &amp; Gutschriftläufe</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Dialer Features Grid (Tempo 1-10, AMD, etc.) */}
      <DialerFeaturesGrid />

      {/* 9. Transparent Pricing Section */}
      <PricingSection />

      {/* 10. Modular Solution Packs */}
      <section className="py-20 bg-[#0b1220] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
              Flexible Module
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-3">
              Wählen Sie die passende Lösung für Ihr Modell
            </h2>
            <p className="text-slate-400 text-sm">
              Nutzen Sie genau die Komponenten, die Sie heute brauchen — nahtlos erweiterbar bei
              Wachstum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 p-7 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold mb-4">
                  CRM
                </div>
                <h3 className="font-bold text-lg text-white mb-2">1. Nur Lead-Bank &amp; CRM</h3>
                <p className="text-slate-400 text-xs mb-4">
                  Für reine Vermarkter &amp; Einkäufer: Leads empfangen, KI-Scoring ausführen, an
                  deutsche Abnehmer matchen und auszahlen.
                </p>
              </div>
              <a href="#kontakt" className="text-sky-400 text-xs font-bold hover:underline">
                Mehr erfahren &rarr;
              </a>
            </div>

            <div className="bg-slate-800/50 p-7 rounded-2xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold mb-4">
                  VOIP
                </div>
                <h3 className="font-bold text-lg text-white mb-2">2. Nur Cloud-Dialer</h3>
                <p className="text-slate-400 text-xs mb-4">
                  Für bestehende Call-Center: Eigene Daten hochladen, Tempo 1–10 steuern, mit 0,04
                  €/Min telefonieren und Wallboards nutzen.
                </p>
              </div>
              <a href="#kontakt" className="text-sky-400 text-xs font-bold hover:underline">
                Mehr erfahren &rarr;
              </a>
            </div>

            <div className="bg-slate-800/90 p-7 rounded-2xl border-2 border-amber-500 shadow-xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">
                  ALL
                </div>
                <h3 className="font-bold text-lg text-white mb-2">3. All-in-One Enterprise</h3>
                <p className="text-slate-300 text-xs mb-4">
                  Das komplette Ökosystem: Leads beschaffen, KI-gestützt veredeln, im Dialer
                  abschließen und an Top-Käufer weiterleiten.
                </p>
              </div>
              <a href="#kontakt" className="text-amber-400 text-xs font-bold hover:underline">
                Jetzt unverbindlich anfragen &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Industries Grid */}
      <IndustriesGrid />

      {/* 12. Career Section */}
      <section id="karriere" className="py-20 bg-[#090e17] text-white border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-3.5 py-1.5 rounded-full font-semibold mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Karriere &amp; Partner-Callcenter</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Wir suchen deutschsprachige Vertriebs-Talente &amp; Agenturen
          </h2>

          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
            Ob erfahrener Outbound-Telefonist, Teamleiter im Home-Office oder eigenständiges
            Call-Center in der Türkei oder Deutschland — profitieren Sie von warmen, KI-vorqualifizierten
            Leads und attraktiven Stunden- und Provisionsmodellen.
          </p>

          <a
            href="#kontakt"
            className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-3 rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <span>Jetzt als Mitarbeiter oder Partner bewerben</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </a>
        </div>
      </section>

      {/* 13. FAQ Accordion (with FAQ JSON-LD) */}
      <FaqAccordion />

      {/* 14. Contact Form Section (Honeypot, User Type, Products, Consent) */}
      <ContactFormSection />

      {/* 15. Public Footer */}
      <PublicFooter brandName="Linkora" />
    </div>
  );
}
