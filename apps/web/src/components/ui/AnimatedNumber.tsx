'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Counts up from the previous value to `value` with an ease-out curve.
 * Respects the OS "reduce motion" setting (renders the final value immediately).
 */
export function AnimatedNumber({
  value,
  duration = 900,
  format = (n: number) => Math.round(n).toLocaleString('de-DE'),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    const reduce =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (target - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className="tabular-nums">{format(display)}</span>;
}
