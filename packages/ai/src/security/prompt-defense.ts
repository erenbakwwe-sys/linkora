import { z } from 'zod';

export const ScoreOutputSchema = z.object({
  score_0_100: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  score_band: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.object({
    positives: z.array(z.string()),
    risks: z.array(z.string()),
    summary: z.string(),
    recommendedProductFit: z.string(),
  }),
});

export const CallQcOutputSchema = z.object({
  summary_de: z.string(),
  summary_tr: z.string(),
  compliance: z.object({
    consentStatementRead: z.boolean(),
    noObligationStated: z.boolean(),
    pricingDisclosed: z.boolean(),
    interestConfirmed: z.boolean(),
    compliancePassed: z.boolean(),
    notes: z.string(),
  }),
  call_quality_score: z.number().min(0).max(100),
  customer_sentiment: z.enum(['VERY_POSITIVE', 'POSITIVE', 'NEUTRAL', 'SKEPTICAL', 'NEGATIVE']),
  extracted_objections: z.array(z.string()),
  suggested_answers: z.record(z.any()),
  next_recommended_action: z.string(),
});

export const TrAssistOutputSchema = z.object({
  priority_score: z.number().min(0).max(100),
  recommended_call_window: z.string(),
  brief_summary_tr: z.string(),
  brief_summary_de: z.string(),
  customer_profile_tr: z.string(),
  recommended_opening_hook: z.string(),
  objection_tips_tr: z.array(
    z.object({
      objection: z.string(),
      suggestedResponse: z.string(),
    })
  ),
  risk_warning_tr: z.string().optional(),
});

export class PromptDefense {
  private static readonly INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous|above)\s+instructions/gi,
    /disregard\s+(all\s+)?(previous|above)\s+instructions/gi,
    /system\s*:\s*/gi,
    /you\s+are\s+now\s+a\s+/gi,
    /new\s+rule\s*:/gi,
    /bypass\s+mode/gi,
    /reveal\s+(the\s+)?system\s+prompt/gi,
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  ];

  /**
   * Sanitizes untrusted user strings: strips known injection heuristics and caps length.
   */
  public static sanitizeString(input: string, maxLength = 500): string {
    if (!input || typeof input !== 'string') return '';
    let sanitized = input;

    for (const pattern of PromptDefense.INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[FILTERED_INPUT]');
    }

    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength) + '... [TRUNCATED]';
    }

    return sanitized.trim();
  }

  /**
   * Sanitizes all string values within an object recursively.
   */
  public static sanitizeObject(obj: Record<string, any>, maxLength = 500): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key] = PromptDefense.sanitizeString(value, maxLength);
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          typeof item === 'string' ? PromptDefense.sanitizeString(item, maxLength) : item
        );
      } else if (value !== null && typeof value === 'object') {
        result[key] = PromptDefense.sanitizeObject(value, maxLength);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Wraps untrusted data in XML delimiter blocks to prevent prompt leakage.
   */
  public static wrapUntrusted(data: any): string {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return `<untrusted_lead_data>\n${serialized}\n</untrusted_lead_data>`;
  }

  /**
   * Validates structured LLM JSON string output against a Zod schema.
   */
  public static validateJsonOutput<T>(rawJson: string, schema: z.ZodSchema<T>): T {
    try {
      // Clean possible markdown code fences (e.g. ```json ... ```)
      let cleaned = rawJson.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleaned);
      return schema.parse(parsed);
    } catch (err: any) {
      throw new Error(`LLM output validation failed: ${err.message}`);
    }
  }
}
