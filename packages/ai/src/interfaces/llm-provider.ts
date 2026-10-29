export type ScoreBand = 'A' | 'B' | 'C' | 'D';

export interface ScoreExplanation {
  positives: string[];
  risks: string[];
  summary: string;
  recommendedProductFit: string;
}

export interface LeadScoreResult {
  score0100: number;
  scoreBand: ScoreBand;
  confidence: number;
  modelId: string;
  promptVersion: string;
  inputsHash: string;
  explanation: ScoreExplanation;
  isFallback: boolean;
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ConversationTurn {
  speaker: 'AGENT' | 'CALLEE' | 'SYSTEM';
  timestamp: string;
  text: string;
}

export interface ComplianceChecklist {
  consentStatementRead: boolean;
  noObligationStated: boolean;
  pricingDisclosed: boolean;
  interestConfirmed: boolean;
  compliancePassed: boolean;
  notes: string;
}

export interface ConversationAnalysisResult {
  summaryDe: string;
  summaryTr: string;
  compliance: ComplianceChecklist;
  callQualityScore: number; // 0 - 100
  customerSentiment: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'SKEPTICAL' | 'NEGATIVE';
  extractedObjections: string[];
  suggestedAnswers: Record<string, any>;
  nextRecommendedAction: string;
  modelId: string;
  tokensUsed: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface TrAssistBrief {
  leadId: string;
  priorityScore: number; // 0 - 100
  recommendedCallWindow: string;
  briefSummaryTr: string;
  briefSummaryDe: string;
  customerProfileTr: string;
  recommendedOpeningHook: string;
  objectionTipsTr: Array<{
    objection: string;
    suggestedResponse: string;
  }>;
  riskWarningTr?: string;
}

export interface LlmProvider {
  readonly id: string;
  readonly name: string;
  scoreLead(leadData: Record<string, any>, promptVersion: string): Promise<LeadScoreResult>;
  analyzeConversation(turns: ConversationTurn[], promptVersion: string): Promise<ConversationAnalysisResult>;
  generateTrBrief(leadData: Record<string, any>, promptVersion: string): Promise<TrAssistBrief>;
  healthCheck(): Promise<{ ok: boolean; latencyMs: number }>;
}
