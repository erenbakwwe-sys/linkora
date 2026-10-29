import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PricingQuote } from './types.js';

@Injectable()
export class PricingEngineService {
  private static readonly BAND_BASE_PRICES: Record<'A' | 'B' | 'C' | 'D', number> = {
    A: 75.0,
    B: 55.0,
    C: 35.0,
    D: 15.0,
  };

  private static readonly PRODUCT_MULTIPLIERS: Record<string, number> = {
    Photovoltaik: 1.0,
    Wärmepumpe: 1.25,
    Treppenlift: 1.15,
    'Fenster & Sanierung': 1.1,
    Energieberatung: 0.9,
    Strom: 0.5,
    Gas: 0.5,
    Pflegebox: 0.6,
  };

  /**
   * Calculates dynamic pricing quote based on score band, product, and optional buyer constraints.
   */
  public calculateQuote(params: {
    projectId?: string;
    projectName?: string;
    scoreBand: 'A' | 'B' | 'C' | 'D';
    buyerFloorPrice?: number;
    buyerCeilingPrice?: number;
  }): PricingQuote {
    const basePrice = PricingEngineService.BAND_BASE_PRICES[params.scoreBand] || 35.0;
    const productName = params.projectName || 'Photovoltaik';
    const multiplier = PricingEngineService.PRODUCT_MULTIPLIERS[productName] || 1.0;

    let computedPrice = Number((basePrice * multiplier).toFixed(2));

    // Enforce floor & ceiling rules
    if (params.buyerFloorPrice && computedPrice < params.buyerFloorPrice) {
      computedPrice = params.buyerFloorPrice;
    }
    if (params.buyerCeilingPrice && computedPrice > params.buyerCeilingPrice) {
      computedPrice = params.buyerCeilingPrice;
    }

    return {
      quoteId: `quote-${randomUUID()}`,
      projectId: params.projectId || 'project-default',
      scoreBand: params.scoreBand,
      basePrice,
      productMultiplier: multiplier,
      finalPrice: computedPrice,
      currency: 'EUR',
      calculatedAt: new Date().toISOString(),
    };
  }

  public getPriceList() {
    return {
      version: '2026.Q4-v1',
      effectiveFrom: '2026-10-01T00:00:00Z',
      currency: 'EUR',
      basePrices: PricingEngineService.BAND_BASE_PRICES,
      productMultipliers: PricingEngineService.PRODUCT_MULTIPLIERS,
    };
  }
}
