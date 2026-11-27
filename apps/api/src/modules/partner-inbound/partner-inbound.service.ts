import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';
import { runAsTenant } from '../../common/services/request-context.js';
import { DEFAULT_TENANT_ID, safeEqual } from '../../common/security/secrets.js';
import { IngestionService } from '../leads/ingestion.service.js';
import { INBOUND_PROJECTS, publicStatus, validateInboundLead } from './inbound.validation.js';

export interface InboundPartner {
  name: string;
  tenantId: string;
}

export type InboundResult = { status: number; body: Record<string, any> };

const RATE_LIMIT_PER_MINUTE = 60;

/**
 * Receives leads from partners (e.g. a call center sending its closed deals) via
 * POST /api/leads/inbound. Partners and their keys are configured in INBOUND_PARTNER_KEYS:
 *   [{"name": "Partner GmbH", "key": "lk_live_…", "tenantId": "<optional uuid>"}]
 */
@Injectable()
export class PartnerInboundService {
  private readonly logger = new Logger(PartnerInboundService.name);
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly db: DatabaseService,
    private readonly ingestion: IngestionService,
  ) {}

  /** Resolves the partner for an `Authorization: Bearer lk_…` header (constant-time compare). */
  authenticate(authHeader: string | undefined): InboundPartner | null {
    const token = (authHeader || '').startsWith('Bearer ') ? authHeader!.slice(7).trim() : '';
    if (!token) return null;
    let partners: any[] = [];
    try {
      partners = JSON.parse(process.env.INBOUND_PARTNER_KEYS || '[]');
    } catch {
      this.logger.error('INBOUND_PARTNER_KEYS is not valid JSON');
      return null;
    }
    let found: InboundPartner | null = null;
    for (const p of Array.isArray(partners) ? partners : []) {
      if (typeof p?.key === 'string' && p.key.length >= 20 && typeof p?.name === 'string' && safeEqual(token, p.key)) {
        found = { name: p.name, tenantId: p.tenantId || DEFAULT_TENANT_ID };
      }
    }
    return found;
  }

  /** Max. 60 leads per minute and partner (per server instance). */
  isRateLimited(partner: InboundPartner): boolean {
    const now = Date.now();
    const list = (this.hits.get(partner.name) || []).filter((t) => now - t < 60_000);
    if (list.length >= RATE_LIMIT_PER_MINUTE) {
      this.hits.set(partner.name, list);
      return true;
    }
    list.push(now);
    this.hits.set(partner.name, list);
    return false;
  }

  async receive(partner: InboundPartner, body: unknown): Promise<InboundResult> {
    const v = validateInboundLead(body);
    if (v.ok === false) {
      return { status: 422, body: { error: 'validation_failed', fieldErrors: v.fieldErrors } };
    }
    const lead = v.lead;

    return runAsTenant(partner.tenantId, async () => {
      // Same externalId again -> nothing new (safe to resend after errors/timeouts)
      if (lead.externalId) {
        const existing = await this.db.query(
          `SELECT id, status FROM leads
           WHERE tenant_id = $1 AND extra_data->>'partner' = $2 AND extra_data->>'externalId' = $3
           LIMIT 1`,
          [partner.tenantId, partner.name, lead.externalId],
        );
        if (existing.rows[0]) {
          return {
            status: 200,
            body: { id: existing.rows[0].id, status: publicStatus(existing.rows[0].status), created: false },
          };
        }
      }

      const sameNameZip = await this.db.query(
        `SELECT 1 FROM leads WHERE tenant_id = $1 AND LOWER(first_name) = LOWER($2)
           AND LOWER(last_name) = LOWER($3) AND postal_code = $4 LIMIT 1`,
        [partner.tenantId, lead.vorname, lead.nachname, lead.plz],
      );

      const hyperion: Record<string, any> = {
        anrede: lead.anrede,
        pflegegrad: lead.pflegegrad,
        kontaktWunsch: lead.kontaktWunsch,
        besteErreichbarkeit: lead.besteErreichbarkeit,
        rueckrufVon: lead.rueckrufVon,
        rueckrufBis: lead.rueckrufBis,
        geburtsdatum: lead.geburtsdatum,
        notizen: lead.notizen,
        ...(lead.treppenlift || {}),
      };

      const result = await this.ingestion.ingestLeadRow(
        partner.tenantId,
        {
          projectId: INBOUND_PROJECTS[lead.kategorie],
          firstName: lead.vorname,
          lastName: lead.nachname,
          phone: lead.telefon,
          phoneCountry: 'DE',
          email: lead.email || '',
          postalCode: lead.plz,
          city: lead.ort,
          street: lead.strasse,
          houseNumber: lead.hausnummer,
          answers: {},
          extraData: {
            partner: partner.name,
            ...(lead.externalId ? { externalId: lead.externalId } : {}),
            kategorie: lead.kategorie,
            anrede: lead.anrede,
            hyperion,
            ...(lead.hausnotruf ? { hausnotruf: lead.hausnotruf } : {}),
            partnerPayload: body,
          },
          provenance: {
            source: `Partner-API: ${partner.name}`,
            campaignName: partner.name,
            optInTimestamp: new Date().toISOString(),
            consentText: 'Einwilligung des Kunden liegt laut Partner vor (datenschutzOk = true).',
            consentVersion: 'partner-api-v1',
            consentChannel: 'PHONE',
            proofMetadata: { partner: partner.name, externalId: lead.externalId },
          },
        } as any,
        {
          channel: 'PARTNER_API',
          rawPayload: { notes: lead.notizen, salutation: lead.anrede },
        },
      );

      if (result.isQuarantined) {
        return {
          status: 422,
          body: { error: 'validation_failed', fieldErrors: { _: result.error || 'Daten fehlerhaft' } },
        };
      }

      if (result.isDuplicate) {
        // Same phone number and category already exists: no second lead
        const row = await this.db.query(`SELECT status FROM leads WHERE id = $1`, [result.leadId]);
        return {
          status: 200,
          body: {
            id: result.leadId,
            status: publicStatus(row.rows[0]?.status || 'NEW'),
            created: false,
            possibleDuplicate: true,
          },
        };
      }

      this.logger.log(`Partner lead received from ${partner.name}: ${result.leadId} (${lead.externalId || '-'})`);
      return {
        status: 201,
        body: {
          id: result.leadId,
          status: 'NEU',
          created: true,
          possibleDuplicate: sameNameZip.rows.length > 0,
        },
      };
    });
  }
}
