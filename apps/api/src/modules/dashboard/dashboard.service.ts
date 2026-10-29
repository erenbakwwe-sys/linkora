import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';

export interface ActiveAgentDto {
  id: string;
  name: string;
  companyName: string;
  status: 'ON_CALL' | 'WRAP_UP' | 'DIALING' | 'JOINING' | 'READY' | 'WAITING' | 'PAUSE';
  statusLabelDe: string;
  statusLabelTr: string;
  durationSeconds: number;
  durationFormatted: string;
  durationCategory: 'light' | 'medium' | 'dark'; // hell 0-5m, mittel 5-10m, dunkel 10+m
}

@Injectable()
export class DashboardService {
  constructor(private db: DatabaseService) {}

  async getStats(tenantId: string) {
    // Dynamic or demo defaults matching the screenshot overview
    return {
      kpi: {
        leadsThisMonth: 190,
        inQc: 0,
        confirmedMonth: 38,
        stornoMonth: 103,
        openDueEur: 0.0,
        nextMonthEur: 5188.94,
      },
      liveDialer: {
        readyToCall: 5,
        customersBeingCalled: 0,
        agentsOnline: 2,
        agentsJoining: 0,
        dialingManually: 0,
      },
    };
  }

  async getActiveAgents(tenantId: string, companyFilter?: string): Promise<{
    onlineCount: number;
    waitingCount: number;
    agents: ActiveAgentDto[];
  }> {
    // Default active agents matching the reference screenshot:
    // Umut (Wartend 165:18, dunkel), Erensamsun (Wartend 00:39, hell)
    const agents: ActiveAgentDto[] = [
      {
        id: 'agent-1',
        name: 'Umut',
        companyName: 'Call-Center Izmir',
        status: 'WAITING',
        statusLabelDe: 'Wartend',
        statusLabelTr: 'Bekliyor',
        durationSeconds: 9918, // 165 min 18 sec
        durationFormatted: '165:18',
        durationCategory: 'dark', // > 10 min
      },
      {
        id: 'agent-2',
        name: 'Erensamsun',
        companyName: 'Call-Center Izmir',
        status: 'WAITING',
        statusLabelDe: 'Wartend',
        statusLabelTr: 'Bekliyor',
        durationSeconds: 39, // 39 sec
        durationFormatted: '00:39',
        durationCategory: 'light', // 0 - 5 min
      },
    ];

    return {
      onlineCount: 2,
      waitingCount: 2,
      agents,
    };
  }
}
