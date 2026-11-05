import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { TelegramService } from '../../common/services/telegram.service.js';

export interface CdrRecord {
  id: string;
  tenantId: string;
  agentName: string;
  calleeNumber: string;
  durationSeconds: number;
  durationFormatted: string;
  costEur: number;
  outcome: string;
  recordingUrl: string;
  timestamp: string;
}

export interface TopupRequest {
  id: string;
  tenantId: string;
  amountEur: number;
  amountTry?: number;
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

@Injectable()
export class FinancesService {
  private readonly logger = new Logger(FinancesService.name);
  private readonly inMemoryCdr: CdrRecord[] = [];
  private readonly inMemoryTopupRequests: TopupRequest[] = [];
  private walletBalance = 1450.5;
  private readonly minuteCost = 0.04;
  private readonly lowBalanceThreshold = 10.0;

  public readonly bankInfo = {
    bankName: 'Ziraat Bankası',
    accountHolder: 'Taha Eren Bal',
    iban: 'TR04 0001 0090 1071 3847 7050 01',
    ibanRaw: 'TR040001009010713847705001',
    currency: 'EUR / TRY',
    note: 'Lütfen havale/EFT açıklama kısmına ekrandaki referans kodunu mutlaka yazınız.',
  };

  constructor(
    private readonly db: DatabaseService,
    private readonly telegramService: TelegramService
  ) {
    this.seedDefaultCdr();
    this.seedDefaultTopupRequests();
  }

  private seedDefaultTopupRequests() {
    this.inMemoryTopupRequests.push({
      id: 'req-sample-01',
      tenantId: '11111111-1111-1111-1111-111111111111',
      amountEur: 500.0,
      referenceCode: 'REF-CAL-7421',
      senderName: 'Solar Direkt GmbH (Max Mustermann)',
      bankName: 'Ziraat Bankası',
      accountHolder: 'Taha Eren Bal',
      iban: 'TR04 0001 0090 1071 3847 7050 01',
      notes: 'Ziraat hesabından havale geçildi.',
      status: 'APPROVED',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      approvedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
      approvedBy: 'Taha Eren Bal',
    });
  }

  private seedDefaultCdr() {
    const tId = '11111111-1111-1111-1111-111111111111';
    this.inMemoryCdr.push(
      {
        id: 'cdr-1',
        tenantId: tId,
        agentName: 'Umut',
        calleeNumber: '+491714567890',
        durationSeconds: 145,
        durationFormatted: '02:25',
        costEur: 0.1,
        outcome: 'TERM_VEREINBART',
        recordingUrl: 'https://minio.local/recordings/rec-001.wav',
        timestamp: '2026-10-28T11:42:00Z',
      },
      {
        id: 'cdr-2',
        tenantId: tId,
        agentName: 'Erensamsun',
        calleeNumber: '+491512345678',
        durationSeconds: 310,
        durationFormatted: '05:10',
        costEur: 0.21,
        outcome: 'RUECKRUF_GEWUENSCHT',
        recordingUrl: 'https://minio.local/recordings/rec-002.wav',
        timestamp: '2026-10-28T10:15:30Z',
      },
      {
        id: 'cdr-3',
        tenantId: tId,
        agentName: 'Umut',
        calleeNumber: '+491605554321',
        durationSeconds: 42,
        durationFormatted: '00:42',
        costEur: 0.03,
        outcome: 'NICHT_ERREICHT',
        recordingUrl: 'https://minio.local/recordings/rec-003.wav',
        timestamp: '2026-10-28T09:50:12Z',
      }
    );
  }

  public getKasaIncome(tenantId: string) {
    return {
      totalRealizedIncomeEur: 24850.0,
      totalCommissionsPaidEur: 6200.0,
      offenFälligEur: 8450.0, // KPI card from screenshot
      naechsterMonatEur: 14200.0, // Expected payout from screenshot
      incomeEntries: [
        { id: 'inc-1', source: 'Lead-Verkauf (Solar Direkt GmbH)', amount: 3750.0, date: '2026-10-28', status: 'PAID' },
        { id: 'inc-2', source: 'Lead-Verkauf (ThermaClean AG)', amount: 2812.5, date: '2026-10-27', status: 'PAID' },
        { id: 'inc-3', source: 'Lead-Verkauf (Vitalis Care KG)', amount: 1687.5, date: '2026-10-26', status: 'PAID' },
        { id: 'inc-4', source: 'Telefonie-Minutenabrechnung', amount: 412.3, date: '2026-10-25', status: 'PAID' },
      ],
    };
  }

  public getBalanceCosts(tenantId: string) {
    const isLowBalance = this.walletBalance <= this.lowBalanceThreshold;
    return {
      balanceEur: this.walletBalance,
      creditLimitEur: 500.0,
      availableCreditEur: this.walletBalance + 500.0,
      perMinuteCostEur: this.minuteCost,
      lowBalanceThresholdEur: this.lowBalanceThreshold,
      isLowBalance,
      warningMessage: isLowBalance
        ? `Guthaben niedrig: ${this.walletBalance.toFixed(2)} € — vor Anrufabbruch aufladen.`
        : null,
      usageStats: {
        dialedMinutesToday: 184,
        costTodayEur: Number((184 * this.minuteCost).toFixed(2)),
        dialedMinutesThisMonth: 4210,
        costThisMonthEur: Number((4210 * this.minuteCost).toFixed(2)),
      },
    };
  }

  public topUpWallet(tenantId: string, amount: number) {
    this.walletBalance = Number((this.walletBalance + amount).toFixed(2));
    return this.getBalanceCosts(tenantId);
  }

  public getBankInfo() {
    return this.bankInfo;
  }

  public getTopupRequests(tenantId: string): TopupRequest[] {
    return this.inMemoryTopupRequests.filter((r) => r.tenantId === tenantId);
  }

  public async createTopupRequest(
    tenantId: string,
    data: {
      amountEur: number;
      senderName: string;
      notes?: string;
      referenceCode?: string;
    }
  ): Promise<TopupRequest> {
    const id = `req-${randomUUID().slice(0, 8)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = data.referenceCode || `REF-CAL-${randomSuffix}`;

    const request: TopupRequest = {
      id,
      tenantId,
      amountEur: Number(data.amountEur || 250),
      referenceCode,
      senderName: data.senderName?.trim() || 'Müşteri / Havale Yapan',
      bankName: this.bankInfo.bankName,
      accountHolder: this.bankInfo.accountHolder,
      iban: this.bankInfo.iban,
      notes: data.notes?.trim() || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    this.inMemoryTopupRequests.unshift(request);

    // Notify Admin via Telegram
    const amountFormatted = request.amountEur.toFixed(2);
    const tgLines = [
      `💰 <b>YENİ HAVALE İLE BAKİYE YÜKLEME TALEBİ!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Gönderen / Müşteri:</b> <code>${request.senderName}</code>`,
      `💵 <b>Bildirilen Tutar:</b> <b>€${amountFormatted}</b> (~${(request.amountEur * 38).toLocaleString('tr-TR')} ₺)`,
      `🏦 <b>Banka:</b> ${this.bankInfo.bankName}`,
      `💳 <b>Alıcı:</b> ${this.bankInfo.accountHolder}`,
      `📌 <b>Referans Kodu:</b> <code>${request.referenceCode}</code>`,
    ];
    if (request.notes) {
      tgLines.push(`📝 <b>Müşteri Notu:</b> <i>"${request.notes}"</i>`);
    }
    tgLines.push(
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `⏰ <b>Tarih:</b> ${new Date().toLocaleString('tr-TR')}`,
      `⚡ Panodan "Onayla" butonuna basarak bakiyeyi aktarabilirsiniz.`
    );

    this.telegramService.sendMessage(tgLines.join('\n')).catch(() => {});

    return request;
  }

  public async approveTopupRequest(
    tenantId: string,
    requestId: string,
    approvedBy = 'Taha Eren Bal'
  ): Promise<{ success: boolean; request: TopupRequest; balance: any }> {
    const request = this.inMemoryTopupRequests.find((r) => r.id === requestId && r.tenantId === tenantId);
    if (!request) {
      throw new NotFoundException(`Bakiye yükleme talebi (${requestId}) bulunamadı.`);
    }

    if (request.status === 'APPROVED') {
      return {
        success: true,
        request,
        balance: this.getBalanceCosts(tenantId),
      };
    }

    request.status = 'APPROVED';
    request.approvedAt = new Date().toISOString();
    request.approvedBy = approvedBy;

    // Credit balance
    this.walletBalance = Number((this.walletBalance + request.amountEur).toFixed(2));

    // Telegram confirmation
    const tgLines = [
      `✅ <b>BAKİYE YÜKLEMESİ ONAYLANDI & YÜKLENDİ!</b>`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 <b>Müşteri:</b> <code>${request.senderName}</code>`,
      `💵 <b>Yüklenen Tutar:</b> +€${request.amountEur.toFixed(2)}`,
      `💰 <b>Yeni Toplam Cüzdan Bakiyesi:</b> €${this.walletBalance.toFixed(2)}`,
      `📌 <b>Referans:</b> ${request.referenceCode}`,
      `👨‍💼 <b>Onaylayan:</b> ${approvedBy}`,
      `⏰ <b>Onay Tarihi:</b> ${new Date().toLocaleString('tr-TR')}`,
    ];
    this.telegramService.sendMessage(tgLines.join('\n')).catch(() => {});

    return {
      success: true,
      request,
      balance: this.getBalanceCosts(tenantId),
    };
  }

  public async rejectTopupRequest(tenantId: string, requestId: string): Promise<TopupRequest> {
    const request = this.inMemoryTopupRequests.find((r) => r.id === requestId && r.tenantId === tenantId);
    if (!request) {
      throw new NotFoundException(`Bakiye yükleme talebi (${requestId}) bulunamadı.`);
    }

    request.status = 'REJECTED';
    return request;
  }

  public getCdrList(tenantId: string): CdrRecord[] {
    return this.inMemoryCdr.filter((c) => c.tenantId === tenantId);
  }
}
