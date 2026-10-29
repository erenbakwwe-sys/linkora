import React from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from '@/components/public/HeaderNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { ContactFormSection } from '@/components/public/ContactFormSection';
import { Sun, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Photovoltaik Leads kaufen & verkaufen | Vorqualifizierte Solar-Anfragen',
  description:
    'Exklusive und qualifizierte Photovoltaik Leads für Solarteure und Vertriebs-Teams in Deutschland. Mit vollständiger Eigentümerprüfung, Dachneigung & Speicher-Bedarf.',
  alternates: {
    canonical: 'https://linkora.io/de/photovoltaik-leads',
  },
  openGraph: {
    title: 'Exklusive Photovoltaik Leads — Linkora Solar Marktplatz',
    description: 'Vorqualifizierte Hauseigentümer mit Interesse an Solaranlagen und Speichern.',
    url: 'https://linkora.io/de/photovoltaik-leads',
    type: 'website',
  },
};

export default function PhotovoltaikLeadsPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <HeaderNav brandName="Linkora" />

      <main className="flex-1">
        {/* SEO Header */}
        <section className="py-20 bg-gradient-to-b from-[#0b1220] to-[#070b13] border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
              Solar &amp; Erneuerbare Energien
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
              Hochwertige Photovoltaik-Leads für Ihren Vertrieb
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Steigern Sie Ihre Abschlussquote mit vorqualifizierten Solaranfragen. Geprüfte
              Hauseigentümer, validierte Dachflächen und lückenloser DSGVO-Einwilligungsnachweis.
            </p>
          </div>
        </section>

        {/* Feature Points */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60">
              <Sun className="w-12 h-12 text-amber-400 mb-4" />
              <h3 className="font-bold text-xl text-white mb-3">Qualifizierte Datenpunkte</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Echtes Hauseigentum (keine Mieter/Wohnungen)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dachform, Neigung und Ausrichtung abgefragt</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Stromverbrauch &amp; Batteriespeicher-Wunsch erfasst</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Telefonische Erreichbarkeit im Dialer vorab geprüft</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60 flex flex-col justify-between">
              <div>
                <Zap className="w-12 h-12 text-sky-400 mb-4" />
                <h3 className="font-bold text-xl text-white mb-3">Exklusiv oder Geteilt</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  Wählen Sie flexibel zwischen 1:1 Exklusiv-Leads für Ihre regionalen Montageteams
                  oder kostengünstigen 1:3 Co-Leads für maximales Terminvolumen.
                </p>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs text-amber-300 font-mono">
                Durchschnittlicher Konversions-Score: 84 / 100 Punkte (Band A)
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
