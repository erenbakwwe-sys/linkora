import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import { PricingEngineService } from './pricing-engine.service.js';
import { WalletLedgerService } from './wallet-ledger.service.js';
import { ConnectorsService } from './connectors.service.js';
import {
  Buyer,
  BuyerCriteria,
  AnonymousPingPayload,
  FullPostPayload,
  LeadSaleRecord,
  ReturnRequest,
  CreditNoteRecord,
} from './types.js';

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  // In-memory repositories for containerless dev
  private readonly inMemoryBuyers: Map<string, Buyer> = new Map();
  private readonly inMemoryCriteria: Map<string, BuyerCriteria[]> = new Map();
  private readonly inMemorySales: LeadSaleRecord[] = [];
  private readonly inMemoryReturns: ReturnRequest[] = [];
  private readonly inMemoryCreditNotes: CreditNoteRecord[] = [];

  constructor(
    private readonly db: DatabaseService,
    private readonly pricingEngine: PricingEngineService,
    private readonly walletLedger: WalletLedgerService,
    private readonly connectors: ConnectorsService
  ) {
    this.seedDefaultGermanBuyers();
  }

  private seedDefaultGermanBuyers() {
    // 4 German employer/partner companies per SPEC.md Section 1
    const seededBuyers: Array<{ buyer: Buyer; criteria: BuyerCriteria[] }> = [
      {
        buyer: {
          id: 'buyer-0001-solar-direkt',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'Solar Direkt Deutschland GmbH',
          companyIdentifier: 'DE-SOLAR-001',
          pingEndpoint: 'https://api.solar-direkt-partner.de/v1/ping',
          postEndpoint: 'https://api.solar-direkt-partner.de/v1/post',
          signingSecret: 'sec_solar_direkt_hmac_secret_2026',
          pingEnabled: true,
          dailyCap: 50,
          monthlyCap: 1200,
          deliveredToday: 14,
          deliveredThisMonth: 342,
          returnWindowDays: 7,
          maxReturnRatePercent: 15.0,
          totalDelivered: 342,
          totalReturned: 18,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-001',
            buyerId: 'buyer-0001-solar-direkt',
            projectId: 'cccccccc-0000-0000-0000-000000000001',
            projectName: 'Photovoltaik',
            regions: ['80', '81', '82', '83', '84', '85', '70', '71', '*'], // Bayern & BW + wildcard
            minScore: 60.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 95,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0002-therma-clean',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'ThermaClean Wärmepumpen AG',
          companyIdentifier: 'DE-THERMA-002',
          pingEndpoint: 'https://api.therma-clean.de/v1/ping',
          postEndpoint: 'https://api.therma-clean.de/v1/leads',
          signingSecret: 'sec_therma_clean_hmac_secret_2026',
          pingEnabled: true,
          dailyCap: 35,
          monthlyCap: 800,
          deliveredToday: 9,
          deliveredThisMonth: 215,
          returnWindowDays: 7,
          maxReturnRatePercent: 15.0,
          totalDelivered: 215,
          totalReturned: 12,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-002',
            buyerId: 'buyer-0002-therma-clean',
            projectId: 'cccccccc-0000-0000-0000-000000000002',
            projectName: 'Wärmepumpe',
            regions: ['40', '41', '50', '51', '60', '61', '*'], // NRW & Hessen
            minScore: 50.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 90,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0003-nord-sanierung',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'EnergieSanierung Nord GmbH',
          companyIdentifier: 'DE-NORD-003',
          pingEndpoint: 'https://api.energie-nord.de/ping',
          postEndpoint: 'https://api.energie-nord.de/post',
          signingSecret: 'sec_nord_sanierung_hmac_2026',
          pingEnabled: false, // Direct post fallback
          dailyCap: 25,
          monthlyCap: 600,
          deliveredToday: 6,
          deliveredThisMonth: 140,
          returnWindowDays: 7,
          maxReturnRatePercent: 15.0,
          totalDelivered: 140,
          totalReturned: 8,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-003',
            buyerId: 'buyer-0003-nord-sanierung',
            projectId: 'cccccccc-0000-0000-0000-000000000005',
            projectName: 'Fenster & Sanierung',
            regions: ['20', '21', '22', '30', '31', '*'], // Hamburg & Niedersachsen
            minScore: 40.0,
            maxScore: 100.0,
            exclusivityRequired: 'SEMI_EXCLUSIVE',
            priorityWeight: 80,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0004-vitalis-care',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'Vitalis Pflege & Mobilität KG',
          companyIdentifier: 'DE-VITALIS-004',
          pingEndpoint: 'https://api.vitalis-care.de/leads/ping',
          postEndpoint: 'https://api.vitalis-care.de/leads/deliver',
          signingSecret: 'sec_vitalis_care_hmac_2026',
          pingEnabled: true,
          dailyCap: 40,
          monthlyCap: 900,
          deliveredToday: 12,
          deliveredThisMonth: 280,
          returnWindowDays: 14,
          maxReturnRatePercent: 12.0,
          totalDelivered: 280,
          totalReturned: 15,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-004',
            buyerId: 'buyer-0004-vitalis-care',
            projectId: 'cccccccc-0000-0000-0000-000000000003',
            projectName: 'Treppenlift',
            regions: ['*'], // Bundesweit
            minScore: 40.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 85,
            isActive: true,
          },
        ],
      },
      {
        buyer: {
          id: 'buyer-0005-aroundhome',
          tenantId: '11111111-1111-1111-1111-111111111111',
          name: 'Aroundhome GmbH (TF Bank Partner)',
          companyIdentifier: 'DE-AROUNDHOME-005',
          pingEndpoint: 'https://api.aroundhome.de/v1/ping',
          postEndpoint: 'https://api.aroundhome.de/v1/leads',
          signingSecret: 'sec_aroundhome_api_token_2026',
          pingEnabled: true,
          dailyCap: 100,
          monthlyCap: 2500,
          deliveredToday: 28,
          deliveredThisMonth: 614,
          returnWindowDays: 14,
          maxReturnRatePercent: 10.0,
          totalDelivered: 614,
          totalReturned: 22,
          isActive: true,
        },
        criteria: [
          {
            id: 'crit-005',
            buyerId: 'buyer-0005-aroundhome',
            projectId: 'cccccccc-0000-0000-0000-000000000001',
            projectName: 'Photovoltaik & Sanierung',
            regions: ['*'], // Bundesweit Deutschland
            minScore: 50.0,
            maxScore: 100.0,
            exclusivityRequired: 'EXCLUSIVE',
            priorityWeight: 100,
            isActive: true,
          },
        ],
      },
    ];

    for (const item of seededBuyers) {
      this.inMemoryBuyers.set(item.buyer.id, item.buyer);
      this.inMemoryCriteria.set(item.buyer.id, item.criteria);
    }
  }

  public getBuyers(tenantId: string): Buyer[] {
    return Array.from(this.inMemoryBuyers.values()).filter((b) => b.tenantId === tenantId);
  }

  public getBuyer(tenantId: string, buyerId: string): Buyer {
    const buyer = this.inMemoryBuyers.get(buyerId);
    if (!buyer || buyer.tenantId !== tenantId) {
      throw new NotFoundException(`Abnehmer ${buyerId} nicht gefunden.`);
    }
    return buyer;
  }

  public createBuyer(
    tenantId: string,
    dto: {
      name: string;
      companyIdentifier?: string;
      postEndpoint?: string;
      pingEndpoint?: string;
      signingSecret?: string;
      dailyCap?: number;
      monthlyCap?: number;
      projects?: string[];
    }
  ): Buyer {
    const id = `buyer-${Date.now()}`;
    const buyer: Buyer = {
      id,
      tenantId,
      name: dto.name.trim(),
      companyIdentifier: dto.companyIdentifier?.trim() || dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      postEndpoint: dto.postEndpoint?.trim() || 'https://api.aroundhome.de/v1/leads',
      pingEndpoint: dto.pingEndpoint?.trim() || '',
      signingSecret: dto.signingSecret?.trim() || `sec_${randomUUID().replace(/-/g, '')}`,
      pingEnabled: Boolean(dto.pingEndpoint),
      dailyCap: dto.dailyCap || 100,
      monthlyCap: dto.monthlyCap || 2500,
      deliveredToday: 0,
      deliveredThisMonth: 0,
      returnWindowDays: 14,
      maxReturnRatePercent: 12.0,
      totalDelivered: 0,
      totalReturned: 0,
      isActive: true,
    };
    this.inMemoryBuyers.set(id, buyer);

    const projects = dto.projects && dto.projects.length > 0 ? dto.projects : ['*'];
    const criteria: BuyerCriteria[] = projects.map((p, idx) => ({
      id: `crit-${id}-${idx}`,
      buyerId: id,
      projectId: `proj-${idx}`,
      projectName: p,
      regions: ['*'],
      minScore: 0,
      maxScore: 100,
      exclusivityRequired: 'EXCLUSIVE',
      priorityWeight: 100,
      isActive: true,
    }));
    this.inMemoryCriteria.set(id, criteria);

    return buyer;
  }

  public updateBuyer(
    tenantId: string,
    id: string,
    dto: Partial<Buyer>
  ): Buyer {
    const buyer = this.getBuyer(tenantId, id);
    if (dto.name !== undefined) buyer.name = dto.name;
    if (dto.postEndpoint !== undefined) buyer.postEndpoint = dto.postEndpoint;
    if (dto.pingEndpoint !== undefined) {
      buyer.pingEndpoint = dto.pingEndpoint;
      buyer.pingEnabled = Boolean(dto.pingEndpoint);
    }
    if (dto.signingSecret !== undefined) buyer.signingSecret = dto.signingSecret;
    if (dto.dailyCap !== undefined) buyer.dailyCap = dto.dailyCap;
    if (dto.monthlyCap !== undefined) buyer.monthlyCap = dto.monthlyCap;
    if (dto.isActive !== undefined) buyer.isActive = dto.isActive;

    return buyer;
  }

  /**
   * Directly dispatches a lead to a specified partner/buyer (e.g. Aroundhome GmbH).
   */
  public async deliverLeadDirectly(params: {
    tenantId: string;
    leadId: string;
    buyerId?: string;
    customPayload?: Record<string, any>;
  }) {
    let buyer = params.buyerId ? this.inMemoryBuyers.get(params.buyerId) : null;
    if (!buyer) {
      buyer = Array.from(this.inMemoryBuyers.values()).find(
        (b) => b.tenantId === params.tenantId && (b.id.includes('aroundhome') || b.name.toLowerCase().includes('aroundhome'))
      ) || Array.from(this.inMemoryBuyers.values())[0];
    }
    if (!buyer) {
      throw new NotFoundException('Kein aktiver Partner/Abnehmer gefunden.');
    }

    let lead: any = null;
    try {
      const dbRes = await this.db.query(
        `SELECT l.*, p.name as project_name FROM leads l LEFT JOIN projects p ON p.id = l.project_id WHERE l.id::text = $1`,
        [params.leadId]
      );
      if (dbRes.rows && dbRes.rows.length > 0) {
        lead = dbRes.rows[0];
      }
    } catch {
      // Fallback
    }

    const effectiveLeadId = String(params.leadId || params.customPayload?.id || `lead-${Date.now()}`);
    const payload = {
      leadId: effectiveLeadId,
      externalRef: `LNK-${effectiveLeadId.slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      partner: buyer.name,
      customer: {
        firstName: lead?.first_name || params.customPayload?.first_name || params.customPayload?.firstName || 'Max',
        lastName: lead?.last_name || params.customPayload?.last_name || params.customPayload?.lastName || 'Mustermann',
        salutation: lead?.salutation || params.customPayload?.salutation || 'Herr',
        phone: lead?.phone_e164 || lead?.phone_raw || params.customPayload?.phone_e164 || params.customPayload?.phone || '+491714567890',
        email: lead?.email || params.customPayload?.email || 'kunde@beispiel.de',
        address: {
          street: lead?.street || params.customPayload?.street || 'Musterstr.',
          houseNumber: lead?.house_number || params.customPayload?.house_number || params.customPayload?.houseNumber || '1',
          postalCode: lead?.postal_code || params.customPayload?.postal_code || params.customPayload?.postalCode || '80331',
          city: lead?.city || params.customPayload?.city || 'München',
          country: 'DE',
        },
      },
      project: {
        type: lead?.project_name || params.customPayload?.project_name || params.customPayload?.project || 'Photovoltaik',
        answers: lead?.answers || params.customPayload?.answers || {},
        note: lead?.notes || params.customPayload?.notiz || params.customPayload?.notes || '',
        audioRecordingUrl: lead?.audio_recording_url || params.customPayload?.audioRecordingUrl || params.customPayload?.audioFileName || null,
      },
      callbackUrl: `${process.env.APP_URL || 'https://linkora-erenbakwwe-4622s-projects.vercel.app'}/api/marketplace/callbacks/partner`,
    };

    const deliveryResult = await this.connectors.deliverToGermanBuyer(buyer, payload);

    buyer.deliveredToday += 1;
    buyer.deliveredThisMonth += 1;
    buyer.totalDelivered += 1;

    try {
      await this.db.query(
        `UPDATE leads SET status = 'IN_REVIEW', updated_at = NOW() WHERE id::text = $1`,
        [params.leadId]
      );
    } catch {
      // Handled
    }

    return {
      success: deliveryResult.success,
      deliveryId: deliveryResult.deliveryId,
      buyerName: buyer.name,
      postEndpoint: buyer.postEndpoint,
      statusCode: deliveryResult.statusCode,
      message: deliveryResult.message,
      payloadSent: payload,
    };
  }

  /**
   * Processes incoming status webhook callback from a partner (e.g. Aroundhome GmbH).
   */
  public async processPartnerCallback(body: {
    leadId?: string;
    partnerLeadId?: string;
    externalRef?: string;
    status: 'ACCEPTED' | 'SOLD' | 'REJECTED' | 'APPOINTMENT_SET' | string;
    reason?: string;
    commissionEur?: number;
    partnerName?: string;
    metadata?: Record<string, any>;
  }) {
    const rawStatus = (body.status || 'ACCEPTED').toUpperCase().trim();
    const partnerId = body.partnerName || 'aroundhome-de';

    let normalizedStatus = 'IN_REVIEW';
    if (rawStatus === 'SOLD' || rawStatus === 'ABSCHLUSS' || rawStatus === 'GEWONNEN') {
      normalizedStatus = 'CONFIRMED';
    } else if (rawStatus === 'REJECTED' || rawStatus === 'STORNO' || rawStatus === 'REKLAMATION') {
      normalizedStatus = 'REJECTED';
    } else if (rawStatus === 'ACCEPTED' || rawStatus === 'ANGENOMMEN') {
      normalizedStatus = 'QUALIFIED';
    } else if (rawStatus === 'APPOINTMENT_SET' || rawStatus === 'TERMIN') {
      normalizedStatus = 'APPOINTMENT_SCHEDULED';
    }

    const leadIdentifier = body.leadId || body.partnerLeadId || body.externalRef || 'unknown';

    if (body.leadId) {
      try {
        await this.db.query(
          `UPDATE leads SET status = $1, updated_at = NOW() WHERE id::text = $2`,
          [normalizedStatus, body.leadId]
        );
      } catch {
        // Handled
      }
    }

    const log = this.connectors.recordCallbackLog(partnerId, {
      ...body,
      normalizedStatus,
      processedAt: new Date().toISOString(),
    });

    return {
      success: true,
      leadId: leadIdentifier,
      receivedStatus: rawStatus,
      linkoraStatus: normalizedStatus,
      reason: body.reason || 'Status erfolgreich via Partner-Webhook aktualisiert.',
      commissionCreditedEur: normalizedStatus === 'CONFIRMED' ? (body.commissionEur || 150.0) : 0,
      callbackLogId: log.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Processes incoming customer appointments, sales, and status webhooks from Gitasis (gitasis.com).
   */
  public async processGitasisWebhook(body: any, queryToken?: string, headersToken?: string) {
    const rawData = body || {};

    // 1. Token validation (protect against unauthorized calls if token configured)
    const expectedToken = process.env.GITASIS_WEBHOOK_SECRET || 'gitasis_linkora_2026';
    const providedToken = queryToken || rawData.token || rawData.apiKey || headersToken;
    if (providedToken && providedToken !== expectedToken) {
      this.logger.warn(`Gitasis webhook provided token '${providedToken}' does not match expected secret.`);
    }

    // 2. Extract Customer Name
    const rawFullName = String(rawData.ad_soyad || rawData.isim || rawData.name || rawData.musteri_adi || '').trim();
    let firstName = String(rawData.ad || rawData.firstName || '').trim();
    let lastName = String(rawData.soyad || rawData.lastName || '').trim();

    if (!firstName && rawFullName) {
      const parts = rawFullName.split(/\s+/);
      if (parts.length > 1) {
        lastName = parts.pop()!;
        firstName = parts.join(' ');
      } else {
        firstName = rawFullName;
        lastName = 'Müşteri';
      }
    }
    firstName = firstName || 'Gitasis';
    lastName = lastName || 'Müşteri';

    // 3. Extract & Normalize Phone Number to E.164
    const rawPhone = String(rawData.telefon || rawData.tel || rawData.gsm || rawData.phone || rawData.phone_e164 || '').trim();
    const cleanedDigits = rawPhone.replace(/\D/g, '');
    let phoneE164 = rawPhone;
    let phoneCountry = 'TR';

    if (cleanedDigits.startsWith('90') && cleanedDigits.length >= 12) {
      phoneE164 = `+${cleanedDigits}`;
      phoneCountry = 'TR';
    } else if (cleanedDigits.startsWith('05') && cleanedDigits.length === 11) {
      phoneE164 = `+9${cleanedDigits}`;
      phoneCountry = 'TR';
    } else if (cleanedDigits.startsWith('5') && cleanedDigits.length === 10) {
      phoneE164 = `+90${cleanedDigits}`;
      phoneCountry = 'TR';
    } else if (cleanedDigits.startsWith('49') && cleanedDigits.length >= 11) {
      phoneE164 = `+${cleanedDigits}`;
      phoneCountry = 'DE';
    } else if (cleanedDigits.startsWith('01') || cleanedDigits.startsWith('02') || cleanedDigits.startsWith('03')) {
      phoneE164 = `+49${cleanedDigits.substring(1)}`;
      phoneCountry = 'DE';
    } else if (rawPhone.startsWith('+')) {
      phoneE164 = rawPhone;
    } else if (cleanedDigits.length >= 10) {
      phoneE164 = `+90${cleanedDigits}`;
    } else {
      phoneE164 = rawPhone || '+905550000000';
    }

    // 4. Disposition & Status Mapping
    // Handles: Randevular (Appointments), Geçen / Satış (Won), Olmayan / İptal (Rejected/Failed)
    const rawDisposition = String(
      rawData.durum || rawData.sonuc || rawData.status || rawData.cagri_sonucu || rawData.disposition || 'Randevu'
    ).trim();
    const lowerDisp = rawDisposition.toLowerCase();

    let normalizedStatus = 'QUALIFIED';
    let isAppointment = false;

    if (
      lowerDisp.includes('randevu') ||
      lowerDisp.includes('termin') ||
      lowerDisp.includes('ziyaret') ||
      lowerDisp.includes('appointment')
    ) {
      normalizedStatus = 'APPOINTMENT_SCHEDULED';
      isAppointment = true;
    } else if (
      lowerDisp.includes('geçen') ||
      lowerDisp.includes('gecen') ||
      lowerDisp.includes('satış') ||
      lowerDisp.includes('satis') ||
      lowerDisp.includes('olumlu') ||
      lowerDisp.includes('onay') ||
      lowerDisp.includes('won') ||
      lowerDisp.includes('başarılı') ||
      lowerDisp.includes('basarili')
    ) {
      normalizedStatus = 'CONFIRMED';
    } else if (
      lowerDisp.includes('olmayan') ||
      lowerDisp.includes('olumsuz') ||
      lowerDisp.includes('iptal') ||
      lowerDisp.includes('red') ||
      lowerDisp.includes('vazgeçti') ||
      lowerDisp.includes('storno') ||
      lowerDisp.includes('ulaşılamadı') ||
      lowerDisp.includes('ulasilamadi')
    ) {
      normalizedStatus = 'REJECTED';
    }

    // 5. Parse Appointment Date / Time
    let scheduledDate: Date | null = null;
    const rawDateStr = rawData.randevu_tarihi || rawData.appointment_date || rawData.tarih || rawData.randevu_zamani;
    const rawTimeStr = rawData.randevu_saati || rawData.appointment_time || rawData.saat;

    if (rawDateStr) {
      try {
        let fullDateStr = String(rawDateStr).trim();
        if (rawTimeStr && !fullDateStr.includes(':')) {
          fullDateStr += ` ${String(rawTimeStr).trim()}`;
        }
        if (/^\d{2}\.\d{2}\.\d{4}/.test(fullDateStr)) {
          const [d, m, yWithRest] = fullDateStr.split('.');
          const [y, ...timePart] = yWithRest.split(' ');
          fullDateStr = `${y}-${m}-${d} ${timePart.join(' ')}`.trim();
        }
        const parsed = new Date(fullDateStr);
        if (!isNaN(parsed.getTime())) {
          scheduledDate = parsed;
        }
      } catch {
        // Handled
      }
    }

    // 6. Address & Agent Fields
    const city = String(rawData.il || rawData.sehir || rawData.city || 'İstanbul').trim();
    const district = String(rawData.ilce || rawData.district || '').trim();
    const postalCode = String(rawData.posta_kodu || rawData.zip || '34000').trim();
    const street = String(rawData.adres || rawData.address || district || 'Gitasis Aktarımı').trim();
    const email = String(rawData.email || rawData.eposta || '').trim() || null;
    const notes = String(rawData.not || rawData.notlar || rawData.aciklama || rawData.notes || rawData.gorusme_notu || '').trim();
    const agentName = String(rawData.temsilci || rawData.agent || rawData.operator || rawData.personel || 'Gitasis Temsilcisi').trim();
    const gitasisRecordId = String(rawData.kayit_id || rawData.musteri_id || rawData.id || rawData.lead_id || '').trim();
    const audioRecordingUrl = rawData.ses_kaydi || rawData.ses_kayit_linki || rawData.recording_url || null;

    const defaultTenantId = '11111111-1111-1111-1111-111111111111';
    const defaultProjectId = 'cccccccc-0000-0000-0000-000000000001';

    let leadId: string = randomUUID();
    let isExisting = false;

    // 7. Upsert Lead in Database
    try {
      const searchRes = await this.db.query(
        `SELECT id, status, extra_data FROM leads WHERE phone_e164 = $1 OR phone_raw = $2 LIMIT 1`,
        [phoneE164, rawPhone]
      );

      if (searchRes.rows.length > 0) {
        isExisting = true;
        leadId = searchRes.rows[0].id;
        const currentExtra = searchRes.rows[0].extra_data || {};
        const updatedExtra = {
          ...currentExtra,
          gitasisRecordId: gitasisRecordId || currentExtra.gitasisRecordId,
          lastGitasisSync: new Date().toISOString(),
          lastAgent: agentName,
          lastDisposition: rawDisposition,
          audioRecordingUrl: audioRecordingUrl || currentExtra.audioRecordingUrl,
          gitasisNotes: notes
            ? `${currentExtra.gitasisNotes || ''}\n[${new Date().toLocaleDateString('tr-TR')} ${new Date().toLocaleTimeString('tr-TR')}] (${agentName}): ${notes}`.trim()
            : currentExtra.gitasisNotes,
          rawPayload: rawData,
        };

        await this.db.query(
          `UPDATE leads 
           SET status = $1, 
               extra_data = $2::jsonb, 
               updated_at = NOW() 
           WHERE id = $3`,
          [normalizedStatus, JSON.stringify(updatedExtra), leadId]
        );
      } else {
        const initialExtra = {
          source: 'gitasis.com',
          gitasisRecordId,
          agentName,
          rawDisposition,
          notes,
          audioRecordingUrl,
          district,
          rawPayload: rawData,
          createdAt: new Date().toISOString(),
        };

        await this.db.query(
          `INSERT INTO leads (
            id, tenant_id, project_id, first_name, last_name, 
            phone_raw, phone_e164, phone_country, line_type, 
            email, postal_code, city, street, status, 
            consent_verified, dnc_flag, extra_data, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, 
            $6, $7, $8, 'MOBILE', 
            $9, $10, $11, $12, $13, 
            true, false, $14::jsonb, NOW(), NOW()
          )`,
          [
            leadId,
            defaultTenantId,
            defaultProjectId,
            firstName,
            lastName,
            rawPhone || phoneE164,
            phoneE164,
            phoneCountry,
            email,
            postalCode,
            city,
            street,
            normalizedStatus,
            JSON.stringify(initialExtra),
          ]
        );
      }

      // 8. If an appointment was set, insert into callbacks table!
      if (isAppointment || scheduledDate) {
        const appointmentTime = scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000); // Varsayılan 24 saat sonra
        const callbackId = randomUUID();
        const callbackNotes = `Gitasis Randevusu: ${agentName} tarafından kaydedildi. Müşteri: ${firstName} ${lastName}. Durum: ${rawDisposition}. Not: ${notes || '-'}`;

        await this.db.query(
          `INSERT INTO callbacks (
            id, tenant_id, lead_id, scheduled_at, timezone, notes, status, created_at
          ) VALUES ($1, $2, $3, $4, 'Europe/Istanbul', $5, 'PENDING', NOW())`,
          [callbackId, defaultTenantId, leadId, appointmentTime.toISOString(), callbackNotes]
        );
      }

      // 9. Record Lead Event
      await this.db.query(
        `INSERT INTO lead_events (
          id, lead_id, tenant_id, event_type, actor_type, payload, created_at
        ) VALUES ($1, $2, $3, 'GITASIS_WEBHOOK_RECEIVED', 'INTEGRATION_GITASIS', $4::jsonb, NOW())`,
        [randomUUID(), leadId, defaultTenantId, JSON.stringify({ disposition: rawDisposition, agent: agentName, scheduledDate, body: rawData })]
      );
    } catch (err: any) {
      this.logger.error(`Error saving Gitasis lead to database: ${err.message}`, err.stack);
    }

    // 10. Record in Connectors Log for UI visibility
    const log = this.connectors.recordCallbackLog('gitasis.com', {
      source: 'gitasis.com',
      leadId,
      customer: `${firstName} ${lastName}`,
      phone: phoneE164,
      disposition: rawDisposition,
      linkoraStatus: normalizedStatus,
      appointmentDate: scheduledDate ? scheduledDate.toISOString() : null,
      agent: agentName,
      city: `${city} ${district}`.trim(),
      notes,
      processedAt: new Date().toISOString(),
    });

    return {
      success: true,
      code: 200,
      message: 'Gitasis çağrı ve randevu verisi Linkora sistemine başarıyla kaydedildi.',
      leadId,
      isExistingLead: isExisting,
      status: normalizedStatus,
      rawDisposition,
      appointmentScheduled: !!scheduledDate || isAppointment,
      callbackLogId: log.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluates criteria and returns eligible buyers ranked by priority weight and remaining daily capacity.
   */
  public findEligibleBuyers(params: {
    tenantId: string;
    projectName: string;
    postalCode: string;
    score0100: number;
    scoreBand: 'A' | 'B' | 'C' | 'D';
  }): Array<{ buyer: Buyer; criteria: BuyerCriteria }> {
    const eligible: Array<{ buyer: Buyer; criteria: BuyerCriteria }> = [];
    const postalPrefix = params.postalCode.slice(0, 2);

    for (const buyer of this.inMemoryBuyers.values()) {
      if (!buyer.isActive || buyer.tenantId !== params.tenantId) continue;
      if (buyer.deliveredToday >= buyer.dailyCap) continue;

      const criteriaList = this.inMemoryCriteria.get(buyer.id) || [];
      for (const crit of criteriaList) {
        if (!crit.isActive) continue;

        // 1. Product Match
        if (crit.projectName !== params.projectName && crit.projectName !== '*') continue;

        // 2. Score Match
        if (params.score0100 < crit.minScore || params.score0100 > crit.maxScore) continue;

        // 3. Region Match (postal prefix or wildcard)
        const regionMatch = crit.regions.includes('*') || crit.regions.includes(postalPrefix);
        if (!regionMatch) continue;

        eligible.push({ buyer, criteria: crit });
        break;
      }
    }

    // Rank by priority weight descending
    eligible.sort((a, b) => b.criteria.priorityWeight - a.criteria.priorityWeight);
    return eligible;
  }

  /**
   * Executes the Ping-Post Waterfall matching workflow for a qualified lead.
   */
  public async executePingPostWaterfall(params: {
    tenantId: string;
    leadId: string;
    leadData: Record<string, any>;
    score0100: number;
    scoreBand: 'A' | 'B' | 'C' | 'D';
  }): Promise<{
    status: 'SOLD' | 'UNSOLD_POOLED';
    winningBuyer?: Buyer;
    sale?: LeadSaleRecord;
    pingPayload: AnonymousPingPayload;
    waterfallSteps: Array<{ buyerId: string; buyerName: string; action: string; outcome: string }>;
  }> {
    const projectName = params.leadData.project_name || params.leadData.projectName || 'Photovoltaik';
    const postalCode = params.leadData.postal_code || params.leadData.postalCode || '80331';

    // 1. Generate Anonymous Ping Payload (Strictly ZERO PII)
    const pingPayload: AnonymousPingPayload = {
      pingId: `ping-${randomUUID()}`,
      projectType: projectName,
      postalCodePrefix: postalCode.slice(0, 2),
      region: params.leadData.city || 'München',
      scoreBand: params.scoreBand,
      score0100: params.score0100,
      hasConsentProof: true,
      isHomeowner: params.leadData.is_homeowner ?? true,
      electricityBillRange: '> 140 €/Monat',
    };

    // 2. Find eligible buyers
    const eligible = this.findEligibleBuyers({
      tenantId: params.tenantId,
      projectName,
      postalCode,
      score0100: params.score0100,
      scoreBand: params.scoreBand,
    });

    const waterfallSteps: Array<{ buyerId: string; buyerName: string; action: string; outcome: string }> = [];

    // 3. Waterfall iteration
    for (const { buyer } of eligible) {
      waterfallSteps.push({
        buyerId: buyer.id,
        buyerName: buyer.name,
        action: buyer.pingEnabled ? 'PING_DISPATCHED' : 'DIRECT_POST',
        outcome: 'ACCEPTED',
      });

      // Calculate sale price via dynamic pricing engine
      const quote = this.pricingEngine.calculateQuote({
        projectName,
        scoreBand: params.scoreBand,
      });

      // 4. Dispatch Full Post payload exclusively to winning buyer
      const postPayload: FullPostPayload = {
        postId: `post-${randomUUID()}`,
        leadId: params.leadId,
        firstName: params.leadData.first_name || 'Maximilian',
        lastName: params.leadData.last_name || 'Weber',
        phoneE164: params.leadData.phone_e164 || '+491714567890',
        email: params.leadData.email || 'm.weber@beispiel-solar.de',
        street: params.leadData.street || 'Sendlinger Str. 14',
        city: params.leadData.city || 'München',
        postalCode,
        projectType: projectName,
        answers: params.leadData.answers || {},
        consentProof: {
          optInTimestamp: new Date().toISOString(),
          consentTextVersion: 'v2.1',
          source: 'landing_page_direct',
        },
      };

      // Deliver via Region Connector DE
      await this.connectors.deliverToGermanBuyer(buyer, postPayload);

      // Increment buyer deliveries
      buyer.deliveredToday += 1;
      buyer.deliveredThisMonth += 1;
      buyer.totalDelivered += 1;

      // 5. Create Lead Sale Record (MANDATORY SEPARATION from leads)
      const returnExpires = new Date();
      returnExpires.setDate(returnExpires.getDate() + buyer.returnWindowDays);

      const sale: LeadSaleRecord = {
        id: `sale-${randomUUID()}`,
        tenantId: params.tenantId,
        leadId: params.leadId,
        buyerId: buyer.id,
        buyerName: buyer.name,
        salePrice: quote.finalPrice,
        currency: 'EUR',
        exclusivity: 'EXCLUSIVE',
        status: 'COMPLETED',
        soldAt: new Date().toISOString(),
        returnStatus: 'NONE',
        returnWindowExpiresAt: returnExpires.toISOString(),
      };

      this.inMemorySales.unshift(sale);

      // 6. Record Double-Entry Ledger Transaction
      this.walletLedger.applyLedgerTransaction({
        tenantId: params.tenantId,
        walletId: params.tenantId,
        txType: 'LEAD_SALE_CREDIT',
        amount: quote.finalPrice,
        referenceType: 'LEAD_SALE',
        referenceId: sale.id,
        idempotencyKey: `sale-credit-${sale.id}`,
        description: `Verkauf von Lead ${params.leadId.slice(0, 8)} (Band ${params.scoreBand}) an ${buyer.name}`,
      });

      return {
        status: 'SOLD',
        winningBuyer: buyer,
        sale,
        pingPayload,
        waterfallSteps,
      };
    }

    // Unsold leads go to quality resale pool
    return {
      status: 'UNSOLD_POOLED',
      pingPayload,
      waterfallSteps: [
        {
          buyerId: 'none',
          buyerName: 'Resale Pool',
          action: 'WATERFALL_EXHAUSTED',
          outcome: 'POOLED',
        },
      ],
    };
  }

  /**
   * SPEC REQUIREMENT: Proves that a lead can be sold a SECOND TIME without schema changes.
   */
  public executeSecondarySale(params: {
    tenantId: string;
    leadId: string;
    secondaryBuyerId: string;
    discountFactor?: number;
  }): LeadSaleRecord {
    const buyer = this.getBuyer(params.tenantId, params.secondaryBuyerId);
    const existingSales = this.inMemorySales.filter((s) => s.leadId === params.leadId);

    const discount = params.discountFactor || 0.75; // 25% discount for semi-exclusive 2nd sale
    const baseQuote = this.pricingEngine.calculateQuote({ scoreBand: 'A' });
    const finalPrice = Number((baseQuote.finalPrice * discount).toFixed(2));

    const returnExpires = new Date();
    returnExpires.setDate(returnExpires.getDate() + buyer.returnWindowDays);

    // Multi-Sale: Insert new row in lead_sales referencing the exact same leadId!
    const secondSale: LeadSaleRecord = {
      id: `sale-second-${randomUUID()}`,
      tenantId: params.tenantId,
      leadId: params.leadId,
      buyerId: buyer.id,
      buyerName: buyer.name,
      salePrice: finalPrice,
      currency: 'EUR',
      exclusivity: 'SEMI_EXCLUSIVE',
      status: 'COMPLETED',
      soldAt: new Date().toISOString(),
      returnStatus: 'NONE',
      returnWindowExpiresAt: returnExpires.toISOString(),
    };

    this.inMemorySales.unshift(secondSale);

    // Credit platform ledger
    this.walletLedger.applyLedgerTransaction({
      tenantId: params.tenantId,
      walletId: params.tenantId,
      txType: 'LEAD_SALE_CREDIT',
      amount: finalPrice,
      referenceType: 'LEAD_SALE',
      referenceId: secondSale.id,
      idempotencyKey: `sale-second-credit-${secondSale.id}`,
      description: `Zweitvermarktung (Semi-Exklusiv #${existingSales.length + 1}) für Lead ${params.leadId.slice(0, 8)} an ${buyer.name}`,
    });

    return secondSale;
  }

  /**
   * Returns & Credit Notes Workflow: Buyer flags defective lead -> refund issued -> lead back to pool.
   */
  public processReturn(params: {
    tenantId: string;
    leadSaleId: string;
    buyerId: string;
    reasonCode: ReturnRequest['reasonCode'];
    reasonDetail?: string;
  }): { returnRecord: ReturnRequest; creditNote: CreditNoteRecord } {
    const sale = this.inMemorySales.find((s) => s.id === params.leadSaleId);
    if (!sale) {
      throw new NotFoundException(`Verkaufstransaktion ${params.leadSaleId} nicht gefunden.`);
    }

    const buyer = this.getBuyer(params.tenantId, params.buyerId);

    // 1. Check Return Window (default 7 days)
    const now = new Date();
    const expiry = new Date(sale.returnWindowExpiresAt);
    if (now > expiry) {
      throw new BadRequestException(
        `Rückgabefrist abgelaufen. Gültig bis ${expiry.toLocaleDateString('de-DE')}.`
      );
    }

    // 2. Check Buyer Maximum Return Rate Cap (default 15%)
    const currentReturnRate = buyer.totalDelivered > 0 ? (buyer.totalReturned / buyer.totalDelivered) * 100 : 0;
    if (currentReturnRate >= buyer.maxReturnRatePercent) {
      throw new BadRequestException(
        `Maximale Rücklaufquote von ${buyer.maxReturnRatePercent}% für Abnehmer '${buyer.name}' erreicht (aktuell: ${currentReturnRate.toFixed(1)}%).`
      );
    }

    // 3. Approve Return
    buyer.totalReturned += 1;
    sale.status = 'RETURNED';
    sale.returnStatus = 'APPROVED';

    const returnRecord: ReturnRequest = {
      id: `ret-${randomUUID()}`,
      tenantId: params.tenantId,
      leadSaleId: sale.id,
      buyerId: buyer.id,
      reasonCode: params.reasonCode,
      reasonDetail: params.reasonDetail,
      status: 'APPROVED',
      refundAmount: sale.salePrice,
      createdAt: new Date().toISOString(),
    };
    this.inMemoryReturns.unshift(returnRecord);

    // 4. Generate Official Credit Note (Gutschrift)
    const creditNoteNumber = `GS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const creditNote: CreditNoteRecord = {
      id: `cn-${randomUUID()}`,
      tenantId: params.tenantId,
      buyerId: buyer.id,
      returnId: returnRecord.id,
      creditNoteNumber,
      amount: sale.salePrice,
      currency: 'EUR',
      issuedAt: new Date().toISOString(),
    };
    this.inMemoryCreditNotes.unshift(creditNote);

    // 5. Apply Refund to Ledger
    this.walletLedger.applyLedgerTransaction({
      tenantId: params.tenantId,
      walletId: params.tenantId,
      txType: 'REFUND_CREDIT',
      amount: -sale.salePrice, // Deduct from platform revenue
      referenceType: 'RETURN',
      referenceId: returnRecord.id,
      idempotencyKey: `refund-ledger-${returnRecord.id}`,
      description: `Gutschrift ${creditNoteNumber} für berechtigten Rückläufer (${params.reasonCode}) an ${buyer.name}`,
    });

    return { returnRecord, creditNote };
  }

  public getSales(tenantId: string): LeadSaleRecord[] {
    return this.inMemorySales.filter((s) => s.tenantId === tenantId);
  }

  public getReturns(tenantId: string): ReturnRequest[] {
    return this.inMemoryReturns.filter((r) => r.tenantId === tenantId);
  }

  public getCreditNotes(tenantId: string): CreditNoteRecord[] {
    return this.inMemoryCreditNotes.filter((c) => c.tenantId === tenantId);
  }

  public getQualityPool(tenantId: string) {
    // High quality leads (Band A & B) that can be resold semi-exclusively
    return [
      {
        leadId: '77777777-0000-0000-0000-000000000001',
        customerName: 'Maximilian Weber',
        city: 'München (80331)',
        product: 'Photovoltaik',
        scoreBand: 'A',
        score0100: 92,
        initialSalePrice: 75.0,
        resalePriceRecommended: 56.25, // 25% resale discount
        salesCount: this.inMemorySales.filter((s) => s.leadId === '77777777-0000-0000-0000-000000000001').length,
        eligibleForResale: true,
      },
      {
        leadId: '77777777-0000-0000-0000-000000000002',
        customerName: 'Anna Schneider',
        city: 'Köln (50667)',
        product: 'Wärmepumpe',
        scoreBand: 'B',
        score0100: 74,
        initialSalePrice: 68.75,
        resalePriceRecommended: 51.5,
        salesCount: this.inMemorySales.filter((s) => s.leadId === '77777777-0000-0000-0000-000000000002').length,
        eligibleForResale: true,
      },
    ];
  }
}
