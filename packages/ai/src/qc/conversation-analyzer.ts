import {
  LlmProvider,
  ConversationTurn,
  ConversationAnalysisResult,
} from '../interfaces/llm-provider.js';

export class ConversationAnalyzer {
  private readonly provider: LlmProvider;

  constructor(provider: LlmProvider) {
    this.provider = provider;
  }

  public async analyze(
    turns: ConversationTurn[],
    promptVersion = 'v1.0'
  ): Promise<ConversationAnalysisResult> {
    try {
      return await this.provider.analyzeConversation(turns, promptVersion);
    } catch (err: any) {
      console.warn(`[ConversationAnalyzer] LLM analysis failed (${err.message}). Using deterministic fallback.`);
      return this.fallbackAnalysis(turns);
    }
  }

  private fallbackAnalysis(turns: ConversationTurn[]): ConversationAnalysisResult {
    const text = turns.map((t) => t.text).join(' ').toLowerCase();

    const consentStatementRead =
      text.includes('einverstanden') ||
      text.includes('datenschutz') ||
      text.includes('aufzeichnung') ||
      text.includes('erlaubnis');

    const noObligationStated =
      text.includes('unverbindlich') ||
      text.includes('kostenlos') ||
      text.includes('ohne verpflichtung');

    const pricingDisclosed = text.includes('preis') || text.includes('kosten') || text.includes('euro');
    const interestConfirmed = text.includes('termin') || text.includes('interessiert') || text.includes('ja gerne');

    const compliancePassed = consentStatementRead && noObligationStated;

    let callQualityScore = 60;
    if (compliancePassed) callQualityScore += 25;
    if (interestConfirmed) callQualityScore += 10;

    return {
      summaryDe: 'Deterministische Analyse: Standard-Gesprächsabwicklung über Fallback-Scanner.',
      summaryTr: 'Deterministik analiz: Yedek tarayıcı üzerinden standart çağrı analizi.',
      compliance: {
        consentStatementRead,
        noObligationStated,
        pricingDisclosed,
        interestConfirmed,
        compliancePassed,
        notes: compliancePassed
          ? 'Pflichtangaben erfüllt (Deterministischer Scanner).'
          : 'Warnung: Gesetzliche Pflichtangaben nicht vollständig erkannt.',
      },
      callQualityScore,
      customerSentiment: interestConfirmed ? 'POSITIVE' : 'NEUTRAL',
      extractedObjections: text.includes('teuer') ? ['Preisbedenken'] : [],
      suggestedAnswers: {},
      nextRecommendedAction: compliancePassed ? 'Termin erfassen' : 'Rückruf zur Einverständnis-Nachholung',
      modelId: 'RULE_BASED_QC_FALLBACK',
      tokensUsed: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}
