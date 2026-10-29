import { calculatePacingLines } from '../src/pacing/pacing.engine.js';
import { PacingSimulator } from '../src/pacing/pacing.simulator.js';

describe('Phase 2: Dialer Pacing Engine & Simulator Unit Tests', () => {
  describe('1. Dialing Modes Line Allocation', () => {
    it('should strictly allocate 1 line per free agent in PREVIEW mode', () => {
      const res = calculatePacingLines({
        dialingMode: 'PREVIEW',
        freeAgents: 5,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 8,
      });

      expect(res.linesToDial).toBe(5);
      expect(res.multiplier).toBe(1.0);
    });

    it('should strictly allocate 1 line per free agent in PROGRESSIVE mode', () => {
      const res = calculatePacingLines({
        dialingMode: 'PROGRESSIVE',
        freeAgents: 4,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 10,
      });

      expect(res.linesToDial).toBe(4);
      expect(res.multiplier).toBe(1.0);
    });

    it('should scale line multipliers dynamically in POWER mode as Tempo increases from 1 to 10', () => {
      const tempo1 = calculatePacingLines({
        dialingMode: 'POWER',
        freeAgents: 5,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 1, // Conservative
      });

      const tempo5 = calculatePacingLines({
        dialingMode: 'POWER',
        freeAgents: 5,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 5, // Medium
      });

      const tempo10 = calculatePacingLines({
        dialingMode: 'POWER',
        freeAgents: 5,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 10, // Max
      });

      expect(tempo1.multiplier).toBeLessThan(tempo5.multiplier);
      expect(tempo5.multiplier).toBeLessThan(tempo10.multiplier);
      expect(tempo10.linesToDial).toBeGreaterThan(tempo1.linesToDial);
    });
  });

  describe('2. Abandon Rate Safety Damper (Hard Cap 3.0%)', () => {
    it('should immediately throttle lines down when recent abandon rate reaches 3%', () => {
      // Normal run at Tempo 8 without abandon breach
      const normal = calculatePacingLines({
        dialingMode: 'POWER',
        freeAgents: 6,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 8,
        maxAbandonRatePercent: 3.0,
        recentAbandonRatePercent: 0.5,
      });

      // Same run but recent abandon rate is 3.2% (breached!)
      const throttled = calculatePacingLines({
        dialingMode: 'POWER',
        freeAgents: 6,
        totalAgents: 10,
        historicalAnswerRate: 0.25,
        pacingTempo: 8,
        maxAbandonRatePercent: 3.0,
        recentAbandonRatePercent: 3.2,
      });

      expect(throttled.isCappedByAbandonRate).toBe(true);
      expect(throttled.linesToDial).toBeLessThan(normal.linesToDial);
      expect(throttled.reason).toContain('safety rule');
    });
  });

  describe('3. Deterministic Pacing Simulator', () => {
    it('should run multi-step simulation and keep final abandon rate under 3%', () => {
      const simulator = new PacingSimulator();
      const sim = simulator.run({
        steps: 30,
        totalAgents: 8,
        initialFreeAgents: 4,
        dialingMode: 'POWER',
        tempo: 5,
        answerRate: 0.20,
        maxAbandonRatePercent: 3.0,
      });

      expect(sim.totalCallsDialed).toBeGreaterThan(0);
      expect(sim.totalAnswered).toBeGreaterThan(0);
      expect(sim.totalBridged).toBeGreaterThan(0);
      expect(sim.finalAbandonRatePercent).toBeLessThanOrEqual(3.0);
      expect(sim.maxAbandonRateBreached).toBe(false);
    });
  });
});
