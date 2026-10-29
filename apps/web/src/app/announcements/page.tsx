'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Megaphone,
  Pin,
  Eye,
  Plus,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  authorName: string;
  readCount: number;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchAnnouncements = () => {
    fetch('/api/operations/announcements')
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setAnnouncements(d);
      })
      .catch((err) => console.error('Failed to load announcements:', err));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await fetch('/api/operations/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, isPinned: true }),
      });
      setTitle('');
      setContent('');
      setShowAddModal(false);
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed create announcement:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Megaphone className="w-7 h-7 text-rose-500" />
            Ankündigungen & Unternehmensmitteilungen
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gepinnte Mitteilungen der Geschäftsleitung und Teamleitung mit automatischer Lesebestätigung.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Neue Ankündigung
        </button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`p-6 rounded-xl border transition-all ${
              a.isPinned
                ? 'bg-rose-50/40 border-rose-200 shadow-sm'
                : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {a.isPinned && <Pin className="w-4 h-4 text-rose-600 fill-rose-600" />}
                <h2 className="text-base font-bold text-slate-900">{a.title}</h2>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(a.createdAt).toLocaleDateString('de-DE')}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed mt-2">{a.content}</p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-4 border-t border-slate-100">
              <span>Autor: <strong className="text-slate-600">{a.authorName}</strong></span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {a.readCount} Lesebestätigungen
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border p-6 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Neue Mitteilung verfassen</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Neue KfW Richtlinien..."
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Inhalt</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Mitteilungstext eingeben..."
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  Abbrechen
                </button>
                <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-semibold rounded-lg">
                  Veröffentlichen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AppShell>
  );
}
