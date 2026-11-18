import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service.js';
import { MarketplaceController } from './marketplace.controller.js';
import { WebhooksController, VipCallWebhookController } from './webhooks.controller.js';
import { PricingEngineService } from './pricing-engine.service.js';
import { WalletLedgerService } from './wallet-ledger.service.js';
import { ConnectorsService } from './connectors.service.js';
import { DatabaseService } from '../../common/services/database.service.js';

@Module({
  controllers: [MarketplaceController, WebhooksController, VipCallWebhookController],
  providers: [
    MarketplaceService,
    PricingEngineService,
    WalletLedgerService,
    ConnectorsService,
    DatabaseService,
  ],
  exports: [MarketplaceService, PricingEngineService, WalletLedgerService, ConnectorsService],
})
export class MarketplaceModule {}
