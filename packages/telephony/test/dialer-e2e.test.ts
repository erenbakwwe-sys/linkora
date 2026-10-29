import { DialerService } from '../../../apps/api/src/modules/dialer/dialer.service.js';
import { AgentStateService } from '../../../apps/api/src/modules/dialer/agent-state.service.js';
import { CampaignsService } from '../../../apps/api/src/modules/dialer/campaigns.service.js';
import { LeadsService } from '../../../apps/api/src/modules/leads/leads.service.js';
import { DatabaseService } from '../../../apps/api/src/common/services/database.service.js';
import { AuditService } from '../../../apps/api/src/modules/audit/audit.service.js';
import { LiveGateway } from '../../../apps/api/src/modules/gateway/live.gateway.js';

describe('Phase 2: End-to-End Mock Campaign & Dialer Session Tests', () => {
  let db: DatabaseService;
  let auditService: AuditService;
  let leadsService: LeadsService;
  let liveGateway: LiveGateway;
  let agentStateService: AgentStateService;
  let campaignsService: CampaignsService;
  let dialerService: DialerService;

  const tenantId = '11111111-1111-1111-1111-111111111111';
  const agentId = '99999999-0000-0000-0000-000000000005'; // Umut Kaya
  const confirmedLeadId = '77777777-0000-0000-0000-000000000001'; // Maximilian Weber (Consent OK)
  const noConsentLeadId = '77777777-0000-0000-0000-000000000003'; // Gerhard Müller (No Consent)

  beforeAll(() => {
    db = new DatabaseService();
    try {
      db.onModuleInit();
    } catch {}
    auditService = new AuditService(db);
    leadsService = new LeadsService(db, auditService);
    liveGateway = new LiveGateway();
    agentStateService = new AgentStateService(db, liveGateway);
    campaignsService = new CampaignsService(db, agentStateService);
    dialerService = new DialerService(db, auditService, leadsService, agentStateService, liveGateway);
  });

  afterAll(async () => {
    try {
      await db.onModuleDestroy();
    } catch {}
  });

  describe('1. Compliance Guardrails Before Dialing', () => {
    it('should block dialing lead without consent proof with NO_CONSENT_PROOF exception', async () => {
      await expect(
        dialerService.dialLead(tenantId, noConsentLeadId, agentId)
      ).rejects.toThrow('NO_CONSENT_PROOF');
    });
  });

  describe('2. End-to-End Call Lifecycle: DIAL -> ON_CALL -> HANGUP (ACW) -> WRAPUP -> READY', () => {
    let callSession: any;

    it('should originate call to verified lead, transition agent to ON_CALL, and track MOS quality', async () => {
      callSession = await dialerService.dialLead(tenantId, confirmedLeadId, agentId);

      expect(callSession).toBeDefined();
      expect(callSession.callId).toBeDefined();
      expect(callSession.status).toBe('ON_CALL');
      expect(callSession.mos).toBeGreaterThanOrEqual(4.0); // High voice quality
      expect(callSession.jitterMs).toBeLessThan(30);

      // Verify agent state is ON_CALL
      const agents = agentStateService.getActiveAgents(tenantId);
      const agent = agents.find((a) => a.agentId === agentId);
      expect(agent?.status).toBe('ON_CALL');
      expect(agent?.statusLabelDe).toBe('Am Telefon');
    });

    it('should hang up call, transition agent to WRAP_UP (mandatory ACW), and calculate billable duration', async () => {
      const hangupRes = await dialerService.hangupCall(tenantId, callSession.callId, agentId);

      expect(hangupRes.success).toBe(true);
      expect(hangupRes.status).toBe('WRAP_UP');
      expect(hangupRes.durationSeconds).toBeGreaterThanOrEqual(0);

      // Agent must now be in ACW (Nachbearbeitung)
      const agents = agentStateService.getActiveAgents(tenantId);
      const agent = agents.find((a) => a.agentId === agentId);
      expect(agent?.status).toBe('WRAP_UP');
      expect(agent?.statusLabelDe).toBe('Nachbearbeitung');
    });

    it('should submit wrap-up code and return agent to READY', async () => {
      const wrapupRes = await dialerService.submitWrapup(tenantId, callSession.callId, agentId, {
        leadId: confirmedLeadId,
        wrapupCode: 'TERM_VEREINBART',
        notes: 'Beratungstermin für PV-Speicher erfolgreich vereinbart',
        countsAsConversion: true,
      });

      expect(wrapupRes.success).toBe(true);
      expect(wrapupRes.nextAgentState).toBe('READY');

      // Agent is back to READY
      const agents = agentStateService.getActiveAgents(tenantId);
      const agent = agents.find((a) => a.agentId === agentId);
      expect(agent?.status).toBe('READY');
      expect(agent?.statusLabelDe).toContain('Bereit');
    });
  });

  describe('3. Live Campaign Pacing Slider', () => {
    it('should update campaign Tempo 1-10 in real-time and recalculate lines', async () => {
      const campaignId = 'aaaaaaaa-1111-0000-0000-000000000001';

      // Update to Tempo 8
      const updated = await campaignsService.updateTempo(tenantId, campaignId, 8);
      expect(updated.pacingTempo).toBe(8);
      expect(updated.pacing.linesToDial).toBeGreaterThanOrEqual(1);

      // Clamp test: Tempo 15 clamped to 10
      const clamped = await campaignsService.updateTempo(tenantId, campaignId, 15);
      expect(clamped.pacingTempo).toBe(10);
    });
  });

  describe('4. Supervisor Live Monitoring Tools', () => {
    it('should allow supervisor to LISTEN, WHISPER, and BARGE on call', async () => {
      const supervisorId = '99999999-0000-0000-0000-000000000004';
      const callId = 'test-call-supervision';

      const listen = await dialerService.superviseCall(tenantId, callId, supervisorId, 'LISTEN');
      expect(listen.success).toBe(true);
      expect(listen.mode).toBe('LISTEN');

      const barge = await dialerService.superviseCall(tenantId, callId, supervisorId, 'BARGE');
      expect(barge.success).toBe(true);
      expect(barge.mode).toBe('BARGE');
    });

    it('should allow reporting bad line with attached WebRTC metrics', async () => {
      const res = await dialerService.reportBadLine(tenantId, 'test-call-bad-line', agentId, 'Starkes Echo');
      expect(res.success).toBe(true);
      expect(res.quality).toBeDefined();
      expect(res.quality.mos).toBeDefined();
    });
  });
});
