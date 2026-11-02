'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/context/I18nContext';
import { publicContent } from '@/lib/publicTranslations';
import { ShieldCheck, Heart } from 'lucide-react';

interface PublicFooterProps {
  brandName?: string;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ brandName = 'Linkora' }) => {
  const { locale } = useI18n();
  const activeLocale = (locale === 'tr' || locale === 'en' ? locale : 'de') as 'de' | 'tr' | 'en';
  const ft = publicContent[activeLocale]?.footer || publicContent.de.footer;

  return (
    <footer className="bg-[#060a12] text-slate-400 text-xs border-t border-slate-900 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                {brandName[0]}
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">{brandName}</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-sm mb-4">
              {ft.desc}
            </p>
            <div className="flex items-center space-x-2 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{activeLocale === 'tr' ? '%100 KVKK & ISO 27001 Uyumlu · DE Barındırma' : '100% DSGVO & ISO 27001 Konform · DE-Hosting'}</span>
            </div>
          </div>

          {/* Solutions Col */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              {ft.col1Title}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#leistungen" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Lead Pazaryeri' : 'Lead-Marktplatz'}
                </a>
              </li>
              <li>
                <a href="#dialer" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Bulut Dialer & Softphone' : 'Cloud-Dialer & Softphone'}
                </a>
              </li>
              <li>
                <Link href="/de/photovoltaik-leads" className="hover:text-white transition">
                  Photovoltaik Leads (PV)
                </Link>
              </li>
              <li>
                <Link href="/de/waermepumpen-leads" className="hover:text-white transition">
                  Wärmepumpen Leads
                </Link>
              </li>
              <li>
                <Link href="/de/deutschsprachiges-callcenter" className="hover:text-white transition">
                  TR Call-Center Assist
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              {ft.col2Title}
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#preise" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Fiyatlar & Dakika Paketleri' : 'Preise & Minutenpakete'}
                </a>
              </li>
              <li>
                <Link href="/de/leads-verkaufen-deutschland" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Lead Satışı Yapın' : 'Leads verkaufen'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Canlı Panel' : 'Live-Dashboard Panel'}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Personel Girişi' : 'Mitarbeiter Login'}
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  {activeLocale === 'tr' ? 'Sıkça Sorulan Sorular (SSS)' : 'Häufige Fragen (FAQ)'}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              {ft.col3Title}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/de/impressum" className="hover:text-white transition">
                  {ft.imprint}
                </Link>
              </li>
              <li>
                <Link href="/de/datenschutz" className="hover:text-white transition">
                  {ft.privacy}
                </Link>
              </li>
              <li>
                <span className="text-slate-500">{activeLocale === 'tr' ? 'Genel Şartlar (AGB)' : 'AGB (Allgemeine Bedingungen)'}</span>
              </li>
              <li>
                <span className="text-slate-500">{activeLocale === 'tr' ? 'Veri İşleme Sözleşmesi (AVV)' : 'Auftragsverarbeitung (AVV)'}</span>
              </li>
              <li>
                <div className="flex items-center space-x-1.5 text-emerald-400 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{activeLocale === 'tr' ? 'Tüm Sistemler Aktif' : 'Alle Systeme betriebsbereit'}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} {brandName} Platform. {ft.rights}
          </div>
          <div className="mt-2 sm:mt-0">
            White-Label Lead-Management & Call-Center Suite.
          </div>
        </div>
      </div>
    </footer>
  );
};
