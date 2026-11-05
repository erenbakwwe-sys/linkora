'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/shell/AppShell';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  PhoneCall,
  Clock,
  Building2,
  Copy,
  Check,
  X,
  Send,
  PlusCircle,
  FileText,
  BadgeAlert,
  Sparkles,
} from 'lucide-react';

interface TopupRequest {
  id: string;
  tenantId: string;
  amountEur: number;
  referenceCode: string;
  senderName: string;
  bankName: string;
  accountHolder: string;
  iban: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export default function BalanceCostsPage() {
  const [balanceData, setBalanceData] = useState<any>(null);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [referenceCode, setReferenceCode] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submittingNotice, setSubmittingNotice] = useState(false);

  // Bank Info from user
  const bankInfo = {
    bankName: 'Ziraat Bankası',
    accountHolder: 'Taha Eren Bal',
    iban: 'TR04 0001 0090 1071 3847 7050 01',
    ibanRaw: 'TR040001009010713847705001',
  };

  const fetchBalance = () => {
    fetch('/api/finances/balance')
      .then((res) => res.json())
      .then((d) => setBalanceData(d))
      .catch((err) => console.error('Failed to load balance:', err));
  };

  const fetchTopupRequests = () => {
    fetch('/api/finances/topup-requests')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTopupRequests(data);
        }
      })
      .catch((err) => console.error('Failed to load topup requests:', err));
  };

  useEffect(() => {
    fetchBalance();
    fetchTopupRequests();
    // Generate an initial random reference code
    const rand = Math.floor(1000 + Math.random() * 9000);
    setReferenceCode(`REF-CAL-${rand}`);
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenModal = (presetAmount = 250) => {
    setSelectedAmount(presetAmount);
    setCustomAmount('');
    const rand = Math.floor(1000 + Math.random() * 9000);
    setReferenceCode(`REF-CAL-${rand}`);
    setShowTopupModal(true);
  };

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!effectiveAmount || effectiveAmount <= 0) {
      alert('Lütfen geçerli bir tutar giriniz.');
      return;
    }
    if (!senderName.trim()) {
      alert('Lütfen havaleyi gönderen kişi veya firma adını giriniz.');
      return;
    }

    setSubmittingNotice(true);
    try {
      const res = await fetch('/api/finances/topup-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountEur: effectiveAmount,
          senderName: senderName.trim(),
          notes: transferNotes.trim(),
          referenceCode,
        }),
      });

      if (!res.ok) throw new Error('Bildirim iletilemedi.');
      const data = await res.json();

      setSuccessMsg(
        `€${effectiveAmount.toFixed(2)} tutarındaki havale bildiriminiz alındı! Yöneticimize iletildi, kontrol sonrası bakiyeniz onaylanacaktır.`
      );
      setShowTopupModal(false);
      setSenderName('');
      setTransferNotes('');
      fetchTopupRequests();
      setTimeout(() => setSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Hata oluştu');
    } finally {
      setSubmittingNotice(false);
    }
  };

  // Admin instant approve action
  const handleApproveRequest = async (requestId: string) => {
    try {
      const res = await fetch(`/api/finances/topup-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Taha Eren Bal' }),
      });
      if (res.ok) {
        const data = await res.json();
        setBalanceData(data.balance);
        setSuccessMsg(`Talep onaylandı! +€${data.request.amountEur} cüzdan bakiyesine yüklendi.`);
        fetchTopupRequests();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error('Approve failed:', err);
    }
  };

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Wallet className="w-7 h-7 text-emerald-600" />
              Guthaben, Kosten & Minutenabrechnung
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Prepaid cüzdan bakiyesi, Ziraat Bankası havale ile yükleme, dakika maliyetleri ve otomatik arama durdurma.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleOpenModal(250)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              Banka Havalesi ile Bakiye Yükle
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Main Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aktuelles Wallet-Guthaben</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-3xl font-extrabold text-slate-950 font-mono tracking-tight">
              €{balanceData?.balanceEur?.toFixed(2) || '1.450,50'}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>Kreditlinie (Dispo):</span>
              <strong className="text-slate-900 font-bold">€{balanceData?.creditLimitEur?.toFixed(2) || '500,00'}</strong>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minutentarif (Dialer)</span>
            <div className="text-3xl font-extrabold text-sky-600 font-mono tracking-tight">
              0.04 € <span className="text-sm font-normal text-slate-500">/ Min. netto</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>Abrechnungstakt:</span>
              <strong className="text-slate-900 font-bold">Sekundengenau abgerechnet</strong>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verbrauch heute</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              €{balanceData?.usageStats?.costTodayEur?.toFixed(2) || '7.36'}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-between pt-3 border-t border-slate-100">
              <span>Gewählte Minuten heute:</span>
              <strong className="text-slate-900 font-bold">{balanceData?.usageStats?.dialedMinutesToday || 184} Min.</strong>
            </div>
          </div>
        </div>

        {/* Bank Connection Card (Quick View) */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>Resmi Banka Havale / EFT Hesabı</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">{bankInfo.bankName}</h3>
              <p className="text-slate-400 text-xs">
                Hesap Sahibi: <strong className="text-slate-200">{bankInfo.accountHolder}</strong>
              </p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">IBAN Numarası</span>
                <span className="text-sm sm:text-base font-mono font-bold text-amber-400 tracking-wider">
                  {bankInfo.iban}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(bankInfo.ibanRaw, 'iban-quick')}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                {copiedField === 'iban-quick' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Kopyalandı</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>IBAN Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Top-up Requests & Transfer Notice Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Havale Bildirimleri & Yükleme Talepleri
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Banka havalesi ile gönderilen bakiye yükleme talepleri ve durumları.
              </p>
            </div>

            <button
              onClick={() => handleOpenModal(500)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
            >
              + Yeni Bildirim Gönder
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Ref. Kodu</th>
                  <th className="py-3 px-4">Gönderen / Müşteri</th>
                  <th className="py-3 px-4">Tutar (€)</th>
                  <th className="py-3 px-4">Banka & Alıcı</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlem (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {topupRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Henüz kayıtlı bir havale bildirimi bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  topupRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {req.referenceCode}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {req.senderName}
                        {req.notes && (
                          <span className="block text-[11px] text-slate-400 italic mt-0.5 truncate max-w-xs">
                            &quot;{req.notes}&quot;
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">
                        €{req.amountEur.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span>{req.bankName}</span>
                        <span className="block text-[10px] text-slate-400">{req.accountHolder}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(req.createdAt).toLocaleString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Onaylandı
                          </span>
                        ) : req.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Onay Bekliyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3 text-rose-600" />
                            Reddedildi
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'PENDING' ? (
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            Onayla & Bakiyeyi Yükle
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {req.approvedBy ? `Onaylayan: ${req.approvedBy}` : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rules Notice */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-5 space-y-2 text-xs text-slate-600">
          <div className="font-bold text-slate-900 uppercase flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Otomatik Arama Koruma Politikası (Carrier Protection)
          </div>
          <p className="leading-relaxed">
            Prepaid bakiye <strong>10,00 €</strong> altına indiğinde panelde otomatik uyarı verilir. Dispo limiti (Kredi Limiti)
            tükendiğinde sistem operatör masrafı oluşmasını önlemek amacıyla Cloud-Dialer aramalarını geçici olarak durdurur.
            Bakiye yüklendiği anda aramalar kesintisiz devam eder.
          </p>
        </div>

        {/* Modal: Guthaben Aufladen per Banküberweisung */}
        {showTopupModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Guthaben Aufladen (Banka Havalesi)</h3>
                    <p className="text-xs text-slate-500">Ziraat Bankası havalesi ile güvenli bakiye yükleme</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTopupModal(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 1. Paket & Miktar Seçimi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Yüklenecek Tutar Seçimi (€)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[100, 250, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      €{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Veya farklı bir tutar girin (€)..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    €{effectiveAmount.toFixed(2)} ile yaklaşık{' '}
                    <strong>{Math.floor(effectiveAmount / 0.04).toLocaleString()} Arama Dakikası</strong> elde edersiniz.
                  </span>
                </p>
              </div>

              {/* 2. Banka Bilgileri & IBAN */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  2. Para Gönderilecek Banka Bilgileri
                </span>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Banka Adı:</span>
                    <strong className="text-slate-900">{bankInfo.bankName}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Hesap Sahibi:</span>
                    <strong className="text-slate-900">{bankInfo.accountHolder}</strong>
                  </div>

                  {/* IBAN Row with Copy */}
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1">IBAN:</span>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-950">
                      <span>{bankInfo.iban}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(bankInfo.ibanRaw, 'iban-modal')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-md transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'iban-modal' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Reference Code Row with Copy */}
                  <div className="pt-1">
                    <span className="text-slate-500 block mb-1 font-semibold text-amber-700">
                      Açıklama / Referans Kodu (Zorunlu):
                    </span>
                    <div className="flex items-center justify-between bg-amber-50/80 p-2.5 rounded-xl border border-amber-300 font-mono text-xs font-bold text-slate-950">
                      <span className="text-amber-900">{referenceCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(referenceCode, 'ref-modal')}
                        className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-slate-900 text-[11px] rounded-md transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'ref-modal' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-700" />
                            <span>Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Kodu Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      * Banka transferi yaparken lütfen açıklama kısmına yalnızca bu kodu yazınız.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Havale Bildirim Formu */}
              <form onSubmit={handleSubmitNotice} className="space-y-3.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  3. Havale Bildirimini Tamamlayın
                </span>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gönderen Adı Soyadı (Banka Hesabındaki İsim) *
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz veya Şirket Ünvanı"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    İşlem Notu (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    value={transferNotes}
                    onChange={(e) => setTransferNotes(e.target.value)}
                    placeholder="Örn: Saat 12:30'da Ziraat'ten havale yapıldı."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 shadow-2xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTopupModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={submittingNotice}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {submittingNotice ? (
                      <span>Gönderiliyor...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Havale Bildirimini Gönder (€{effectiveAmount.toFixed(2)})</span>
                      </>
                    )}
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
