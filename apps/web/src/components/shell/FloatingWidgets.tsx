'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/I18nContext';
import { Compass, UserPlus, Bell, X } from 'lucide-react';

export const FloatingWidgets: React.FC = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 flex items-center space-x-3 z-40 select-none">
      {/* 1. Guide / Rehber Button */}
      <button
        onClick={() => setIsHelpOpen(!isHelpOpen)}
        className="flex items-center space-x-2 bg-navy-800 hover:bg-navy-700 text-white px-4 py-2.5 rounded-full shadow-lg border border-navy-700 transition cursor-pointer group"
      >
        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-navy-950">
          <Compass className="w-3.5 h-3.5 fill-current" />
        </div>
        <span className="text-xs font-bold tracking-wide">{t('common.guide')}</span>
      </button>

      {/* 2. Green Add User FAB */}
      <button
        onClick={() => router.push('/users')}
        title={t('common.add_user')}
        className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition transform hover:scale-105 cursor-pointer"
      >
        <UserPlus className="w-5 h-5" />
      </button>

      {/* 3. Notification Bell with 99+ Badge */}
      <div className="relative">
        <button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          className="w-12 h-12 rounded-full bg-navy-900 hover:bg-navy-800 text-slate-200 flex items-center justify-center shadow-lg border border-navy-700 transition cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border-2 border-white shadow">
            99+
          </span>
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 bottom-14 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-bottom-2 text-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-sm">Benachrichtigungen</span>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-6 text-center text-xs text-slate-500">
              Keine neuen ungelesenen Benachrichtigungen
            </div>
          </div>
        )}
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-slate-900 border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Rehber / Onboarding Guide</h3>
              </div>
              <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                Willkommen beim Linkora Call-Center & Lead-Portal. Hier finden Sie Schnelleinstiege für:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Anruf-Bildschirm & Softphone starten</li>
                <li>Leads importieren & validieren</li>
                <li>Kampagnen-Tempo & AMD konfigurieren</li>
                <li>Guthaben aufladen & Rechnungen einsehen</li>
              </ul>
            </div>
            <button
              onClick={() => setIsHelpOpen(false)}
              className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium text-xs py-2.5 rounded-xl transition cursor-pointer"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
