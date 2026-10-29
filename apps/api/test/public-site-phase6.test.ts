import { LeadsController } from '../src/modules/leads/leads.controller.js';
import { LeadsService } from '../src/modules/leads/leads.service.js';
import { IngestionService } from '../src/modules/leads/ingestion.service.js';
import { MarketplaceService } from '../src/modules/marketplace/marketplace.service.js';
import { PricingEngineService } from '../src/modules/marketplace/pricing-engine.service.js';
import { WalletLedgerService } from '../src/modules/marketplace/wallet-ledger.service.js';
import { ConnectorsService } from '../src/modules/marketplace/connectors.service.js';
import { AuditService } from '../src/modules/audit/audit.service.js';
import { DatabaseService } from '../src/common/services/database.service.js';
import { BadRequestException } from '@nestjs/common';

describe('Phase 6: Public Website, Anti-Spam Honeypot, Consent & Golden Path', () => {
  let db: DatabaseService;
  let auditService: AuditService;
  let leadsService: LeadsService;
  let ingestionService: IngestionService;
  let leadsController: LeadsController;
  let pricingEngine: PricingEngineService;
  let walletLedger: WalletLedgerService;
  let connectors: ConnectorsService;
  let marketplaceService: MarketplaceService;

  const tenantId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    db = new DatabaseService();
    auditService = new AuditService(db);
    leadsService = new LeadsService(db, auditService);
    ingestionService = new IngestionService(db, auditService);
    leadsController = new LeadsController(leadsService, ingestionService);
    pricingEngine = new PricingEngineService();
    walletLedger = new WalletLedgerService(db);
    connectors = new ConnectorsService();
    marketplaceService = new MarketplaceService(db, pricingEngine, walletLedger, connectors);
  });

  describe('Anti-Spam Honeypot & Consent Validation (SPEC Section 7)', () => {
    it('SPEC REQUIREMENT: should silently neutralize spam bots when honeypot field is filled', async () => {
      const res = await leadsController.publicInquiry(
        {
          website_hp: 'automated-crawler-token-xyz',
          firstName: 'Bot',
          lastName: 'Spammer',
          phone: '+491701111111',
          consentGranted: true,
        },
        { ip: '192.168.1.1', headers: {} }
      );

      expect(res.success).toBe(true);
      expect(res.isSpamDropped).toBe(true);
      expect(res.leadId).toBeUndefined(); // Bot lead must NOT be created in the database!
    });

    it('SPEC REQUIREMENT: should reject inquiries lacking explicit GDPR consent with 400 Bad Request', async () => {
      await expect(
        leadsController.publicInquiry(
          {
            firstName: 'Klaus',
            lastName: 'Müller',
            phone: '+491702222222',
            consentGranted: false, // Explicit consent omitted
          },
          { ip: '127.0.0.1', headers: {} }
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully accept valid public inquiry, normalize phone and create provenance record', async () => {
      const res = await leadsController.publicInquiry(
        {
          userType: 'COMPANY',
          inquiryType: 'LEADS',
          project: 'Photovoltaik',
          firstName: 'Sabine',
          lastName: 'Schulz',
          phone: '0171 9876543', // Local German format
          email: 'sabine@schulz-solar.de',
          postalCode: '10115',
          city: 'Berlin',
          consentGranted: true,
          consentVersion: 'v2026.1',
          website_hp: '', // Legitimate user leaves honeypot empty
        },
        { ip: '85.214.132.11', headers: { 'user-agent': 'Mozilla/5.0' } }
      );

      expect(res.success).toBe(true);
      expect(res.isSpamDropped).toBeUndefined();
      expect(res.leadId).toBeDefined();

      // Retrieve lead detail and verify provenance
      const detail = await leadsService.getLeadDetail(tenantId, res.leadId);
      expect(detail).toBeDefined();
      expect(detail.lead).toBeDefined();
      expect(detail.lead.phone_e164).toBe('+491719876543'); // E.164 normalized
      expect(detail.provenance).toBeDefined();
      expect(detail.provenance.length).toBeGreaterThan(0);
      expect(detail.provenance[0].source).toBe('LANDING_PAGE');
    });
  });

  describe('Full Golden Path E2E Journey (SPEC Sections 1 & 9)', () => {
    it('executes full path: Public Inquiry -> Ingestion -> Ping-Post Matching to German Buyer -> Sale Recorded', async () => {
      // 1. Submit Public Inquiry from Landing Page
      const inquiryRes = await leadsController.publicInquiry(
        {
          userType: 'COMPANY',
          inquiryType: 'LEADS',
          project: 'Photovoltaik',
          firstName: 'Michael',
          lastName: 'Weber',
          phone: '+491715556677',
          email: 'm.weber@beispiel-energie.de',
          postalCode: '80331',
          city: 'München',
          consentGranted: true,
          consentVersion: 'v2026.1',
          website_hp: '',
        },
        { ip: '80.147.22.10', headers: {} }
      );

      expect(inquiryRes.success).toBe(true);
      const leadId = inquiryRes.leadId;

      // 2. Dialer Eligibility Verification (Must be allowed since valid consent proof exists)
      const dialCheck = await leadsService.canDial(tenantId, leadId);
      expect(dialCheck.allowed).toBe(true);
      expect(dialCheck.reason).toBeUndefined();

      // 3. Marketplace Ping-Post Waterfall Matching to German Buyer
      const pingPostResult = await marketplaceService.executePingPostWaterfall({
        tenantId,
        leadId,
        leadData: {
          first_name: 'Michael',
          last_name: 'Weber',
          phone_e164: '+491715556677',
          email: 'm.weber@beispiel-energie.de',
          city: 'München',
          postal_code: '80331',
          project_name: 'Photovoltaik',
          is_homeowner: true,
        },
        score0100: 92,
        scoreBand: 'A',
      });

      expect(pingPostResult.status).toBe('SOLD');
      expect(pingPostResult.winningBuyer).toBeDefined();
      expect(pingPostResult.winningBuyer?.name).toBe('Solar Direkt Deutschland GmbH');
      expect(pingPostResult.sale).toBeDefined();
      expect(pingPostResult.sale?.salePrice).toBe(75.0);
      expect(pingPostResult.sale?.status).toBe('COMPLETED');
    });
  });
});
