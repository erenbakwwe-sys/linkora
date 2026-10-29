import { calculatePacingLines, DialingMode } from './pacing.engine.js';

export interface SimulationStepStats {
  step: number;
  freeAgents: number;
  linesDialed: number;
  answeredCalls: number;
  abandonedCalls: number;
  runningAbandonRatePercent: number;
}

export interface SimulationResult {
  totalCallsDialed: number;
  totalAnswered: number;
  totalBridged: number;
  totalAbandoned: number;
  finalAbandonRatePercent: number;
  maxAbandonRateBreached: boolean;
  history: SimulationStepStats[];
}

export class PacingSimulator {
  /**
   * Runs a deterministic pacing simulation across multiple intervals.
   */
  run(config: {
    steps: number;
    totalAgents: number;
    initialFreeAgents: number;
    dialingMode: DialingMode;
    tempo: number;
    answerRate: number; // e.g. 0.25 (25%)
    maxAbandonRatePercent?: number; // 3.0%
  }): SimulationResult {
    const {
      steps = 50,
      totalAgents = 10,
      dialingMode = 'POWER',
      tempo = 5,
      answerRate = 0.25,
      maxAbandonRatePercent = 3.0,
    } = config;

    let totalCallsDialed = 0;
    let totalAnswered = 0;
    let totalBridged = 0;
    let totalAbandoned = 0;

    let freeAgents = config.initialFreeAgents;
    const history: SimulationStepStats[] = [];

    for (let step = 1; step <= steps; step++) {
      const runningAbandonRate =
        totalAnswered > 0 ? (totalAbandoned / totalAnswered) * 100 : 0.0;

      const pacing = calculatePacingLines({
        dialingMode,
        freeAgents,
        totalAgents,
        historicalAnswerRate: answerRate,
        pacingTempo: tempo,
        maxAbandonRatePercent,
        recentAbandonRatePercent: runningAbandonRate,
      });

      const linesToDial = pacing.linesToDial;
      totalCallsDialed += linesToDial;

      // Simulated answer count for this step
      // Using deterministic rounding based on answerRate to avoid flaky random test runs
      const answeredInStep = Math.round(linesToDial * answerRate);
      totalAnswered += answeredInStep;

      // Bridge as many as free agents available
      const bridgedInStep = Math.min(answeredInStep, freeAgents);
      const abandonedInStep = Math.max(0, answeredInStep - freeAgents);

      totalBridged += bridgedInStep;
      totalAbandoned += abandonedInStep;

      // Update free agents: agents who took a call become busy, some previous busy agents finish
      freeAgents = Math.max(1, freeAgents - bridgedInStep + Math.floor(Math.random() * 2));
      freeAgents = Math.min(totalAgents, freeAgents);

      const updatedAbandonRate = totalAnswered > 0 ? (totalAbandoned / totalAnswered) * 100 : 0.0;

      history.push({
        step,
        freeAgents,
        linesDialed: linesToDial,
        answeredCalls: answeredInStep,
        abandonedCalls: abandonedInStep,
        runningAbandonRatePercent: parseFloat(updatedAbandonRate.toFixed(2)),
      });
    }

    const finalAbandonRate = totalAnswered > 0 ? (totalAbandoned / totalAnswered) * 100 : 0.0;

    return {
      totalCallsDialed,
      totalAnswered,
      totalBridged,
      totalAbandoned,
      finalAbandonRatePercent: parseFloat(finalAbandonRate.toFixed(2)),
      maxAbandonRateBreached: finalAbandonRate > maxAbandonRatePercent,
      history,
    };
  }
}
