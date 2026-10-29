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
import { PromptDefense } from '../security/prompt-defense.js';

export class MockLlmProvider implements LlmProvider {
  public readonly id = 'mock-gemini-v1';
  public readonly name = 'Mock Google Gemini Sandbox';
  public simulateFailure = false;

  public async scoreLead(leadData: Record<string, any>, promptVersion = 'v1.0'): Promise<LeadScoreResult> {
    if (this.simulateFailure) {
      throw new Error('[MOCK_ERROR] Gemini API connection timeout (simulated provider failure).');
    }

    // 1. PII Masking
    const { maskedData, tokenMap } = PiiMasker.mask(leadData);

    // 2. Prompt Defense Sanitization
    const sanitized = PromptDefense.sanitizeObject(maskedData);
    const inputsHash = createHash('sha256').update(JSON.stringify(sanitized)).digest('hex');

    // 3. Simulated Intelligent Scoring
    let score = 55;
    const positives: string[] = [];
    const risks: string[] = [];

    const isOwner =
      sanitized.is_homeowner === true ||
      sanitized.owner === 'OWNER' ||
      String(sanitized.ownership || '').toLowerCase().includes('eigentüm');

    if (isOwner) {
      score += 30;
      positives.push('Verifizierter Hauseigentümer mit hoher Investitionsautonomie');
    } else {
      score -= 20;
      risks.push('Objekt zur Miete: Vermieterzustimmung für Installation erforderlich');
    }

    const bill = Number(sanitized.electricity_bill || sanitized.electricityBill || 120);
    if (bill >= 120) {
      score += 12;
      positives.push(`Hohes Einsparpotenzial durch aktuellen Strompreis (${bill} €/Monat)`);
    }

    // High confidence default
    const confidence = isOwner ? 0.92 : 0.62; // triggers low confidence QC queue if non-owner
    score = Math.max(10, Math.min(96, score));

    let scoreBand: ScoreBand = 'D';
    if (score >= 80) scoreBand = 'A';
    else if (score >= 60) scoreBand = 'B';
    else if (score >= 40) scoreBand = 'C';

    const explanation = {
      positives,
      risks,
      summary: `KI-gestützte Bewertung für ${sanitized.city || 'Region'}: Hohe Konversionswahrscheinlichkeit bei Vor-Ort-Terminierung.`,
      recommendedProductFit: 'Photovoltaik Aufdach 8-12 kWp + 10 kWh Speicher',
    };

    return {
      score0100: score,
      scoreBand,
      confidence,
      modelId: this.id,
      promptVersion,
      inputsHash,
      explanation,
      isFallback: false,
      tokensUsed: {
        promptTokens: 412,
        completionTokens: 168,
        totalTokens: 580,
      },
    };
  }

  public async analyzeConversation(
    turns: ConversationTurn[],
    promptVersion = 'v1.0'
  ): Promise<ConversationAnalysisResult> {
    if (this.simulateFailure) {
      throw new Error('[MOCK_ERROR] Gemini API failed during conversation analysis.');
    }

    const combinedText = turns.map((t) => `${t.speaker}: ${t.text}`).join('\n').toLowerCase();

    // Verify compliance statements
    const consentRead =
      combinedText.includes('einverstanden') ||
      combinedText.includes('datenschutz') ||
      combinedText.includes('erlauben') ||
      combinedText.includes('aufzeichnung');

    const noObligation =
      combinedText.includes('unverbindlich') ||
      combinedText.includes('kostenlos') ||
      combinedText.includes('ohne verpflichtung');

    const interestConfirmed =
      combinedText.includes('termin') ||
      combinedText.includes('interessiert') ||
      combinedText.includes('dienstag') ||
      combinedText.includes('angebot');

    const compliancePassed = consentRead && noObligation;

    // Quality score calculation
    let qualityScore = 70;
    if (compliancePassed) qualityScore += 18;
    if (interestConfirmed) qualityScore += 10;
    qualityScore = Math.min(98, qualityScore);

    return {
      summaryDe:
        'Der Kunde hat Interesse an einer PV-Anlage mit Speicher geäußert. Ein Vor-Ort-Termin zur Dachvermessung wurde für nächste Woche vereinbart.',
      summaryTr:
        'Müşteri depolamalı güneş enerjisi (PV) sistemiyle ilgilendiğini belirtti. Gelecek hafta için çatı keşif randevusu planlandı.',
      compliance: {
        consentStatementRead: consentRead,
        noObligationStated: noObligation,
        pricingDisclosed: true,
        interestConfirmed,
        compliancePassed,
        notes: compliancePassed
          ? 'Gesetzliche Pflichtangaben (DSGVO & Unverbindlichkeit) vollständig erfüllt.'
          : 'Hinweis: Hinweis auf kostenlose Beratung nicht eindeutig dokumentiert.',
      },
      callQualityScore: qualityScore,
      customerSentiment: 'VERY_POSITIVE',
      extractedObjections: [
        'Frage nach Amortisationsdauer',
        'Unsicherheit bezüglich Lieferzeiten',
      ],
      suggestedAnswers: {
        amortisation: 'Durchschnittliche Amortisation liegt bei 8 bis 10 Jahren',
        lieferzeit: 'Montage innerhalb von 4 bis 6 Wochen nach Vertragsabschluss',
      },
      nextRecommendedAction: 'Terminbestätigung per E-Mail & Kalendereinladung versenden.',
      modelId: this.id,
      tokensUsed: {
        promptTokens: 840,
        completionTokens: 290,
        totalTokens: 1130,
      },
    };
  }

  public async generateTrBrief(leadData: Record<string, any>, promptVersion = 'v1.0'): Promise<TrAssistBrief> {
    if (this.simulateFailure) {
      throw new Error('[MOCK_ERROR] Gemini API failed during TR brief generation.');
    }

    const { maskedData } = PiiMasker.mask(leadData);
    const sanitized = PromptDefense.sanitizeObject(maskedData);

    const isOwner =
      sanitized.is_homeowner === true ||
      sanitized.owner === 'OWNER' ||
      String(sanitized.ownership || '').toLowerCase().includes('eigentüm');

    return {
      leadId: sanitized.id || 'lead-mock-id',
      priorityScore: isOwner ? 88 : 45,
      recommendedCallWindow: '14:00 - 17:30 (Beste Erreichbarkeit)',
      briefSummaryTr:
        'Müstakil ev sahibi, yüksek elektrik faturası ödüyor. Güneş paneli ve batarya teşvikiyle ilgileniyor. Randevu kapatmaya çok uygun aday.',
      briefSummaryDe:
        'Einfamilienhaus-Eigentümer mit hohem Stromverbrauch. Großes Interesse an Förderung für PV + Speicher.',
      customerProfileTr: `${sanitized.postal_code || '80331'} ${sanitized.city || 'München'}, Müstakil Ev, Çatı güney cepheli.`,
      recommendedOpeningHook:
        'Guten Tag Herr/Frau [KUNDE], Sie hatten sich bezüglich der neuen KfW-Solarförderung für Ihr Eigenheim informiert...',
      objectionTipsTr: [
        {
          objection: '"Ich habe aktuell keine Zeit für ein langes Telefonat."',
          suggestedResponse:
            '"Vollkommen verständlich! Es geht nur um 60 Sekunden für die Eckdaten, damit Ihnen der Fachberater ein fertiges Konzept zusenden kann."',
        },
        {
          objection: '"Solaranlagen sind mir aktuell zu teuer."',
          suggestedResponse:
            '"Genau deshalb nutzen 85% unserer Kunden die aktuelle 0% Mehrwertsteuer-Regelung und KfW-Kredite ohne Eigenkapital."',
        },
      ],
      riskWarningTr: isOwner ? undefined : 'DİKKAT: Müşteri kiracı olabilir, ev sahibi onayını teyit edin.',
    };
  }

  public async healthCheck(): Promise<{ ok: boolean; latencyMs: number }> {
    return { ok: !this.simulateFailure, latencyMs: 24 };
  }
}
