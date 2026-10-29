import { MockLlmProvider } from '../src/providers/mock-llm.provider.js';
import { ScoringEngine } from '../src/scoring/scoring.engine.js';
import { FallbackScorer } from '../src/scoring/fallback.scorer.js';

describe('AI Scoring & Guaranteed Fallback Resilience', () => {
  let mockProvider: MockLlmProvider;
  let scoringEngine: ScoringEngine;

  beforeEach(() => {
    mockProvider = new MockLlmProvider();
    scoringEngine = new ScoringEngine(mockProvider, { lowConfidenceThreshold: 0.65 });
  });

  it('should score lead with model_id, prompt_version, and inputs_hash on healthy LLM', async () => {
    const lead = {
      is_homeowner: true,
      electricity_bill: 160,
      city: 'München',
      phone_e164: '+491714567890',
    };

    const result = await scoringEngine.evaluateLead(lead, 'v1.0');

    expect(result.score0100).toBeGreaterThanOrEqual(80);
    expect(result.scoreBand).toBe('A');
    expect(result.confidence).toBeGreaterThanOrEqual(0.65);
    expect(result.modelId).toBe('mock-gemini-v1');
    expect(result.promptVersion).toBe('v1.0');
    expect(result.inputsHash).toBeDefined();
    expect(result.inputsHash.length).toBe(64); // SHA-256
    expect(result.isFallback).toBe(false);
    expect(result.requiresHumanQc).toBe(false);
  });

  it('SPEC REQUIREMENT: Killing the LLM provider must keep system running on deterministic fallback scores', async () => {
    // Simulate complete LLM API outage / timeout
    mockProvider.simulateFailure = true;

    const lead = {
      is_homeowner: true,
      electricity_bill: 180,
      phone_e164: '+491714567890',
      city: 'Berlin',
    };

    // Must NOT throw
    const fallbackResult = await scoringEngine.evaluateLead(lead, 'v1.0');

    expect(fallbackResult).toBeDefined();
    expect(fallbackResult.isFallback).toBe(true);
    expect(fallbackResult.modelId).toBe(FallbackScorer.MODEL_ID);
    expect(fallbackResult.promptVersion).toBe(FallbackScorer.PROMPT_VERSION);
    expect(fallbackResult.score0100).toBeGreaterThanOrEqual(60);
    expect(fallbackResult.explanation.summary).toContain('Deterministische Fallback-Bewertung');
    expect(fallbackResult.inputsHash).toBeDefined();
  });

  it('should route low confidence scores (< 0.65) to human QC review queue', async () => {
    const uncertainLead = {
      is_homeowner: false, // tenant
      electricity_bill: 40,
    };

    const result = await scoringEngine.evaluateLead(uncertainLead, 'v1.0');

    expect(result.confidence).toBeLessThan(0.65);
    expect(result.requiresHumanQc).toBe(true);
  });
});
