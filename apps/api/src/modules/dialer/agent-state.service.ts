import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { LiveGateway } from '../gateway/live.gateway.js';

export type AgentState =
  | 'OFFLINE'
  | 'READY'
  | 'WAITING'
  | 'DIALING'
  | 'JOINING'
  | 'ON_CALL'
  | 'WRAP_UP' // ACW
  | 'PAUSE';

export interface AgentStatusInfo {
  agentId: string;
  name: string;
  companyName: string;
  status: AgentState;
  statusLabelDe: string;
  statusLabelTr: string;
  pauseReason?: string;
  startedAt: Date;
  durationSeconds: number;
  durationFormatted: string;
  durationCategory: 'light' | 'medium' | 'dark'; // hell 0-5m, mittel 5-10m, dunkel 10+m
  currentCallId?: string;
}

// In-memory agent state store with demo defaults matching reference screenshot
const memoryAgentStates = new Map<string, AgentStatusInfo>([
  [
    '99999999-0000-0000-0000-000000000005',
    {
      agentId: '99999999-0000-0000-0000-000000000005',
      name: 'Umut',
      companyName: 'Call-Center Izmir',
      status: 'WAITING',
      statusLabelDe: 'Wartend',
      statusLabelTr: 'Bekliyor',
      startedAt: new Date(Date.now() - 9918 * 1000), // 165 min 18 sec
      durationSeconds: 9918,
      durationFormatted: '165:18',
      durationCategory: 'dark',
    },
  ],
  [
    '99999999-0000-0000-0000-000000000006',
    {
      agentId: '99999999-0000-0000-0000-000000000006',
      name: 'Erensamsun',
      companyName: 'Call-Center Izmir',
      status: 'WAITING',
      statusLabelDe: 'Wartend',
      statusLabelTr: 'Bekliyor',
      startedAt: new Date(Date.now() - 39 * 1000), // 39 sec
      durationSeconds: 39,
      durationFormatted: '00:39',
      durationCategory: 'light',
    },
  ],
]);

@Injectable()
export class AgentStateService {
  private readonly logger = new Logger(AgentStateService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly liveGateway: LiveGateway,
  ) {}

  /**
   * Transition an agent to a new state and log to agent_status_log.
   */
  async setAgentState(
    tenantId: string,
    agentId: string,
    newState: AgentState,
    options: {
      pauseReason?: string;
      callId?: string;
      agentName?: string;
      companyName?: string;
    } = {}
  ): Promise<AgentStatusInfo> {
    const now = new Date();
    const existing = memoryAgentStates.get(agentId);

    // If changing state, calculate previous duration and persist log
    if (existing && existing.status !== newState) {
      const prevDuration = Math.round((now.getTime() - existing.startedAt.getTime()) / 1000);
      try {
        await this.db.query(
          `INSERT INTO agent_status_log (id, tenant_id, user_id, status, pause_reason, started_at, ended_at, duration_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            randomUUID(),
            tenantId,
            agentId,
            existing.status,
            existing.pauseReason || null,
            existing.startedAt.toISOString(),
            now.toISOString(),
            prevDuration,
          ]
        );
      } catch {
        // Fallback
      }
    }

    const { statusLabelDe, statusLabelTr } = this.getStatusLabels(newState);
    const updated: AgentStatusInfo = {
      agentId,
      name: options.agentName || existing?.name || 'Agent',
      companyName: options.companyName || existing?.companyName || 'Call-Center',
      status: newState,
      statusLabelDe,
      statusLabelTr,
      pauseReason: options.pauseReason,
      startedAt: now,
      durationSeconds: 0,
      durationFormatted: '00:00',
      durationCategory: 'light',
      currentCallId: options.callId,
    };

    memoryAgentStates.set(agentId, updated);

    // Broadcast live event over WebSocket
    this.liveGateway.server?.emit('agent:state_changed', {
      tenantId,
      agent: updated,
    });

    return updated;
  }

  /**
   * Get all active agents with live elapsed durations.
   */
  getActiveAgents(tenantId: string): AgentStatusInfo[] {
    const now = new Date();
    const list: AgentStatusInfo[] = [];

    for (const info of memoryAgentStates.values()) {
      const durationSeconds = Math.max(
        0,
        Math.round((now.getTime() - info.startedAt.getTime()) / 1000)
      );

      const mins = Math.floor(durationSeconds / 60);
      const secs = durationSeconds % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      // Hell: 0-5 min, Mittel: 5-10 min, Dunkel: 10+ min
      let durationCategory: 'light' | 'medium' | 'dark' = 'light';
      if (mins >= 10) {
        durationCategory = 'dark';
      } else if (mins >= 5) {
        durationCategory = 'medium';
      }

      list.push({
        ...info,
        durationSeconds,
        durationFormatted: formatted,
        durationCategory,
      });
    }

    return list;
  }

  /**
   * Get count of agents currently in 'READY' or 'WAITING' state.
   */
  getFreeAgentCount(tenantId: string): number {
    return Array.from(memoryAgentStates.values()).filter(
      (a) => a.status === 'READY' || a.status === 'WAITING'
    ).length;
  }

  private getStatusLabels(state: AgentState): { statusLabelDe: string; statusLabelTr: string } {
    switch (state) {
      case 'ON_CALL':
        return { statusLabelDe: 'Am Telefon', statusLabelTr: 'Telefonda' };
      case 'WRAP_UP':
        return { statusLabelDe: 'Nachbearbeitung', statusLabelTr: 'Son İşlem (ACW)' };
      case 'DIALING':
        return { statusLabelDe: 'Wählt', statusLabelTr: 'Arıyor' };
      case 'JOINING':
        return { statusLabelDe: 'Wählt sich ein', statusLabelTr: 'Hatta Bağlanıyor' };
      case 'READY':
        return { statusLabelDe: 'Bereit, wartet auf Anruf', statusLabelTr: 'Hazır, çağrı bekliyor' };
      case 'WAITING':
        return { statusLabelDe: 'Wartend', statusLabelTr: 'Bekliyor' };
      case 'PAUSE':
        return { statusLabelDe: 'Pause', statusLabelTr: 'Mola' };
      default:
        return { statusLabelDe: 'Offline', statusLabelTr: 'Çevrimdışı' };
    }
  }
}
