import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CurrentTenant } from '../../common/guards/user.decorator.js';
import { MarketplaceService } from './marketplace.service.js';
import { PricingEngineService } from './pricing-engine.service.js';
import { WalletLedgerService } from './wallet-ledger.service.js';
import { ConnectorsService } from './connectors.service.js';

@ApiTags('Marketplace, Buyers & Ping-Post')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly pricingEngine: PricingEngineService,
    private readonly walletLedger: WalletLedgerService,
    private readonly connectors: ConnectorsService
  ) {}

  @Get('buyers')
  @ApiOperation({ summary: 'List all buyer partner companies with caps, criteria, and return rates' })
  async getBuyers(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.getBuyers(tId);
  }

  @Get('buyers/:id')
  @ApiOperation({ summary: 'Get buyer details' })
  async getBuyer(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.getBuyer(tId, id);
  }

  @Post('ping-post')
  @ApiOperation({ summary: 'Execute Ping-Post Waterfall matching for a lead' })
  async executePingPost(
    @Body()
    body: {
      leadId: string;
      leadData: Record<string, any>;
      score0100: number;
      scoreBand: 'A' | 'B' | 'C' | 'D';
    },
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.executePingPostWaterfall({
      tenantId: tId,
      leadId: body.leadId,
      leadData: body.leadData || {},
      score0100: body.score0100 || 85,
      scoreBand: body.scoreBand || 'A',
    });
  }

  @Post('secondary-sale')
  @ApiOperation({ summary: 'Execute secondary sale of an existing lead (Multi-Sale without schema change)' })
  async executeSecondarySale(
    @Body()
    body: {
      leadId: string;
      secondaryBuyerId: string;
      discountFactor?: number;
    },
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.executeSecondarySale({
      tenantId: tId,
      leadId: body.leadId,
      secondaryBuyerId: body.secondaryBuyerId,
      discountFactor: body.discountFactor,
    });
  }

  @Get('sales')
  @ApiOperation({ summary: 'List all lead sales transactions' })
  async getSales(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.getSales(tId);
  }

  @Post('returns')
  @ApiOperation({ summary: 'Process a lead return claim and issue an automated credit note' })
  async processReturn(
    @Body()
    body: {
      leadSaleId: string;
      buyerId: string;
      reasonCode: any;
      reasonDetail?: string;
    },
    @CurrentTenant() tenantId?: string
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.processReturn({
      tenantId: tId,
      leadSaleId: body.leadSaleId,
      buyerId: body.buyerId,
      reasonCode: body.reasonCode,
      reasonDetail: body.reasonDetail,
    });
  }

  @Get('returns')
  @ApiOperation({ summary: 'List return requests' })
  async getReturns(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.getReturns(tId);
  }

  @Get('credit-notes')
  @ApiOperation({ summary: 'List official credit notes (Gutschriften)' })
  async getCreditNotes(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.getCreditNotes(tId);
  }

  @Get('quality-pool')
  @ApiOperation({ summary: 'Get high-quality leads available in the resale pool (Qualitätspool)' })
  async getQualityPool(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.marketplaceService.getQualityPool(tId);
  }

  @Get('pricing/quote')
  @ApiOperation({ summary: 'Calculate dynamic price quote for a lead' })
  async getPricingQuote(
    @Query('projectName') projectName: string,
    @Query('scoreBand') scoreBand: 'A' | 'B' | 'C' | 'D'
  ) {
    return this.pricingEngine.calculateQuote({
      projectName: projectName || 'Photovoltaik',
      scoreBand: scoreBand || 'A',
    });
  }

  @Get('pricing/list')
  @ApiOperation({ summary: 'Get versioned price list and product multipliers' })
  async getPriceList() {
    return this.pricingEngine.getPriceList();
  }

  @Get('wallet')
  @ApiOperation({ summary: 'Get current wallet balance, credit limit, and low balance alert' })
  async getWallet(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.walletLedger.getWallet(tId);
  }

  @Get('ledger')
  @ApiOperation({ summary: 'Get immutable double-entry ledger transactions' })
  async getLedger(@CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.walletLedger.getLedgerEntries(tId);
  }

  @Get('webhooks')
  @ApiOperation({ summary: 'Get webhook delivery logs and Dead Letter Queue (DLQ)' })
  async getWebhooks() {
    return {
      deliveries: this.connectors.getWebhookLogs(),
      dlq: this.connectors.getDlq(),
    };
  }

  @Post('webhooks/replay/:id')
  @ApiOperation({ summary: 'Replay a failed webhook from the DLQ' })
  async replayWebhook(@Param('id') deliveryId: string) {
    return this.connectors.replayWebhook(deliveryId);
  }
}
