'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { AlertTriangle, X } from 'lucide-react';

export const LowBalanceBanner: React.FC = () => {
  const { user, tenant, isBannerDismissed, dismissBanner } = useAuth();
  const { t } = useI18n();

  const isAgent = user?.mode === 'AGENT' || user?.role === 'Agent' || user?.role === 'AGENT';
  if (isAgent || isBannerDismissed || !tenant?.lowBalanceWarning) {
    return null;
  }

  const balanceFormatted = (tenant.walletBalance || 10.0).toFixed(2);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-xl w-full px-4 select-none animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-rose-600 text-white rounded-2xl shadow-xl p-3 px-5 flex items-center justify-between space-x-4 border border-rose-500">
        <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 fill-amber-300 text-rose-600" />
          <span>
            {t('common.low_balance_warning', { amount: balanceFormatted })}
          </span>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            onClick={() => alert('Guthaben aufladen (Phase 4 / 5)')}
            className="bg-white hover:bg-slate-50 text-rose-700 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            {t('common.top_up')}
          </button>
          <button
            onClick={dismissBanner}
            title="Schließen"
            className="text-rose-200 hover:text-white transition p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
