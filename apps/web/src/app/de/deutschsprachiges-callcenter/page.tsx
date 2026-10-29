import React from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from '@/components/public/HeaderNav';
import { PublicFooter } from '@/components/public/PublicFooter';
import { ContactFormSection } from '@/components/public/ContactFormSection';
import { Headphones, Sparkles, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Deutschsprachiges Callcenter in der Türkei & Nearshore | Linkora Cloud-Dialer',
  description:
    'Spezialisierte Cloud-Dialer Plattform für deutschsprachige Call-Center in der Türkei und Nearshore. Mit bilingualem TR-Assist, KI-Briefing und DSGVO-Servern.',
  alternates: {
    canonical: 'https://linkora.io/de/deutschsprachiges-callcenter',
  },
  openGraph: {
    title: 'Deutschsprachige Callcenter Software — TR AI-Assist Dialer',
    description: 'Cloud-Dialer & Lead-Management für Outbound-Teams in Istanbul, Izmir & Antalya.',
    url: 'https://linkora.io/de/deutschsprachiges-callcenter',
    type: 'website',
  },
};

export default function DeutschsprachigesCallcenterPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <HeaderNav brandName="Linkora" />

      <main className="flex-1">
        <section className="py-20 bg-gradient-to-b from-[#0b1220] to-[#070b13] border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3.5 py-1.5 rounded-full">
              Nearshore &amp; Türkei Spezialisierung
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4 tracking-tight">
              Software für deutschsprachige Call-Center in der Türkei
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Verbinden Sie Ihre türkischen Outbound-Agenten mit deutschen Lead-Auftraggebern.
              Mit zweisprachigem KI-Briefing (TR/DE), sekundengenauem Pacing und 0,04 €/Min Telefonie.
            </p>
          </div>
        </section>

        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-800/40 p-7 rounded-2xl border border-slate-700/60">
              <Sparkles className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Bilinguales KI-Briefing</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Agenten erhalten vor dem Anruf eine türkische Zusammenfassung des deutschen Kunden,
                vorgeschlagene Fragen und Hilfen zur Einwandbehandlung.
              </p>
            </div>

            <div className="bg-slate-800/40 p-7 rounded-2xl border border-slate-700/60">
              <Headphones className="w-10 h-10 text-sky-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">Glasklares WebRTC</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Keine VPN-Komplexität, keine Verzögerungen. Direkte High-Speed SIP-Anbindung an
                deutsche Carrier mit 4,35 MOS Sprachqualität.
              </p>
            </div>

            <div className="bg-slate-800/40 p-7 rounded-2xl border border-slate-700/60">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="font-bold text-lg text-white mb-2">100% DSGVO-Sicherheit</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Revisionssichere PII-Maskierung und EU-konforme Datenhaltung. Vollständig abgesichert
                für deutsche Auftraggeber und Betriebsräte.
              </p>
            </div>
          </div>
        </section>

        <ContactFormSection />
      </main>

      <PublicFooter brandName="Linkora" />
    </div>
  );
}
