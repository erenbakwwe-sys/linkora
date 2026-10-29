import React from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from '@/components/public/HeaderNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { ContactFormSection } from '@/components/public/ContactFormSection';
import { ShieldCheck, CheckCircle2, TrendingUp, DollarSign, ArrowRight, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Leads verkaufen in Deutschland | Höchste Vergütung & Sofortige Auszahlung',
  description:
    'Monetarisieren Sie Ihre B2C-Leads (PV, Wärmepumpen, Sanierung) an verifizierte deutsche Fachbetriebe. Anonymisiertes Ping-Post Matching & transparente Gutschriften.',
  alternates: {
    canonical: 'https://linkora.io/de/leads-verkaufen-deutschland',
  },
  openGraph: {
    title: 'B2C Leads verkaufen in Deutschland — Linkora Lead-Marktplatz',
    description: 'Direkter Zugang zu 4+ deutschen Großabnehmern. Faire Preise und tägliche Abrechnung.',
    url: 'https://linkora.io/de/leads-verkaufen-deutschland',
    type: 'website',
  },
};

export default function LeadsVerkaufenPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <HeaderNav brandName="Linkora" />

      <main className="flex-1">
        {/* SEO Header */}
        <section className="py-20 bg-gradient-to-b from-[#0b1220] to-[#070b13] border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
              Lead-Lieferanten &amp; Affiliate Partner
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
              B2C Leads verkaufen in Deutschland
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Verbinden Sie Ihre Kampagnen per API oder CSV mit unserem automatisierten
              Marktplatz. Garantierte Höchstpreise durch unser dynamisches Ping-Post Bidding.
            </p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/40 p-7 rounded-2xl border border-slate-700/60">
              <DollarSign className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Attraktive Vergütungssätze</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Bis zu 120 € pro qualifiziertem Photovoltaik- oder Wärmepumpen-Datensatz.
                Sekundenschnelle Gutschrift direkt auf Ihr Wallet.
              </p>
            </div>

            <div className="bg-slate-800/40 p-7 rounded-2xl border border-slate-700/60">
              <Database className="w-10 h-10 text-sky-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Automatisierte Schnittstellen</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Liefern Sie Leads über unsere gesicherte Provider Push API (HMAC-Signatur,
                Idempotenz) oder per manuellem CSV/Excel-Upload ein.
              </p>
            </div>

            <div className="bg-slate-800/40 p-7 rounded-2xl border border-slate-700/60">
              <ShieldCheck className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Faires Reklamations-Handling</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Transparente Reklamationsregeln (max. 15% Cap, 7 Tage Fenster). Keine willkürlichen
                Stornos durch Käufer.
              </p>
            </div>
          </div>
        </section>

        {/* Inbound Contact Form */}
        <ContactFormSection />
      </main>

      <PublicFooter brandName="Linkora" />
    </div>
  );
}
