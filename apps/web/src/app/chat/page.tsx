'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  MessageCircle,
  Send,
  User,
  Hash,
  Smile,
  Paperclip,
} from 'lucide-react';

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputMsg, setInputMsg] = useState('');

  const fetchMessages = () => {
    fetch('http://localhost:3001/api/operations/chat')
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d)) setMessages(d);
      })
      .catch((err) => console.error('Failed to load chat:', err));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    try {
      await fetch('http://localhost:3001/api/operations/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: 'general',
          senderId: '99999999-0000-0000-0000-000000000002',
          senderName: 'Agent',
          message: inputMsg.trim(),
        }),
      });
      setInputMsg('');
      fetchMessages();
    } catch (err: any) {
      console.error('Failed send chat:', err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-7 h-7 text-sky-500" />
            Team-Chat & Direktnachrichten
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Echtzeit-Kommunikation zwischen Agenten, Teamleitern und Supervisoren während laufender Kampagnen.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Channel Bar */}
        <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-slate-500" />
            <span className="font-bold text-slate-900 text-sm">general — Alle Mitarbeiter</span>
          </div>
          <span className="text-xs text-slate-400">Live verbunden</span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {m.senderName.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{m.senderName}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(m.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg text-slate-800 text-xs border border-slate-100 max-w-xl">
                  {m.message}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t bg-slate-50 flex items-center gap-3">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Nachricht an #general senden..."
            className="flex-1 border rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Senden
          </button>
        </form>
      </div>
      </div>
    </AppShell>
  );
}
