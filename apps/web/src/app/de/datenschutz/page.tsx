import React from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from '@/components/public/HeaderNav';
import { PublicFooter } from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung | Linkora DSGVO-Compliance',
  description: 'Informationen zur Erhebung und Verarbeitung personenbezogener Daten gemäß DSGVO.',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <HeaderNav brandName="Linkora" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Datenschutzerklärung</h1>
        <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/60 space-y-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-white mb-2">1. Datenschutz auf einen Blick</h2>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
              behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
              Datenschutzvorschriften (DSGVO, BDSG) sowie dieser Datenschutzerklärung.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">2. Verantwortliche Stelle</h2>
            <p>
              Verantwortlicher im Sinne der Datenschutzgesetze ist:<br />
              Linkora Software Solutions GmbH<br />
              Friedrichstraße 100, 10117 Berlin<br />
              E-Mail: datenschutz@linkora.io
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">3. Erhebung von Lead- und Telefondaten</h2>
            <p>
              Im Rahmen der Plattform-Nutzung werden Lead-Daten verarbeitet. Die Erhebung und
              Verarbeitung erfolgt streng zweckgebunden auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO
              (ausdrückliche Einwilligung) oder Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Jeder
              Lead verfügt über einen unveränderlichen, kryptografisch verifizierten Nachweis
              (Opt-in Zeitstempel, IP-Adresse, Quell-URL, Einwilligungswortlaut Version v2026.1).
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">4. KI-Verarbeitung & PII-Maskierung</h2>
            <p>
              Vor jeder automatisierten Analyse (z.B. KI-Scoring, Transkription oder
              Konformitätsprüfung) werden sensible personenidentifizierbare Merkmale (Namen,
              Rufnummern, E-Mails) clientseitig bzw. auf unserem geschützten DE-Server durch anonyme
              Tokens maskiert. Die Zuordnungstabelle verbleibt ausschließlich in isolierten,
              verschlüsselten Datenbanken.
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">5. Ihre Rechte (Auskunft, Löschung, Widerruf)</h2>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten
              personenbezogenen Daten (Art. 15 DSGVO), deren Herkunft und Empfänger, das Recht auf
              Berichtigung (Art. 16 DSGVO) sowie Löschung (Art. 17 DSGVO). Sie können eine erteilte
              Einwilligung jederzeit formlos per E-Mail an datenschutz@linkora.io widerrufen.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter brandName="Linkora" />
    </div>
  );
}
