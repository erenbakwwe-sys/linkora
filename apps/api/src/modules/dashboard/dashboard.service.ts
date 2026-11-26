import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { AgentStateService } from '../dialer/agent-state.service.js';

export interface ActiveAgentDto {
  id: string;
  name: string;
  companyName: string;
  status: 'ON_CALL' | 'WRAP_UP' | 'DIALING' | 'JOINING' | 'READY' | 'WAITING' | 'PAUSE';
  statusLabelDe: string;
  statusLabelTr: string;
  durationSeconds: number;
  durationFormatted: string;
  durationCategory: 'light' | 'medium' | 'dark';
}

@Injectable()
export class DashboardService {
  constructor(
    private db: DatabaseService,
    private agentState: AgentStateService,
  ) {}

  /** Real figures from the database (no demo defaults). */
  async getStats(tenantId: string) {
    const leads = await this.db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW()))::int AS leads_this_month,
         COUNT(*) FILTER (WHERE status IN ('QC_PENDING', 'IN_REVIEW'))::int AS in_qc,
         COUNT(*) FILTER (WHERE status IN ('CONFIRMED', 'SOLD', 'ROUTED') AND updated_at >= date_trunc('month', NOW()))::int AS confirmed_month,
         COUNT(*) FILTER (WHERE status IN ('STORNO', 'REJECTED', 'RETURNED') AND updated_at >= date_trunc('month', NOW()))::int AS storno_month,
         COUNT(*) FILTER (WHERE status = 'NEW' AND consent_verified = true AND dnc_flag = false)::int AS ready_to_call
       FROM leads WHERE tenant_id = $1`,
      [tenantId],
    );
    const money = await this.db.query(
      `SELECT
         COALESCE((SELECT SUM(total_amount) FROM invoices WHERE tenant_id = $1 AND status NOT IN ('PAID', 'CANCELLED')), 0)::float AS open_due,
         COALESCE((SELECT SUM(sale_price) FROM lead_sales WHERE tenant_id = $1 AND status = 'COMPLETED'
                     AND sold_at >= date_trunc('month', NOW())), 0)::float AS next_month`,
      [tenantId],
    );
    const l = leads.rows[0] || {};
    const m = money.rows[0] || {};
    const agents = this.agentState.getActiveAgents(tenantId);

    return {
      kpi: {
        leadsThisMonth: l.leads_this_month || 0,
        inQc: l.in_qc || 0,
        confirmedMonth: l.confirmed_month || 0,
        stornoMonth: l.storno_month || 0,
        openDueEur: Number(m.open_due || 0),
        nextMonthEur: Number(m.next_month || 0),
      },
      liveDialer: {
        readyToCall: l.ready_to_call || 0,
        customersBeingCalled: agents.filter((a) => a.status === 'ON_CALL' || a.status === 'DIALING').length,
        agentsOnline: agents.length,
        agentsJoining: agents.filter((a) => a.status === 'JOINING').length,
        dialingManually: agents.filter((a) => a.status === 'DIALING').length,
      },
    };
  }

  async getActiveAgents(tenantId: string, companyFilter?: string): Promise<{
    onlineCount: number;
    waitingCount: number;
    agents: ActiveAgentDto[];
  }> {
    const live = this.agentState
      .getActiveAgents(tenantId)
      .filter((a) => !companyFilter || companyFilter === 'ALL' || a.companyName === companyFilter);
    const agents: ActiveAgentDto[] = live.map((a) => ({
      id: a.agentId,
      name: a.name,
      companyName: a.companyName,
      status: a.status as ActiveAgentDto['status'],
      statusLabelDe: a.statusLabelDe,
      statusLabelTr: a.statusLabelTr,
      durationSeconds: a.durationSeconds,
      durationFormatted: a.durationFormatted,
      durationCategory: a.durationCategory,
    }));
    return {
      onlineCount: agents.length,
      waitingCount: agents.filter((a) => a.status === 'WAITING' || a.status === 'READY').length,
      agents,
    };
  }

  /** Agent rankings and the caller's own figures, computed from real leads. */
  async getLeaderboard(tenantId: string, userId?: string) {
    const ranking = async (since: string) =>
      (
        await this.db.query(
          `SELECT COALESCE(u.display_name, TRIM(u.first_name || ' ' || u.last_name)) AS name, COUNT(*)::int AS count
           FROM leads l
           JOIN users u ON u.id::text = l.extra_data->>'createdBy'
           WHERE l.tenant_id = $1 AND l.created_at >= ${since}
           GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
          [tenantId],
        )
      ).rows;

    const today = await ranking(`date_trunc('day', NOW() AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'Europe/Berlin'`);
    const month = await ranking(`date_trunc('month', NOW() AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'Europe/Berlin'`);

    let me = { total: 0, last30Days: 0, recent: [] as any[] };
    if (userId && /^[0-9a-f-]{36}$/i.test(userId)) {
      const counts = await this.db.query(
        `SELECT COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int AS last30
         FROM leads WHERE tenant_id = $1 AND extra_data->>'createdBy' = $2`,
        [tenantId, userId],
      );
      const recent = await this.db.query(
        `SELECT l.id, l.first_name, l.last_name, l.status, l.created_at, p.name AS project_name
         FROM leads l LEFT JOIN projects p ON p.id = l.project_id
         WHERE l.tenant_id = $1 AND l.extra_data->>'createdBy' = $2
         ORDER BY l.created_at DESC LIMIT 10`,
        [tenantId, userId],
      );
      me = { total: counts.rows[0]?.total || 0, last30Days: counts.rows[0]?.last30 || 0, recent: recent.rows };
    }
    return { today, month, me };
  }
}
