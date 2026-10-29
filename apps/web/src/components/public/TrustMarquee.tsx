'use client';

import React from 'react';
import { Shield, Cloud, Cpu, Database, CheckCircle, Lock } from 'lucide-react';

export const TrustMarquee: React.FC = () => {
  const partners = [
    { name: 'DE-Cloud Infrastructure', icon: Cloud, desc: 'ISO 27001 Rechenzentren Frankfurt' },
    { name: 'DSGVO Certified Hub', icon: Shield, desc: 'Revisionssichere Audit-Kette' },
    { name: 'NextGen AI Gateway', icon: Cpu, desc: 'Gemini / Claude / On-Premise' },
    { name: 'Carrier-Grade SIP', icon: Lock, desc: 'WebRTC & Telnyx Backbones' },
    { name: 'Enterprise CRM Sync', icon: Database, desc: 'REST & Webhook Connectoren' },
  ];

  return (
    <section className="py-12 bg-[#090e17] border-y border-slate-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
          Zertifizierte Sicherheit & Carrier-Grade Technologie für den D-A-CH Markt
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center">
          {partners.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:border-slate-600 transition group text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 group-hover:text-amber-400 transition-colors mb-2 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-sm text-slate-200 group-hover:text-white transition">
                  {p.name}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">{p.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
