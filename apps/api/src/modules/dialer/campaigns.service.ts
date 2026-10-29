import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { calculatePacingLines, DialingMode, PacingResult } from '@linkora/telephony';
import { AgentStateService } from './agent-state.service.js';

export interface CampaignDto {
  id: string;
  tenantId: string;
  projectId: string;
  projectName: string;
  name: string;
  dialingMode: DialingMode;
  pacingTempo: number; // Slider 1-10
  maxAbandonRate: number; // default 3.00%
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  totalLeads: number;
  contactedLeads: number;
  freeAgents: number;
  pacing: PacingResult;
}

// Memory store fallback
const memoryCampaigns = new Map<string, any>([
  [
    'aaaaaaaa-1111-0000-0000-000000000001',
    {
      id: 'aaaaaaaa-1111-0000-0000-000000000001',
      tenantId: '11111111-1111-1111-1111-111111111111',
      projectId: 'cccccccc-0000-0000-0000-000000000001',
      projectName: 'Photovoltaik',
      name: 'PV Deutschland Outbound Q4',
      dialingMode: 'POWER',
      pacingTempo: 5,
      maxAbandonRate: 3.0,
      status: 'ACTIVE',
      totalLeads: 450,
      contactedLeads: 182,
    },
  ],
  [
    'aaaaaaaa-1111-0000-0000-000000000002',
    {
      id: 'aaaaaaaa-1111-0000-0000-000000000002',
      tenantId: '11111111-1111-1111-1111-111111111111',
      projectId: 'cccccccc-0000-0000-0000-000000000002',
      projectName: 'Wärmepumpe',
      name: 'Wärmepumpen Sanierung 2026',
      dialingMode: 'PROGRESSIVE',
      pacingTempo: 3,
      maxAbandonRate: 3.0,
      status: 'ACTIVE',
      totalLeads: 230,
      contactedLeads: 74,
    },
  ],
]);

@Injectable()
export class CampaignsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly agentStateService: AgentStateService,
  ) {}

  async listCampaigns(tenantId: string): Promise<CampaignDto[]> {
    const freeAgents = this.agentStateService.getFreeAgentCount(tenantId);
    const list: CampaignDto[] = [];

    for (const c of memoryCampaigns.values()) {
      if (c.tenantId === tenantId) {
        const pacing = calculatePacingLines({
          dialingMode: c.dialingMode,
          freeAgents,
          totalAgents: 10,
          historicalAnswerRate: 0.25,
          pacingTempo: c.pacingTempo,
          maxAbandonRatePercent: c.maxAbandonRate,
        });

        list.push({
          ...c,
          freeAgents,
          pacing,
        });
      }
    }

    return list;
  }

  async getCampaign(tenantId: string, id: string): Promise<CampaignDto> {
    const c = memoryCampaigns.get(id);
    if (!c || c.tenantId !== tenantId) {
      throw new NotFoundException(`Kampagne ${id} nicht gefunden`);
    }

    const freeAgents = this.agentStateService.getFreeAgentCount(tenantId);
    const pacing = calculatePacingLines({
      dialingMode: c.dialingMode,
      freeAgents,
      totalAgents: 10,
      historicalAnswerRate: 0.25,
      pacingTempo: c.pacingTempo,
      maxAbandonRatePercent: c.maxAbandonRate,
    });

    return {
      ...c,
      freeAgents,
      pacing,
    };
  }

  /**
   * Update live pacing Tempo slider (1-10) with instant effect.
   */
  async updateTempo(tenantId: string, id: string, tempo: number): Promise<CampaignDto> {
    const c = memoryCampaigns.get(id);
    if (!c || c.tenantId !== tenantId) {
      throw new NotFoundException(`Kampagne ${id} nicht gefunden`);
    }

    const clampedTempo = Math.max(1, Math.min(10, tempo));
    c.pacingTempo = clampedTempo;

    try {
      await this.db.query(
        `UPDATE campaigns SET pacing_tempo = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
        [clampedTempo, id, tenantId]
      );
    } catch {
      // Memory fallback
    }

    return this.getCampaign(tenantId, id);
  }

  /**
   * Toggle campaign status: ACTIVE, PAUSED, STOPPED.
   */
  async updateStatus(tenantId: string, id: string, status: 'ACTIVE' | 'PAUSED' | 'STOPPED'): Promise<CampaignDto> {
    const c = memoryCampaigns.get(id);
    if (!c || c.tenantId !== tenantId) {
      throw new NotFoundException(`Kampagne ${id} nicht gefunden`);
    }

    c.status = status;
    try {
      await this.db.query(
        `UPDATE campaigns SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
        [status, id, tenantId]
      );
    } catch {
      // Memory fallback
    }

    return this.getCampaign(tenantId, id);
  }

  // ========================================================
  // KAMPAGNEN MANAGEMENT VIEW (Matching UI Reference)
  // ========================================================
  private managementCount = 4;
  private availableTeams = ['Testcalendra', 'MD-Team', 'Izmir Core', 'Solar Direkt'];

  private managementCampaigns = [
    {
      id: 'camp-1',
      number: 1,
      name: 'Kampanya 1',
      companyName: 'Lead-Kontackt',
      status: 'Offen' as const,
      isActive: true,
      tempo: 5,
      teams: [] as string[],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [] as { id: string; name: string; count: number; createdAt: string }[],
    },
    {
      id: 'camp-2',
      number: 2,
      name: 'Kampanya 2',
      companyName: 'Lead-Kontackt',
      status: 'Offen' as const,
      isActive: true,
      tempo: 5,
      teams: [] as string[],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [] as { id: string; name: string; count: number; createdAt: string }[],
    },
    {
      id: 'camp-3',
      number: 3,
      name: 'Kampanya 3',
      companyName: 'Lead-Kontackt',
      status: 'Offen' as const,
      isActive: true,
      tempo: 5,
      teams: [] as string[],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [] as { id: string; name: string; count: number; createdAt: string }[],
    },
    {
      id: 'camp-4',
      number: 4,
      name: 'Kampanya 4',
      companyName: 'Lead-Kontackt',
      status: 'Offen' as const,
      isActive: true,
      tempo: 5,
      teams: [] as string[],
      dataPackagesCount: 0,
      contactsCount: 0,
      newContactsCount: 0,
      dataPackages: [] as { id: string; name: string; count: number; createdAt: string }[],
    },
  ];

  async getManagementData(tenantId: string) {
    // Ensure array has at least managementCount items
    while (this.managementCampaigns.length < this.managementCount) {
      const num = this.managementCampaigns.length + 1;
      this.managementCampaigns.push({
        id: `camp-${num}`,
        number: num,
        name: `Kampanya ${num}`,
        companyName: 'Lead-Kontackt',
        status: 'Offen',
        isActive: true,
        tempo: 5,
        teams: [],
        dataPackagesCount: 0,
        contactsCount: 0,
        newContactsCount: 0,
        dataPackages: [],
      });
    }

    return {
      activeCompany: 'Calendra',
      campaignCount: this.managementCount,
      campaigns: this.managementCampaigns.slice(0, this.managementCount),
      availableTeams: this.availableTeams,
    };
  }

  async setCampaignCount(count: number) {
    const validCount = Math.max(1, Math.min(20, count || 4));
    this.managementCount = validCount;
    return this.getManagementData('default');
  }

  async saveManagementCampaign(id: string, body: any) {
    const camp = this.managementCampaigns.find((c) => c.id === id);
    if (!camp) {
      throw new NotFoundException(`Kampagne ${id} nicht gefunden`);
    }

    if (body.name !== undefined) camp.name = body.name.trim();
    if (body.isActive !== undefined) camp.isActive = Boolean(body.isActive);
    if (body.tempo !== undefined) camp.tempo = Number(body.tempo) || 5;
    if (Array.isArray(body.teams)) camp.teams = body.teams;

    return camp;
  }

  async addDataPackage(id: string, name: string) {
    const camp = this.managementCampaigns.find((c) => c.id === id);
    if (!camp) {
      throw new NotFoundException(`Kampagne ${id} nicht gefunden`);
    }

    const pkgName = name?.trim() || `Paket-${camp.dataPackages.length + 1}`;
    const newPkg = {
      id: `pkg-${Date.now()}`,
      name: pkgName,
      count: 50,
      createdAt: new Date().toLocaleDateString('de-DE'),
    };

    camp.dataPackages.push(newPkg);
    camp.dataPackagesCount += 1;
    camp.contactsCount += newPkg.count;
    camp.newContactsCount += newPkg.count;

    return camp;
  }
}
