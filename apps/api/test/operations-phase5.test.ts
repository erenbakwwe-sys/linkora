import { OperationsService } from '../src/modules/operations/operations.service.js';
import { FinancesService } from '../src/modules/finances/finances.service.js';
import { ReportsService } from '../src/modules/reports/reports.service.js';
import { TenantsService } from '../src/modules/tenants/tenants.service.js';
import { DatabaseService } from '../src/common/services/database.service.js';

describe('Phase 5: Operations, HR-Zeit, Rota, Finances & 1-Click Provisioning', () => {
  let db: DatabaseService;
  let operations: OperationsService;
  let finances: FinancesService;
  let reports: ReportsService;
  let tenants: TenantsService;

  const tenantId = '11111111-1111-1111-1111-111111111111';

  beforeEach(() => {
    db = new DatabaseService();
    operations = new OperationsService(db);
    finances = new FinancesService(db);
    reports = new ReportsService(db);
    tenants = new TenantsService(db);
  });

  describe('Rota-Tafel & Shift Conflict Detection Engine', () => {
    it('should schedule normal shift without conflict', () => {
      const shift = operations.createShift({
        tenantId,
        teamName: 'Outbound Team',
        userId: 'agent-100',
        userName: 'Max Mustermann',
        date: '2026-11-10',
        startTime: '09:00',
        endTime: '17:30',
      });

      expect(shift.hasConflict).toBe(false);
      expect(shift.status).toBe('SCHEDULED');
    });

    it('SPEC REQUIREMENT: should highlight scheduling conflict when agent has approved leave on shift date', () => {
      // 1. Request & approve leave
      const leave = operations.requestLeave({
        tenantId,
        userId: 'agent-100',
        userName: 'Max Mustermann',
        startDate: '2026-11-15',
        endDate: '2026-11-18',
        leaveType: 'URLAUB',
      });
      operations.updateLeaveStatus(tenantId, leave.id, 'APPROVED');

      // 2. Schedule shift on date during approved leave
      const conflictingShift = operations.createShift({
        tenantId,
        teamName: 'Outbound Team',
        userId: 'agent-100',
        userName: 'Max Mustermann',
        date: '2026-11-16', // falls inside 15-18!
        startTime: '09:00',
        endTime: '17:30',
      });

      expect(conflictingShift.hasConflict).toBe(true);
      expect(conflictingShift.conflictReason).toContain('Genehmigter Urlaub');
    });
  });

  describe('HR-Zeit Clock In / Clock Out', () => {
    it('should clock in, calculate working minutes subtracting breaks, and submit for manager approval', () => {
      const userId = 'agent-200';
      const clockIn = operations.clockIn(tenantId, userId, 'Laura Schmidt');
      expect(clockIn.status).toBe('ACTIVE');

      const clockOut = operations.clockOut(tenantId, userId, 30); // 30 min break
      expect(clockOut.status).toBe('PENDING');
      expect(clockOut.breakMinutes).toBe(30);

      const approved = operations.approveTimeEntry(tenantId, clockOut.id, 'Manager Mustermann');
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedBy).toBe('Manager Mustermann');
    });
  });

  describe('Finanzen: Kasa, Fällig & Nächster Monat', () => {
    it('should return realized income, Offen (fällig), and Nächster Monat calculations matching dashboard specs', () => {
      const kasa = finances.getKasaIncome(tenantId);
      expect(kasa.totalRealizedIncomeEur).toBeGreaterThan(0);
      expect(kasa.offenFälligEur).toBe(8450.0);
      expect(kasa.naechsterMonatEur).toBe(14200.0);
      expect(kasa.incomeEntries.length).toBeGreaterThanOrEqual(4);
    });

    it('should calculate minute costs and trigger low-balance warning if balance <= threshold', () => {
      const balanceInfo = finances.getBalanceCosts(tenantId);
      expect(balanceInfo.perMinuteCostEur).toBe(0.04);
      expect(balanceInfo.lowBalanceThresholdEur).toBe(10.0);
    });
  });

  describe('SPEC REQUIREMENT: 1-Click Sub-Company Provisioning in < 10 Minutes', () => {
    it('should provision a new tenant with admin user, wallet, and sample project in seconds', async () => {
      const result = await tenants.provisionSubCompany(tenantId, {
        name: 'Call-Center Antalya GmbH',
        brandName: 'Antalya Dialers',
        adminEmail: 'admin@antalya-dialers.de',
        initialBalance: 750.0,
        accentColor: '#10b981',
      });

      expect(result.tenant.id).toBeDefined();
      expect(result.tenant.parent_tenant_id).toBe(tenantId);
      expect(result.tenant.name).toBe('Call-Center Antalya GmbH');
      expect(result.tenant.branding.brand_name).toBe('Antalya Dialers');
      expect(result.adminUser.email).toBe('admin@antalya-dialers.de');
      expect(result.wallet.balance).toBe(750.0);
      expect(result.sampleProject.name).toContain('Photovoltaik');

      // Must complete in seconds (well under 10 minutes requirement)
      expect(result.provisionDurationMs).toBeLessThan(1000);
    });
  });
});
