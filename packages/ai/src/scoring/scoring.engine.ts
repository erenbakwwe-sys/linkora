import { createHash } from 'node:crypto';
import { LlmProvider, LeadScoreResult, ScoreBand } from '../interfaces/llm-provider.js';
import { FallbackScorer } from './fallback.scorer.js';

export interface ScoringEngineOptions {
  lowConfidenceThreshold?: number; // default 0.65
  enableCache?: boolean;
}

export class ScoringEngine {
  private readonly provider: LlmProvider;
  private readonly lowConfidenceThreshold: number;
  private readonly cache = new Map<string, LeadScoreResult>();

  constructor(provider: LlmProvider, options?: ScoringEngineOptions) {
    this.provider = provider;
    this.lowConfidenceThreshold = options?.lowConfidenceThreshold ?? 0.65;
  }

  public static computeInputsHash(leadData: Record<string, any>): string {
    // Deterministic sorted JSON stringify
    const sortedKeys = Object.keys(leadData).sort();
    const sortedObj: Record<string, any> = {};
    for (const key of sortedKeys) {
      if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
        sortedObj[key] = leadData[key];
      }
    }
    return createHash('sha256').update(JSON.stringify(sortedObj)).digest('hex');
  }

  public static resolveScoreBand(score: number): ScoreBand {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    return 'D';
  }

  public async evaluateLead(
    leadData: Record<string, any>,
    promptVersion = 'v1.0'
  ): Promise<LeadScoreResult & { requiresHumanQc: boolean }> {
    const inputsHash = ScoringEngine.computeInputsHash(leadData);

    // 1. Check in-memory cache
    if (this.cache.has(inputsHash)) {
      const cached = this.cache.get(inputsHash)!;
      return {
        ...cached,
        requiresHumanQc: cached.confidence < this.lowConfidenceThreshold,
      };
    }

    // 2. Try primary LLM provider
    let result: LeadScoreResult;
    try {
      result = await this.provider.scoreLead(leadData, promptVersion);
      // Ensure correct band
      result.scoreBand = ScoringEngine.resolveScoreBand(result.score0100);
      result.inputsHash = inputsHash;
    } catch (llmError: any) {
      // 3. Guaranteed Deterministic Fallback on ANY LLM failure
      console.warn(
        `[ScoringEngine] Primary LLM provider '${this.provider.name}' failed. Falling back to deterministic ruleset. Error: ${llmError.message}`
      );
      result = FallbackScorer.score(leadData);
      result.inputsHash = inputsHash;
    }

    const requiresHumanQc = result.confidence < this.lowConfidenceThreshold;
    this.cache.set(inputsHash, result);

    return {
      ...result,
      requiresHumanQc,
    };
  }
}
