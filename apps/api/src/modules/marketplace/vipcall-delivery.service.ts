import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { buildVipCallPayload } from './vipcall.payload.js';

const DEFAULT_URL = 'https://vipcalldailer.com/api/v1/leads';
const TIMEOUT_MS = 15000;

export interface VipCallDeliveryResult {
  leadId: string;
  ok: boolean;
  skipped?: boolean;
  httpStatus?: number;
  message: string;
  errors?: Record<string, string>;
  response?: any;
}

/**
 * Sends leads to Aroundhome through the VIP Call Dialer API.
 * - No placeholder data: incomplete leads are not sent (errors are returned instead).
 * - No simulated success: network errors and non-2xx answers are reported as failures.
 * - A lead that was delivered successfully is not sent twice unless `force` is set.
 */
@Injectable()
export class VipCallDeliveryService {
  private readonly logger = new Logger(VipCallDeliveryService.name);

  constructor(private readonly db: DatabaseService) {}

  private async loadLead(tenantId: string, leadId: string) {
    if (!/^[0-9a-f-]{36}$/i.test(leadId)) throw new NotFoundException('Lead nicht gefunden');
    const res = await this.db.query(
      `SELECT l.*, p.slug AS project_slug, p.name AS project_name
       FROM leads l LEFT JOIN projects p ON p.id = l.project_id
       WHERE l.id = $1 AND l.tenant_id = $2`,
      [leadId, tenantId],
    );
    if (!res.rows[0]) throw new NotFoundException('Lead nicht gefunden');
    const prov = await this.db.query(
      `SELECT * FROM lead_provenance WHERE lead_id = $1 ORDER BY opt_in_timestamp ASC`,
      [leadId],
    );
    return { lead: res.rows[0], provenance: prov.rows };
  }

  async preview(tenantId: string, leadId: string) {
    const { lead, provenance } = await this.loadLead(tenantId, leadId);
    const { payload, errors } = buildVipCallPayload(lead, provenance);
    return { ready: !!payload, errors, payload, lastDelivery: lead.extra_data?.aroundhomeDelivery || null };
  }

  async deliver(tenantId: string, leadId: string, opts: { force?: boolean; actorId?: string } = {}): Promise<VipCallDeliveryResult> {
    const { lead, provenance } = await this.loadLead(tenantId, leadId);
    const last = lead.extra_data?.aroundhomeDelivery;
    if (last?.ok && !opts.force) {
      return { leadId, ok: true, skipped: true, message: `Bereits am ${new Date(last.sentAt).toLocaleString('de-DE')} gesendet` };
    }

    const { payload, errors } = buildVipCallPayload(lead, provenance);
    if (!payload) {
      return { leadId, ok: false, message: 'Lead unvollständig – nicht gesendet', errors };
    }

    const apiKey = process.env.VIPCALL_API_KEY;
    if (!apiKey) {
      return { leadId, ok: false, message: 'VIPCALL_API_KEY ist nicht konfiguriert' };
    }

    let httpStatus = 0;
    let response: any = null;
    let ok = false;
    let message = '';
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(process.env.VIPCALL_API_URL || DEFAULT_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept-Language': 'de',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        httpStatus = res.status;
        const text = await res.text();
        try {
          response = JSON.parse(text);
        } catch {
          response = text.slice(0, 500);
        }
        ok = res.ok;
        message = ok ? 'An Aroundhome (VIP Call) übermittelt' : `VIP Call hat abgelehnt (HTTP ${res.status})`;
      } finally {
        clearTimeout(timer);
      }
    } catch (err: any) {
      message = `VIP Call nicht erreichbar: ${err?.name === 'AbortError' ? 'Zeitüberschreitung' : err?.message || err}`;
    }

    const delivery = {
      ok,
      httpStatus,
      externalId: payload.external_id,
      sentAt: new Date().toISOString(),
      response: typeof response === 'object' ? response : String(response ?? ''),
    };
    await this.db.query(
      `UPDATE leads
       SET extra_data = COALESCE(extra_data, '{}'::jsonb) || jsonb_build_object('aroundhomeDelivery', $1::jsonb),
           status = CASE WHEN $2::boolean THEN 'ROUTED' ELSE status END,
           updated_at = NOW()
       WHERE id = $3 AND tenant_id = $4`,
      [JSON.stringify(delivery), ok, leadId, tenantId],
    );
    await this.db
      .query(
        `INSERT INTO lead_events (id, lead_id, tenant_id, event_type, actor_type, payload)
         VALUES ($1, $2, $3, $4, 'USER', $5)`,
        [randomUUID(), leadId, tenantId, ok ? 'AROUNDHOME_DELIVERED' : 'AROUNDHOME_DELIVERY_FAILED', JSON.stringify({ ...delivery, actorId: opts.actorId })],
      )
      .catch(() => undefined);

    this.logger.log(`VIP Call delivery ${leadId}: ${ok ? 'OK' : 'FAILED'} (${httpStatus})`);
    return { leadId, ok, httpStatus, message, response };
  }

  /** Sends several leads one after another (max. ~2 per second). */
  async deliverMany(tenantId: string, leadIds: string[], opts: { actorId?: string } = {}) {
    const results: VipCallDeliveryResult[] = [];
    for (const id of leadIds.slice(0, 500)) {
      try {
        results.push(await this.deliver(tenantId, id, opts));
      } catch (err: any) {
        results.push({ leadId: id, ok: false, message: err?.message || 'Fehler' });
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    return {
      total: results.length,
      sent: results.filter((r) => r.ok && !r.skipped).length,
      skipped: results.filter((r) => r.skipped).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    };
  }
}
