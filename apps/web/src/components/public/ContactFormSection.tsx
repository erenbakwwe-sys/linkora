'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Building2, User, Briefcase, ShieldCheck } from 'lucide-react';

export const ContactFormSection: React.FC = () => {
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
      const res = await fetch('http://localhost:3001/api/leads/public-inquiry', {
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
    <section id="kontakt" className="py-20 bg-[#090e17] text-white border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Kontakt & Live-Demo
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-3">
            Jetzt unverbindlich beraten lassen
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Testen Sie unsere Plattform kostenfrei oder fordern Sie ein maßgeschneidertes Angebot
            für Ihre Kampagnen an. Wir melden uns innerhalb von 24 Stunden.
          </p>
        </div>

        <div className="bg-slate-800/40 rounded-3xl p-6 sm:p-10 border border-slate-700/60 shadow-2xl backdrop-blur-md">
          {statusMessage && (
            <div
              className={`p-4 rounded-xl mb-6 flex items-start space-x-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: User Persona Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                1. Ich bin:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('COMPANY')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                    userType === 'COMPANY'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Unternehmen / Call-Center</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('JOB_SEEKER')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                    userType === 'JOB_SEEKER'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Arbeitssuchend</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType('PRIVATE_INDIVIDUAL')}
                  className={`py-3 px-4 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition cursor-pointer ${
                    userType === 'PRIVATE_INDIVIDUAL'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Privatperson</span>
                </button>
              </div>
            </div>

            {/* Step 2: Conditional Fields based on Persona */}
            {userType === 'COMPANY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Interesse / Anliegen
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value as any)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="LEADS">Leads kaufen oder verkaufen</option>
                    <option value="DIALER">Cloud-Dialer & Software testen</option>
                    <option value="COLLABORATION">Partner-Netzwerk Kooperation</option>
                    <option value="OTHER">Allgemeine Beratung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Fokus-Branche (Projekt)
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Vorname *
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Max"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nachname *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {userType === 'COMPANY' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Unternehmensname
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Muster Solar GmbH"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Telefonnummer *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 170 1234567"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  E-Mail Adresse *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kontakt@unternehmen.de"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">PLZ</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="10115"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ort</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Berlin"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nachricht / Anmerkungen (optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Wie können wir Ihnen weiterhelfen? (z.B. geplantes Anrufvolumen, Wunsch-Starttermin)"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-hidden focus:border-amber-500"
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
              <label className="flex items-start space-x-3 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 rounded-sm bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                />
                <span className="leading-relaxed">
                  Ich willige ein, dass meine Daten zur Kontaktaufnahme und Beantwortung meiner
                  Anfrage gemäß der{' '}
                  <a href="/de/datenschutz" target="_blank" className="text-sky-400 underline">
                    Datenschutzerklärung
                  </a>{' '}
                  elektronisch gespeichert und verarbeitet werden (Version v2026.1). Diese
                  Einwilligung kann ich jederzeit formlos widerrufen.
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
                  <span>Wird übermittelt...</span>
                ) : (
                  <>
                    <span>Anfrage unverbindlich absenden</span>
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
