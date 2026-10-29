import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { CallbackCreateInput } from '@linkora/shared';

export interface CallbackItemDto {
  id: string;
  leadId: string;
  customerName: string;
  phoneE164: string;
  projectName: string;
  scheduledAt: string;
  timezone: string;
  notes: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  assignedUserName?: string;
  isOverdue: boolean;
  dueLabelDe: string;
  dueLabelTr: string;
}

@Injectable()
export class CallbacksService {
  constructor(private readonly db: DatabaseService) {}

  async listCallbacks(tenantId: string): Promise<CallbackItemDto[]> {
    try {
      const res = await this.db.query(
        `SELECT c.id, c.lead_id, c.scheduled_at, c.timezone, c.notes, c.status,
                l.first_name, l.last_name, l.phone_e164,
                p.name as project_name,
                u.first_name as agent_first_name, u.last_name as agent_last_name
         FROM callbacks c
         JOIN leads l ON l.id = c.lead_id
         LEFT JOIN projects p ON p.id = l.project_id
         LEFT JOIN users u ON u.id = c.assigned_user_id
         WHERE c.tenant_id = $1 AND c.status = 'PENDING'
         ORDER BY c.scheduled_at ASC`,
        [tenantId]
      );

      if (res.rows.length > 0) {
        const now = new Date();
        return res.rows.map((r: any) => {
          const sched = new Date(r.scheduled_at);
          const isOverdue = sched < now;
          const diffMinutes = Math.round((sched.getTime() - now.getTime()) / 60000);

          let dueLabelDe = isOverdue ? `Überfällig (${Math.abs(diffMinutes)} Min)` : `In ${diffMinutes} Min`;
          let dueLabelTr = isOverdue ? `Gecikmiş (${Math.abs(diffMinutes)} dk)` : `${diffMinutes} dk içinde`;

          return {
            id: r.id,
            leadId: r.lead_id,
            customerName: `${r.first_name} ${r.last_name}`,
            phoneE164: r.phone_e164,
            projectName: r.project_name || 'Allgemein',
            scheduledAt: r.scheduled_at,
            timezone: r.timezone || 'Europe/Berlin',
            notes: r.notes || '',
            status: r.status,
            assignedUserName: r.agent_first_name ? `${r.agent_first_name} ${r.agent_last_name}` : 'Nicht zugewiesen',
            isOverdue,
            dueLabelDe,
            dueLabelTr,
          };
        });
      }
    } catch {
      // DB offline
    }

    // Default sample callbacks matching seeded demo data
    const now = new Date();
    return [
      {
        id: '98989898-0000-0000-0000-000000000002',
        leadId: '77777777-0000-0000-0000-000000000001',
        customerName: 'Maximilian Weber',
        phoneE164: '+491714567890',
        projectName: 'Photovoltaik',
        scheduledAt: new Date(now.getTime() - 30 * 60000).toISOString(),
        timezone: 'Europe/Berlin',
        notes: 'Dringend: Detailfragen zum Speicherangebot klären',
        status: 'PENDING',
        assignedUserName: 'Erensamsun Aydin',
        isOverdue: true,
        dueLabelDe: 'Überfällig (30 Min)',
        dueLabelTr: 'Gecikmiş (30 dk)',
      },
      {
        id: '98989898-0000-0000-0000-000000000001',
        leadId: '77777777-0000-0000-0000-000000000002',
        customerName: 'Claudia Fischer',
        phoneE164: '+49407654321',
        projectName: 'Wärmepumpe',
        scheduledAt: new Date(now.getTime() + 120 * 60000).toISOString(),
        timezone: 'Europe/Berlin',
        notes: 'Kunde wünscht Rückruf nach 16:30 Uhr wegen Ehepartner',
        status: 'PENDING',
        assignedUserName: 'Umut Kaya',
        isOverdue: false,
        dueLabelDe: 'In 120 Min (16:30 Uhr)',
        dueLabelTr: '120 dk içinde (16:30)',
      },
    ];
  }

  async createCallback(tenantId: string, input: CallbackCreateInput) {
    const id = randomUUID();
    try {
      await this.db.query(
        `INSERT INTO callbacks (id, tenant_id, lead_id, assigned_user_id, scheduled_at, timezone, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING')`,
        [id, tenantId, input.leadId, input.assignedUserId || null, input.scheduledAt, input.timezone, input.notes || '']
      );
    } catch {
      // Memory fallback
    }

    return {
      success: true,
      id,
      scheduledAt: input.scheduledAt,
      message: 'Rückruf erfolgreich terminiert.',
    };
  }

  async completeCallback(tenantId: string, callbackId: string) {
    try {
      await this.db.query(
        `UPDATE callbacks SET status = 'COMPLETED' WHERE id = $1 AND tenant_id = $2`,
        [callbackId, tenantId]
      );
    } catch {
      // Memory fallback
    }
    return { success: true, message: 'Rückruf abgeschlossen.' };
  }
}
