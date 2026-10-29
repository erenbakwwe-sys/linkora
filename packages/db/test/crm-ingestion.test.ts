import { normalizePhoneNumber } from '@linkora/shared';
import { IngestionService } from '../../../apps/api/src/modules/leads/ingestion.service.js';
import { LeadsService } from '../../../apps/api/src/modules/leads/leads.service.js';
import { ImportService } from '../../../apps/api/src/modules/import/import.service.js';
import { DatabaseService } from '../../../apps/api/src/common/services/database.service.js';
import { AuditService } from '../../../apps/api/src/modules/audit/audit.service.js';

describe('Phase 1: CRM Core Ingestion, Dedup, Consent & Quarantine Rules', () => {
  let db: DatabaseService;
  let auditService: AuditService;
  let ingestionService: IngestionService;
  let leadsService: LeadsService;
  let importService: ImportService;

  const tenantId = '11111111-1111-1111-1111-111111111111';
  const pvProjectId = 'cccccccc-0000-0000-0000-000000000001';

  beforeAll(() => {
    db = new DatabaseService();
    // Do not fail if DB is not running; DatabaseService in tests works with in-memory stores
    try {
      db.onModuleInit();
    } catch {
      // offline fallback
    }
    auditService = new AuditService(db);
    ingestionService = new IngestionService(db, auditService);
    leadsService = new LeadsService(db, auditService);
    importService = new ImportService(db, ingestionService);
  });

  afterAll(async () => {
    try {
      await db.onModuleDestroy();
    } catch {
      // ignore
    }
  });

  describe('1. Phone Normalization & Line-Type Detection', () => {
    it('should normalize German mobile numbers to E.164 and detect MOBILE', () => {
      const res = normalizePhoneNumber('0176 98765432', 'DE');
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe('+4917698765432');
      expect(res.lineType).toBe('MOBILE');
    });

    it('should normalize German landline numbers to E.164 and detect FIXED_LINE', () => {
      const res = normalizePhoneNumber('089 / 1234567', 'DE');
      expect(res.isValid).toBe(true);
      expect(res.e164).toBe('+49891234567');
      expect(res.lineType).toBe('FIXED_LINE');
    });

    it('should reject invalid or garbage phone strings', () => {
      const res = normalizePhoneNumber('abc-invalid', 'DE');
      expect(res.isValid).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe('2. Batch Idempotency (SPEC.md: "Importing the same file twice is a no-op")', () => {
    it('should process a new file hash once, and return duplicate no-op on repeat', async () => {
      const fileHash = 'sha256-test-hash-' + Date.now();
      const testRows = [
        {
          Vorname: 'Felix',
          Nachname: 'Bauer',
          Telefon: '0151 11223344',
          Email: 'felix.bauer@test.de',
          Quelle: 'Solar Portal',
          Einwilligung: 'Einwilligung erteilt nach DSGVO Art 6 Abs 1.',
          OptIn: new Date().toISOString(),
        },
      ];

      const mapping = {
        firstName: 'Vorname',
        lastName: 'Nachname',
        phone: 'Telefon',
        email: 'Email',
        source: 'Quelle',
        consentText: 'Einwilligung',
        optInTimestamp: 'OptIn',
      };

      // First run: Accepted
      const run1 = await importService.executeImport(tenantId, {
        projectId: pvProjectId,
        fileName: 'leads_october.csv',
        fileHash,
        mapping,
        rows: testRows,
        defaultSource: 'CSV',
      });

      expect(run1.isDuplicateBatch).toBe(false);
      expect(run1.acceptedRows).toBe(1);
      expect(run1.quarantinedRows).toBe(0);

      // Second run with EXACT same fileHash: MUST be a no-op
      const run2 = await importService.executeImport(tenantId, {
        projectId: pvProjectId,
        fileName: 'leads_october.csv',
        fileHash,
        mapping,
        rows: testRows,
        defaultSource: 'CSV',
      });

      expect(run2.isDuplicateBatch).toBe(true);
      expect(run2.batchId).toBe(run1.batchId);
    });
  });

  describe('3. Quarantine Records (SPEC.md: "Bad rows land in quarantine; never deleted")', () => {
    it('should route rows with invalid phone numbers or missing names to quarantine', async () => {
      const badLeadInput = {
        projectId: pvProjectId,
        firstName: '', // Missing mandatory first name
        lastName: 'Schulz',
        phone: '123-NOT-A-PHONE', // Broken phone
      };

      const result = await ingestionService.ingestLeadRow(tenantId, badLeadInput as any, {
        channel: 'UNIT_TEST',
      });

      expect(result.success).toBe(false);
      expect(result.isQuarantined).toBe(true);
      expect(result.quarantineId).toBeDefined();
      expect(result.error).toContain('Vorname');

      // Verify quarantine record is queryable
      const quarantineList = await ingestionService.getQuarantineRecords(tenantId);
      const savedRecord = quarantineList.find((q: any) => q.id === result.quarantineId);
      expect(savedRecord).toBeDefined();
      expect(savedRecord.status).toBe('PENDING_REVIEW');
    });
  });

  describe('4. Consent & Provenance (SPEC.md: "Lead without consent proof cannot be dialed or sold")', () => {
    it('should mark lead consent_verified=true when full provenance is provided', async () => {
      const verifiedInput: any = {
        projectId: pvProjectId,
        firstName: 'Lukas',
        lastName: 'Zimmermann',
        phone: '0160 55443322',
        phoneCountry: 'DE',
        provenance: {
          source: 'Google Ads',
          optInTimestamp: new Date().toISOString(),
          consentText: 'Ich stimme der Kontaktaufnahme ausdrücklich zu.',
          consentChannel: 'ONLINE_FORM',
          consentVersion: 'v1.0',
          proofMetadata: {},
        },
      };

      const result = await ingestionService.ingestLeadRow(tenantId, verifiedInput);
      expect(result.success).toBe(true);
      expect(result.consentVerified).toBe(true);

      // canDial check should be ALLOWED
      const dialCheck = leadsService.checkCanDial({
        id: result.leadId!,
        phone_e164: result.phoneE164,
        consent_verified: result.consentVerified,
        dnc_flag: result.dncFlag,
      });

      expect(dialCheck.allowed).toBe(true);
      expect(dialCheck.message).toContain('freigegeben');
    });

    it('should enforce hard stop NO_CONSENT_PROOF when consent proof is missing', async () => {
      const noConsentInput: any = {
        projectId: pvProjectId,
        firstName: 'Markus',
        lastName: 'Wolf',
        phone: '0172 88990011',
        phoneCountry: 'DE',
        // No provenance object provided
      };

      const result = await ingestionService.ingestLeadRow(tenantId, noConsentInput);
      expect(result.success).toBe(true);
      expect(result.consentVerified).toBe(false);

      // canDial check MUST return allowed=false with NO_CONSENT_PROOF
      const dialCheck = leadsService.checkCanDial({
        id: result.leadId!,
        phone_e164: result.phoneE164,
        consent_verified: result.consentVerified,
        dnc_flag: result.dncFlag,
      });

      expect(dialCheck.allowed).toBe(false);
      expect(dialCheck.reason).toBe('NO_CONSENT_PROOF');
      expect(dialCheck.message).toContain('UWG');
    });
  });

  describe('5. DNC (Robinson) Suppression Check', () => {
    it('should block dialing with DNC_SUPPRESSED if phone is on suppression list', () => {
      const dialCheck = leadsService.checkCanDial({
        id: 'test-dnc-lead',
        phone_e164: '+491709999999',
        consent_verified: true,
        dnc_flag: true, // On DNC
      });

      expect(dialCheck.allowed).toBe(false);
      expect(dialCheck.reason).toBe('DNC_SUPPRESSED');
    });
  });

  describe('6. Deduplication & Provenance Merging', () => {
    it('should merge new provenance into existing lead when exact phone matches', async () => {
      const phone = '0175 44332211';
      const lead1 = await ingestionService.ingestLeadRow(tenantId, {
        projectId: pvProjectId,
        firstName: 'Anna',
        lastName: 'Krause',
        phone,
        phoneCountry: 'DE',
        provenance: {
          source: 'Campaign A',
          optInTimestamp: new Date().toISOString(),
          consentText: 'Einwilligung A',
          consentChannel: 'ONLINE_FORM',
          consentVersion: 'v1.0',
          proofMetadata: {},
        },
      } as any);

      expect(lead1.success).toBe(true);
      expect(lead1.isDuplicate).toBe(false);

      // Ingest second time from different source
      const lead2 = await ingestionService.ingestLeadRow(tenantId, {
        projectId: pvProjectId,
        firstName: 'Anna',
        lastName: 'Krause',
        phone,
        phoneCountry: 'DE',
        provenance: {
          source: 'Campaign B',
          optInTimestamp: new Date().toISOString(),
          consentText: 'Einwilligung B',
          consentChannel: 'PHONE',
          consentVersion: 'v1.0',
          proofMetadata: {},
        },
      } as any);

      expect(lead2.success).toBe(true);
      expect(lead2.isDuplicate).toBe(true);
      expect(lead2.leadId).toBe(lead1.leadId); // Same lead entity preserved
    });
  });
});
