import { createHash } from 'node:crypto';
import { LeadScoreResult, ScoreBand, ScoreExplanation } from '../interfaces/llm-provider.js';

export class FallbackScorer {
  public static readonly MODEL_ID = 'RULE_BASED_FALLBACK_V1';
  public static readonly PROMPT_VERSION = 'v0-ruleset';

  /**
   * Evaluates lead deterministically when the LLM provider fails, times out, or throws an error.
   */
  public static score(leadData: Record<string, any>): LeadScoreResult {
    let score = 30; // base score
    const positives: string[] = [];
    const risks: string[] = [];

    const isHomeowner =
      leadData.is_homeowner === true ||
      leadData.isHomeowner === true ||
      leadData.owner === 'OWNER' ||
      String(leadData.ownership || '').toLowerCase().includes('eigentümer') ||
      String(leadData.ownership || '').toLowerCase().includes('owner');

    if (isHomeowner) {
      score += 35;
      positives.push('Hauseigentümer bestätigt (+35 Pkt.)');
    } else {
      score -= 20;
      risks.push('Kein verifizierter Eigentümer (-20 Pkt.)');
    }

    // Power bill
    const bill = Number(leadData.electricity_bill || leadData.electricityBill || leadData.monthlyCost || 0);
    if (bill >= 150) {
      score += 20;
      positives.push(`Hoher monatlicher Stromverbrauch (€${bill}) (+20 Pkt.)`);
    } else if (bill > 80) {
      score += 10;
      positives.push(`Mittlerer Stromverbrauch (€${bill}) (+10 Pkt.)`);
    } else if (bill > 0) {
      risks.push(`Geringer Stromverbrauch (€${bill})`);
    }

    // Phone validity
    if (leadData.phone_e164 || leadData.phone) {
      score += 10;
      positives.push('Gültige E.164 Telefonnummer vorhanden (+10 Pkt.)');
    }

    // Clamp score 0 - 100
    score = Math.max(5, Math.min(95, score));

    // Determine band
    let scoreBand: ScoreBand = 'D';
    if (score >= 80) scoreBand = 'A';
    else if (score >= 60) scoreBand = 'B';
    else if (score >= 40) scoreBand = 'C';

    const explanation: ScoreExplanation = {
      positives,
      risks,
      summary: `Deterministische Fallback-Bewertung (Regelbasiert v1): ${score}/100 Punkte (Band ${scoreBand}).`,
      recommendedProductFit: isHomeowner ? 'Photovoltaik & Wärmepumpe Standard' : 'Eingeschränkte Eignung',
    };

    const inputsHash = createHash('sha256')
      .update(JSON.stringify(leadData))
      .digest('hex');

    return {
      score0100: score,
      scoreBand,
      confidence: 0.70, // Fixed fallback confidence
      modelId: FallbackScorer.MODEL_ID,
      promptVersion: FallbackScorer.PROMPT_VERSION,
      inputsHash,
      explanation,
      isFallback: true,
      tokensUsed: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}
