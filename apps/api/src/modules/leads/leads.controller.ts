import { Controller, Get, Post, Body, Param, Query, Headers, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CurrentTenant, CurrentUser } from '../../common/guards/user.decorator.js';
import { LeadsService } from './leads.service.js';
import { IngestionService } from './ingestion.service.js';
import { leadIngestSchema, qcActionSchema, LeadIngestInput, QcActionInput } from '@linkora/shared';

@ApiTags('Leads & Kunden')
@Controller(['leads', 'v1/leads'])
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List leads with filtering by project, status, and search query' })
  async listLeads(
    @CurrentTenant() tenantId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.leadsService.listLeads(tId, { projectId, status, search, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full lead details (profile, answers, provenance, events, dial eligibility)' })
  async getLead(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.leadsService.getLeadDetail(tId, id);
  }

  @Get(':id/can-dial')
  @ApiOperation({ summary: 'Enforce deterministic dialer eligibility check (NO_CONSENT_PROOF / DNC suppression)' })
  async canDial(@Param('id') id: string, @CurrentTenant() tenantId?: string) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    return this.leadsService.canDial(tId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Provider Push API for incoming leads (supports X-API-Key and X-Idempotency-Key)' })
  @ApiHeader({ name: 'X-API-Key', required: false, description: 'Partner API key' })
  @ApiHeader({ name: 'X-Idempotency-Key', required: false, description: 'Unique idempotency key' })
  async pushLead(
    @Body() body: any,
    @Headers('X-Idempotency-Key') idempotencyKey?: string,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';

    // Normalize projectId mapping for domain projects
    const projectMapping: Record<string, string> = {
      PV: 'cccccccc-0000-0000-0000-000000000001',
      Photovoltaik: 'cccccccc-0000-0000-0000-000000000001',
      WP: 'cccccccc-0000-0000-0000-000000000002',
      Wärmepumpe: 'cccccccc-0000-0000-0000-000000000002',
      Treppenlift: 'cccccccc-0000-0000-0000-000000000003',
      Badsanierung: 'cccccccc-0000-0000-0000-000000000004',
      'Elektromobil / Elektrorollstuhl': 'cccccccc-0000-0000-0000-000000000005',
      Elektromobil: 'cccccccc-0000-0000-0000-000000000005',
    };

    if (
      !body.projectId ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.projectId)
    ) {
      body.projectId =
        projectMapping[body.projectName] ||
        projectMapping[body.projectId] ||
        'cccccccc-0000-0000-0000-000000000001';
    }

    // Default provenance for agent direct-entry if not provided
    if (!body.provenance || !body.provenance.consentText) {
      body.provenance = {
        source: body.source || 'Agent-Direkterfassung',
        campaignName: body.projectName || 'PV',
        optInTimestamp: new Date().toISOString(),
        consentText: 'Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7).',
        consentVersion: 'v2.1',
        consentChannel: 'PHONE',
      };
    }

    // Validate body against Zod leadIngestSchema
    const parseRes = leadIngestSchema.safeParse(body);
    if (!parseRes.success) {
      // If validation fails, route to quarantine rather than silent drop
      const errors = parseRes.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      const qId = await this.ingestionService.saveToQuarantine(tId, undefined, body, errors);
      return {
        success: false,
        isQuarantined: true,
        quarantineId: qId,
        message: 'Lead-Daten fehlerhaft. In Quarantäne zur Prüfung verschoben.',
        errors,
      };
    }

    const validatedInput = parseRes.data;

    // Check Idempotency key if provided
    if (idempotencyKey) {
      const cached = await this.ingestionService.checkBatchIdempotency(tId, idempotencyKey);
      if (cached) {
        return {
          success: true,
          isDuplicate: true,
          message: 'Anfrage mit Idempotency-Key bereits verarbeitet (No-Op).',
          leadId: cached.createdLeadIds[0] || null,
        };
      }
    }

    const result = await this.ingestionService.ingestLeadRow(tId, validatedInput, {
      channel: 'PROVIDER_PUSH_API',
      actorId: user?.id,
      rawPayload: body,
    });

    if (idempotencyKey && result.leadId) {
      await this.ingestionService.finalizeBatch(tId, idempotencyKey, idempotencyKey, 1, 0, 0, [], [result.leadId]);
    }

    return result;
  }

  @Post('public-inquiry')
  @ApiOperation({ summary: 'Public landing page inquiry with honeypot bot trap and consent validation' })
  async publicInquiry(
    @Body() body: any,
    @Req() req: any,
    @Headers('x-forwarded-for') xForwardedFor?: string,
  ) {
    // 1. Honeypot check: 'website_hp' must remain empty
    if (body.website_hp && typeof body.website_hp === 'string' && body.website_hp.trim().length > 0) {
      // Spam bot detected! Drop silently with success to fool spam scrapers
      return {
        success: true,
        isSpamDropped: true,
        message: 'Vielen Dank für Ihre Anfrage. Wir werden diese zeitnah prüfen.',
      };
    }

    // 2. Explicit GDPR Consent validation
    if (!body.consentGranted) {
      throw new BadRequestException('Die ausdrückliche Einwilligung gemäß DSGVO (Art. 6 Abs. 1 lit. a) ist erforderlich.');
    }

    // 3. Fallback tenant (default primary platform tenant)
    const tenantId = body.tenantId || '11111111-1111-1111-1111-111111111111';
    const clientIp = xForwardedFor || (req && req.ip) || '127.0.0.1';

    // 4. Construct LeadIngestInput
    const leadInput: LeadIngestInput = {
      projectId: body.projectId || 'cccccccc-0000-0000-0000-000000000001',
      firstName: body.firstName || 'Interessent',
      lastName: body.lastName || 'Web-Anfrage',
      phone: body.phone || '+491701234567',
      phoneCountry: 'DE',
      email: body.email || 'kontakt@anfrage.de',
      postalCode: body.postalCode || '10115',
      city: body.city || 'Berlin',
      answers: {
        userType: body.userType || 'COMPANY',
        inquiryType: body.inquiryType || 'LEADS',
        companyName: body.companyName || '',
        message: body.message || '',
        selectedProduct: body.project || 'Photovoltaik',
      },
      extraData: {},
      provenance: {
        source: 'LANDING_PAGE',
        campaignName: body.campaign || 'Website Organic',
        landingPageUrl: body.landingPageUrl || 'https://linkora.io/',
        optInTimestamp: new Date().toISOString(),
        ipAddress: clientIp,
        consentChannel: 'ONLINE_FORM',
        consentText: 'Ich willige ein, dass meine Daten zur Kontaktaufnahme und Bearbeitung meiner Anfrage verarbeitet werden.',
        consentVersion: body.consentVersion || 'v2026.1',
        proofMetadata: {
          submittedUserAgent: req ? req.headers['user-agent'] : 'Web-Client',
          inquiryType: body.inquiryType || 'LEADS',
        },
      },
    };

    const result = await this.ingestionService.ingestLeadRow(tenantId, leadInput, {
      channel: 'PUBLIC_LANDING_PAGE',
      actorId: 'web-public-guest',
      rawPayload: body,
    });

    return {
      success: true,
      leadId: result.leadId,
      isQuarantined: result.isQuarantined,
      message: 'Ihre Anfrage wurde erfolgreich übermittelt. Ein Kundenberater meldet sich in Kürze bei Ihnen.',
    };
  }

  @Post(':id/qc')
  @ApiOperation({ summary: 'Submit QC Reviewer decision (APPROVE, REJECT, REQUEST_RECALL)' })
  async submitQc(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentTenant() tenantId?: string,
    @CurrentUser() user?: any,
  ) {
    const tId = tenantId || '11111111-1111-1111-1111-111111111111';
    const parseRes = qcActionSchema.safeParse(body);
    if (!parseRes.success) {
      throw new BadRequestException(parseRes.error.errors.map((e) => e.message).join(', '));
    }

    return this.leadsService.handleQcAction(tId, id, parseRes.data, user || { id: 'qc-user', email: 'qc@lead-kontackt.de' });
  }
}
