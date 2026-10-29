import { LlmProvider, TrAssistBrief } from '../interfaces/llm-provider.js';

export interface PrioritizedTrLead {
  leadId: string;
  customerName: string;
  phone: string;
  city: string;
  product: string;
  priorityScore: number; // 0 - 100
  scoreBand: 'A' | 'B' | 'C' | 'D';
  bestCallingWindow: string;
  briefTr: string;
  openingHookDe: string;
  riskWarningTr?: string;
  isFlaggedUnqualified: boolean;
}

export class TrAssistEngine {
  private readonly provider: LlmProvider;

  constructor(provider: LlmProvider) {
    this.provider = provider;
  }

  public async getLeadBrief(leadData: Record<string, any>, promptVersion = 'v1.0'): Promise<TrAssistBrief> {
    return this.provider.generateTrBrief(leadData, promptVersion);
  }

  public async prioritizeCallList(leads: Array<Record<string, any>>): Promise<PrioritizedTrLead[]> {
    const list: PrioritizedTrLead[] = [];

    for (const lead of leads) {
      const isOwner =
        lead.is_homeowner === true ||
        lead.isHomeowner === true ||
        lead.owner === 'OWNER' ||
        String(lead.ownership || '').toLowerCase().includes('eigentüm');

      const bill = Number(lead.electricity_bill || lead.electricityBill || 100);
      let priorityScore = 50;

      if (isOwner) priorityScore += 35;
      else priorityScore -= 20;

      if (bill >= 140) priorityScore += 15;

      priorityScore = Math.max(10, Math.min(98, priorityScore));

      let scoreBand: 'A' | 'B' | 'C' | 'D' = 'D';
      if (priorityScore >= 80) scoreBand = 'A';
      else if (priorityScore >= 60) scoreBand = 'B';
      else if (priorityScore >= 40) scoreBand = 'C';

      const isFlaggedUnqualified = priorityScore < 40 || !isOwner;

      list.push({
        leadId: lead.id,
        customerName: `${lead.first_name || lead.firstName || ''} ${lead.last_name || lead.lastName || ''}`.trim(),
        phone: lead.phone_e164 || lead.phone || '',
        city: lead.city || 'Deutschland',
        product: lead.project_name || lead.projectName || 'Photovoltaik',
        priorityScore,
        scoreBand,
        bestCallingWindow: priorityScore >= 80 ? '10:00 - 12:30 & 15:00 - 18:00' : '17:00 - 19:30',
        briefTr: isOwner
          ? 'Ev sahibi, yüksek tüketim. Güneş enerjisi teşviki ilgisi yüksek. Hemen aranmalı.'
          : 'Kiracı şüphesi var. Ev sahibi izni teyit edilmeden uzun süre harcanmamalı.',
        openingHookDe: `Guten Tag ${lead.last_name ? 'Herr/Frau ' + lead.last_name : ''}, Sie hatten sich zur staatlichen Förderung für Ihr Eigenheim in ${lead.city || 'Ihrer Region'} eingetragen...`,
        riskWarningTr: isFlaggedUnqualified
          ? 'UYARI: Düşük öncelikli aday. Çağrı dakikası harcamadan önce mülk sahipliğini teyit edin.'
          : undefined,
        isFlaggedUnqualified,
      });
    }

    // Sort priority descending (high score first)
    list.sort((a, b) => b.priorityScore - a.priorityScore);
    return list;
  }
}
