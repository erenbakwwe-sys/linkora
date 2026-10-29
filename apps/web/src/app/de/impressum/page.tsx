import React from 'react';
import type { Metadata } from 'next';
import { HeaderNav } from '@/components/public/HeaderNav';
import { PublicFooter } from '@/components/public/PublicFooter';

export const metadata: Metadata = {
  title: 'Impressum | Linkora Unified Lead-Bank & Cloud-Dialer',
  description: 'Gesetzliche Anbieterkennzeichnung gemäß § 5 TMG.',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans">
      <HeaderNav brandName="Linkora" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-extrabold text-white mb-6">Impressum</h1>
        <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700/60 space-y-6 text-sm text-slate-300 leading-relaxed">
          <div>
            <h2 className="text-base font-bold text-white mb-2">Angaben gemäß § 5 TMG</h2>
            <p>
              Linkora Software Solutions GmbH (Musterfirma)<br />
              Friedrichstraße 100<br />
              10117 Berlin<br />
              Deutschland
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Vertreten durch</h2>
            <p>Geschäftsführung: Eren Samsun</p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Kontakt</h2>
            <p>
              Telefon: +49 (0) 30 12345678<br />
              E-Mail: kontakt@linkora.io<br />
              Website: https://linkora.io
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Registereintrag</h2>
            <p>
              Eintragung im Handelsregister.<br />
              Registergericht: Amtsgericht Charlottenburg (Berlin)<br />
              Registernummer: HRB 998877 B
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE 345 678 901
            </p>
          </div>

          <div>
            <h2 className="text-base font-bold text-white mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p>
              Eren Samsun<br />
              Friedrichstraße 100<br />
              10117 Berlin
            </p>
          </div>
        </div>
      </main>

      <PublicFooter brandName="Linkora" />
    </div>
  );
}
