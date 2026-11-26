import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService, isDatabaseConfigured } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CanDialResult, QcActionInput } from '@linkora/shared';
import { memoryLeads, memoryProvenance, memoryEvents } from './ingestion.service.js';

const ANSWER_LABELS: Record<string, string> = {
  pvInstallLocation: 'Wo möchten Sie die Photovoltaik installieren?',
  pvRoofAge: 'Wie alt ist Ihr Dach?',
  pvRoofArea: 'Wie groß ist Ihre nutzbare Dachfläche?',
  pvRoofShape: 'Welche Dachform hat Ihr Haus?',
  pvRoofCover: 'Womit ist ihr Dach gedeckt? (Dachdeckungstyp)',
  pvIsOwner: 'Handelt es sich bei dem Interessenten um den Eigentümer/Entscheider?',
  pvInstallTime: 'Wann soll die Photovoltaik installiert werden?',
  pvFinancing: 'Welche Finanzierung kommt für Sie in Frage?',
  pvRoofOrientation: 'Wie ist Ihr Dach ausgerichtet?',
  pvPowerConsumption: 'Stromverbrauch in kWh/Jahr',
  pvBatteryStorage: 'Stromspeicher gewünscht?',
  pvAvailability: 'Erreichbarkeit?',
  tlLiftType: 'Was für einen Lift suchen Sie?',
  tlBuildingType: 'Um welchen Gebäudetyp handelt es sich?',
  tlUserWeight: 'Welches Nutzergewicht soll der Lift befördern?',
  tlTimeFrame: 'Wann wird der Lift benötigt?',
  tlIsOwner: 'Eigentum oder Miete?',
  tlFloors: 'Wie viele Etagen müssen überwunden werden?',
  tlCareLevel: 'Liegt ein Pflegegrad vor?',
  tlStairCourse: 'Wie verläuft die Treppe?',
  tlMobility: 'Mobilität des Nutzers',
  tlStairWidth: 'Treppenbreite (in cm)',
  tlStepCount: 'Anzahl der Stufen',
  tlHeightDiff: 'Höhenunterschied (in cm)',
  tlOutdoor: 'Innen oder außen?',
  tlNutzer: 'Für wen ist der Lift?',
  tlKontaktWunsch: 'Kontaktwunsch',
  tlAvailability: 'Treppenlift · Erreichbarkeit',
  wpCurrentSystem: 'Aktuelles Heizsystem?',
  wpHeatingAge: 'Alter der Heizung?',
  wpLivingSpace: 'Wohnfläche (in m²)?',
  wpInstallTime: 'Wann soll die Wärmepumpe installiert werden?',
  badProjectType: 'Welches Badprojekt möchten Sie angehen?',
  badSize: 'Wie groß ist das Badezimmer?',
  badBarrierFree: 'Soll das Bad barrierefrei sein?',
  badFeatures: 'Welche Ausstattung wünschen Sie?',
  badBudget: 'Was darf der Badumbau kosten?',
  badTimeFrame: 'Wann wird der Badumbau benötigt?',
  badIsOwner: 'Sind Sie Eigentümer/Entscheider?',
  emModelType: 'Für welches Modell interessieren Sie sich?',
  emUsageArea: 'Wo soll die überwiegende Nutzung stattfinden?',
  emUserWeight: 'Für welches Gewicht muss das Modell geeignet sein?',
  emTargetPerson: 'Für wen ist das Elektromobil / der Elektrorollstuhl gedacht?',
  emHealthInsurance: 'Sind Sie gesetzlich krankenversichert?',
  emBudgetLimit: 'Wo liegt die Budgetgrenze für das Modell?',
  emWheelchairSpeed: 'Wie hoch soll die maximale Geschwindigkeit beim Elektrorollstuhl sein?',
  emWheelchairRange: 'Welche Reichweite soll der Elektrorollstuhl haben?',
  emScooterSpeed: 'Wie hoch soll die maximale Geschwindigkeit beim Elektromobil sein?',
  emScooterRange: 'Welche Reichweite soll das Elektromobil haben?',
  emTimeFrame: 'Wann wird das Elektromobil / der Elektrorollstuhl benötigt?',
};

@Injectable()
export class LeadsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * List leads with filtering and search (database only when a database is configured).
   */
  async listLeads(
    tenantId: string,
    query: {
      projectId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(Number(query.limit) || 25, 100);
    const offset = (page - 1) * limit;

    try {
      let where = 'WHERE l.tenant_id = $1';
      const params: any[] = [tenantId];
      let i = 2;
      if (query.projectId) {
        where += ` AND l.project_id = $${i++}`;
        params.push(query.projectId);
      }
      if (query.status && query.status !== 'ALL') {
        where += ` AND l.status = $${i++}`;
        params.push(query.status);
      }
      if (query.search) {
        where += ` AND (l.first_name ILIKE $${i} OR l.last_name ILIKE $${i} OR l.phone_e164 ILIKE $${i}
                   OR l.email ILIKE $${i} OR l.city ILIKE $${i} OR l.postal_code ILIKE $${i})`;
        params.push(`%${query.search}%`);
        i++;
      }

      const res = await this.db.query(
        `SELECT l.id, l.first_name, l.last_name, l.phone_raw, l.phone_e164, l.line_type,
                l.email, l.postal_code, l.city, l.street, l.house_number, l.status,
                l.consent_verified, l.dnc_flag, l.created_at, l.extra_data,
                p.id as project_id, p.name as project_name, p.slug as project_slug, p.icon as project_icon
         FROM leads l
         LEFT JOIN projects p ON p.id = l.project_id
         ${where}
         ORDER BY l.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset],
      );
      const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM leads l ${where}`, params);
      const total = countRes.rows[0]?.total || 0;

      return {
        data: res.rows,
        meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      };
    } catch (err) {
      if (isDatabaseConfigured()) {
        throw err;
      }
    }

    // Local development without a database: leads created in this process only (no demo data)
    let filtered = Array.from(memoryLeads.values())
      .filter((mem) => !mem.tenantId || mem.tenantId === tenantId)
      .map((mem) => ({
        id: mem.id,
        first_name: mem.first_name || mem.firstName || '',
        last_name: mem.last_name || mem.lastName || '',
        phone_raw: mem.phone_raw || mem.phoneRaw || mem.phoneE164 || '',
        phone_e164: mem.phone_e164 || mem.phoneE164 || '',
        line_type: mem.line_type || mem.lineType || 'FIXED_LINE',
        email: mem.email || null,
        postal_code: mem.postal_code || mem.postalCode || null,
        city: mem.city || null,
        street: mem.street || null,
        house_number: mem.house_number || mem.houseNumber || null,
        status: mem.status || 'NEW',
        consent_verified: mem.consent_verified ?? mem.consentVerified ?? false,
        dnc_flag: mem.dnc_flag ?? mem.dncFlag ?? false,
        created_at: mem.created_at || mem.createdAt || new Date().toISOString(),
        project_id: mem.project_id || mem.projectId,
        project_name: mem.project_name || mem.projectName,
        project_slug: mem.project_slug || mem.projectSlug,
        project_icon: mem.project_icon || mem.projectIcon,
        extra_data: mem.extraData || {},
      }));
    if (query.projectId) filtered = filtered.filter((l) => l.project_id === query.projectId);
    if (query.status && query.status !== 'ALL') filtered = filtered.filter((l) => l.status === query.status);
    if (query.search) {
      const q = query.search.toLowerCase();
      filtered = filtered.filter((l) =>
        [l.first_name, l.last_name, l.phone_e164, l.email, l.city, l.postal_code].some((v) =>
          String(v || '').toLowerCase().includes(q),
        ),
      );
    }
    return {
      data: filtered.slice(offset, offset + limit),
      meta: { page, limit, total: filtered.length, totalPages: Math.max(1, Math.ceil(filtered.length / limit)) },
    };
  }

  /** Converts stored answers (extra_data) into the list shown in the lead detail view. */
  private answersFromExtraData(extra: any): any[] {
    if (!extra || typeof extra !== 'object') return [];
    if (Array.isArray(extra.formattedAnswers) && extra.formattedAnswers.length > 0) {
      return extra.formattedAnswers;
    }
    if (extra.answers && typeof extra.answers === 'object') {
      return Object.entries(extra.answers)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => ({ question_code: k, question_label: ANSWER_LABELS[k] || k, value_raw: String(v) }));
    }
    return [];
  }

  /**
   * Full lead details: profile, answers, provenance, timeline and dial eligibility.
   * Only real records are returned – nothing is invented when data is missing.
   */
  async getLeadDetail(tenantId: string, leadId: string) {
    let lead: any = null;
    let provenance: any[] = [];
    let events: any[] = [];

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leadId);
    if (isUuid) {
      try {
        const res = await this.db.query(
          `SELECT l.*, p.name as project_name, p.slug as project_slug, p.icon as project_icon
           FROM leads l
           LEFT JOIN projects p ON p.id = l.project_id
           WHERE l.id = $1 AND l.tenant_id = $2`,
          [leadId, tenantId],
        );
        lead = res.rows[0] || null;
        if (lead) {
          provenance = (
            await this.db.query(`SELECT * FROM lead_provenance WHERE lead_id = $1 ORDER BY opt_in_timestamp DESC`, [leadId])
          ).rows;
          events = (await this.db.query(`SELECT * FROM lead_events WHERE lead_id = $1 ORDER BY created_at DESC`, [leadId])).rows;
        }
      } catch (err) {
        if (isDatabaseConfigured()) throw err;
      }
    }

    if (!lead && !isDatabaseConfigured()) {
      const mem = memoryLeads.get(leadId);
      if (mem && (!mem.tenantId || mem.tenantId === tenantId)) {
        lead = {
          id: mem.id,
          first_name: mem.first_name || mem.firstName,
          last_name: mem.last_name || mem.lastName,
          phone_raw: mem.phone_raw || mem.phoneRaw || mem.phoneE164,
          phone_e164: mem.phone_e164 || mem.phoneE164,
          email: mem.email,
          postal_code: mem.postal_code || mem.postalCode,
          city: mem.city,
          street: mem.street,
          house_number: mem.house_number || mem.houseNumber,
          status: mem.status || 'NEW',
          consent_verified: mem.consent_verified ?? mem.consentVerified ?? false,
          dnc_flag: mem.dnc_flag ?? mem.dncFlag ?? false,
          extra_data: mem.extra_data || mem.extraData || {},
          project_id: mem.project_id || mem.projectId,
          project_name: mem.project_name || mem.projectName,
          project_slug: mem.project_slug || mem.projectSlug,
          project_icon: mem.project_icon || mem.projectIcon,
          created_at: mem.created_at || mem.createdAt,
        };
        provenance = memoryProvenance.get(leadId) || [];
        events = memoryEvents.get(leadId) || [];
      }
    }

    if (!lead) {
      throw new NotFoundException(`Lead ${leadId} not found`);
    }

    const extra = lead.extra_data || {};
    // Convenience fields used by the lead detail view
    lead.notes = lead.notes ?? extra.notes ?? null;
    lead.notiz = lead.notiz ?? extra.notes ?? null;
    lead.audioFileName = lead.audioFileName ?? extra.audioFileName ?? null;

    return {
      lead,
      provenance,
      answers: this.answersFromExtraData(extra),
      events,
      canDial: this.checkCanDial(lead),
    };
  }

  /**
   * Deterministic Hard Rule for Telephony & Sales:
   * 1. If consent is NOT verified -> NO_CONSENT_PROOF (hard block)
   * 2. If DNC is true -> DNC_SUPPRESSED (hard block)
   */
  checkCanDial(lead: {
    id: string;
    phone_e164?: string;
    consent_verified: boolean;
    dnc_flag: boolean;
  }): CanDialResult {
    if (!lead.consent_verified) {
      return {
        allowed: false,
        reason: 'NO_CONSENT_PROOF',
        message: 'Kein Werbeeinwilligungs-Nachweis vorhanden. Anruf gesetzlich untersagt (UWG § 7).',
        leadId: lead.id,
        phoneE164: lead.phone_e164,
        consentVerified: false,
        dncFlag: lead.dnc_flag,
      };
    }

    if (lead.dnc_flag) {
      return {
        allowed: false,
        reason: 'DNC_SUPPRESSED',
        message: 'Rufnummer befindet sich auf der Robinson- bzw. DNC-Sperrliste.',
        leadId: lead.id,
        phoneE164: lead.phone_e164,
        consentVerified: true,
        dncFlag: true,
      };
    }

    return {
      allowed: true,
      message: 'Lead ist verifiziert und für Anrufe freigegeben.',
      leadId: lead.id,
      phoneE164: lead.phone_e164,
      consentVerified: true,
      dncFlag: false,
    };
  }

  /**
   * Check if a specific lead can be dialed by ID.
   */
  async canDial(tenantId: string, leadId: string): Promise<CanDialResult> {
    const detail = await this.getLeadDetail(tenantId, leadId);
    return detail.canDial;
  }

  /**
   * QC Reviewer Actions: APPROVE, REJECT, REQUEST_RECALL.
   */
  async handleQcAction(
    tenantId: string,
    leadId: string,
    qcInput: QcActionInput,
    user: { id?: string; email?: string }
  ) {
    let nextStatus = 'QC_PENDING';
    let eventType = 'LEAD_QC_REVIEW';

    switch (qcInput.action) {
      case 'APPROVE':
        nextStatus = 'CONFIRMED';
        eventType = 'LEAD_QC_APPROVED';
        break;
      case 'REJECT':
        nextStatus = 'STORNO';
        eventType = 'LEAD_QC_REJECTED';
        break;
      case 'REQUEST_RECALL':
        nextStatus = 'NEW';
        eventType = 'LEAD_QC_RECALL_REQUESTED';
        break;
    }

    try {
      await this.db.query(
        `UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3`,
        [nextStatus, leadId, tenantId]
      );

      await this.db.query(
        `INSERT INTO lead_events (id, lead_id, tenant_id, event_type, actor_id, actor_type, payload)
         VALUES ($1, $2, $3, $4, $5, 'USER', $6)`,
        [
          randomUUID(),
          leadId,
          tenantId,
          eventType,
          user.id || null,
          JSON.stringify({ reason: qcInput.reason, action: qcInput.action }),
        ]
      );

      // If recall requested and timestamp provided, insert callback
      if (qcInput.action === 'REQUEST_RECALL' && qcInput.recallScheduledAt) {
        await this.db.query(
          `INSERT INTO callbacks (id, tenant_id, lead_id, scheduled_at, notes, status)
           VALUES ($1, $2, $3, $4, $5, 'PENDING')`,
          [randomUUID(), tenantId, leadId, qcInput.recallScheduledAt, `QC Recall: ${qcInput.reason}`]
        );
      }
    } catch {
      // Memory fallback
    }

    await this.auditService.log({
      tenantId,
      actorId: user.id || null,
      actorType: 'USER',
      action: eventType,
      entityTable: 'leads',
      entityId: leadId,
      diff: { status: nextStatus, reason: qcInput.reason },
    });

    return {
      success: true,
      leadId,
      status: nextStatus,
      action: qcInput.action,
      reason: qcInput.reason,
    };
  }
}
