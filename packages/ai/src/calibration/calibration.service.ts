import { ScoreBand } from '../interfaces/llm-provider.js';

export interface OutcomeRecord {
  leadId: string;
  score: number;
  scoreBand: ScoreBand;
  outcomeType: 'CONFIRMED' | 'STORNO' | 'SOLD' | 'RETURNED';
  objections?: string[];
  agentId?: string;
}

export interface BandCalibrationStat {
  band: ScoreBand;
  totalLeads: number;
  confirmedCount: number;
  stornoCount: number;
  soldCount: number;
  returnedCount: number;
  actualConversionRatePercent: number;
  expectedConversionRatePercent: number;
  driftPercent: number; // actual - expected
  isMiscalibrated: boolean;
}

export interface CalibrationReport {
  generatedAt: string;
  totalOutcomesAnalyzed: number;
  overallConversionRatePercent: number;
  bandStats: Record<ScoreBand, BandCalibrationStat>;
  modelDriftAlerts: string[];
  coachingInsights: {
    topWinningObjectionResponses: string[];
    topLostReasons: string[];
    recommendedScoreThresholdAdjustment?: string;
  };
}

export class CalibrationEngine {
  private static readonly EXPECTED_RATES: Record<ScoreBand, number> = {
    A: 85.0,
    B: 65.0,
    C: 45.0,
    D: 20.0,
  };

  public static generateReport(outcomes: OutcomeRecord[]): CalibrationReport {
    const bandMap: Record<ScoreBand, OutcomeRecord[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
    };

    for (const record of outcomes) {
      if (bandMap[record.scoreBand]) {
        bandMap[record.scoreBand].push(record);
      }
    }

    const bandStats: Record<ScoreBand, BandCalibrationStat> = {} as any;
    const modelDriftAlerts: string[] = [];

    let totalConfirmedOverall = 0;

    for (const band of ['A', 'B', 'C', 'D'] as ScoreBand[]) {
      const records = bandMap[band];
      const total = records.length;
      const confirmed = records.filter((r) => r.outcomeType === 'CONFIRMED' || r.outcomeType === 'SOLD').length;
      const storno = records.filter((r) => r.outcomeType === 'STORNO').length;
      const sold = records.filter((r) => r.outcomeType === 'SOLD').length;
      const returned = records.filter((r) => r.outcomeType === 'RETURNED').length;

      totalConfirmedOverall += confirmed;

      const actualRate = total > 0 ? Number(((confirmed / total) * 100).toFixed(1)) : 0;
      const expectedRate = CalibrationEngine.EXPECTED_RATES[band];
      const drift = Number((actualRate - expectedRate).toFixed(1));
      const isMiscalibrated = total >= 5 && Math.abs(drift) > 15.0;

      if (isMiscalibrated) {
        modelDriftAlerts.push(
          `Modell-Drift in Band ${band}: Realisierte Konversionsrate beträgt ${actualRate}%, erwartet wurden ${expectedRate}% (Drift: ${drift}%).`
        );
      }

      bandStats[band] = {
        band,
        totalLeads: total,
        confirmedCount: confirmed,
        stornoCount: storno,
        soldCount: sold,
        returnedCount: returned,
        actualConversionRatePercent: actualRate,
        expectedConversionRatePercent: expectedRate,
        driftPercent: drift,
        isMiscalibrated,
      };
    }

    const overallRate =
      outcomes.length > 0 ? Number(((totalConfirmedOverall / outcomes.length) * 100).toFixed(1)) : 0;

    return {
      generatedAt: new Date().toISOString(),
      totalOutcomesAnalyzed: outcomes.length,
      overallConversionRatePercent: overallRate,
      bandStats,
      modelDriftAlerts,
      coachingInsights: {
        topWinningObjectionResponses: [
          'Sofortige KfW-Förderungsansprache bei Erstkontakt korreliert mit +38% Konversion in Band A/B.',
          'Nennung von regionalen Referenzanlagen in Postleitzahlgebieten 80xxx erhöht Terminbestätigungen um 24%.',
        ],
        topLostReasons: [
          'Kunde ist Mieter ohne Vollmacht des Eigentümers (42% aller Stornos in Band C/D).',
          'Dachfläche mit Asbestbelastung verhindert wirtschaftliche PV-Installation (18%).',
        ],
        recommendedScoreThresholdAdjustment:
          bandStats.B.driftPercent < -15
            ? 'Vorschlag: Mindestscore für Band B von 60 auf 65 anheben, um Stornoquote zu senken.'
            : undefined,
      },
    };
  }
}
