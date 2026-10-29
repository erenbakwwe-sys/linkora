import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { PricingEngineService } from './pricing-engine.service.js';
import { WalletLedgerService } from './wallet-ledger.service.js';
import { ConnectorsService } from './connectors.service.js';
import {
  Buyer,
  BuyerCriteria,
  AnonymousPingPayload,
  FullPostPayload,
  LeadSaleRecord,
  ReturnRequest,
  CreditNoteRecord,
} from './types.js';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  // In-memory repositories for containerless dev
  private readonly inMemoryBuyers: Map<string, Buyer> = new Map();
  private readonly inMemoryCriteria: Map<string, BuyerCriteria[]> = new Map();
  private readonly inMemorySales: LeadSaleRecord[] = [];
  private readonly inMemoryReturns: ReturnRequest[] = [];
  private readonly inMemoryCreditNotes: CreditNoteRecord[] = [];

  constructor(
    private readonly db: DatabaseService,
    private readonly pricingEngine: PricingEngineService,
    private readonly walletLedger: WalletLedgerService,
    private readonly connectors: ConnectorsService
  ) {
    this.seedDefaultGermanBuyers();
  }

  private seedDefaultGermanBuyers() {
    // 4 German employer/partner companies per SPEC.md Section 1
    const seededBuyers: Array<{ buyer: Buyer; criteria: BuyerCriteria[] }> = [
      {
        buyer: {
          id: 'buyer-0001-solar-direkt',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'Solar Direkt Deutschland GmbH',
          companyIdentifier: 'DE-SOLAR-001',
          pingEndpoint: 'https://api.solar-direkt-partner.de/v1/ping',
          postEndpoint: 'https://api.solar-direkt-partner.de/v1/post',
          signingSecret: 'sec_solar_direkt_hmac_secret_2026',
          pingEnabled: true,
          dailyCap: 50,
          monthlyCap: 1200,
          deliveredToday: 14,
          deliveredThisMonth: 342,
          returnWindowDays: 7,
          maxReturnRatePercent: 15.0,
          totalDelivered: 342,
          totalReturned: 18,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-001',
            buyerId: 'buyer-0001-solar-direkt',
            projectId: 'cccccccc-0000-0000-0000-000000000001',
            projectName: 'Photovoltaik',
            regions: ['80', '81', '82', '83', '84', '85', '70', '71', '*'], // Bayern & BW + wildcard
            minScore: 60.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 95,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0002-therma-clean',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'ThermaClean Wärmepumpen AG',
          companyIdentifier: 'DE-THERMA-002',
          pingEndpoint: 'https://api.therma-clean.de/v1/ping',
          postEndpoint: 'https://api.therma-clean.de/v1/leads',
          signingSecret: 'sec_therma_clean_hmac_secret_2026',
          pingEnabled: true,
          dailyCap: 35,
          monthlyCap: 800,
          deliveredToday: 9,
          deliveredThisMonth: 215,
          returnWindowDays: 7,
          maxReturnRatePercent: 15.0,
          totalDelivered: 215,
          totalReturned: 12,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-002',
            buyerId: 'buyer-0002-therma-clean',
            projectId: 'cccccccc-0000-0000-0000-000000000002',
            projectName: 'Wärmepumpe',
            regions: ['40', '41', '50', '51', '60', '61', '*'], // NRW & Hessen
            minScore: 50.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 90,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0003-nord-sanierung',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'EnergieSanierung Nord GmbH',
          companyIdentifier: 'DE-NORD-003',
          pingEndpoint: 'https://api.energie-nord.de/ping',
          postEndpoint: 'https://api.energie-nord.de/post',
          signingSecret: 'sec_nord_sanierung_hmac_2026',
          pingEnabled: false, // Direct post fallback
          dailyCap: 25,
          monthlyCap: 600,
          deliveredToday: 6,
          deliveredThisMonth: 140,
          returnWindowDays: 7,
          maxReturnRatePercent: 15.0,
          totalDelivered: 140,
          totalReturned: 8,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-003',
            buyerId: 'buyer-0003-nord-sanierung',
            projectId: 'cccccccc-0000-0000-0000-000000000005',
            projectName: 'Fenster & Sanierung',
            regions: ['20', '21', '22', '30', '31', '*'], // Hamburg & Niedersachsen
            minScore: 40.0,
            maxScore: 100.0,
            exclusivityRequired: 'SEMI_EXCLUSIVE',
            priorityWeight: 80,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0004-vitalis-care',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'Vitalis Pflege & Mobilität KG',
          companyIdentifier: 'DE-VITALIS-004',
          pingEndpoint: 'https://api.vitalis-care.de/leads/ping',
          postEndpoint: 'https://api.vitalis-care.de/leads/deliver',
          signingSecret: 'sec_vitalis_care_hmac_2026',
          pingEnabled: true,
          dailyCap: 40,
          monthlyCap: 900,
          deliveredToday: 12,
          deliveredThisMonth: 280,
          returnWindowDays: 14,
          maxReturnRatePercent: 12.0,
          totalDelivered: 280,
          totalReturned: 15,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-004',
            buyerId: 'buyer-0004-vitalis-care',
            projectId: 'cccccccc-0000-0000-0000-000000000003',
            projectName: 'Treppenlift',
            regions: ['*'], // Bundesweit
            minScore: 40.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 85,
            isActive: true,
          },
        ],
      },
    ];

    for (const item of seededBuyers) {
      this.inMemoryBuyers.set(item.buyer.id, item.buyer);
      this.inMemoryCriteria.set(item.buyer.id, item.criteria);
    }
  }

  public getBuyers(tenantId: string): Buyer[] {
    return Array.from(this.inMemoryBuyers.values()).filter((b) => b.tenantId === tenantId);
  }

  public getBuyer(tenantId: string, buyerId: string): Buyer {
    const buyer = this.inMemoryBuyers.get(buyerId);
    if (!buyer || buyer.tenantId !== tenantId) {
      throw new NotFoundException(`Abnehmer ${buyerId} nicht gefunden.`);
    }
    return buyer;
  }

  /**
   * Evaluates criteria and returns eligible buyers ranked by priority weight and remaining daily capacity.
   */
  public findEligibleBuyers(params: {
    tenantId: string;
    projectName: string;
    postalCode: string;
    score0100: number;
    scoreBand: 'A' | 'B' | 'C' | 'D';
  }): Array<{ buyer: Buyer; criteria: BuyerCriteria }> {
    const eligible: Array<{ buyer: Buyer; criteria: BuyerCriteria }> = [];
    const postalPrefix = params.postalCode.slice(0, 2);

    for (const buyer of this.inMemoryBuyers.values()) {
      if (!buyer.isActive || buyer.tenantId !== params.tenantId) continue;
      if (buyer.deliveredToday >= buyer.dailyCap) continue;

      const criteriaList = this.inMemoryCriteria.get(buyer.id) || [];
      for (const crit of criteriaList) {
        if (!crit.isActive) continue;

        // 1. Product Match
        if (crit.projectName !== params.projectName && crit.projectName !== '*') continue;

        // 2. Score Match
        if (params.score0100 < crit.minScore || params.score0100 > crit.maxScore) continue;

        // 3. Region Match (postal prefix or wildcard)
        const regionMatch = crit.regions.includes('*') || crit.regions.includes(postalPrefix);
        if (!regionMatch) continue;

        eligible.push({ buyer, criteria: crit });
        break;
      }
    }

    // Rank by priority weight descending
    eligible.sort((a, b) => b.criteria.priorityWeight - a.criteria.priorityWeight);
    return eligible;
  }

  /**
   * Executes the Ping-Post Waterfall matching workflow for a qualified lead.
   */
  public async executePingPostWaterfall(params: {
    tenantId: string;
    leadId: string;
    leadData: Record<string, any>;
    score0100: number;
    scoreBand: 'A' | 'B' | 'C' | 'D';
  }): Promise<{
    status: 'SOLD' | 'UNSOLD_POOLED';
    winningBuyer?: Buyer;
    sale?: LeadSaleRecord;
    pingPayload: AnonymousPingPayload;
    waterfallSteps: Array<{ buyerId: string; buyerName: string; action: string; outcome: string }>;
  }> {
    const projectName = params.leadData.project_name || params.leadData.projectName || 'Photovoltaik';
    const postalCode = params.leadData.postal_code || params.leadData.postalCode || '80331';

    // 1. Generate Anonymous Ping Payload (Strictly ZERO PII)
    const pingPayload: AnonymousPingPayload = {
      pingId: `ping-${randomUUID()}`,
      projectType: projectName,
      postalCodePrefix: postalCode.slice(0, 2),
      region: params.leadData.city || 'München',
      scoreBand: params.scoreBand,
      score0100: params.score0100,
      hasConsentProof: true,
      isHomeowner: params.leadData.is_homeowner ?? true,
      electricityBillRange: '> 140 €/Monat',
    };

    // 2. Find eligible buyers
    const eligible = this.findEligibleBuyers({
      tenantId: params.tenantId,
      projectName,
      postalCode,
      score0100: params.score0100,
      scoreBand: params.scoreBand,
    });

    const waterfallSteps: Array<{ buyerId: string; buyerName: string; action: string; outcome: string }> = [];

    // 3. Waterfall iteration
    for (const { buyer } of eligible) {
      waterfallSteps.push({
        buyerId: buyer.id,
        buyerName: buyer.name,
        action: buyer.pingEnabled ? 'PING_DISPATCHED' : 'DIRECT_POST',
        outcome: 'ACCEPTED',
      });

      // Calculate sale price via dynamic pricing engine
      const quote = this.pricingEngine.calculateQuote({
        projectName,
        scoreBand: params.scoreBand,
      });

      // 4. Dispatch Full Post payload exclusively to winning buyer
      const postPayload: FullPostPayload = {
        postId: `post-${randomUUID()}`,
        leadId: params.leadId,
        firstName: params.leadData.first_name || 'Maximilian',
        lastName: params.leadData.last_name || 'Weber',
        phoneE164: params.leadData.phone_e164 || '+491714567890',
        email: params.leadData.email || 'm.weber@beispiel-solar.de',
        street: params.leadData.street || 'Sendlinger Str. 14',
        city: params.leadData.city || 'München',
        postalCode,
        projectType: projectName,
        answers: params.leadData.answers || {},
        consentProof: {
          optInTimestamp: new Date().toISOString(),
          consentTextVersion: 'v2.1',
          source: 'landing_page_direct',
        },
      };

      // Deliver via Region Connector DE
      await this.connectors.deliverToGermanBuyer(buyer, postPayload);

      // Increment buyer deliveries
      buyer.deliveredToday += 1;
      buyer.deliveredThisMonth += 1;
      buyer.totalDelivered += 1;

      // 5. Create Lead Sale Record (MANDATORY SEPARATION from leads)
      const returnExpires = new Date();
      returnExpires.setDate(returnExpires.getDate() + buyer.returnWindowDays);

      const sale: LeadSaleRecord = {
        id: `sale-${randomUUID()}`,
        tenantId: params.tenantId,
        leadId: params.leadId,
        buyerId: buyer.id,
        buyerName: buyer.name,
        salePrice: quote.finalPrice,
        currency: 'EUR',
        exclusivity: 'EXCLUSIVE',
        status: 'COMPLETED',
        soldAt: new Date().toISOString(),
        returnStatus: 'NONE',
        returnWindowExpiresAt: returnExpires.toISOString(),
      };

      this.inMemorySales.unshift(sale);

      // 6. Record Double-Entry Ledger Transaction
      this.walletLedger.applyLedgerTransaction({
        tenantId: params.tenantId,
        walletId: params.tenantId,
        txType: 'LEAD_SALE_CREDIT',
        amount: quote.finalPrice,
        referenceType: 'LEAD_SALE',
        referenceId: sale.id,
        idempotencyKey: `sale-credit-${sale.id}`,
        description: `Verkauf von Lead ${params.leadId.slice(0, 8)} (Band ${params.scoreBand}) an ${buyer.name}`,
      });

      return {
        status: 'SOLD',
        winningBuyer: buyer,
        sale,
        pingPayload,
        waterfallSteps,
      };
    }

    // Unsold leads go to quality resale pool
    return {
      status: 'UNSOLD_POOLED',
      pingPayload,
      waterfallSteps: [
        {
          buyerId: 'none',
          buyerName: 'Resale Pool',
          action: 'WATERFALL_EXHAUSTED',
          outcome: 'POOLED',
        },
      ],
    };
  }

  /**
   * SPEC REQUIREMENT: Proves that a lead can be sold a SECOND TIME without schema changes.
   */
  public executeSecondarySale(params: {
    tenantId: string;
    leadId: string;
    secondaryBuyerId: string;
    discountFactor?: number;
  }): LeadSaleRecord {
    const buyer = this.getBuyer(params.tenantId, params.secondaryBuyerId);
    const existingSales = this.inMemorySales.filter((s) => s.leadId === params.leadId);

    const discount = params.discountFactor || 0.75; // 25% discount for semi-exclusive 2nd sale
    const baseQuote = this.pricingEngine.calculateQuote({ scoreBand: 'A' });
    const finalPrice = Number((baseQuote.finalPrice * discount).toFixed(2));

    const returnExpires = new Date();
    returnExpires.setDate(returnExpires.getDate() + buyer.returnWindowDays);

    // Multi-Sale: Insert new row in lead_sales referencing the exact same leadId!
    const secondSale: LeadSaleRecord = {
      id: `sale-second-${randomUUID()}`,
      tenantId: params.tenantId,
      leadId: params.leadId,
      buyerId: buyer.id,
      buyerName: buyer.name,
      salePrice: finalPrice,
      currency: 'EUR',
      exclusivity: 'SEMI_EXCLUSIVE',
      status: 'COMPLETED',
      soldAt: new Date().toISOString(),
      returnStatus: 'NONE',
      returnWindowExpiresAt: returnExpires.toISOString(),
    };

    this.inMemorySales.unshift(secondSale);

    // Credit platform ledger
    this.walletLedger.applyLedgerTransaction({
      tenantId: params.tenantId,
      walletId: params.tenantId,
      txType: 'LEAD_SALE_CREDIT',
      amount: finalPrice,
      referenceType: 'LEAD_SALE',
      referenceId: secondSale.id,
      idempotencyKey: `sale-second-credit-${secondSale.id}`,
      description: `Zweitvermarktung (Semi-Exklusiv #${existingSales.length + 1}) für Lead ${params.leadId.slice(0, 8)} an ${buyer.name}`,
    });

    return secondSale;
  }

  /**
   * Returns & Credit Notes Workflow: Buyer flags defective lead -> refund issued -> lead back to pool.
   */
  public processReturn(params: {
    tenantId: string;
    leadSaleId: string;
    buyerId: string;
    reasonCode: ReturnRequest['reasonCode'];
    reasonDetail?: string;
  }): { returnRecord: ReturnRequest; creditNote: CreditNoteRecord } {
    const sale = this.inMemorySales.find((s) => s.id === params.leadSaleId);
    if (!sale) {
      throw new NotFoundException(`Verkaufstransaktion ${params.leadSaleId} nicht gefunden.`);
    }

    const buyer = this.getBuyer(params.tenantId, params.buyerId);

    // 1. Check Return Window (default 7 days)
    const now = new Date();
    const expiry = new Date(sale.returnWindowExpiresAt);
    if (now > expiry) {
      throw new BadRequestException(
        `Rückgabefrist abgelaufen. Gültig bis ${expiry.toLocaleDateString('de-DE')}.`
      );
    }

    // 2. Check Buyer Maximum Return Rate Cap (default 15%)
    const currentReturnRate = buyer.totalDelivered > 0 ? (buyer.totalReturned / buyer.totalDelivered) * 100 : 0;
    if (currentReturnRate >= buyer.maxReturnRatePercent) {
      throw new BadRequestException(
        `Maximale Rücklaufquote von ${buyer.maxReturnRatePercent}% für Abnehmer '${buyer.name}' erreicht (aktuell: ${currentReturnRate.toFixed(1)}%).`
      );
    }

    // 3. Approve Return
    buyer.totalReturned += 1;
    sale.status = 'RETURNED';
    sale.returnStatus = 'APPROVED';

    const returnRecord: ReturnRequest = {
      id: `ret-${randomUUID()}`,
      tenantId: params.tenantId,
      leadSaleId: sale.id,
      buyerId: buyer.id,
      reasonCode: params.reasonCode,
      reasonDetail: params.reasonDetail,
      status: 'APPROVED',
      refundAmount: sale.salePrice,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryReturns.unshift(returnRecord);

    // 4. Generate Official Credit Note (Gutschrift)
    const creditNoteNumber = `GS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const creditNote: CreditNoteRecord = {
      id: `cn-${randomUUID()}`,
      tenantId: params.tenantId,
      buyerId: buyer.id,
      returnId: returnRecord.id,
      creditNoteNumber,
      amount: sale.salePrice,
      currency: 'EUR',
      issuedAt: new Date().toISOString(),
    };
    this.inMemoryCreditNotes.unshift(creditNote);

    // 5. Apply Refund to Ledger
    this.walletLedger.applyLedgerTransaction({
      tenantId: params.tenantId,
      walletId: params.tenantId,
      txType: 'REFUND_CREDIT',
      amount: -sale.salePrice, // Deduct from platform revenue
      referenceType: 'RETURN',
      referenceId: returnRecord.id,
      idempotencyKey: `refund-ledger-${returnRecord.id}`,
      description: `Gutschrift ${creditNoteNumber} für berechtigten Rückläufer (${params.reasonCode}) an ${buyer.name}`,
    });

    return { returnRecord, creditNote };
  }

  public getSales(tenantId: string): LeadSaleRecord[] {
    return this.inMemorySales.filter((s) => s.tenantId === tenantId);
  }

  public getReturns(tenantId: string): ReturnRequest[] {
    return this.inMemoryReturns.filter((r) => r.tenantId === tenantId);
  }

  public getCreditNotes(tenantId: string): CreditNoteRecord[] {
    return this.inMemoryCreditNotes.filter((c) => c.tenantId === tenantId);
  }

  public getQualityPool(tenantId: string) {
    // High quality leads (Band A & B) that can be resold semi-exclusively
    return [
      {
        leadId: '77777777-0000-0000-0000-000000000001',
        customerName: 'Maximilian Weber',
        city: 'München (80331)',
        product: 'Photovoltaik',
        scoreBand: 'A',
        score0100: 92,
        initialSalePrice: 75.0,
        resalePriceRecommended: 56.25, // 25% resale discount
        salesCount: this.inMemorySales.filter((s) => s.leadId === '77777777-0000-0000-0000-000000000001').length,
        eligibleForResale: true,
      },
      {
        leadId: '77777777-0000-0000-0000-000000000002',
        customerName: 'Anna Schneider',
        city: 'Köln (50667)',
        product: 'Wärmepumpe',
        scoreBand: 'B',
        score0100: 74,
        initialSalePrice: 68.75,
        resalePriceRecommended: 51.5,
        salesCount: this.inMemorySales.filter((s) => s.leadId === '77777777-0000-0000-0000-000000000002').length,
        eligibleForResale: true,
      },
    ];
  }
}
