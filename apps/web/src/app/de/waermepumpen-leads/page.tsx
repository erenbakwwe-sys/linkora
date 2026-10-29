import React from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from '@/components/public/HeaderNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { ContactFormSection } from '@/components/public/ContactFormSection';
import { Flame, CheckCircle2, ShieldCheck, ThermometerSun } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Wärmepumpen Leads kaufen | Vorqualifizierte Heizungstausch Anfragen',
  description:
    'Qualifizierte Wärmepumpen- und Heizungs-Leads für SHK-Fachbetriebe und Energieberater in Deutschland. Mit aktuellem Heizungstyp, Baujahr & Sanierungsplan.',
  alternates: {
    canonical: 'https://linkora.io/de/waermepumpen-leads',
  },
  openGraph: {
    title: 'Geprüfte Wärmepumpen Leads — Linkora SHK Marktplatz',
    description: 'Eigentümer von Ein- und Zweifamilienhäusern mit konkreter Heizungstausch-Absicht.',
    url: 'https://linkora.io/de/waermepumpen-leads',
    type: 'website',
  },
};

export default function WaermepumpenLeadsPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <HeaderNav brandName="Linkora" />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-[#0b1220] to-[#070b13] border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 rounded-full">
              Heizungs- &amp; Klimatechnik
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
              Vorqualifizierte Wärmepumpen-Leads
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Erhalten Sie kaufbereite Anfragen für den Austausch von Öl- und Gasheizungen durch
              moderne Luft-Wasser- oder Erdwärmepumpen.
            </p>
          </div>
        </section>

        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60">
              <Flame className="w-12 h-12 text-rose-400 mb-4" />
              <h3 className="font-bold text-xl text-white mb-3">Erfasste Objektdaten</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Aktueller Energieträger (Gas, Öl, Nachtspeicher)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Alter der bestehenden Heizungsanlage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Heizkörper vs. Fußbodenheizung (Vorlauftemperatur)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interesse an BEG / KfW Förderberatung</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <ThermometerSun className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="font-bold text-xl text-white mb-3">Direkte CRM-Auslieferung</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Die Leads werden per Webhook oder REST-Schnittstelle in Echtzeit an Ihre
                  Vertriebs- oder SHK-Software übertragen — inklusive Anrufnotizen und Score.
                </p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs text-emerald-400 font-mono">
                100% rechtskonform nach deutschem UWG &amp; DSGVO
              </div>
            </div>
          </div>
        </section>

        <ContactFormSection />
      </main>

      <PublicFooter brandName="Linkora" />
    </div>
  );
}
