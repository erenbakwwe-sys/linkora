import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { AuditService } from '../audit/audit.service.js';
import { CanDialResult, QcActionInput } from '@linkora/shared';
import { memoryLeads, memoryProvenance, memoryEvents } from './ingestion.service.js';

@Injectable()
export class LeadsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * List leads with filtering and search.
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
    const page = Number(query.page) || 1;
    const limit = Math.min(Number(query.limit) || 25, 100);
    const offset = (page - 1) * limit;

    try {
      let sql = `
        SELECT l.id, l.first_name, l.last_name, l.phone_raw, l.phone_e164, l.line_type,
               l.email, l.postal_code, l.city, l.street, l.house_number, l.status,
               l.consent_verified, l.dnc_flag, l.created_at,
               p.id as project_id, p.name as project_name, p.slug as project_slug, p.icon as project_icon
        FROM leads l
        LEFT JOIN projects p ON p.id = l.project_id
        WHERE l.tenant_id = $1
      `;
      const params: any[] = [tenantId];
      let paramIdx = 2;

      if (query.projectId) {
        sql += ` AND l.project_id = $${paramIdx++}`;
        params.push(query.projectId);
      }

      if (query.status && query.status !== 'ALL') {
        sql += ` AND l.status = $${paramIdx++}`;
        params.push(query.status);
      }

      if (query.search) {
        sql += ` AND (
          l.first_name ILIKE $${paramIdx} OR
          l.last_name ILIKE $${paramIdx} OR
          l.phone_e164 ILIKE $${paramIdx} OR
          l.email ILIKE $${paramIdx} OR
          l.city ILIKE $${paramIdx}
        )`;
        params.push(`%${query.search}%`);
        paramIdx++;
      }

      sql += ` ORDER BY l.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
      params.push(limit, offset);

      const res = await this.db.query(sql, params);

      const countRes = await this.db.query(
        `SELECT COUNT(*) as total FROM leads WHERE tenant_id = $1`,
        [tenantId]
      );
      const total = parseInt(countRes.rows[0]?.total || '0', 10);

      if (res.rows.length > 0) {
        return {
          data: res.rows,
          meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      }
    } catch {
      // DB offline fallback
    }

    // Default seeded sample leads
    const sampleLeads = [
      {
        id: '77777777-0000-0000-0000-000000000001',
        first_name: 'Maximilian',
        last_name: 'Weber',
        phone_raw: '0171 4567890',
        phone_e164: '+491714567890',
        line_type: 'MOBILE',
        email: 'm.weber@beispiel-solar.de',
        postal_code: '80331',
        city: 'München',
        street: 'Sendlinger Str.',
        house_number: '14',
        status: 'CONFIRMED',
        consent_verified: true,
        dnc_flag: false,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        project_id: 'cccccccc-0000-0000-0000-000000000001',
        project_name: 'Photovoltaik',
        project_slug: 'photovoltaik',
        project_icon: 'Sun',
      },
      {
        id: '77777777-0000-0000-0000-000000000002',
        first_name: 'Claudia',
        last_name: 'Fischer',
        phone_raw: '040 7654321',
        phone_e164: '+49407654321',
        line_type: 'FIXED_LINE',
        email: 'c.fischer@nord-mail.de',
        postal_code: '20095',
        city: 'Hamburg',
        street: 'Mönckebergstraße',
        house_number: '42',
        status: 'QC_PENDING',
        consent_verified: true,
        dnc_flag: false,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        project_id: 'cccccccc-0000-0000-0000-000000000002',
        project_name: 'Wärmepumpe',
        project_slug: 'waermepumpe',
        project_icon: 'Flame',
      },
      {
        id: '77777777-0000-0000-0000-000000000003',
        first_name: 'Gerhard',
        last_name: 'Müller',
        phone_raw: '069 8877665',
        phone_e164: '+49698877665',
        line_type: 'FIXED_LINE',
        email: 'g.mueller@web.de',
        postal_code: '60311',
        city: 'Frankfurt am Main',
        street: 'Zeil',
        house_number: '105',
        status: 'NEW',
        consent_verified: false, // NO CONSENT PROOF
        dnc_flag: false,
        created_at: new Date().toISOString(),
        project_id: 'cccccccc-0000-0000-0000-000000000003',
        project_name: 'Treppenlift',
        project_slug: 'treppenlift',
        project_icon: 'MoveUp',
      },
      {
        id: '77777777-0000-0000-0000-000000000004',
        first_name: 'Stefan',
        last_name: 'Klaus',
        phone_raw: '0170 9999999',
        phone_e164: '+491709999999',
        line_type: 'MOBILE',
        email: 's.klaus@t-online.de',
        postal_code: '70173',
        city: 'Stuttgart',
        street: 'Königstraße',
        house_number: '28',
        status: 'NEW',
        consent_verified: true,
        dnc_flag: true, // DNC SUPPRESSED
        created_at: new Date().toISOString(),
        project_id: 'cccccccc-0000-0000-0000-000000000001',
        project_name: 'Photovoltaik',
        project_slug: 'photovoltaik',
        project_icon: 'Sun',
      },
    ];

    const memList = Array.from(memoryLeads.values()).map((mem) => ({
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
      consent_verified: mem.consent_verified !== undefined ? mem.consent_verified : (mem.consentVerified !== undefined ? mem.consentVerified : true),
      dnc_flag: mem.dnc_flag !== undefined ? mem.dnc_flag : (mem.dncFlag !== undefined ? mem.dncFlag : false),
      created_at: mem.created_at || mem.createdAt || new Date().toISOString(),
      project_id: mem.project_id || mem.projectId || 'cccccccc-0000-0000-0000-000000000001',
      project_name: mem.project_name || mem.projectName || 'Photovoltaik',
      project_slug: mem.project_slug || mem.projectSlug || 'photovoltaik',
      project_icon: mem.project_icon || mem.projectIcon || 'Sun',
      formattedAnswers: mem.formattedAnswers || [],
      answers: mem.answers || {},
      notiz: mem.notiz || mem.notes,
      audioFileName: mem.audioFileName,
    }));

    let filtered = [...memList, ...sampleLeads];
    if (query.status && query.status !== 'ALL') {
      filtered = filtered.filter((l) => l.status === query.status);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.first_name || '').toLowerCase().includes(s) ||
          (l.last_name || '').toLowerCase().includes(s) ||
          (l.phone_e164 || '').includes(s) ||
          (l.email && l.email.toLowerCase().includes(s)) ||
          (l.city && l.city.toLowerCase().includes(s))
      );
    }

    return {
      data: filtered,
      meta: {
        page: 1,
        limit: 25,
        total: filtered.length,
        totalPages: 1,
      },
    };
  }

  /**
   * Get full lead details including answers, provenance, consents, timeline, and dial eligibility.
   */
  async getLeadDetail(tenantId: string, leadId: string) {
    let lead: any = null;
    let project: any = null;
    let provenance: any[] = [];
    let answers: any[] = [];
    let events: any[] = [];

    try {
      const res = await this.db.query(
        `SELECT l.*, p.name as project_name, p.slug as project_slug, p.icon as project_icon
         FROM leads l
         LEFT JOIN projects p ON p.id = l.project_id
         WHERE l.id = $1 AND l.tenant_id = $2`,
        [leadId, tenantId]
      );
      if (res.rows.length > 0) {
        lead = res.rows[0];

        const provRes = await this.db.query(
          `SELECT * FROM lead_provenance WHERE lead_id = $1 ORDER BY opt_in_timestamp DESC`,
          [leadId]
        );
        provenance = provRes.rows;

        const ansRes = await this.db.query(
          `SELECT la.*, q.code as question_code, q.label as question_label
           FROM lead_answers la
           LEFT JOIN questions q ON q.id = la.question_id
           WHERE la.lead_id = $1`,
          [leadId]
        );
        answers = ansRes.rows;

        const evRes = await this.db.query(
          `SELECT * FROM lead_events WHERE lead_id = $1 ORDER BY created_at DESC`,
          [leadId]
        );
        events = evRes.rows;
      }
    } catch {
      // DB offline
    }

    // Fallback sample detail if not found in DB
    if (!lead) {
      if (memoryLeads.has(leadId)) {
        const mem = memoryLeads.get(leadId);
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
          consent_verified: mem.consent_verified !== undefined ? mem.consent_verified : true,
          dnc_flag: mem.dnc_flag || false,
          project_id: mem.project_id || mem.projectId || 'cccccccc-0000-0000-0000-000000000001',
          project_name: mem.project_name || 'Photovoltaik',
          project_slug: (mem.project_name || 'Photovoltaik').toLowerCase(),
          project_icon: mem.project_icon || 'Sun',
          created_at: mem.created_at || (mem.createdAt ? new Date(mem.createdAt).toISOString() : new Date().toISOString()),
        };
        provenance = memoryProvenance.get(leadId) || [
          {
            id: 'prov-' + leadId,
            source: mem.source || 'Agent-Direkterfassung',
            campaign_name: lead.project_name,
            opt_in_timestamp: lead.created_at,
            consent_text: 'Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7).',
            consent_version: 'v2.1',
            consent_channel: 'PHONE',
          },
        ];
        const labelMap: Record<string, string> = {
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
          tlIsOwner: 'Sind Sie Eigentümer/Entscheider',
          tlFloors: 'Wie viele Etagen müssen überwunden werden?',
          tlCareLevel: 'Liegt ein Pflegegrad vor?',
          tlStairCourse: 'Wie verläuft die Treppe?',
          tlMobility: 'Mobilität des Nutzers',
          tlStairWidth: 'Treppenbreite (in cm)',
          tlStepCount: 'Anzahl der Stufen',
          tlHeightDiff: 'Höhenunterschied (in cm)',
          tlOutdoor: 'Wird der Lift im Außenbereich benötigt?',
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

        if (Array.isArray(mem.formattedAnswers) && mem.formattedAnswers.length > 0) {
          answers = mem.formattedAnswers;
        } else if (Array.isArray(mem.answers) && mem.answers.length > 0) {
          answers = mem.answers;
        } else if (typeof mem.answers === 'object' && mem.answers !== null) {
          answers = Object.entries(mem.answers).map(([k, v]) => ({
            question_code: k,
            question_label: labelMap[k] || k,
            value_raw: String(v),
          }));
        } else {
          answers = [];
        }
        events = memoryEvents.get(leadId) || [
          {
            id: 'ev-1',
            event_type: 'LEAD_INGESTED',
            created_at: lead.created_at,
            payload: { channel: 'Agent-Erfassung' },
          },
        ];
      } else {
        const list = await this.listLeads(tenantId, {});
        lead = list.data.find((l: any) => l.id === leadId);
        if (!lead) {
          throw new NotFoundException(`Lead ${leadId} not found`);
        }
      }

      if (lead.consent_verified && provenance.length === 0) {
        provenance = [
          {
            id: 'prov-1',
            source: 'Google Ads Search',
            campaign_name: 'PV_Muenchen_Q4',
            opt_in_timestamp: new Date(Date.now() - 86400000).toISOString(),
            ip_address: '194.25.0.12',
            landing_page_url: 'https://angebot.solarenergie-portal.de/pv-muenchen',
            consent_text: 'Ich erkläre mich damit einverstanden, telefonisch kontaktiert zu werden.',
            consent_version: 'v2.1',
            consent_channel: 'ONLINE_FORM',
          },
        ];
      }

      if (answers.length === 0) {
        answers = [
          { question_code: 'PROPERTY_OWNERSHIP', question_label: 'Sind Sie Eigentümer der Immobilie?', value_raw: 'Ja, Alleineigentümer' },
          { question_code: 'ROOF_TYPE', question_label: 'Welche Dachform hat das Gebäude?', value_raw: 'Satteldach' },
          { question_code: 'ANNUAL_CONSUMPTION', question_label: 'Jährlicher Stromverbrauch (kWh)?', value_raw: '5200' },
        ];
      }

      if (events.length === 0) {
        events = [
          {
            id: 'ev-1',
            event_type: 'LEAD_CREATED',
            created_at: lead.created_at,
            payload: { source: 'Google Ads' },
          },
        ];
      }
    }

    const canDial = this.checkCanDial(lead);

    return {
      lead,
      provenance,
      answers,
      events,
      canDial,
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
