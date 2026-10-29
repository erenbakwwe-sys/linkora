import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';

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

@Injectable()
export class FinancesService {
  private readonly inMemoryCdr: CdrRecord[] = [];
  private walletBalance = 1450.5;
  private readonly minuteCost = 0.04;
  private readonly lowBalanceThreshold = 10.0;

  constructor(private readonly db: DatabaseService) {
    this.seedDefaultCdr();
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

  public getCdrList(tenantId: string): CdrRecord[] {
    return this.inMemoryCdr.filter((c) => c.tenantId === tenantId);
  }
}
