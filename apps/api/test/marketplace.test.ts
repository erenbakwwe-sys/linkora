import { MarketplaceService } from '../src/modules/marketplace/marketplace.service.js';
import { PricingEngineService } from '../src/modules/marketplace/pricing-engine.service.js';
import { WalletLedgerService } from '../src/modules/marketplace/wallet-ledger.service.js';
import { ConnectorsService } from '../src/modules/marketplace/connectors.service.js';
import { DatabaseService } from '../src/common/services/database.service.js';

describe('Phase 4: Marketplace, Ping-Post, Pricing & Multi-Sale Lifecycle', () => {
  let db: DatabaseService;
  let pricingEngine: PricingEngineService;
  let walletLedger: WalletLedgerService;
  let connectors: ConnectorsService;
  let marketplace: MarketplaceService;

  const tenantId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    db = new DatabaseService();
    pricingEngine = new PricingEngineService();
    walletLedger = new WalletLedgerService(db);
    connectors = new ConnectorsService();
    marketplace = new MarketplaceService(db, pricingEngine, walletLedger, connectors);
  });

  describe('Dynamic Pricing Engine', () => {
    it('should quote correctly for Band A Photovoltaik (€75) and Wärmepumpe (€93.75)', () => {
      const pvQuote = pricingEngine.calculateQuote({
        projectName: 'Photovoltaik',
        scoreBand: 'A',
      });
      expect(pvQuote.finalPrice).toBe(75.0);

      const wpQuote = pricingEngine.calculateQuote({
        projectName: 'Wärmepumpe',
        scoreBand: 'A',
      });
      expect(wpQuote.finalPrice).toBe(93.75); // 75 * 1.25 multiplier
    });

    it('should clamp price between buyer floor and ceiling', () => {
      const clamped = pricingEngine.calculateQuote({
        projectName: 'Photovoltaik',
        scoreBand: 'D', // base €15
        buyerFloorPrice: 25.0,
      });
      expect(clamped.finalPrice).toBe(25.0);
    });
  });

  describe('HMAC Webhooks & Replay Protection', () => {
    it('should sign and verify valid payload, and reject tampered payloads or expired timestamps', () => {
      const secret = 'partner-secret-test';
      const timestamp = new Date().toISOString();
      const payload = { leadId: 'lead-test-123', product: 'Photovoltaik' };

      const signature = ConnectorsService.signPayload(payload, secret, timestamp);
      expect(signature).toBeDefined();

      // Valid
      const verifyOk = ConnectorsService.verifySignature(payload, secret, signature, timestamp);
      expect(verifyOk.valid).toBe(true);

      // Tampered payload
      const tamperedPayload = { leadId: 'lead-test-123', product: 'Wärmepumpe' };
      const verifyTampered = ConnectorsService.verifySignature(tamperedPayload, secret, signature, timestamp);
      expect(verifyTampered.valid).toBe(false);

      // Expired timestamp (> 300 seconds)
      const oldTimestamp = new Date(Date.now() - 400000).toISOString();
      const verifyExpired = ConnectorsService.verifySignature(payload, secret, signature, oldTimestamp);
      expect(verifyExpired.valid).toBe(false);
      expect(verifyExpired.reason).toContain('replay attack');
    });
  });

  describe('GOLDEN PATH SPEC REQUIREMENT: Full Lead Commerce Lifecycle', () => {
    it('lead flows: upload -> score -> ping -> accept -> post -> sale -> return -> credit with correct ledger', async () => {
      const leadId = '77777777-0000-0000-0000-000000000001';
      const leadData = {
        first_name: 'Maximilian',
        last_name: 'Weber',
        phone_e164: '+491714567890',
        email: 'm.weber@beispiel-solar.de',
        street: 'Sendlinger Str. 14',
        city: 'München',
        postal_code: '80331',
        project_name: 'Photovoltaik',
        is_homeowner: true,
      };

      const initialWallet = walletLedger.getWallet(tenantId);
      const initialBalance = initialWallet.balance;

      // 1. Ping-Post Waterfall Execution
      const result = await marketplace.executePingPostWaterfall({
        tenantId,
        leadId,
        leadData,
        score0100: 92,
        scoreBand: 'A',
      });

      expect(result.status).toBe('SOLD');
      expect(result.winningBuyer).toBeDefined();
      expect(result.winningBuyer?.name).toBe('Solar Direkt Deutschland GmbH');

      // 2. Anonymous Ping Payload Verification (ZERO PII)
      expect(result.pingPayload.scoreBand).toBe('A');
      expect(result.pingPayload.postalCodePrefix).toBe('80');
      expect((result.pingPayload as any).firstName).toBeUndefined();
      expect((result.pingPayload as any).phoneE164).toBeUndefined();

      // 3. Lead Sale Record verification (Separate table from leads)
      expect(result.sale).toBeDefined();
      expect(result.sale?.salePrice).toBe(75.0);
      expect(result.sale?.status).toBe('COMPLETED');
      expect(result.sale?.returnStatus).toBe('NONE');

      // 4. Wallet Ledger Credited
      const postSaleWallet = walletLedger.getWallet(tenantId);
      expect(postSaleWallet.balance).toBe(initialBalance + 75.0);

      // 5. Return & Credit Note Workflow
      const returnResult = marketplace.processReturn({
        tenantId,
        leadSaleId: result.sale!.id,
        buyerId: result.winningBuyer!.id,
        reasonCode: 'INVALID_NUMBER',
        reasonDetail: 'Nummer ist nicht vergeben',
      });

      expect(returnResult.returnRecord.status).toBe('APPROVED');
      expect(returnResult.returnRecord.refundAmount).toBe(75.0);

      // Official Credit Note generated
      expect(returnResult.creditNote.creditNoteNumber).toMatch(/^GS-2026-\d{4}$/);
      expect(returnResult.creditNote.amount).toBe(75.0);

      // 6. Ledger Balanced After Refund
      const postRefundWallet = walletLedger.getWallet(tenantId);
      expect(postRefundWallet.balance).toBe(initialBalance); // exact back to initial balance
    });
  });

  describe('SECONDARY MULTI-SALE SPEC REQUIREMENT', () => {
    it('a second sale of the exact same lead works without schema changes via lead_sales', async () => {
      const leadId = '77777777-0000-0000-0000-000000000001';
      const leadData = {
        first_name: 'Maximilian',
        last_name: 'Weber',
        postal_code: '80331',
        project_name: 'Photovoltaik',
      };

      // 1. Initial Exclusive Sale
      const firstSaleResult = await marketplace.executePingPostWaterfall({
        tenantId,
        leadId,
        leadData,
        score0100: 92,
        scoreBand: 'A',
      });
      expect(firstSaleResult.status).toBe('SOLD');
      const firstSaleId = firstSaleResult.sale!.id;

      // 2. Secondary Sale to a different partner (Vitalis Care)
      const secondSale = marketplace.executeSecondarySale({
        tenantId,
        leadId,
        secondaryBuyerId: 'buyer-0004-vitalis-care',
        discountFactor: 0.75, // Semi-exclusive discount
      });

      expect(secondSale.id).toBeDefined();
      expect(secondSale.id).not.toBe(firstSaleId);
      expect(secondSale.leadId).toBe(leadId); // EXACT SAME LEAD ID
      expect(secondSale.exclusivity).toBe('SEMI_EXCLUSIVE');
      expect(secondSale.salePrice).toBe(56.25); // 75 * 0.75
      expect(secondSale.buyerName).toBe('Vitalis Pflege & Mobilität KG');

      // Verify that all sales for this lead contain both records
      const allSales = marketplace.getSales(tenantId).filter((s) => s.leadId === leadId);
      expect(allSales.length).toBe(2);
      expect(allSales[0].id).toBe(secondSale.id);
      expect(allSales[1].id).toBe(firstSaleId);
    });
  });
});
