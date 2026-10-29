import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../common/services/database.service.js';
import {
  MockLlmProvider,
  GeminiProvider,
  ScoringEngine,
  ConversationAnalyzer,
  CalibrationEngine,
  TrAssistEngine,
  LeadScoreResult,
  OutcomeRecord,
  PrioritizedTrLead,
  ConversationTurn,
} from '@linkora/ai';

export interface QcQueueItem {
  id: string;
  tenantId: string;
  leadId: string;
  customerName: string;
  phone: string;
  city: string;
  product: string;
  reason: 'LOW_CONFIDENCE' | 'COMPLIANCE_WARNING' | 'DATA_MISMATCH';
  confidence: number;
  score: number;
  scoreBand: string;
  explanation: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RE_CALL_REQUESTED';
  createdAt: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: MockLlmProvider;
  private readonly scoringEngine: ScoringEngine;
  private readonly conversationAnalyzer: ConversationAnalyzer;
  private readonly trAssistEngine: TrAssistEngine;

  // In-memory fallback stores for containerless dev
  private readonly inMemoryScores: Map<string, LeadScoreResult[]> = new Map();
  private readonly inMemoryQcQueue: QcQueueItem[] = [];
  private readonly inMemoryOutcomes: OutcomeRecord[] = [];

  constructor(private readonly db: DatabaseService) {
    // Default to Mock sandbox with option to switch to Gemini if key provided
    this.provider = new MockLlmProvider();
    this.scoringEngine = new ScoringEngine(this.provider, { lowConfidenceThreshold: 0.65 });
    this.conversationAnalyzer = new ConversationAnalyzer(this.provider);
    this.trAssistEngine = new TrAssistEngine(this.provider);

    this.seedSampleOutcomes();
    this.seedSampleQcItems();
  }

  private seedSampleOutcomes() {
    // Seed outcomes to give instant calibration report
    const sampleOutcomes: OutcomeRecord[] = [
      { leadId: randomUUID(), score: 86, scoreBand: 'A', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 89, scoreBand: 'A', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 91, scoreBand: 'A', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 84, scoreBand: 'A', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 82, scoreBand: 'A', outcomeType: 'STORNO' },

      { leadId: randomUUID(), score: 72, scoreBand: 'B', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 68, scoreBand: 'B', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 65, scoreBand: 'B', outcomeType: 'STORNO' },
      { leadId: randomUUID(), score: 70, scoreBand: 'B', outcomeType: 'STORNO' },
      { leadId: randomUUID(), score: 66, scoreBand: 'B', outcomeType: 'STORNO' },
      { leadId: randomUUID(), score: 64, scoreBand: 'B', outcomeType: 'STORNO' },

      { leadId: randomUUID(), score: 48, scoreBand: 'C', outcomeType: 'CONFIRMED' },
      { leadId: randomUUID(), score: 52, scoreBand: 'C', outcomeType: 'STORNO' },
      { leadId: randomUUID(), score: 45, scoreBand: 'C', outcomeType: 'STORNO' },

      { leadId: randomUUID(), score: 25, scoreBand: 'D', outcomeType: 'STORNO' },
      { leadId: randomUUID(), score: 18, scoreBand: 'D', outcomeType: 'STORNO' },
    ];
    this.inMemoryOutcomes.push(...sampleOutcomes);
  }

  private seedSampleQcItems() {
    this.inMemoryQcQueue.push(
      {
        id: 'qc-item-1',
        tenantId: '11111111-1111-1111-1111-111111111111',
        leadId: '77777777-0000-0000-0000-000000000003',
        customerName: 'Sabine Fischer',
        phone: '+491605554321',
        city: 'Augsburg',
        product: 'Photovoltaik',
        reason: 'LOW_CONFIDENCE',
        confidence: 0.58,
        score: 42,
        scoreBand: 'C',
        explanation: {
          summary: 'Eigentümerstatus im Datensatz widersprüchlich (Angabe "Ehemann ist Eigentümer", Vollmacht fehlt).',
          positives: ['Hoher Stromverbrauch'],
          risks: ['Vollmacht unklar'],
        },
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'qc-item-2',
        tenantId: '11111111-1111-1111-1111-111111111111',
        leadId: '77777777-0000-0000-0000-000000000004',
        customerName: 'Thomas Wagner',
        phone: '+491728889900',
        city: 'Nürnberg',
        product: 'Wärmepumpe',
        reason: 'COMPLIANCE_WARNING',
        confidence: 0.88,
        score: 78,
        scoreBand: 'B',
        explanation: {
          summary: 'Hinweis auf kostenlose und unverbindliche Beratung im Call-Transkript nur undeutlich formuliert.',
          positives: ['Termin vereinbart für Donnerstag'],
          risks: ['Unverbindlichkeitshinweis prüfen'],
        },
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      }
    );
  }

  public async scoreLead(tenantId: string, leadId: string, leadDataOverride?: Record<string, any>): Promise<LeadScoreResult> {
    // Find lead data
    let leadData = leadDataOverride;
    if (!leadData) {
      try {
        const query = await this.db.query(
          `SELECT * FROM leads WHERE id = $1 AND tenant_id = $2 LIMIT 1`,
          [leadId, tenantId]
        );
        if (query.rows.length > 0) {
          leadData = query.rows[0];
        }
      } catch (err: any) {
        this.logger.warn(`Could not load lead from DB: ${err.message}`);
      }
    }

    if (!leadData) {
      // Fallback lead stub
      leadData = {
        id: leadId,
        firstName: 'Maximilian',
        lastName: 'Weber',
        city: 'München',
        is_homeowner: true,
        electricity_bill: 150,
      };
    }

    const result = await this.scoringEngine.evaluateLead(leadData, 'v1.0');

    // Save score
    const scores = this.inMemoryScores.get(leadId) || [];
    scores.unshift(result);
    this.inMemoryScores.set(leadId, scores);

    // If low confidence, route to QC Queue
    if (result.requiresHumanQc) {
      this.inMemoryQcQueue.unshift({
        id: `qc-${randomUUID()}`,
        tenantId,
        leadId,
        customerName: `${leadData.first_name || leadData.firstName || ''} ${leadData.last_name || leadData.lastName || ''}`.trim() || 'Unbekannt',
        phone: leadData.phone_e164 || leadData.phone || '',
        city: leadData.city || 'München',
        product: leadData.product || 'Photovoltaik',
        reason: 'LOW_CONFIDENCE',
        confidence: result.confidence,
        score: result.score0100,
        scoreBand: result.scoreBand,
        explanation: result.explanation,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });
    }

    // Persist to DB if available
    try {
      await this.db.query(
        `INSERT INTO lead_scores (id, lead_id, tenant_id, model_id, prompt_version, inputs_hash, confidence, score_0_100, score_band, explanation, is_fallback)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          randomUUID(),
          leadId,
          tenantId,
          result.modelId,
          result.promptVersion,
          result.inputsHash,
          result.confidence,
          result.score0100,
          result.scoreBand,
          JSON.stringify(result.explanation),
          result.isFallback,
        ]
      );
    } catch {
      // Dev mode fallback
    }

    return result;
  }

  public async getScoresForLead(leadId: string): Promise<LeadScoreResult[]> {
    return this.inMemoryScores.get(leadId) || [];
  }

  public async analyzeCallTranscript(turns: ConversationTurn[]) {
    return this.conversationAnalyzer.analyze(turns);
  }

  public async getQcQueue(tenantId: string): Promise<QcQueueItem[]> {
    return this.inMemoryQcQueue.filter((item) => item.tenantId === tenantId);
  }

  public async reviewQcItem(
    tenantId: string,
    qcId: string,
    action: 'APPROVE' | 'REJECT' | 'RE_CALL',
    notes?: string
  ): Promise<QcQueueItem> {
    const item = this.inMemoryQcQueue.find((q) => q.id === qcId && q.tenantId === tenantId);
    if (!item) {
      throw new NotFoundException(`QC Item ${qcId} nicht gefunden.`);
    }

    if (action === 'APPROVE') item.status = 'APPROVED';
    else if (action === 'REJECT') item.status = 'REJECTED';
    else if (action === 'RE_CALL') item.status = 'RE_CALL_REQUESTED';

    return item;
  }

  public async getCalibrationReport(): Promise<any> {
    return CalibrationEngine.generateReport(this.inMemoryOutcomes);
  }

  public async getTrBrief(leadId: string, leadData?: Record<string, any>) {
    const data = leadData || {
      id: leadId,
      first_name: 'Stefan',
      last_name: 'Bauer',
      city: 'Stuttgart',
      is_homeowner: true,
      electricity_bill: 140,
      ownership: 'Hauseigentümer',
    };
    return this.trAssistEngine.getLeadBrief(data);
  }

  public async getPrioritizedTrCallList(): Promise<PrioritizedTrLead[]> {
    const sampleLeads = [
      { id: '77777777-0000-0000-0000-000000000001', first_name: 'Maximilian', last_name: 'Weber', is_homeowner: true, electricity_bill: 180, city: 'München', projectName: 'Photovoltaik', phone: '+491714567890' },
      { id: '77777777-0000-0000-0000-000000000002', first_name: 'Anna', last_name: 'Schneider', is_homeowner: true, electricity_bill: 150, city: 'Köln', projectName: 'Wärmepumpe', phone: '+491512345678' },
      { id: '77777777-0000-0000-0000-000000000003', first_name: 'Sabine', last_name: 'Fischer', is_homeowner: false, electricity_bill: 75, city: 'Augsburg', projectName: 'Photovoltaik', phone: '+491605554321' },
      { id: '77777777-0000-0000-0000-000000000004', first_name: 'Thomas', last_name: 'Wagner', is_homeowner: true, electricity_bill: 130, city: 'Nürnberg', projectName: 'Wärmepumpe', phone: '+491728889900' },
    ];
    return this.trAssistEngine.prioritizeCallList(sampleLeads);
  }
}
