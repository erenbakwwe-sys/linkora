import { MockLlmProvider } from '../src/providers/mock-llm.provider.js';
import { ConversationAnalyzer } from '../src/qc/conversation-analyzer.js';
import { CalibrationEngine, OutcomeRecord } from '../src/calibration/calibration.service.js';
import { TrAssistEngine } from '../src/tr-assist/tr-assist.engine.js';

describe('AI QC Analysis, Calibration Loop & TR Assist', () => {
  const mockProvider = new MockLlmProvider();

  describe('Conversation QC Analyzer', () => {
    const analyzer = new ConversationAnalyzer(mockProvider);

    it('should verify compliance checklist on audio turns', async () => {
      const turns = [
        { speaker: 'AGENT' as const, timestamp: '00:05', text: 'Guten Tag, sind Sie mit der Aufzeichnung einverstanden?' },
        { speaker: 'CALLEE' as const, timestamp: '00:08', text: 'Ja, das ist in Ordnung.' },
        { speaker: 'AGENT' as const, timestamp: '00:15', text: 'Unser Beratungstermin ist für Sie vollkommen kostenlos und unverbindlich.' },
        { speaker: 'CALLEE' as const, timestamp: '00:22', text: 'Sehr gerne, lassen Sie uns einen Termin für Dienstag vereinbaren.' },
      ];

      const analysis = await analyzer.analyze(turns, 'v1.0');

      expect(analysis.compliance.consentStatementRead).toBe(true);
      expect(analysis.compliance.noObligationStated).toBe(true);
      expect(analysis.compliance.compliancePassed).toBe(true);
      expect(analysis.callQualityScore).toBeGreaterThanOrEqual(80);
      expect(analysis.summaryDe).toBeDefined();
      expect(analysis.summaryTr).toBeDefined();
    });
  });

  describe('Calibration Engine & Drift Alerts', () => {
    it('should calculate predicted vs actual conversion and trigger drift alerts when drift > 15%', () => {
      // 10 leads in Band B: Expected 65%, but only 3 converted (30% -> drift -35%)
      const outcomes: OutcomeRecord[] = [
        { leadId: '1', score: 85, scoreBand: 'A', outcomeType: 'CONFIRMED' },
        { leadId: '2', score: 88, scoreBand: 'A', outcomeType: 'CONFIRMED' },
        { leadId: '3', score: 92, scoreBand: 'A', outcomeType: 'CONFIRMED' },
        { leadId: '4', score: 82, scoreBand: 'A', outcomeType: 'STORNO' },
        // Band B with high storno (miscalibration)
        { leadId: '5', score: 65, scoreBand: 'B', outcomeType: 'CONFIRMED' },
        { leadId: '6', score: 70, scoreBand: 'B', outcomeType: 'CONFIRMED' },
        { leadId: '7', score: 62, scoreBand: 'B', outcomeType: 'CONFIRMED' },
        { leadId: '8', score: 68, scoreBand: 'B', outcomeType: 'STORNO' },
        { leadId: '9', score: 64, scoreBand: 'B', outcomeType: 'STORNO' },
        { leadId: '10', score: 66, scoreBand: 'B', outcomeType: 'STORNO' },
        { leadId: '11', score: 69, scoreBand: 'B', outcomeType: 'STORNO' },
        { leadId: '12', score: 72, scoreBand: 'B', outcomeType: 'STORNO' },
        { leadId: '13', score: 63, scoreBand: 'B', outcomeType: 'STORNO' },
        { leadId: '14', score: 67, scoreBand: 'B', outcomeType: 'STORNO' },
      ];

      const report = CalibrationEngine.generateReport(outcomes);

      expect(report.totalOutcomesAnalyzed).toBe(14);
      expect(report.bandStats.A.actualConversionRatePercent).toBe(75);
      expect(report.bandStats.B.actualConversionRatePercent).toBe(30);
      expect(report.bandStats.B.isMiscalibrated).toBe(true);
      expect(report.modelDriftAlerts.length).toBeGreaterThan(0);
      expect(report.modelDriftAlerts[0]).toContain('Modell-Drift in Band B');
      expect(report.coachingInsights.recommendedScoreThresholdAdjustment).toBeDefined();
    });
  });

  describe('TR AI-Assist Engine', () => {
    const trEngine = new TrAssistEngine(mockProvider);

    it('should prioritize call list with Turkish briefs and flag low-quality leads', async () => {
      const leads = [
        { id: 'lead-1', firstName: 'Hans', lastName: 'Müller', is_homeowner: false, electricity_bill: 60, city: 'Bremen' },
        { id: 'lead-2', firstName: 'Klaus', lastName: 'Schmidt', is_homeowner: true, electricity_bill: 170, city: 'Köln' },
        { id: 'lead-3', firstName: 'Stefan', lastName: 'Bauer', is_homeowner: true, electricity_bill: 110, city: 'Stuttgart' },
      ];

      const prioritized = await trEngine.prioritizeCallList(leads);

      expect(prioritized.length).toBe(3);
      // Klaus Schmidt should be ranked #1
      expect(prioritized[0].customerName).toBe('Klaus Schmidt');
      expect(prioritized[0].scoreBand).toBe('A');
      expect(prioritized[0].priorityScore).toBeGreaterThanOrEqual(80);
      expect(prioritized[0].briefTr).toBeDefined();

      // Hans Müller should be ranked lowest and flagged unqualified
      const lowest = prioritized[2];
      expect(lowest.customerName).toBe('Hans Müller');
      expect(lowest.isFlaggedUnqualified).toBe(true);
      expect(lowest.riskWarningTr).toContain('UYARI');
    });
  });
});
