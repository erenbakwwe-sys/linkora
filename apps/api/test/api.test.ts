import { AuthService } from '../src/modules/auth/auth.service.js';
import { DashboardService } from '../src/modules/dashboard/dashboard.service.js';
import { JwtService } from '@nestjs/jwt';

describe('API Services & Logic Tests', () => {
  it('should return KPI stats matching screenshot metrics', async () => {
    const mockDb = { query: async () => ({ rows: [] }) } as any;
    const dashboardService = new DashboardService(mockDb);

    const stats = await dashboardService.getStats('tenant-id');
    expect(stats.kpi.leadsThisMonth).toBe(190);
    expect(stats.kpi.inQc).toBe(0);
    expect(stats.kpi.confirmedMonth).toBe(38);
    expect(stats.kpi.stornoMonth).toBe(103);
    expect(stats.kpi.openDueEur).toBe(0.0);
    expect(stats.kpi.nextMonthEur).toBe(5188.94);

    expect(stats.liveDialer.readyToCall).toBe(5);
    expect(stats.liveDialer.customersBeingCalled).toBe(0);
    expect(stats.liveDialer.agentsOnline).toBe(2);
    expect(stats.liveDialer.agentsJoining).toBe(0);
    expect(stats.liveDialer.dialingManually).toBe(0);
  });

  it('should return active agents matching the screenshot (Umut and Erensamsun)', async () => {
    const mockDb = { query: async () => ({ rows: [] }) } as any;
    const dashboardService = new DashboardService(mockDb);

    const result = await dashboardService.getActiveAgents('tenant-id');
    expect(result.onlineCount).toBe(2);
    expect(result.waitingCount).toBe(2);
    expect(result.agents).toHaveLength(2);

    const umut = result.agents.find((a) => a.name === 'Umut');
    expect(umut).toBeDefined();
    expect(umut?.status).toBe('WAITING');
    expect(umut?.statusLabelDe).toBe('Wartend');
    expect(umut?.durationFormatted).toBe('165:18');
    expect(umut?.durationCategory).toBe('dark'); // 10+ min

    const eren = result.agents.find((a) => a.name === 'Erensamsun');
    expect(eren).toBeDefined();
    expect(eren?.status).toBe('WAITING');
    expect(eren?.statusLabelDe).toBe('Wartend');
    expect(eren?.durationFormatted).toBe('00:39');
    expect(eren?.durationCategory).toBe('light'); // 0-5 min
  });

  it('should toggle user mode between MANAGER and AGENT', async () => {
    const mockDb = {
      query: async (sql: string) => {
        if (sql.includes('UPDATE users')) return { rows: [] };
        return {
          rows: [
            {
              id: 'user-1',
              email: 'eren@cc-izmir.com',
              tenant_id: 'tenant-1',
              role_slug: 'COMPANY_ADMIN',
            },
          ],
        };
      },
    } as any;

    const jwtService = new JwtService({ secret: 'test-secret' });
    const authService = new AuthService(mockDb, jwtService, {} as any);

    const res = await authService.switchMode('user-1', 'AGENT');
    expect(res.mode).toBe('AGENT');
    expect(res.accessToken).toBeDefined();
  });
});
