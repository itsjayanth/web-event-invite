'use client';
import { m, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { Elephant } from '../../ornaments/Elephant';

/** A small, elegant farewell procession: the elephant walks across the foot of the section with scroll. */
export function ClosingProcession({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  // `x` (a transform) instead of `left` (layout) — scroll-driven position no longer forces reflow.
  const x = useTransform(progress, [0.35, 1], ['-34vw', '72vw']);
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 overflow-hidden sm:h-44">
      <div className="absolute inset-x-0 bottom-3 h-px bg-gradient-to-r from-transparent via-gold-light/50 to-transparent sm:bottom-5" />
      <m.div
        className="absolute bottom-3 left-0 w-[11.5rem] text-gold-light sm:bottom-5 sm:w-[19rem]"
        style={reduce ? { x: '50vw', translateX: '-50%' } : { x }}
      >
        <Elephant className="block h-auto w-full" animated={!reduce} lit />
      </m.div>
    </div>
  );
}
