import { createHash } from 'node:crypto';
import {
  LlmProvider,
  LeadScoreResult,
  ConversationAnalysisResult,
  TrAssistBrief,
  ConversationTurn,
  ScoreBand,
} from '../interfaces/llm-provider.js';
import { PiiMasker } from '../pii/pii-masker.js';
import {
  PromptDefense,
  ScoreOutputSchema,
  CallQcOutputSchema,
  TrAssistOutputSchema,
} from '../security/prompt-defense.js';
import { MockLlmProvider } from './mock-llm.provider.js';

export interface GeminiConfig {
  apiKey?: string;
  modelName?: string;
  temperature?: number;
}

export class GeminiProvider implements LlmProvider {
  public readonly id = 'gemini-2.0-flash';
  public readonly name = 'Google Gemini 2.0 Flash';
  private readonly apiKey: string;
  private readonly modelName: string;
  private readonly fallbackMock: MockLlmProvider;

  constructor(config?: GeminiConfig) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || '';
    this.modelName = config?.modelName || 'gemini-2.0-flash';
    this.fallbackMock = new MockLlmProvider();
  }

  public async scoreLead(leadData: Record<string, any>, promptVersion = 'v1.0'): Promise<LeadScoreResult> {
    if (!this.apiKey) {
      // Graceful fallback to sandbox mock if no API key is provided
      return this.fallbackMock.scoreLead(leadData, promptVersion);
    }

    const { maskedData } = PiiMasker.mask(leadData);
    const sanitized = PromptDefense.sanitizeObject(maskedData);
    const untrustedBlock = PromptDefense.wrapUntrusted(sanitized);

    const prompt = `You are an expert lead qualification model. Evaluate conversion suitability for this lead:
${untrustedBlock}

Return strictly JSON matching:
{
  "score_0_100": number,
  "confidence": number,
  "score_band": "A" | "B" | "C" | "D",
  "explanation": {
    "positives": string[],
    "risks": string[],
    "summary": string,
    "recommendedProductFit": string
  }
}`;

    const rawResponse = await this.callGeminiApi(prompt);
    const validated = PromptDefense.validateJsonOutput(rawResponse.text, ScoreOutputSchema);

    const inputsHash = createHash('sha256').update(JSON.stringify(sanitized)).digest('hex');

    return {
      score0100: validated.score_0_100,
      scoreBand: validated.score_band as ScoreBand,
      confidence: validated.confidence,
      modelId: this.id,
      promptVersion,
      inputsHash,
      explanation: validated.explanation,
      isFallback: false,
      tokensUsed: rawResponse.tokens,
    };
  }

  public async analyzeConversation(
    turns: ConversationTurn[],
    promptVersion = 'v1.0'
  ): Promise<ConversationAnalysisResult> {
    if (!this.apiKey) {
      return this.fallbackMock.analyzeConversation(turns, promptVersion);
    }

    const transcriptText = turns.map((t) => `[${t.speaker}] ${t.text}`).join('\n');
    const { maskedData } = PiiMasker.mask(transcriptText);
    const untrustedBlock = `<untrusted_call_transcript>\n${maskedData}\n</untrusted_call_transcript>`;

    const prompt = `Analyze this contact center call transcript for legal compliance and sales quality:
${untrustedBlock}

Check specifically if:
1. Consent statement was confirmed
2. "Kostenlos und unverbindlich" was stated
3. Quality score (0-100)
4. Objections extracted
5. Summary in DE and TR.`;

    const rawResponse = await this.callGeminiApi(prompt);
    const validated = PromptDefense.validateJsonOutput(rawResponse.text, CallQcOutputSchema);

    return {
      summaryDe: validated.summary_de,
      summaryTr: validated.summary_tr,
      compliance: validated.compliance,
      callQualityScore: validated.call_quality_score,
      customerSentiment: validated.customer_sentiment,
      extractedObjections: validated.extracted_objections,
      suggestedAnswers: validated.suggested_answers,
      nextRecommendedAction: validated.next_recommended_action,
      modelId: this.id,
      tokensUsed: rawResponse.tokens,
    };
  }

  public async generateTrBrief(leadData: Record<string, any>, promptVersion = 'v1.0'): Promise<TrAssistBrief> {
    if (!this.apiKey) {
      return this.fallbackMock.generateTrBrief(leadData, promptVersion);
    }

    const { maskedData } = PiiMasker.mask(leadData);
    const sanitized = PromptDefense.sanitizeObject(maskedData);
    const untrustedBlock = PromptDefense.wrapUntrusted(sanitized);

    const prompt = `Generate a tactical sales brief in Turkish for an agent calling this German residential lead:
${untrustedBlock}`;

    const rawResponse = await this.callGeminiApi(prompt);
    const validated = PromptDefense.validateJsonOutput(rawResponse.text, TrAssistOutputSchema);

    return {
      leadId: leadData.id || 'lead-id',
      priorityScore: validated.priority_score,
      recommendedCallWindow: validated.recommended_call_window,
      briefSummaryTr: validated.brief_summary_tr,
      briefSummaryDe: validated.brief_summary_de,
      customerProfileTr: validated.customer_profile_tr,
      recommendedOpeningHook: validated.recommended_opening_hook,
      objectionTipsTr: validated.objection_tips_tr,
      riskWarningTr: validated.risk_warning_tr,
    };
  }

  public async healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
    if (!this.apiKey) return { ok: true, latencyMs: 1 };
    const start = Date.now();
    try {
      await this.callGeminiApi('Respond with {"ping": "pong"}');
      return { ok: true, latencyMs: Date.now() - start };
    } catch {
      return { ok: false, latencyMs: Date.now() - start };
    }
  }

  private async callGeminiApi(promptText: string): Promise<{ text: string; tokens: { promptTokens: number; completionTokens: number; totalTokens: number } }> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Gemini API HTTP Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || '{}';
    const metadata = data.usageMetadata || {};

    return {
      text,
      tokens: {
        promptTokens: metadata.promptTokenCount || 200,
        completionTokens: metadata.candidatesTokenCount || 100,
        totalTokens: metadata.totalTokenCount || 300,
      },
    };
  }
}
