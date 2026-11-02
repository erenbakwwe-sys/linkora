'use client';

import React from 'react';
import { Sliders, Bot, Headphones, Mic2, Eye, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';

export const DialerFeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Sliders,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: 'Tempo 1–10 Pacing Engine',
      desc: 'Dynamische Taktung der Wählleitungen in Echtzeit. Höchste Auslastung bei garantierter Einhaltung der maximal 3 % Abbruchquote.',
    },
    {
      icon: Bot,
      color: 'text-sky-600 bg-sky-50 border-sky-200',
      title: 'Präzise AMD-Erkennung',
      desc: 'Filtert Mailboxen, Besetztzeichen und AB-Ansagen in unter 1,2 Sekunden heraus, bevor der Agent überhaupt verbunden wird.',
    },
    {
      icon: Headphones,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      title: 'WebRTC Browser-Telefonie',
      desc: 'Keine Software-Installation, keine SIP-Hardware. Agenten telefonieren direkt im Browser mit integriertem Mikrofon-Check.',
    },
    {
      icon: Mic2,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      title: 'Dual-Channel Aufzeichnung',
      desc: 'Getrennte Tonspuren für Kunde und Mitarbeiter zur automatischen Transkription und lückenlosen Qualitätsprüfung.',
    },
    {
      icon: Eye,
      color: 'text-rose-600 bg-rose-50 border-rose-200',
      title: 'Supervisor Live-Coaching',
      desc: 'Mithören, Flüstern und Aufschalten in laufende Gespräche mit vollständiger Berechtigungsprüfung und revisionssicherem Audit-Log.',
    },
    {
      icon: CalendarCheck,
      color: 'text-cyan-600 bg-cyan-50 border-cyan-200',
      title: 'Intelligente Wiedervorlagen',
      desc: 'Zeitzonen-optimierte Wiedervorlagen mit automatischer Priorisierung fälliger Rückrufe vor frischen Lead-Listen.',
    },
    {
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      title: 'Bilinguales TR-Assist',
      desc: 'Für türkische Call-Center: Priorisierte Wähllisten mit zweisprachigen Gesprächs-Briefings und intelligenten Einwandbehandlungs-Tipps.',
    },
    {
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      title: 'Echtzeit DNC-Sperrfilter',
      desc: 'Automatischer Abgleich gegen Robinsonlisten und interne Werbesperren vor jedem einzelnen Wählversuch.',
    },
  ];

  return (
    <section id="dialer" className="py-20 bg-white text-slate-900 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full shadow-2xs">
            Integrierter Cloud-Dialer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3 mb-4">
            Maximale Gesprächszeit statt lästigem Freizeichenton
          </h2>
          <p className="text-slate-600 text-base">
            Moderne Wählmodi (Preview, Progressive, Power & Predictive) kombiniert mit modernster
            KI-Unterstützung für höchste Konversionsraten im Call-Center.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/70 hover:bg-white border border-slate-200/80 hover:border-slate-300 p-6 rounded-2xl transition duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${feat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{feat.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
