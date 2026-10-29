'use client';

import React from 'react';
import { Sliders, Bot, Headphones, Mic2, Eye, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';

export const DialerFeaturesGrid: React.FC = () => {
  const features = [
    {
      icon: Sliders,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Tempo 1–10 Pacing Engine',
      desc: 'Dynamische Taktung der Wählleitungen in Echtzeit. Höchste Auslastung bei garantierter Einhaltung der maximal 3 % Abbruchquote.',
    },
    {
      icon: Bot,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      title: 'Präzise AMD-Erkennung',
      desc: 'Filtert Mailboxen, Besetztzeichen und AB-Ansagen in unter 1,2 Sekunden heraus, bevor der Agent überhaupt verbunden wird.',
    },
    {
      icon: Headphones,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'WebRTC Browser-Telefonie',
      desc: 'Keine Software-Installation, keine SIP-Hardware. Agenten telefonieren direkt im Browser mit integriertem Mikrofon-Check.',
    },
    {
      icon: Mic2,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: 'Dual-Channel Aufzeichnung',
      desc: 'Getrennte Tonspuren für Kunde und Mitarbeiter zur automatischen Transkription und lückenlosen Qualitätsprüfung.',
    },
    {
      icon: Eye,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      title: 'Supervisor Live-Coaching',
      desc: 'Mithören, Flüstern und Aufschalten in laufende Gespräche mit vollständiger Berechtigungsprüfung und revisionssicherem Audit-Log.',
    },
    {
      icon: CalendarCheck,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      title: 'Intelligente Wiedervorlagen',
      desc: 'Zeitzonen-optimierte Wiedervorlagen mit automatischer Priorisierung fälliger Rückrufe vor frischen Lead-Listen.',
    },
    {
      icon: Sparkles,
      color: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      title: 'Bilinguales TR-Assist',
      desc: 'Für türkische Call-Center: Priorisierte Wähllisten mit zweisprachigen Gesprächs-Briefings und intelligenten Einwandbehandlungs-Tipps.',
    },
    {
      icon: ShieldCheck,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      title: 'Echtzeit DNC-Sperrfilter',
      desc: 'Automatischer Abgleich gegen Robinsonlisten und interne Werbesperren vor jedem einzelnen Wählversuch.',
    },
  ];

  return (
    <section id="dialer" className="py-20 bg-[#0e172a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full">
            Integrierter Cloud-Dialer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
            Maximale Gesprächszeit statt lästigem Freizeichenton
          </h2>
          <p className="text-slate-400 text-base">
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
                className="bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-slate-600 p-6 rounded-2xl transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${feat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
