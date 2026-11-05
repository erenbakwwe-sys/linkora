'use client';

import React from 'react';
import Link from 'next/link';
import { HeaderNav } from '@/components/public/HeaderNav';
import { LiveCampaignPreview } from '@/components/public/LiveCampaignPreview';
import { TrustMarquee } from '@/components/public/TrustMarquee';
import {
  ThreeFeatureCards,
  LeadPartnersProcess,
  ProofStatsGrid,
  IndustriesGrid,
} from '@/components/public/PublicSections';
import { DialerFeaturesGrid } from '@/components/public/DialerFeaturesGrid';
import { FaqAccordion } from '@/components/public/FaqAccordion';
import { ContactFormSection } from '@/components/public/ContactFormSection';
import { PublicFooter } from '@/components/public/PublicFooter';
import { useI18n } from '@/context/I18nContext';
import { publicContent } from '@/lib/publicTranslations';
import {
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Layers,
  PhoneCall,
  Headphones,
  Check,
  Briefcase,
  ExternalLink,
} from 'lucide-react';

export default function PublicLandingPage() {
  const { locale } = useI18n();
  const activeLocale = (locale === 'tr' || locale === 'en' ? locale : 'de') as 'de' | 'tr' | 'en';
  const content = publicContent[activeLocale] || publicContent.de;

  return (
    <div className="min-h-screen bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* 1. Header Navigation */}
      <HeaderNav brandName="Linkora" />

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden bg-gradient-to-b from-white via-slate-50/70 to-[#fbfcfd] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-sky-50 border border-sky-200/80 text-sky-800 text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{content.hero.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
                {content.hero.titleStart}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-sky-600">
                  {content.hero.titleGradient}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {content.hero.description}
              </p>

              {/* 2 CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#kontakt"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 transition cursor-pointer"
                >
                  <span>{content.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm px-6 py-3.5 rounded-xl shadow-2xs transition"
                >
                  <span>{content.hero.ctaSecondary}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </Link>
              </div>

              {/* 3 Trust Ticks */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{content.hero.trustGdpr}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{content.hero.trustNoContract}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{content.hero.trustQuickSetup}</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Live Campaign Preview Card */}
            <div className="lg:col-span-6">
              <LiveCampaignPreview />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Feature Cards (Teams · Leads · Technologie) */}
      <ThreeFeatureCards />

      {/* 4. Trust-Logo Marquee (Placeholders only) */}
      <TrustMarquee />

      {/* 5. Lead Partners Section (4 Steps) */}
      <LeadPartnersProcess />

      {/* 6. Proof Stats Grid */}
      <ProofStatsGrid />

      {/* 7. Three Building Blocks & Checklist */}
      <section className="py-20 bg-slate-50/70 text-slate-900 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full shadow-2xs">
              {content.infra.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3 mb-4">
              {content.infra.title}
            </h2>
            <p className="text-slate-600 text-sm">
              {content.infra.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-base text-amber-600 mb-3">{content.infra.col1Title}</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {content.infra.col1Bullets.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-base text-sky-600 mb-3">{content.infra.col2Title}</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {content.infra.col2Bullets.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
              <h3 className="font-bold text-base text-emerald-600 mb-3">{content.infra.col3Title}</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                {content.infra.col3Bullets.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Dialer Features Grid (Tempo 1-10, AMD, etc.) */}
      <DialerFeaturesGrid />

      {/* 9. Modular Solution Packs */}
      <section className="py-20 bg-white text-slate-900 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-800 bg-sky-50 border border-sky-200/80 px-3 py-1 rounded-full shadow-2xs">
              {content.solutions.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3 mb-3">
              {content.solutions.title}
            </h2>
            <p className="text-slate-600 text-sm">
              {content.solutions.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50/70 hover:bg-slate-50 p-7 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold mb-4">
                  CRM
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{content.solutions.pack1Title}</h3>
                <p className="text-slate-600 text-xs mb-4">
                  {content.solutions.pack1Desc}
                </p>
              </div>
              <a href="#kontakt" className="text-sky-600 text-xs font-bold hover:underline">
                {content.solutions.pack1Cta}
              </a>
            </div>

            <div className="bg-slate-50/70 hover:bg-slate-50 p-7 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center font-bold mb-4">
                  VOIP
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{content.solutions.pack2Title}</h3>
                <p className="text-slate-600 text-xs mb-4">
                  {content.solutions.pack2Desc}
                </p>
              </div>
              <a href="#kontakt" className="text-sky-600 text-xs font-bold hover:underline">
                {content.solutions.pack2Cta}
              </a>
            </div>

            <div className="bg-white p-7 rounded-2xl border-2 border-amber-500 shadow-xl shadow-amber-500/10 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold mb-4">
                  ALL
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{content.solutions.pack3Title}</h3>
                <p className="text-slate-600 text-xs mb-4">
                  {content.solutions.pack3Desc}
                </p>
              </div>
              <a href="#kontakt" className="text-amber-600 text-xs font-bold hover:underline">
                {content.solutions.pack3Cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Industries Grid */}
      <IndustriesGrid />

      {/* 12. Career Section */}
      <section id="karriere" className="py-20 bg-slate-50/70 text-slate-900 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs px-3.5 py-1.5 rounded-full font-semibold mb-4 shadow-2xs">
            <Briefcase className="w-3.5 h-3.5" />
            <span>{content.career.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mb-4">
            {content.career.title}
          </h2>

          <p className="text-slate-600 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
            {content.career.desc}
          </p>

          <a
            href="#kontakt"
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm px-6 py-3 rounded-xl border border-slate-300 shadow-2xs transition cursor-pointer"
          >
            <span>{content.career.cta}</span>
            <ArrowRight className="w-4 h-4 text-amber-500" />
          </a>
        </div>
      </section>

      {/* 13. FAQ Accordion (with FAQ JSON-LD) */}
      <FaqAccordion />

      {/* 14. Contact Form Section (Honeypot, User Type, Products, Consent) */}
      <ContactFormSection />

      {/* 15. Public Footer */}
      <PublicFooter brandName="Linkora" />
    </div>
  );
}
