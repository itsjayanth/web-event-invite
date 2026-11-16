'use client';
import { useEffect, useState } from 'react';

/**
 * Feature-detects a low-power / data-constrained device so decorative animation layers
 * (motes, stars, elephant sparkle, thread glow) can be skipped. Defaults to `false` (full
 * experience) when the underlying APIs are unsupported, and never throws.
 */
export function useLowPower(): boolean {
  const [low, setLow] = useState(false);

  useEffect(() => {
    try {
      let saveData = false;
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
        saveData = Boolean(conn?.saveData);
      }
      const deviceMemory =
        typeof navigator !== 'undefined' && 'deviceMemory' in navigator
          ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
          : undefined;
      const cores =
        typeof navigator !== 'undefined' && 'hardwareConcurrency' in navigator
          ? navigator.hardwareConcurrency
          : undefined;
      const lowMemory = typeof deviceMemory === 'number' && deviceMemory <= 4;
      const lowCores = typeof cores === 'number' && cores <= 4;
      setLow(saveData || lowMemory || lowCores);
    } catch {
      setLow(false);
    }
  }, []);

  return low;
}
