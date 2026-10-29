'use client';

import React, { useState } from 'react';
import { Check, Phone, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [selectedPack, setSelectedPack] = useState<'1k' | '5k' | '10k'>('5k');

  const packages = [
    {
      id: '1k',
      name: 'Starter Kontingent',
      minutes: '1.000 Min',
      price: '40 €',
      rate: '0,040 € / Min',
      popular: false,
      desc: 'Optimal zum Kennenlernen, für kleine Teams oder Kampagnen-Pilotphasen.',
      features: [
        'Volle WebRTC Browser-Telefonie',
        'Tempo 1–10 Pacing-Engine',
        'Integrierte AMD Mailbox-Erkennung',
        'Sekundengenaue Abrechnung',
        'Keine Grundgebühr',
      ],
    },
    {
      id: '5k',
      name: 'Professional Kontingent',
      minutes: '5.000 Min',
      price: '190 €',
      rate: '0,038 € / Min (5% Rabatt)',
      popular: true,
      desc: 'Der Bestseller für wachsende Outbound-Teams und Call-Center mit täglichem Wählvolumen.',
      features: [
        'Alle Starter-Funktionen inklusive',
        'Automatische Rufnummern-Rotation',
        'Supervisor Live-Mithören & Flüstern',
        'Dual-Channel Sprachaufzeichnung',
        'Prioritärer Telefon- & Chat-Support',
      ],
    },
    {
      id: '10k',
      name: 'Enterprise Kontingent',
      minutes: '10.000 Min',
      price: '360 €',
      rate: '0,036 € / Min (10% Rabatt)',
      popular: false,
      desc: 'Maximale Kosteneffizienz für Großkampagnen, Multi-Tenant Firmen und Vertriebsorganisationen.',
      features: [
        'Alle Professional-Funktionen inklusive',
        'Eigene SIP-Trunk Anbindung optional',
        'Mandanten-Subunternehmens Provisioning',
        'Dedizierter Account Manager',
        'Individuelle SLA-Vereinbarungen',
      ],
    },
  ];

  return (
    <section id="preise" className="py-20 bg-[#090e17] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Faire & Transparente Preise
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-4">
            Keine monatliche Grundgebühr. Zahlen Sie nur, wenn Sie sprechen.
          </h2>
          <p className="text-slate-400 text-base">
            Starten Sie mit 0,04 € / Gesprächsminute oder sparen Sie bis zu 10% mit unseren flexiblen
            Prepaid-Minutenpaketen. Nicht verbrauchte Minuten verfallen niemals.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPack(pkg.id as any)}
              className={`relative rounded-3xl p-8 transition duration-200 cursor-pointer flex flex-col justify-between ${
                pkg.popular
                  ? 'bg-slate-800/90 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 scale-105 z-10'
                  : 'bg-slate-800/40 border border-slate-700/60 hover:border-slate-600'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider py-1 px-3.5 rounded-full shadow-md">
                  Meistgewählt
                </div>
              )}

              <div>
                <div className="flex justify-between items-baseline mb-3">
                  <h3 className="font-bold text-xl text-white">{pkg.name}</h3>
                  <span className="text-xs font-mono text-sky-400">{pkg.minutes}</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">{pkg.desc}</p>

                <div className="mb-6 pb-6 border-b border-slate-700/60">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold tracking-tight text-white">
                      {pkg.price}
                    </span>
                    <span className="text-xs text-slate-400">exkl. MwSt.</span>
                  </div>
                  <div className="text-xs text-amber-400 font-semibold mt-1">{pkg.rate}</div>
                </div>

                <div className="space-y-3 mb-8">
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-center space-x-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#kontakt"
                className={`w-full py-3 rounded-xl font-bold text-center text-sm transition block ${
                  pkg.popular
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-700/80 hover:bg-slate-700 text-white'
                }`}
              >
                Paket auswählen & anfragen
              </a>
            </div>
          ))}
        </div>

        {/* Number Rotation Visual (Mandatory Feature in SPEC) */}
        <div className="bg-slate-800/40 rounded-3xl p-6 sm:p-8 border border-slate-700/60 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h4 className="font-bold text-base text-white">
                Intelligente Rufnummern-Rotation (CLI Reputation)
              </h4>
              <p className="text-xs text-slate-400 max-w-xl mt-0.5">
                Schützen Sie Ihre Wählquoten: Die Plattform rotiert deutsche (+49) Festnetz- und
                Mobilfunknummern turnusmäßig (wöchentlich/14-tägig) und pausiert verbrannte Nummern
                vollautomatisch.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700 font-mono text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Pool aktiv (18 Nummern)</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Spam-Score: 0.0% sauber</span>
          </div>
        </div>
      </div>
    </section>
  );
};
