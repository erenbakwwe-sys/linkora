import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../../common/services/database.service.js';
import { LeadsService } from '../../leads/leads.service.js';
import { memoryLeads } from '../../leads/ingestion.service.js';
import { buildHyperionPayload, FieldErrors, isTreppenliftLead } from './hyperion.payload.js';

const DEFAULT_ENDPOINT = 'https://hyperionleadspanel.online/api/leads/inbound';
const TIMEOUT_MS = 15000;

export type HyperionSendResult =
  | {
      ok: true;
      created: boolean;
      hyperionId: string;
      hyperionStatus: string;
      possibleDuplicate: boolean;
      httpStatus: number;
      sentAt: string;
    }
  | {
      ok: false;
      error:
        | 'not_configured'
        | 'validation_failed'
        | 'unauthorized'
        | 'rate_limited'
        | 'remote_error'
        | 'network_error';
      message: string;
      fieldErrors?: FieldErrors;
      httpStatus?: number;
    };

@Injectable()
export class HyperionService {
  private readonly logger = new Logger(HyperionService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly leadsService: LeadsService,
  ) {}

  isConfigured(): boolean {
    return Boolean(process.env.HYPERION_API_KEY);
  }

  private endpoint(): string {
    return process.env.HYPERION_API_URL || DEFAULT_ENDPOINT;
  }

  getStatus() {
    return {
      configured: this.isConfigured(),
      endpoint: this.endpoint(),
    };
  }

  private async loadLead(tenantId: string, leadId: string) {
    const detail = await this.leadsService.getLeadDetail(tenantId, leadId);
    const lead = detail?.lead;
    // getLeadDetail returns demo data for unknown ids – only accept the lead that was asked for
    if (!lead || String(lead.id) !== String(leadId)) {
      throw new NotFoundException('Lead nicht gefunden');
    }
    return lead;
  }

  /** Validates a lead locally without sending (used by the UI to show missing fields). */
  async preview(tenantId: string, leadId: string) {
    const lead = await this.loadLead(tenantId, leadId);
    const { payload, fieldErrors } = buildHyperionPayload(lead);
    const extra = lead.extra_data || {};
    return {
      eligible: isTreppenliftLead(lead),
      ready: !!payload,
      fieldErrors,
      lastDelivery: extra.hyperionDelivery || null,
    };
  }

  async sendLead(tenantId: string, leadId: string, actorId?: string): Promise<HyperionSendResult> {
    const lead = await this.loadLead(tenantId, leadId);

    if (!this.isConfigured()) {
      return {
        ok: false,
        error: 'not_configured',
        message: 'HYPERION_API_KEY ist nicht gesetzt. Bitte in den Umgebungsvariablen hinterlegen.',
      };
    }

    const { payload, fieldErrors } = buildHyperionPayload(lead);
    if (!payload) {
      return {
        ok: false,
        error: 'validation_failed',
        message: 'Lead ist unvollständig – bitte fehlende Angaben ergänzen.',
        fieldErrors,
      };
    }

    let res: Response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        res = await fetch(this.endpoint(), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HYPERION_API_KEY}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    } catch (err: any) {
      this.logger.warn(`Hyperion request failed for lead ${leadId}: ${err?.message || err}`);
      await this.recordEvent(tenantId, leadId, actorId, 'HYPERION_DELIVERY_FAILED', { error: 'network_error' });
      // Re-sending is safe: Hyperion deduplicates by externalId
      return {
        ok: false,
        error: 'network_error',
        message: 'Hyperion nicht erreichbar. Bitte später erneut senden (kein Doppel-Lead, gleiche externalId).',
      };
    }

    const body: any = await res.json().catch(() => null);

    if (res.status === 201 || res.status === 200) {
      const delivery = {
        hyperionId: String(body?.id ?? ''),
        hyperionStatus: String(body?.status ?? ''),
        created: res.status === 201 ? true : Boolean(body?.created),
        possibleDuplicate: Boolean(body?.possibleDuplicate),
        httpStatus: res.status,
        sentAt: new Date().toISOString(),
      };
      await this.saveDelivery(tenantId, leadId, delivery);
      await this.recordEvent(tenantId, leadId, actorId, 'HYPERION_DELIVERED', delivery);
      return { ok: true, ...delivery };
    }

    const failure: HyperionSendResult = (() => {
      switch (res.status) {
        case 401:
          return {
            ok: false as const,
            error: 'unauthorized' as const,
            message: 'Hyperion hat den API-Schlüssel abgelehnt (fehlt, falsch oder entzogen).',
            httpStatus: 401,
          };
        case 422:
        case 400:
          return {
            ok: false as const,
            error: 'validation_failed' as const,
            message: 'Hyperion hat den Lead abgelehnt (ungültige Angaben).',
            fieldErrors: (body?.fieldErrors as FieldErrors) || {},
            httpStatus: res.status,
          };
        case 429:
          return {
            ok: false as const,
            error: 'rate_limited' as const,
            message: 'Hyperion-Limit erreicht (60 Leads/Minute). Bitte kurz warten und erneut senden.',
            httpStatus: 429,
          };
        default:
          return {
            ok: false as const,
            error: 'remote_error' as const,
            message: `Fehler bei Hyperion (HTTP ${res.status}). Erneutes Senden ist ohne Risiko möglich.`,
            httpStatus: res.status,
          };
      }
    })();

    await this.recordEvent(tenantId, leadId, actorId, 'HYPERION_DELIVERY_FAILED', {
      httpStatus: res.status,
      error: (failure as any).error,
      fieldErrors: (failure as any).fieldErrors,
    });
    return failure;
  }

  private async saveDelivery(tenantId: string, leadId: string, delivery: Record<string, any>) {
    const mem = memoryLeads.get(leadId);
    if (mem) {
      mem.extraData = { ...(mem.extraData || {}), hyperionDelivery: delivery };
    }
    try {
      await this.db.query(
        `UPDATE leads
         SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('hyperionDelivery', $1::jsonb),
             updated_at = NOW()
         WHERE id::text = $2 AND tenant_id = $3`,
        [JSON.stringify(delivery), leadId, tenantId],
      );
    } catch (err: any) {
      this.logger.warn(`Could not persist Hyperion delivery for lead ${leadId}: ${err?.message || err}`);
    }
  }

  private async recordEvent(
    tenantId: string,
    leadId: string,
    actorId: string | undefined,
    eventType: string,
    payload: Record<string, any>,
  ) {
    try {
      await this.db.query(
        `INSERT INTO lead_events (id, lead_id, tenant_id, event_type, actor_type, payload)
         VALUES ($1, $2, $3, $4, 'USER', $5)`,
        [randomUUID(), leadId, tenantId, eventType, JSON.stringify({ ...payload, actorId })],
      );
    } catch {
      // DB offline – event is informational only
    }
  }
}
