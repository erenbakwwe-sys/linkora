'use client';

import React, { useState } from 'react';
import { useI18n } from '@/context/I18nContext';
import { publicContent } from '@/lib/publicTranslations';
import { Send, CheckCircle2, AlertCircle, Building2, User, Briefcase, ShieldCheck } from 'lucide-react';

export const ContactFormSection: React.FC = () => {
  const { locale } = useI18n();
  const activeLocale = (locale === 'tr' || locale === 'en' ? locale : 'de') as 'de' | 'tr' | 'en';
  const ct = publicContent[activeLocale]?.contact || publicContent.de.contact;

  const [userType, setUserType] = useState<'COMPANY' | 'JOB_SEEKER' | 'PRIVATE_INDIVIDUAL'>('COMPANY');
  const [inquiryType, setInquiryType] = useState<'LEADS' | 'COLLABORATION' | 'DIALER' | 'JOB' | 'OTHER'>('LEADS');
  const [selectedProduct, setSelectedProduct] = useState('Photovoltaik');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Hidden spam bot trap

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setStatusMessage({
        type: 'error',
        text: 'Bitte stimmen Sie der Verarbeitung Ihrer Daten gemäß DSGVO zu.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/leads/public-inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userType,
          inquiryType,
          project: selectedProduct,
          firstName,
          lastName,
          companyName: userType === 'COMPANY' ? companyName : undefined,
          phone,
          email,
          postalCode,
          city,
          message,
          consentGranted,
          consentVersion: 'v2026.1',
          website_hp: honeypot, // Honeypot: must be empty
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.message || 'Fehler beim Absenden des Formulars.');
      }

      setStatusMessage({
        type: 'success',
        text: data.message || 'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt.',
      });

      // Clear fields
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setPhone('');
      setEmail('');
      setMessage('');
      setConsentGranted(false);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Verbindung zum Server fehlgeschlagen. Bitte versuchen Sie es später erneut.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kontakt" className="py-20 bg-slate-50/70 text-slate-900 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-full shadow-2xs">
            {ct.badge}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 mt-3 mb-3">
            {ct.title}
          </h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            {ct.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl backdrop-blur-md">
          {statusMessage && (
            <div
              className={`p-4 rounded-xl mb-6 flex items-start space-x-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: User Persona Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                {activeLocale === 'tr' ? '1. Başvuru Türü:' : activeLocale === 'en' ? '1. I am a:' : '1. Ich bin:'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('COMPANY')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                    userType === 'COMPANY'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{ct.tabCompany}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('JOB_SEEKER')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                    userType === 'JOB_SEEKER'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{ct.tabJob}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('PRIVATE_INDIVIDUAL')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                    userType === 'PRIVATE_INDIVIDUAL'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{ct.tabPrivate}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Conditional Fields based on Persona */}
            {userType === 'COMPANY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Interesse / Anliegen
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                  >
                    <option value="LEADS">Leads kaufen oder verkaufen</option>
                    <option value="DIALER">Cloud-Dialer & Software testen</option>
                    <option value="COLLABORATION">Partner-Netzwerk Kooperation</option>
                    <option value="OTHER">Allgemeine Beratung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Fokus-Branche (Projekt)
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                  >
                    <option value="Photovoltaik">Photovoltaik & Solaranlagen</option>
                    <option value="Wärmepumpe">Wärmepumpen & Heizung</option>
                    <option value="Treppenlift">Treppenlifte & Barrierefreiheit</option>
                    <option value="Energieberatung">Energieberatung (iSFP)</option>
                    <option value="Sanierung">Fenster & Dachsanierung</option>
                    <option value="Strom & Gas">Strom & Gas Wechsel</option>
                    <option value="Pflegebox">Pflegeboxen (§ 40 SGB XI)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {ct.lblFirstName} *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ahmet / Max"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {ct.lblLastName} *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Yılmaz / Mustermann"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            {userType === 'COMPANY' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {ct.lblCompany}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="GmbH / Ltd. Şti."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {ct.lblPhone} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 170 1234567 / +90 532 ..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {ct.lblEmail} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@sirketiniz.com"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{ct.lblPostal}</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="34000 / 10115"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">{ct.lblCity}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="İstanbul / Berlin"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {ct.lblMessage}
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={activeLocale === 'tr' ? 'Size nasıl yardımcı olabiliriz? (Örn: günlük arama hacmi, temsilci sayısı)' : 'Wie können wir Ihnen weiterhelfen?'}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-2xs"
              />
            </div>

            {/* Anti-Spam Honeypot Field (Mandatory in SPEC, invisible to real users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website_hp">Spam Protection</label>
              <input
                id="website_hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* Mandatory Explicit Consent Checkbox with Versioning */}
            <div className="pt-2">
              <label className="flex items-start space-x-3 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 rounded-sm bg-white border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="leading-relaxed">
                  {ct.consentText}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base transition-all shadow-xl shadow-amber-500/20 disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>{ct.btnSubmitting}</span>
                ) : (
                  <>
                    <span>{ct.btnSubmit}</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
