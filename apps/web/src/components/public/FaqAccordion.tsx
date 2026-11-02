'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FaqAccordion: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Wie funktioniert die Abrechnung der Telefonie-Minuten?',
      a: 'Sie zahlen standardmäßig 0,04 € pro reiner Gesprächsminute (sekundengenau abgerechnet). Für nicht zustande gekommene Verbindungen, Besetztzeichen oder Anrufbeantworter fallen keinerlei Kosten an. Es gibt keine monatliche Grundgebühr oder Mindestvertragslaufzeit.',
    },
    {
      q: 'Ist die Plattform zu 100 % DSGVO- und UWG-konform?',
      a: 'Ja. Alle Daten werden ausschließlich auf ISO-27001-zertifizierten Servern in Deutschland gehostet. Das System erzwingt vor jedem Anruf einen lückenlosen Werbeeinwilligungs-Nachweis (Opt-in Zeitstempel, Quell-URL, IP und Einwilligungstext) und sperrt Leads ohne Nachweis automatisch.',
    },
    {
      q: 'Wie werden Anrufbeantworter und Mailboxen gefiltert?',
      a: 'Unsere integrierte KI-gestützte AMD-Technologie (Answering Machine Detection) erkennt menschliche Stimmen und Anrufbeantworter in unter 1,2 Sekunden. Erkannte Mailboxen werden sofort getrennt, ohne dass ein Agent wertvolle Arbeitszeit verliert.',
    },
    {
      q: 'Kann ich meine eigenen Rufnummern oder SIP-Trunks nutzen?',
      a: 'Ja. Neben unserem sofort nutzbaren, rotationsgestützten Rufnummern-Pool können Sie eigene deutsche Ortsnetz- oder Mobilfunk-Trunks über standardisierte SIP-Schnittstellen (Telnyx, Twilio, FreeSWITCH) nahtlos anbinden.',
    },
    {
      q: 'Wie läuft die Reklamation von fehlerhaften Leads ab?',
      a: 'Käufer von Leads können fehlerhafte Kontakte (z.B. falsche Nummer, kein Interesse) innerhalb von 7 Tagen mit einem Klick reklamieren. Das System prüft die Kriterien und schreibt den Betrag centgenau Ihrem Guthaben-Konto gut.',
    },
    {
      q: 'Benötigen meine Call-Center-Mitarbeiter spezielle Software?',
      a: 'Nein. Unser Cloud-Dialer basiert vollständig auf WebRTC. Ihre Agenten benötigen lediglich einen modernen Webbrowser (Chrome, Edge, Firefox) und ein gängiges Headset.',
    },
  ];

  // Schema.org FAQPage JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <section id="faq" className="py-20 bg-white text-slate-900 border-b border-slate-200/80">
      {/* Schema.org JSON-LD Script for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full shadow-2xs">
            Häufige Fragen
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3 mb-3">
            Fragen & Antworten
          </h2>
          <p className="text-slate-600 text-sm">
            Alles Wichtige zu Technologie, Abrechnung, Compliance und Onboarding.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-2xl overflow-hidden transition shadow-2xs"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between font-bold text-slate-900 hover:text-slate-950 transition"
                >
                  <span className="text-base pr-4">{faq.q}</span>
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 shadow-2xs">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 border-t border-slate-200/70 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
