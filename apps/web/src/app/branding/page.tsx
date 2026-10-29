'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Sparkles,
  Palette,
  CheckCircle2,
  Image as ImageIcon,
  Building,
} from 'lucide-react';

export default function BrandingPage() {
  const [brandName, setBrandName] = useState('Linkora Dialing');
  const [accentColor, setAccentColor] = useState('#0284c7');
  const [logoUrl, setLogoUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3001/api/tenants/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          primary_color: accentColor,
          logo_url: logoUrl || null,
        }),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed save branding:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <Palette className="w-7 h-7 text-indigo-500" />
          Firmenlogo & White-Label Branding
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Konfigurieren Sie Markenidentität, Primärfarben und Logo-Upload für Ihren Mandanten. Änderungen werden sofort
          und ohne Software-Redeploy wirksam.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Branding erfolgreich gespeichert und live angewendet!
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Brand-Name / Markenbezeichnung</label>
          <input
            type="text"
            required
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Primäre Akzentfarbe</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border p-0.5"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-32 border rounded-lg p-2 font-mono text-sm"
            />
            <span
              className="px-3 py-1.5 rounded-lg text-white font-bold text-xs"
              style={{ backgroundColor: accentColor }}
            >
              Vorschau Button
            </span>
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Logo URL (Optional)</label>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://ihre-firma.de/logo.png"
            className="w-full border rounded-lg p-2.5 text-sm"
          />
        </div>

        {/* Live Preview Card */}
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 mt-4">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Vorschau Header</span>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs"
                style={{ backgroundColor: accentColor }}
              >
                {brandName.slice(0, 1)}
              </div>
              <span className="font-bold text-sm">{brandName}</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold">● Live</span>
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm"
        >
          Branding speichern & anwenden
        </button>
      </form>
      </div>
    </AppShell>
  );
}
