'use client';

import React, { useEffect, useState } from 'react';

type Entry = { name: string; count: number };

let cache: { at: number; data: Promise<{ today: Entry[]; month: Entry[] } | null> } | null = null;

/** Loads the real agent ranking once per minute and shares it between widgets. */
function loadRanking() {
  if (!cache || Date.now() - cache.at > 60_000) {
    cache = {
      at: Date.now(),
      data: fetch('/api/v1/dashboard/leaderboard')
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    };
  }
  return cache.data;
}

export const rankingTitleDate = (period: 'today' | 'month') => {
  const now = new Date();
  return period === 'today'
    ? now.toLocaleDateString('de-DE')
    : `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
};

/** Agent ranking (leads entered) for today or this month – real data only. */
export function RankingList({ period }: { period: 'today' | 'month' }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadRanking().then((d) => {
      if (alive) setEntries(d ? d[period] || [] : []);
    });
    return () => {
      alive = false;
    };
  }, [period]);

  if (entries === null) {
    return <div className="py-3 text-center text-xs text-slate-400 font-medium">Wird geladen…</div>;
  }
  if (entries.length === 0) {
    return <div className="py-3 text-center text-xs text-slate-400 font-medium">Keine Daten verfügbar</div>;
  }
  return (
    <div className="space-y-2 stagger-items">
      {entries.map((r, i) => (
        <div key={r.name + i} className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50 transition">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 min-w-0">
            <span className="text-base w-5 text-center shrink-0">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
            <span className="truncate">{r.name}</span>
          </div>
          <span
            className={`${i === 0 ? 'bg-[#fef08a] text-amber-900' : 'bg-slate-100 text-slate-800'} font-extrabold text-xs px-2.5 py-0.5 rounded-full`}
          >
            {r.count}
          </span>
        </div>
      ))}
    </div>
  );
}
