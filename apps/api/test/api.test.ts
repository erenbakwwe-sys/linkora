import { AuthService } from '../src/modules/auth/auth.service.js';
import { DashboardService } from '../src/modules/dashboard/dashboard.service.js';
import { JwtService } from '@nestjs/jwt';

describe('API Services & Logic Tests', () => {
  it('computes dashboard KPIs from the database (no demo numbers)', async () => {
    const mockDb = {
      query: async (sql: string) => {
        if (sql.includes('leads_this_month')) {
          return { rows: [{ leads_this_month: 7, in_qc: 2, confirmed_month: 3, storno_month: 1, ready_to_call: 4 }] };
        }
        if (sql.includes('open_due')) {
          return { rows: [{ open_due: 120.5, next_month: 900 }] };
        }
        return { rows: [] };
      },
    } as any;
    const agentState = {
      getActiveAgents: () => [
        { agentId: 'a1', name: 'Agent A', companyName: 'Linkora', status: 'ON_CALL', statusLabelDe: 'Im Gespräch', statusLabelTr: '', durationSeconds: 30, durationFormatted: '00:30', durationCategory: 'light' },
        { agentId: 'a2', name: 'Agent B', companyName: 'Linkora', status: 'WAITING', statusLabelDe: 'Wartend', statusLabelTr: '', durationSeconds: 700, durationFormatted: '11:40', durationCategory: 'dark' },
      ],
    } as any;
    const dashboardService = new DashboardService(mockDb, agentState);

    const stats = await dashboardService.getStats('tenant-id');
    expect(stats.kpi).toEqual({
      leadsThisMonth: 7,
      inQc: 2,
      confirmedMonth: 3,
      stornoMonth: 1,
      openDueEur: 120.5,
      nextMonthEur: 900,
    });
    expect(stats.liveDialer.readyToCall).toBe(4);
    expect(stats.liveDialer.agentsOnline).toBe(2);
    expect(stats.liveDialer.customersBeingCalled).toBe(1);

    const agents = await dashboardService.getActiveAgents('tenant-id');
    expect(agents.onlineCount).toBe(2);
    expect(agents.waitingCount).toBe(1);
    expect(agents.agents.map((a) => a.name)).toEqual(['Agent A', 'Agent B']);
  });

  it('returns zeros and no agents for an empty tenant', async () => {
    const mockDb = { query: async () => ({ rows: [{}] }) } as any;
    const dashboardService = new DashboardService(mockDb, { getActiveAgents: () => [] } as any);
    const stats = await dashboardService.getStats('tenant-id');
    expect(stats.kpi.leadsThisMonth).toBe(0);
    expect(stats.kpi.nextMonthEur).toBe(0);
    expect((await dashboardService.getActiveAgents('tenant-id')).agents).toHaveLength(0);
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
    const authService = new AuthService(mockDb, jwtService, {} as any, {} as any);

    const res = await authService.switchMode('user-1', 'AGENT', 'COMPANY_ADMIN', 'tenant-1');
    expect(res.mode).toBe('AGENT');
    expect(res.accessToken).toBeDefined();
  });

  it('should forbid agents from switching into MANAGER mode', async () => {
    const jwtService = new JwtService({ secret: 'test-secret' });
    const authService = new AuthService({ query: async () => ({ rows: [] }) } as any, jwtService, {} as any, {} as any);
    await expect(authService.switchMode('user-1', 'MANAGER', 'AGENT', 'tenant-1')).rejects.toThrow();
  });
});
