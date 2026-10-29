export type DialingMode = 'PREVIEW' | 'PROGRESSIVE' | 'POWER' | 'PREDICTIVE';

export interface PacingCalculationParams {
  dialingMode: DialingMode;
  freeAgents: number;
  totalAgents: number;
  historicalAnswerRate: number; // e.g. 0.25 (25% answer rate)
  pacingTempo: number; // 1 to 10
  maxAbandonRatePercent?: number; // default 3.00%
  recentAbandonRatePercent?: number; // actual running abandon rate, e.g. 1.8%
}

export interface PacingResult {
  linesToDial: number;
  multiplier: number;
  isCappedByAbandonRate: boolean;
  expectedAnswers: number;
  reason: string;
}

/**
 * Calculates optimal outbound line allocation according to dialing mode,
 * agent availability, historical connection probability, and Tempo (1-10) pacing slider.
 * Hard safety rule: Never exceed maxAbandonRate (3% default).
 */
export function calculatePacingLines(params: PacingCalculationParams): PacingResult {
  const {
    dialingMode,
    freeAgents,
    historicalAnswerRate,
    pacingTempo,
    maxAbandonRatePercent = 3.0,
    recentAbandonRatePercent = 0.0,
  } = params;

  // 1. If no agents are free, cannot dial in progressive/power modes
  if (freeAgents <= 0) {
    if (dialingMode === 'PREDICTIVE' && params.totalAgents > 0 && pacingTempo >= 7) {
      // Predictive dialing can pre-dial a minimal line if agents are about to finish ACW
      return {
        linesToDial: 1,
        multiplier: 0.2,
        isCappedByAbandonRate: false,
        expectedAnswers: 0.25,
        reason: 'Predictive pre-dial ahead of ACW release',
      };
    }
    return {
      linesToDial: 0,
      multiplier: 0,
      isCappedByAbandonRate: false,
      expectedAnswers: 0,
      reason: 'No agents currently free or ready',
    };
  }

  // 2. Mode: PREVIEW (Strictly 1:1, agent initiates)
  if (dialingMode === 'PREVIEW') {
    return {
      linesToDial: freeAgents,
      multiplier: 1.0,
      isCappedByAbandonRate: false,
      expectedAnswers: freeAgents * historicalAnswerRate,
      reason: 'Preview mode: 1 line per available agent',
    };
  }

  // 3. Mode: PROGRESSIVE (Strictly 1 line per free agent as soon as ready)
  if (dialingMode === 'PROGRESSIVE') {
    return {
      linesToDial: freeAgents,
      multiplier: 1.0,
      isCappedByAbandonRate: false,
      expectedAnswers: freeAgents * historicalAnswerRate,
      reason: 'Progressive mode: 1:1 dial ratio',
    };
  }

  // 4. POWER & PREDICTIVE MODES (Tempo 1-10 pacing formula)
  // Clamp tempo between 1 and 10
  const tempo = Math.max(1, Math.min(10, pacingTempo));
  const safeAnswerRate = Math.max(0.05, Math.min(0.95, historicalAnswerRate || 0.25));

  // Base multiplier from answer rate: e.g. answer rate 25% -> 1 / 0.25 = 4 lines per agent at max tempo
  // Tempo 1 = 1.0x (conservative)
  // Tempo 5 = 50% of the inverted answer rate
  // Tempo 10 = full aggressive pacing
  const theoreticalMultiplier = 1.0 + (tempo / 10) * ((1 / safeAnswerRate) - 1.0);

  // Abandon Rate Safety Damper:
  // If recent abandon rate is close to or exceeds maxAbandonRate (3%), throttle lines immediately
  let isCappedByAbandonRate = false;
  let safetyFactor = 1.0;

  if (recentAbandonRatePercent >= maxAbandonRatePercent) {
    // Abandon cap breached! Throttle back to 1:1 to clear queue
    safetyFactor = 0.5;
    isCappedByAbandonRate = true;
  } else if (recentAbandonRatePercent >= maxAbandonRatePercent * 0.8) {
    // Approaching 3% cap (>= 2.4%) -> apply dampening
    safetyFactor = 0.75;
    isCappedByAbandonRate = true;
  }

  const effectiveMultiplier = Math.max(1.0, theoreticalMultiplier * safetyFactor);
  let lines = Math.floor(freeAgents * effectiveMultiplier);

  // Safety ceiling: Never dial more than 4x free agents in v1
  if (lines > freeAgents * 4) {
    lines = freeAgents * 4;
    isCappedByAbandonRate = true;
  }

  return {
    linesToDial: Math.max(1, lines),
    multiplier: parseFloat(effectiveMultiplier.toFixed(2)),
    isCappedByAbandonRate,
    expectedAnswers: parseFloat((lines * safeAnswerRate).toFixed(2)),
    reason: isCappedByAbandonRate
      ? `Throttled by abandon rate safety rule (limit ${maxAbandonRatePercent}%)`
      : `Paced at Tempo ${tempo}/10 with factor ${effectiveMultiplier.toFixed(2)}x`,
  };
}
